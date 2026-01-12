// Report Generation Utilities
// Generates comprehensive assessment reports similar to Gallup/Gr8

import { competencyAreas } from '../data/kafaatQuestions';
import { leadership360Categories } from '../data/leadership360Questions';

// Calculate scores for Kafaat Assessment
export const calculateKafaatScores = (responses, language = 'en') => {
  const competencyScores = {};
  const questionDetails = [];

  // Group responses by competency
  responses.forEach(response => {
    const { competency, score, maxScore = 5, questionId } = response;
    
    if (!competencyScores[competency]) {
      competencyScores[competency] = {
        total: 0,
        count: 0,
        scores: []
      };
    }
    
    competencyScores[competency].total += score;
    competencyScores[competency].count += 1;
    competencyScores[competency].scores.push(score);
    
    questionDetails.push({
      questionId,
      competency,
      score,
      percentage: (score / maxScore) * 100
    });
  });

  // Calculate averages and percentages
  const competencyResults = Object.entries(competencyScores).map(([key, data]) => {
    const average = data.total / data.count;
    const percentage = (average / 5) * 100;
    const info = competencyAreas[key] || {};
    
    return {
      id: key,
      name: info[language]?.name || key,
      description: info[language]?.description || '',
      score: average.toFixed(2),
      percentage: Math.round(percentage),
      questionsAnswered: data.count,
      rating: getScoreRating(percentage)
    };
  });

  // Sort by percentage (highest first)
  competencyResults.sort((a, b) => b.percentage - a.percentage);

  // Calculate overall score
  const totalScore = competencyResults.reduce((sum, c) => sum + parseFloat(c.score), 0);
  const overallScore = (totalScore / competencyResults.length).toFixed(2);
  const overallPercentage = Math.round((parseFloat(overallScore) / 5) * 100);

  return {
    overallScore,
    overallPercentage,
    overallRating: getScoreRating(overallPercentage),
    competencies: competencyResults,
    strengths: competencyResults.slice(0, 3),
    developmentAreas: competencyResults.slice(-3).reverse(),
    questionDetails,
    totalQuestions: responses.length
  };
};

// Calculate scores for 360 Assessment
export const calculate360Scores = (evaluators, language = 'en') => {
  const categoryScores = {};
  const byRelationship = {};
  
  // Process each evaluator's responses
  evaluators.forEach(evaluator => {
    if (evaluator.status !== 'completed') return;
    
    const relationship = evaluator.relationship;
    
    evaluator.responses.forEach(response => {
      const { category, rating } = response;
      
      // By category
      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, count: 0, scores: [] };
      }
      categoryScores[category].total += rating;
      categoryScores[category].count += 1;
      categoryScores[category].scores.push(rating);
      
      // By relationship
      if (!byRelationship[relationship]) {
        byRelationship[relationship] = {};
      }
      if (!byRelationship[relationship][category]) {
        byRelationship[relationship][category] = { total: 0, count: 0 };
      }
      byRelationship[relationship][category].total += rating;
      byRelationship[relationship][category].count += 1;
    });
  });

  // Calculate category results
  const categoryResults = Object.entries(categoryScores).map(([key, data]) => {
    const average = data.total / data.count;
    const percentage = (average / 5) * 100;
    const info = leadership360Categories[key] || {};
    
    return {
      id: key,
      name: info[language]?.name || key,
      icon: info[language]?.icon || '📊',
      score: average.toFixed(2),
      percentage: Math.round(percentage),
      responseCount: data.count,
      rating: getScoreRating(percentage)
    };
  });

  categoryResults.sort((a, b) => b.percentage - a.percentage);

  // Calculate by relationship
  const relationshipResults = Object.entries(byRelationship).map(([rel, categories]) => {
    const catScores = Object.entries(categories).map(([cat, data]) => ({
      category: cat,
      score: (data.total / data.count).toFixed(2),
      percentage: Math.round((data.total / data.count / 5) * 100)
    }));
    
    const avgScore = catScores.reduce((sum, c) => sum + parseFloat(c.score), 0) / catScores.length;
    
    return {
      relationship: rel,
      averageScore: avgScore.toFixed(2),
      averagePercentage: Math.round((avgScore / 5) * 100),
      categories: catScores
    };
  });

  // Overall score
  const totalScore = categoryResults.reduce((sum, c) => sum + parseFloat(c.score), 0);
  const overallScore = (totalScore / categoryResults.length).toFixed(2);
  const overallPercentage = Math.round((parseFloat(overallScore) / 5) * 100);

  // Count completed evaluators
  const completedEvaluators = evaluators.filter(e => e.status === 'completed').length;

  return {
    overallScore,
    overallPercentage,
    overallRating: getScoreRating(overallPercentage),
    categories: categoryResults,
    strengths: categoryResults.slice(0, 3),
    developmentAreas: categoryResults.slice(-3).reverse(),
    byRelationship: relationshipResults,
    completedEvaluators,
    totalEvaluators: evaluators.length
  };
};

