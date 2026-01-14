// AI-Powered Analysis Engine for Assessment Reports
// Generates personalized insights and recommendations based on actual user responses

import { kafaatCompetencyData, leadership360Data, getPerformanceTier } from '../data/reportRecommendations';
import { competencyAreas } from '../data/kafaatQuestions';
import { leadership360Categories } from '../data/leadership360Questions';

// Competency key mapping for consistent reference
const competencyKeyMap = {
  leadership_fundamentals: 'leadershipFundamentals',
  change_management: 'changeManagement',
  performance_management: 'performanceManagement',
  team_building: 'teamBuilding',
  communication: 'communication',
  problem_solving: 'problemSolving',
  emotional_intelligence: 'emotionalIntelligence',
  strategic_implementation: 'strategicImplementation'
};

// Reverse mapping for display names
const competencyDisplayNames = {
  leadershipFundamentals: {
    en: 'Leadership Fundamentals',
    ar: 'أساسيات القيادة'
  },
  changeManagement: {
    en: 'Change Management',
    ar: 'إدارة التغيير'
  },
  performanceManagement: {
    en: 'Performance Management',
    ar: 'إدارة الأداء'
  },
  teamBuilding: {
    en: 'Team Building',
    ar: 'بناء الفرق'
  },
  communication: {
    en: 'Communication',
    ar: 'التواصل'
  },
  problemSolving: {
    en: 'Problem Solving',
    ar: 'حل المشكلات'
  },
  emotionalIntelligence: {
    en: 'Emotional Intelligence',
    ar: 'الذكاء العاطفي'
  },
  strategicImplementation: {
    en: 'Strategic Implementation',
    ar: 'التنفيذ الاستراتيجي'
  }
};

// Generate AI-powered personalized analysis based on user responses
export const generatePersonalizedAnalysis = (responses, competencyResults, language = 'en') => {
  const analysis = {
    overallProfile: generateOverallProfile(competencyResults, language),
    patternAnalysis: analyzeResponsePatterns(responses, language),
    strengthsDeep: generateDeepStrengthsAnalysis(competencyResults, language),
    developmentPriorities: generatePrioritizedDevelopment(competencyResults, language),
    behavioralInsights: analyzeBehavioralTendencies(responses, competencyResults, language),
    actionableSteps: generateActionableSteps(competencyResults, language),
    leadershipStyle: identifyLeadershipStyle(competencyResults, language),
    progressMetrics: createProgressMetrics(competencyResults, language)
  };

  return analysis;
};

// Generate overall leadership profile based on scores
const generateOverallProfile = (competencies, language) => {
  const avgScore = competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length;
  const highScores = competencies.filter(c => c.score >= 80);
  const lowScores = competencies.filter(c => c.score < 60);
  
  let profileType, description;
  
  if (avgScore >= 85 && lowScores.length === 0) {
    profileType = language === 'en' ? 'Transformational Leader' : 'قائد تحويلي';
    description = language === 'en' 
      ? 'You demonstrate exceptional leadership capabilities across all dimensions. Your balanced competency profile positions you as a strategic leader capable of driving significant organizational change.'
      : 'تُظهر قدرات قيادية استثنائية في جميع الأبعاد. ملفك الكفاءاتي المتوازن يضعك كقائد استراتيجي قادر على قيادة تغيير مؤسسي كبير.';
  } else if (avgScore >= 70 && highScores.length >= 3) {
    profileType = language === 'en' ? 'Emerging Strategic Leader' : 'قائد استراتيجي صاعد';
    description = language === 'en'
      ? 'You have strong foundations with clear areas of excellence. By focusing on your development areas, you can evolve into a highly effective transformational leader.'
      : 'لديك أسس قوية مع مجالات تميز واضحة. بالتركيز على مجالات تطويرك، يمكنك التطور إلى قائد تحويلي فعال للغاية.';
  } else if (avgScore >= 55) {
    profileType = language === 'en' ? 'Developing Leader' : 'قائد متطور';
    description = language === 'en'
      ? 'You are building your leadership toolkit with solid foundations in several areas. Targeted development in specific competencies will accelerate your leadership journey.'
      : 'أنت تبني أدواتك القيادية مع أسس صلبة في عدة مجالات. التطوير المستهدف في كفاءات محددة سيسرع رحلتك القيادية.';
  } else {
    profileType = language === 'en' ? 'Emerging Leader' : 'قائد ناشئ';
    description = language === 'en'
      ? 'You are at the beginning of your leadership development journey. This assessment provides a clear roadmap for building fundamental leadership competencies.'
      : 'أنت في بداية رحلة تطويرك القيادي. يوفر هذا التقييم خارطة طريق واضحة لبناء الكفاءات القيادية الأساسية.';
  }

  return {
    type: profileType,
    description,
    averageScore: Math.round(avgScore),
    excellenceAreas: highScores.length,
    developmentAreas: lowScores.length
  };
};

// Analyze response patterns to identify behavioral tendencies
const analyzeResponsePatterns = (responses, language) => {
  const patterns = [];
  
  // Analyze consistency in responses
  const scoreVariation = calculateScoreVariation(responses);
  
  if (scoreVariation < 0.5) {
    patterns.push({
      type: language === 'en' ? 'Consistent Performance' : 'أداء متسق',
      insight: language === 'en'
        ? 'Your responses show consistent decision-making across scenarios, indicating stable leadership judgment.'
        : 'تُظهر إجاباتك اتخاذ قرارات متسق عبر السيناريوهات، مما يشير إلى حكم قيادي مستقر.'
    });
  } else if (scoreVariation > 1.5) {
    patterns.push({
      type: language === 'en' ? 'Variable Approach' : 'نهج متغير',
      insight: language === 'en'
        ? 'Your responses show significant variation, which may indicate adaptability or opportunities to develop consistent frameworks.'
        : 'تُظهر إجاباتك تباينًا كبيرًا، مما قد يشير إلى قابلية التكيف أو فرص لتطوير أطر عمل متسقة.'
    });
  }

  // Group responses by competency to find strongest/weakest patterns
  const byCompetency = {};
  responses.forEach(r => {
    const key = r.competency || r.category;
    if (!byCompetency[key]) byCompetency[key] = [];
    byCompetency[key].push(r.score || r.rating);
  });

  // Find consistently high performers
  Object.entries(byCompetency).forEach(([key, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 4.5) {
      const mappedKey = competencyKeyMap[key] || key;
      const name = competencyDisplayNames[mappedKey]?.[language] || key;
      patterns.push({
        type: language === 'en' ? 'Area of Excellence' : 'مجال تميز',
        insight: language === 'en'
          ? `You consistently demonstrate strong capabilities in ${name}.`
          : `تُظهر باستمرار قدرات قوية في ${name}.`
      });
    }
  });

  return patterns;
};

// Calculate score variation
const calculateScoreVariation = (responses) => {
  if (responses.length < 2) return 0;
  
  const scores = responses.map(r => r.score || r.rating || 0);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
  
  return Math.sqrt(variance);
};

// Generate deep analysis for strengths
const generateDeepStrengthsAnalysis = (competencies, language) => {
  const strengths = competencies.filter(c => c.score >= 70).slice(0, 3);
  
  return strengths.map(strength => {
    const key = strength.key;
    const mappedKey = competencyKeyMap[key] || key;
    const competencyData = kafaatCompetencyData[mappedKey] || leadership360Data[mappedKey];
    const tier = getPerformanceTier(strength.score);
    
    let leverageStrategy;
    if (strength.score >= 90) {
      leverageStrategy = language === 'en'
        ? 'This is a signature strength. Consider mentoring others and taking on complex challenges that showcase this capability.'
        : 'هذه نقطة قوة مميزة. فكر في توجيه الآخرين وتولي تحديات معقدة تُبرز هذه القدرة.';
    } else if (strength.score >= 80) {
      leverageStrategy = language === 'en'
        ? 'You have strong capabilities here. Apply this strength to help compensate for development areas.'
        : 'لديك قدرات قوية هنا. طبّق هذه القوة للمساعدة في تعويض مجالات التطوير.';
    } else {
      leverageStrategy = language === 'en'
        ? 'This is a developing strength. Continue building on this foundation for greater leadership impact.'
        : 'هذه نقطة قوة متطورة. استمر في البناء على هذا الأساس لتأثير قيادي أكبر.';
    }

    return {
      competency: strength.name?.[language] || strength.name?.en || key,
      score: strength.score,
      tier,
      insight: competencyData?.[language]?.[`${tier}Performance`]?.insight || 
               competencyData?.en?.[`${tier}Performance`]?.insight ||
               (language === 'en' ? 'Strong performance in this area.' : 'أداء قوي في هذا المجال.'),
      leverageStrategy
    };
  });
};