// Get score rating
export const getScoreRating = (percentage) => {
  if (percentage >= 85) return { level: 'excellent', en: 'Excellent', ar: 'ممتاز', color: 'green' };
  if (percentage >= 70) return { level: 'good', en: 'Good', ar: 'جيد', color: 'blue' };
  if (percentage >= 55) return { level: 'average', en: 'Average', ar: 'متوسط', color: 'yellow' };
  return { level: 'needs-improvement', en: 'Needs Improvement', ar: 'يحتاج تحسين', color: 'red' };
};

// Generate recommendations based on scores
export const generateRecommendations = (competencies, language = 'en') => {
  const recommendations = [];
  
  competencies.forEach(comp => {
    if (comp.percentage < 70) {
      const recKey = comp.id;
      const recs = recommendationTemplates[recKey] || recommendationTemplates.default;
      recommendations.push({
        competency: comp.name,
        priority: comp.percentage < 50 ? 'high' : 'medium',
        actions: recs[language] || recs.en
      });
    }
  });

  return recommendations;
};

// Recommendation templates by competency
const recommendationTemplates = {
  leadershipFundamentals: {
    en: [
      "Develop a personal leadership philosophy and vision statement",
      "Practice situational leadership by adapting style to team needs",
      "Seek mentorship from experienced leaders",
      "Read foundational leadership books (e.g., Good to Great, Leaders Eat Last)"
    ],
    ar: [
      "تطوير فلسفة قيادية شخصية وبيان رؤية",
      "ممارسة القيادة الموقفية بتكييف الأسلوب مع احتياجات الفريق",
      "طلب الإرشاد من قادة ذوي خبرة",
      "قراءة كتب القيادة الأساسية"
    ]
  },
  changeManagement: {
    en: [
      "Study and apply Kotter's 8-Step Change Model",
      "Practice communicating the 'why' behind changes",
      "Develop strategies to address resistance constructively",
      "Create celebration moments for change milestones"
    ],
    ar: [
      "دراسة وتطبيق نموذج كوتر للتغيير",
      "ممارسة توصيل 'لماذا' وراء التغييرات",
      "تطوير استراتيجيات لمعالجة المقاومة بشكل بناء",
      "إنشاء لحظات احتفال للمراحل الهامة في التغيير"
    ]
  },
  performanceManagement: {
    en: [
      "Master SMART goal setting methodology",
      "Practice the SBI (Situation-Behavior-Impact) feedback model",
      "Schedule regular one-on-one performance conversations",
      "Develop clear KPIs for all team members"
    ],
    ar: [
      "إتقان منهجية وضع أهداف SMART",
      "ممارسة نموذج SBI للتغذية الراجعة",
      "جدولة محادثات أداء فردية منتظمة",
      "تطوير مؤشرات أداء واضحة لجميع أعضاء الفريق"
    ]
  },
  teamBuilding: {
    en: [
      "Learn and apply Tuckman's team development stages",
      "Conduct a Belbin team roles assessment",
      "Create team bonding activities and trust-building exercises",
      "Address conflicts promptly using mediation skills"
    ],
    ar: [
      "تعلم وتطبيق مراحل تطور الفريق لـ Tuckman",
      "إجراء تقييم أدوار الفريق بنموذج Belbin",
      "إنشاء أنشطة ترابط الفريق وتمارين بناء الثقة",
      "معالجة النزاعات فوراً باستخدام مهارات الوساطة"
    ]
  },
  communication: {
    en: [
      "Practice active listening techniques",
      "Develop presentation skills through regular practice",
      "Learn to read and use body language effectively",
      "Master meeting facilitation skills"
    ],
    ar: [
      "ممارسة تقنيات الاستماع الفعال",
      "تطوير مهارات العرض من خلال الممارسة المنتظمة",
      "تعلم قراءة واستخدام لغة الجسد بفاعلية",
      "إتقان مهارات تسهيل الاجتماعات"
    ]
  },
  problemSolving: {
    en: [
      "Apply root cause analysis tools (5 Whys, Fishbone)",
      "Practice decision-making frameworks (OODA Loop, Decision Matrix)",
      "Develop critical thinking skills",
      "Learn to balance analysis with action"
    ],
    ar: [
      "تطبيق أدوات تحليل السبب الجذري",
      "ممارسة أطر اتخاذ القرار (OODA Loop، مصفوفة القرار)",
      "تطوير مهارات التفكير النقدي",
      "تعلم التوازن بين التحليل والعمل"
    ]
  },
  emotionalIntelligence: {
    en: [
      "Practice daily self-reflection and emotional journaling",
      "Develop empathetic listening skills",
      "Learn emotional regulation techniques",
      "Seek feedback on emotional impact from trusted colleagues"
    ],
    ar: [
      "ممارسة التأمل الذاتي اليومي وتدوين المشاعر",
      "تطوير مهارات الاستماع التعاطفي",
      "تعلم تقنيات تنظيم الانفعالات",
      "طلب التغذية الراجعة حول الأثر العاطفي من الزملاء الموثوقين"
    ]
  },
  strategicImplementation: {
    en: [
      "Learn project management fundamentals (DMAIC methodology)",
      "Practice stakeholder mapping and engagement",
      "Develop executive presentation skills",
      "Build accountability systems for initiatives"
    ],
    ar: [
      "تعلم أساسيات إدارة المشاريع (منهجية DMAIC)",
      "ممارسة رسم خرائط وإشراك أصحاب المصلحة",
      "تطوير مهارات العرض التنفيذي",
      "بناء أنظمة مساءلة للمبادرات"
    ]
  },
  default: {
    en: [
      "Identify specific skill gaps and create a development plan",
      "Seek coaching or mentoring in this area",
      "Practice through real-world application",
      "Track progress with measurable goals"
    ],
    ar: [
      "تحديد فجوات المهارات المحددة وإنشاء خطة تطوير",
      "طلب التوجيه أو الإرشاد في هذا المجال",
      "الممارسة من خلال التطبيق الواقعي",
      "تتبع التقدم بأهداف قابلة للقياس"
    ]
  }
};

// Generate action plan
export const generateActionPlan = (developmentAreas, language = 'en') => {
  return developmentAreas.map((area, index) => ({
    priority: index + 1,
    competency: area.name,
    currentLevel: area.percentage,
    targetLevel: Math.min(area.percentage + 20, 100),
    timeline: index === 0 ? '30 days' : index === 1 ? '60 days' : '90 days',
    timelineAr: index === 0 ? '30 يوم' : index === 1 ? '60 يوم' : '90 يوم',
    actions: (recommendationTemplates[area.id] || recommendationTemplates.default)[language]?.slice(0, 2)
  }));
};

export default {
  calculateKafaatScores,
  calculate360Scores,
  getScoreRating,
  generateRecommendations,
  generateActionPlan
};