// Generate prioritized development recommendations
const generatePrioritizedDevelopment = (competencies, language) => {
  const development = competencies
    .filter(c => c.score < 70)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return development.map((dev, index) => {
    const key = dev.key;
    const mappedKey = competencyKeyMap[key] || key;
    const competencyData = kafaatCompetencyData[mappedKey] || leadership360Data[mappedKey];
    const tier = getPerformanceTier(dev.score);
    const priority = index === 0 ? 'critical' : index === 1 ? 'high' : 'medium';

    // Generate specific actions based on competency
    const specificActions = generateCompetencyActions(mappedKey, tier, language);

    return {
      competency: dev.name?.[language] || dev.name?.en || key,
      score: dev.score,
      priority,
      priorityLabel: language === 'en' 
        ? (priority === 'critical' ? 'Critical Priority' : priority === 'high' ? 'High Priority' : 'Medium Priority')
        : (priority === 'critical' ? 'أولوية حرجة' : priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'),
      insight: competencyData?.[language]?.[`${tier}Performance`]?.insight ||
               competencyData?.en?.[`${tier}Performance`]?.insight ||
               (language === 'en' ? 'This area needs development.' : 'يحتاج هذا المجال للتطوير.'),
      recommendation: competencyData?.[language]?.[`${tier}Performance`]?.recommendation ||
                      competencyData?.en?.[`${tier}Performance`]?.recommendation ||
                      (language === 'en' ? 'Focus on targeted skill building.' : 'ركز على بناء مهارات مستهدفة.'),
      specificActions,
      targetScore: Math.min(dev.score + 20, 100),
      timeline: language === 'en' 
        ? `${30 * (index + 1)} days`
        : `${30 * (index + 1)} يوم`
    };
  });
};

// Generate specific actions for each competency
const generateCompetencyActions = (competencyKey, tier, language) => {
  const actionsMap = {
    leadershipFundamentals: {
      low: {
        en: ['Study situational leadership models', 'Identify your leadership strengths through self-reflection', 'Find a leadership mentor'],
        ar: ['دراسة نماذج القيادة الموقفية', 'تحديد نقاط قوتك القيادية من خلال التأمل الذاتي', 'البحث عن مرشد قيادي']
      },
      medium: {
        en: ['Practice adapting leadership style to different situations', 'Lead a small team project', 'Seek feedback on leadership approach'],
        ar: ['ممارسة تكييف الأسلوب القيادي للمواقف المختلفة', 'قيادة مشروع فريق صغير', 'طلب الملاحظات على النهج القيادي']
      },
      high: {
        en: ['Mentor emerging leaders', 'Lead complex change initiatives', 'Develop thought leadership content'],
        ar: ['توجيه القادة الناشئين', 'قيادة مبادرات تغيير معقدة', 'تطوير محتوى قيادة الفكر']
      }
    },
    changeManagement: {
      low: {
        en: ['Study Kotter\'s 8-Step Change Model', 'Practice communicating change rationale', 'Learn resistance management techniques'],
        ar: ['دراسة نموذج كوتر للتغيير', 'ممارسة توصيل مبررات التغيير', 'تعلم تقنيات إدارة المقاومة']
      },
      medium: {
        en: ['Lead a small change initiative', 'Build change coalitions', 'Create change communication plans'],
        ar: ['قيادة مبادرة تغيير صغيرة', 'بناء تحالفات التغيير', 'إنشاء خطط تواصل التغيير']
      },
      high: {
        en: ['Lead organizational transformations', 'Coach others in change management', 'Develop change frameworks'],
        ar: ['قيادة التحولات المؤسسية', 'تدريب الآخرين على إدارة التغيير', 'تطوير أطر التغيير']
      }
    },
    performanceManagement: {
      low: {
        en: ['Master SMART goal setting', 'Learn SBI feedback model', 'Practice giving constructive feedback'],
        ar: ['إتقان وضع أهداف SMART', 'تعلم نموذج SBI للتغذية الراجعة', 'ممارسة تقديم تغذية راجعة بناءة']
      },
      medium: {
        en: ['Implement regular performance check-ins', 'Develop KPIs for your team', 'Use data to drive performance discussions'],
        ar: ['تنفيذ متابعات أداء منتظمة', 'تطوير مؤشرات أداء لفريقك', 'استخدام البيانات لدفع مناقشات الأداء']
      },
      high: {
        en: ['Design performance management systems', 'Coach others in feedback delivery', 'Implement OKR frameworks'],
        ar: ['تصميم أنظمة إدارة الأداء', 'تدريب الآخرين على تقديم التغذية الراجعة', 'تنفيذ أطر OKR']
      }
    },
    teamBuilding: {
      low: {
        en: ['Study Tuckman team stages', 'Practice one-on-one relationship building', 'Learn conflict resolution basics'],
        ar: ['دراسة مراحل الفريق لـ Tuckman', 'ممارسة بناء العلاقات الفردية', 'تعلم أساسيات حل النزاعات']
      },
      medium: {
        en: ['Apply Belbin roles in team composition', 'Facilitate team-building activities', 'Address conflicts proactively'],
        ar: ['تطبيق أدوار Belbin في تكوين الفريق', 'تسهيل أنشطة بناء الفريق', 'معالجة النزاعات بشكل استباقي']
      },
      high: {
        en: ['Develop team leaders within your team', 'Create psychological safety culture', 'Lead cross-functional teams'],
        ar: ['تطوير قادة الفريق داخل فريقك', 'خلق ثقافة الأمان النفسي', 'قيادة فرق عبر الوظائف']
      }
    },
    communication: {
      low: {
        en: ['Practice active listening', 'Work on presentation skills', 'Learn to read body language'],
        ar: ['ممارسة الاستماع الفعال', 'العمل على مهارات العرض التقديمي', 'تعلم قراءة لغة الجسد']
      },
      medium: {
        en: ['Apply persuasion techniques', 'Improve meeting facilitation', 'Develop executive presence'],
        ar: ['تطبيق تقنيات الإقناع', 'تحسين تسهيل الاجتماعات', 'تطوير الحضور التنفيذي']
      },
      high: {
        en: ['Coach others in communication', 'Lead high-stakes presentations', 'Develop thought leadership'],
        ar: ['تدريب الآخرين على التواصل', 'قيادة العروض التقديمية عالية المخاطر', 'تطوير قيادة الفكر']
      }
    },
    problemSolving: {
      low: {
        en: ['Learn 5 Whys technique', 'Practice fishbone diagrams', 'Develop critical thinking habits'],
        ar: ['تعلم تقنية الخمسة لماذا', 'ممارسة مخططات عظم السمكة', 'تطوير عادات التفكير النقدي']
      },
      medium: {
        en: ['Apply OODA Loop for decisions', 'Lead problem-solving sessions', 'Use data in decision-making'],
        ar: ['تطبيق حلقة OODA للقرارات', 'قيادة جلسات حل المشكلات', 'استخدام البيانات في اتخاذ القرارات']
      },
      high: {
        en: ['Solve complex cross-functional problems', 'Train others in analytical techniques', 'Develop decision frameworks'],
        ar: ['حل مشاكل معقدة عبر الوظائف', 'تدريب الآخرين على التقنيات التحليلية', 'تطوير أطر اتخاذ القرار']
      }
    },
    emotionalIntelligence: {
      low: {
        en: ['Start emotion journaling', 'Practice self-awareness exercises', 'Learn empathy techniques'],
        ar: ['بدء تدوين المشاعر', 'ممارسة تمارين الوعي الذاتي', 'تعلم تقنيات التعاطف']
      },
      medium: {
        en: ['Develop emotional regulation skills', 'Practice empathetic listening', 'Build stronger relationships'],
        ar: ['تطوير مهارات تنظيم الانفعالات', 'ممارسة الاستماع التعاطفي', 'بناء علاقات أقوى']
      },
      high: {
        en: ['Create emotionally intelligent culture', 'Coach others in EQ', 'Lead through emotional complexity'],
        ar: ['خلق ثقافة ذكاء عاطفي', 'تدريب الآخرين على الذكاء العاطفي', 'القيادة من خلال التعقيد العاطفي']
      }
    },
    strategicImplementation: {
      low: {
        en: ['Learn project management basics', 'Practice stakeholder mapping', 'Start with small initiatives'],
        ar: ['تعلم أساسيات إدارة المشاريع', 'ممارسة رسم خرائط أصحاب المصلحة', 'البدء بمبادرات صغيرة']
      },
      medium: {
        en: ['Apply DMAIC methodology', 'Build stakeholder coalitions', 'Lead departmental initiatives'],
        ar: ['تطبيق منهجية DMAIC', 'بناء تحالفات أصحاب المصلحة', 'قيادة مبادرات إدارية']
      },
      high: {
        en: ['Lead enterprise-level initiatives', 'Mentor others in strategic execution', 'Drive organizational transformation'],
        ar: ['قيادة مبادرات على مستوى المؤسسة', 'توجيه الآخرين في التنفيذ الاستراتيجي', 'دفع التحول المؤسسي']
      }
    }
  };

  const actions = actionsMap[competencyKey]?.[tier]?.[language] || 
                  actionsMap[competencyKey]?.[tier]?.en ||
                  [
                    language === 'en' ? 'Identify specific skill gaps' : 'تحديد فجوات المهارات المحددة',
                    language === 'en' ? 'Seek training opportunities' : 'البحث عن فرص تدريبية',
                    language === 'en' ? 'Practice through application' : 'الممارسة من خلال التطبيق'
                  ];

  return actions;
};

// Analyze behavioral tendencies from responses
const analyzeBehavioralTendencies = (responses, competencies, language) => {
  const tendencies = [];
  const strongCompetencies = competencies.filter(c => c.score >= 80);
  const weakCompetencies = competencies.filter(c => c.score < 60);

  // Identify leadership style tendencies
  if (strongCompetencies.some(c => 
    ['emotionalIntelligence', 'emotional_intelligence'].includes(c.key) ||
    ['teamBuilding', 'team_building'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'People-Oriented Leader' : 'قائد موجه نحو الناس',
      description: language === 'en'
        ? 'You show strong capabilities in building relationships and understanding emotions, which helps create engaged teams.'
        : 'تُظهر قدرات قوية في بناء العلاقات وفهم المشاعر، مما يساعد على إنشاء فرق منخرطة.'
    });
  }

  if (strongCompetencies.some(c => 
    ['strategicImplementation', 'strategic_implementation'].includes(c.key) ||
    ['problemSolving', 'problem_solving'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'Results-Driven Leader' : 'قائد موجه نحو النتائج',
      description: language === 'en'
        ? 'You excel at translating strategy into action and solving complex problems systematically.'
        : 'تتفوق في ترجمة الاستراتيجية إلى عمل وحل المشكلات المعقدة بشكل منهجي.'
    });
  }

  if (strongCompetencies.some(c => 
    ['changeManagement', 'change_management'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'Change Agent' : 'وكيل التغيير',
      description: language === 'en'
        ? 'You have strong capabilities in leading organizational transformation and managing transitions.'
        : 'لديك قدرات قوية في قيادة التحول المؤسسي وإدارة الانتقالات.'
    });
  }

  // Add development focus
  if (weakCompetencies.length > 0) {
    const focusAreas = weakCompetencies.map(c => 
      c.name?.[language] || c.name?.en || c.key
    ).join(', ');
    tendencies.push({
      type: language === 'en' ? 'Development Focus' : 'محور التطوير',
      description: language === 'en'
        ? `Key areas for your development include: ${focusAreas}. Targeted improvement here will significantly enhance your leadership effectiveness.`
        : `المجالات الرئيسية لتطويرك تشمل: ${focusAreas}. التحسين المستهدف هنا سيعزز فعاليتك القيادية بشكل كبير.`
    });
  }

  return tendencies;
};

// Generate actionable next steps
const generateActionableSteps = (competencies, language) => {
  const lowestCompetency = [...competencies].sort((a, b) => a.score - b.score)[0];
  const highestCompetency = [...competencies].sort((a, b) => b.score - a.score)[0];
  
  const steps = [
    {
      timeframe: language === 'en' ? 'Immediate (Week 1)' : 'فوري (الأسبوع 1)',
      action: language === 'en'
        ? `Reflect on your assessment results and identify one specific behavior to change in ${lowestCompetency?.name?.[language] || lowestCompetency?.name?.en || 'your lowest area'}.`
        : `تأمل في نتائج تقييمك وحدد سلوكًا واحدًا محددًا للتغيير في ${lowestCompetency?.name?.[language] || lowestCompetency?.name?.ar || 'مجالك الأدنى'}.`
    },
    {
      timeframe: language === 'en' ? 'Short-term (Month 1)' : 'قصير المدى (الشهر 1)',
      action: language === 'en'
        ? 'Find a mentor or coach who can provide guidance on your development areas. Schedule regular feedback sessions.'
        : 'ابحث عن مرشد أو مدرب يمكنه تقديم التوجيه في مجالات تطويرك. جدول جلسات ملاحظات منتظمة.'
    },
    {
      timeframe: language === 'en' ? 'Medium-term (Months 2-3)' : 'متوسط المدى (الشهر 2-3)',
      action: language === 'en'
        ? 'Apply learning to real projects. Seek opportunities to practice new skills in safe environments before high-stakes situations.'
        : 'طبق التعلم على مشاريع حقيقية. ابحث عن فرص لممارسة المهارات الجديدة في بيئات آمنة قبل المواقف عالية المخاطر.'
    },
    {
      timeframe: language === 'en' ? 'Long-term (Quarter 2)' : 'طويل المدى (الربع 2)',
      action: language === 'en'
        ? `Leverage your strength in ${highestCompetency?.name?.[language] || highestCompetency?.name?.en || 'your highest area'} to compensate for development areas and create greater impact.`
        : `استفد من قوتك في ${highestCompetency?.name?.[language] || highestCompetency?.name?.ar || 'مجالك الأعلى'} لتعويض مجالات التطوير وخلق تأثير أكبر.`
    }
  ];

  return steps;
};

// Identify leadership style based on competencies
const identifyLeadershipStyle = (competencies, language) => {
  const scores = {};
  competencies.forEach(c => {
    const key = competencyKeyMap[c.key] || c.key;
    scores[key] = c.score;
  });

  // Calculate style scores
  const styles = [];

  // Transformational Leadership Score
  const transformationalScore = (
    (scores.leadershipFundamentals || 0) * 0.3 +
    (scores.changeManagement || 0) * 0.25 +
    (scores.communication || 0) * 0.25 +
    (scores.emotionalIntelligence || 0) * 0.2
  );

  // Task-Oriented Leadership Score
  const taskScore = (
    (scores.performanceManagement || 0) * 0.3 +
    (scores.problemSolving || 0) * 0.3 +
    (scores.strategicImplementation || 0) * 0.4
  );

  // People-Oriented Leadership Score
  const peopleScore = (
    (scores.teamBuilding || 0) * 0.35 +
    (scores.emotionalIntelligence || 0) * 0.35 +
    (scores.communication || 0) * 0.3
  );

  if (transformationalScore >= taskScore && transformationalScore >= peopleScore) {
    styles.push({
      primary: language === 'en' ? 'Transformational Leadership' : 'القيادة التحويلية',
      score: Math.round(transformationalScore),
      description: language === 'en'
        ? 'You inspire and motivate through vision, communication, and emotional connection. Focus on maintaining high standards while developing others.'
        : 'أنت تلهم وتحفز من خلال الرؤية والتواصل والاتصال العاطفي. ركز على الحفاظ على معايير عالية مع تطوير الآخرين.'
    });
  } else if (taskScore >= transformationalScore && taskScore >= peopleScore) {
    styles.push({
      primary: language === 'en' ? 'Task-Focused Leadership' : 'القيادة الموجهة للمهام',
      score: Math.round(taskScore),
      description: language === 'en'
        ? 'You excel at getting results through systematic approaches and problem-solving. Consider balancing task focus with team relationship building.'
        : 'تتفوق في تحقيق النتائج من خلال المناهج المنهجية وحل المشكلات. فكر في موازنة التركيز على المهام مع بناء علاقات الفريق.'
    });
  } else {
    styles.push({
      primary: language === 'en' ? 'People-Centered Leadership' : 'القيادة المرتكزة على الناس',
      score: Math.round(peopleScore),
      description: language === 'en'
        ? 'You build strong teams through relationships and emotional intelligence. Consider developing stronger task management and strategic execution skills.'
        : 'تبني فرقًا قوية من خلال العلاقات والذكاء العاطفي. فكر في تطوير مهارات أقوى في إدارة المهام والتنفيذ الاستراتيجي.'
    });
  }

  return styles[0];
};

// Create progress metrics for tracking
const createProgressMetrics = (competencies, language) => {
  return {
    currentOverall: Math.round(competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length),
    targetOverall: Math.min(Math.round(competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length) + 15, 100),
    competencyTargets: competencies.map(c => ({
      name: c.name?.[language] || c.name?.en || c.key,
      current: c.score,
      target: Math.min(c.score + 15, 100),
      gap: Math.max(0, Math.min(c.score + 15, 100) - c.score)
    })),
    milestones: [
      {
        days: 30,
        label: language === 'en' ? '30-Day Milestone' : 'علامة 30 يوم',
        goal: language === 'en' ? 'Complete self-assessment and development plan' : 'إكمال التقييم الذاتي وخطة التطوير'
      },
      {
        days: 60,
        label: language === 'en' ? '60-Day Milestone' : 'علامة 60 يوم',
        goal: language === 'en' ? 'Demonstrate measurable improvement in one area' : 'إظهار تحسن قابل للقياس في مجال واحد'
      },
      {
        days: 90,
        label: language === 'en' ? '90-Day Milestone' : 'علامة 90 يوم',
        goal: language === 'en' ? 'Integrated improvements across all development areas' : 'تحسينات متكاملة عبر جميع مجالات التطوير'
      }
    ]
  };
};

// Generate executive summary
export const generateExecutiveSummary = (overallScore, competencies, language) => {
  const profile = generateOverallProfile(competencies, language);
  const leadershipStyle = identifyLeadershipStyle(competencies, language);
  const strengths = competencies.filter(c => c.score >= 70).slice(0, 3);
  const development = competencies.filter(c => c.score < 70).slice(0, 3);

  return {
    scoreInterpretation: language === 'en'
      ? `Your overall score of ${overallScore}% places you in the ${profile.type} category.`
      : `نتيجتك الإجمالية ${overallScore}% تضعك في فئة ${profile.type}.`,
    leadershipProfile: profile,
    dominantStyle: leadershipStyle,
    topStrengths: strengths.map(s => s.name?.[language] || s.name?.en || s.key),
    priorityDevelopment: development.map(d => d.name?.[language] || d.name?.en || d.key),
    keyRecommendation: language === 'en'
      ? `Focus your development efforts on ${development[0]?.name?.[language] || development[0]?.name?.en || 'your lowest scoring area'} while leveraging your strength in ${strengths[0]?.name?.[language] || strengths[0]?.name?.en || 'your highest scoring area'}.`
      : `ركز جهودك التطويرية على ${development[0]?.name?.[language] || development[0]?.name?.ar || 'مجالك الأدنى درجة'} مع الاستفادة من قوتك في ${strengths[0]?.name?.[language] || strengths[0]?.name?.ar || 'مجالك الأعلى درجة'}.`
  };
};

export default {
  generatePersonalizedAnalysis,
  generateExecutiveSummary
};
