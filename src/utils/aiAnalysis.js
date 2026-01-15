// AI-Powered Analysis Engine for Assessment Reports
// Generates personalized insights and recommendations based on actual user responses

import { kafaatCompetencyData, leadership360Data, getPerformanceTier } from '../data/reportRecommendations';
import { competencyAreas } from '../data/kafaatQuestions';
import { leadership360Categories } from '../data/leadership360Questions';

// Competency key mapping for consistent reference
// Supports both Kafaat and 360 assessment types
const competencyKeyMap = {
  // Kafaat Assessment mappings
  leadership_fundamentals: 'leadershipFundamentals',
  change_management: 'changeManagement',
  performance_management: 'performanceManagement',
  team_building: 'teamBuilding',
  communication: 'communication',
  problem_solving: 'problemSolving',
  emotional_intelligence: 'emotionalIntelligence',
  strategic_implementation: 'strategicImplementation',
  // 360 Assessment mappings (direct mappings - keys match)
  vision: 'vision',
  teamLeadership: 'teamLeadership',
  decisionMaking: 'decisionMaking',
  emotionalIntelligence: 'emotionalIntelligence',
  changeManagement: 'changeManagement',
  accountability: 'accountability',
  development: 'development',
  integrity: 'integrity',
  innovation: 'innovation'
};

// Reverse mapping for display names - supports both Kafaat and 360 assessments
const competencyDisplayNames = {
  // Kafaat Assessment competencies
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
  },
  // 360 Assessment categories
  vision: {
    en: 'Vision & Strategic Thinking',
    ar: 'الرؤية والتفكير الاستراتيجي'
  },
  teamLeadership: {
    en: 'Team Leadership',
    ar: 'قيادة الفريق'
  },
  decisionMaking: {
    en: 'Decision Making',
    ar: 'اتخاذ القرارات'
  },
  accountability: {
    en: 'Accountability & Results',
    ar: 'المساءلة والنتائج'
  },
  development: {
    en: 'Development & Coaching',
    ar: 'التطوير والتوجيه'
  },
  integrity: {
    en: 'Integrity & Ethics',
    ar: 'النزاهة والأخلاق'
  },
  innovation: {
    en: 'Innovation & Adaptability',
    ar: 'الابتكار والتكيف'
  }
};

// Generate AI-powered personalized analysis based on user responses
export const generatePersonalizedAnalysis = (responses, competencyResults, language = 'en') => {
  // Safety check - ensure competencyResults is a valid array
  if (!competencyResults || !Array.isArray(competencyResults) || competencyResults.length === 0) {
    console.warn('generatePersonalizedAnalysis: Invalid or empty competencyResults');
    return {
      overallProfile: { type: language === 'en' ? 'Assessment Pending' : 'التقييم معلق', description: language === 'en' ? 'No competency data available.' : 'لا تتوفر بيانات الكفاءات.', averageScore: 0, excellenceAreas: 0, developmentAreas: 0 },
      patternAnalysis: [],
      strengthsDeep: [],
      developmentPriorities: [],
      behavioralInsights: [],
      actionableSteps: [],
      leadershipStyle: null,
      progressMetrics: { currentOverall: 0, targetOverall: 0, competencyTargets: [], milestones: [] }
    };
  }
  
  const analysis = {
    overallProfile: generateOverallProfile(competencyResults, language),
    patternAnalysis: analyzeResponsePatterns(responses || [], language),
    strengthsDeep: generateDeepStrengthsAnalysis(competencyResults, language),
    developmentPriorities: generatePrioritizedDevelopment(competencyResults, language),
    behavioralInsights: analyzeBehavioralTendencies(responses || [], competencyResults, language),
    actionableSteps: generateActionableSteps(competencyResults, language),
    leadershipStyle: identifyLeadershipStyle(competencyResults, language),
    progressMetrics: createProgressMetrics(competencyResults, language)
  };

  return analysis;
};

// Generate overall leadership profile based on scores
const generateOverallProfile = (competencies, language) => {
  if (!competencies || competencies.length === 0) {
    return { type: language === 'en' ? 'Assessment Pending' : 'التقييم معلق', description: '', averageScore: 0, excellenceAreas: 0, developmentAreas: 0 };
  }
  
  const avgScore = competencies.reduce((sum, c) => sum + (c.score || 0), 0) / competencies.length;
  const highScores = competencies.filter(c => (c.score || 0) >= 80);
  const lowScores = competencies.filter(c => (c.score || 0) < 60);
  
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

// Helper function to extract display name from item (handles both Kafaat and 360 formats)
const getItemDisplayName = (item, language) => {
  if (!item.name) {
    // Fallback to key with formatting
    const key = item.key || 'Unknown';
    return competencyDisplayNames[key]?.[language] || key.replace(/([A-Z])/g, ' $1').trim();
  }
  
  // 360 format: { en: { name: '...', icon: '...' }, ar: { name: '...', icon: '...' } }
  if (item.name[language]?.name) {
    return item.name[language].name;
  }
  // Kafaat format: { en: '...', ar: '...' }
  if (typeof item.name[language] === 'string') {
    return item.name[language];
  }
  // Fallback to English
  if (item.name.en?.name) {
    return item.name.en.name;
  }
  if (typeof item.name.en === 'string') {
    return item.name.en;
  }
  // Final fallback
  const key = item.key || 'Unknown';
  return competencyDisplayNames[key]?.[language] || key;
};

// Generate deep analysis for strengths
const generateDeepStrengthsAnalysis = (competencies, language) => {
  if (!competencies || competencies.length === 0) return [];
  
  const strengths = competencies.filter(c => (c.score || 0) >= 70).slice(0, 3);
  
  return strengths.map(strength => {
    const key = strength.key || '';
    const mappedKey = competencyKeyMap[key] || key;
    const competencyData = kafaatCompetencyData[mappedKey] || leadership360Data[mappedKey];
    const score = strength.score || 0;
    const tier = getPerformanceTier(score);
    
    let leverageStrategy;
    if (score >= 90) {
      leverageStrategy = language === 'en'
        ? 'This is a signature strength. Consider mentoring others and taking on complex challenges that showcase this capability.'
        : 'هذه نقطة قوة مميزة. فكر في توجيه الآخرين وتولي تحديات معقدة تُبرز هذه القدرة.';
    } else if (score >= 80) {
      leverageStrategy = language === 'en'
        ? 'You have strong capabilities here. Apply this strength to help compensate for development areas.'
        : 'لديك قدرات قوية هنا. طبّق هذه القوة للمساعدة في تعويض مجالات التطوير.';
    } else {
      leverageStrategy = language === 'en'
        ? 'This is a developing strength. Continue building on this foundation for greater leadership impact.'
        : 'هذه نقطة قوة متطورة. استمر في البناء على هذا الأساس لتأثير قيادي أكبر.';
    }

    return {
      competency: getItemDisplayName(strength, language),
      score: score,
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
  if (!competencies || competencies.length === 0) return [];
  
  const development = competencies
    .filter(c => (c.score || 0) < 70)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 3);

  return development.map((dev, index) => {
    const key = dev.key || '';
    const mappedKey = competencyKeyMap[key] || key;
    const competencyData = kafaatCompetencyData[mappedKey] || leadership360Data[mappedKey];
    const score = dev.score || 0;
    const tier = getPerformanceTier(score);
    const priority = index === 0 ? 'critical' : index === 1 ? 'high' : 'medium';

    // Generate specific actions based on competency
    const specificActions = generateCompetencyActions(mappedKey, tier, language);

    return {
      competency: getItemDisplayName(dev, language),
      score: score,
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
      targetScore: Math.min(score + 20, 100),
      timeline: language === 'en' 
        ? `${30 * (index + 1)} days`
        : `${30 * (index + 1)} يوم`
    };
  });
};

// Generate specific actions for each competency (supports both Kafaat and 360)
const generateCompetencyActions = (competencyKey, tier, language) => {
  const actionsMap = {
    // Kafaat competencies
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
    },
    // 360 Assessment categories
    vision: {
      low: {
        en: ['Study strategic planning frameworks', 'Practice articulating team vision', 'Connect daily work to organizational goals'],
        ar: ['دراسة أطر التخطيط الاستراتيجي', 'ممارسة صياغة رؤية الفريق', 'ربط العمل اليومي بأهداف المنظمة']
      },
      medium: {
        en: ['Lead strategic planning sessions', 'Translate high-level strategy to team objectives', 'Communicate vision more frequently'],
        ar: ['قيادة جلسات التخطيط الاستراتيجي', 'ترجمة الاستراتيجية إلى أهداف الفريق', 'توصيل الرؤية بشكل أكثر تكراراً']
      },
      high: {
        en: ['Lead cross-functional strategic initiatives', 'Mentor others in strategic thinking', 'Shape organizational direction'],
        ar: ['قيادة مبادرات استراتيجية عبر الوظائف', 'توجيه الآخرين في التفكير الاستراتيجي', 'تشكيل اتجاه المنظمة']
      }
    },
    teamLeadership: {
      low: {
        en: ['Build one-on-one relationships with team members', 'Practice delegation with clear expectations', 'Learn conflict resolution techniques'],
        ar: ['بناء علاقات فردية مع أعضاء الفريق', 'ممارسة التفويض مع توقعات واضحة', 'تعلم تقنيات حل النزاعات']
      },
      medium: {
        en: ['Create psychological safety in meetings', 'Optimize team composition and roles', 'Address conflicts proactively'],
        ar: ['خلق الأمان النفسي في الاجتماعات', 'تحسين تكوين الفريق والأدوار', 'معالجة النزاعات بشكل استباقي']
      },
      high: {
        en: ['Develop team leaders within your team', 'Build high-performing cross-functional teams', 'Create team culture of excellence'],
        ar: ['تطوير قادة الفريق داخل فريقك', 'بناء فرق عالية الأداء عبر الوظائف', 'خلق ثقافة فريق متميزة']
      }
    },
    decisionMaking: {
      low: {
        en: ['Use pros/cons analysis for decisions', 'Seek input from trusted advisors', 'Start with reversible decisions to build confidence'],
        ar: ['استخدام تحليل الإيجابيات/السلبيات للقرارات', 'طلب المدخلات من المستشارين الموثوقين', 'البدء بقرارات قابلة للعكس لبناء الثقة']
      },
      medium: {
        en: ['Set decision deadlines to avoid analysis paralysis', 'Create stakeholder input frameworks', 'Balance speed with thoroughness'],
        ar: ['تحديد مواعيد نهائية للقرارات لتجنب شلل التحليل', 'إنشاء أطر لمدخلات أصحاب المصلحة', 'الموازنة بين السرعة والدقة']
      },
      high: {
        en: ['Lead complex organizational decisions', 'Mentor others in decision frameworks', 'Drive strategic decision-making culture'],
        ar: ['قيادة قرارات مؤسسية معقدة', 'توجيه الآخرين في أطر اتخاذ القرار', 'دفع ثقافة اتخاذ القرار الاستراتيجي']
      }
    },
    accountability: {
      low: {
        en: ['Keep all commitments consistently', 'Set clear written expectations', 'Create simple tracking systems'],
        ar: ['الحفاظ على جميع الالتزامات باستمرار', 'وضع توقعات واضحة مكتوبة', 'إنشاء أنظمة تتبع بسيطة']
      },
      medium: {
        en: ['Create comprehensive tracking systems', 'Provide feedback more frequently', 'Hold regular accountability check-ins'],
        ar: ['إنشاء أنظمة تتبع شاملة', 'تقديم التغذية الراجعة بشكل أكثر تكراراً', 'عقد جلسات متابعة المساءلة المنتظمة']
      },
      high: {
        en: ['Model accountability culture', 'Establish organization-wide standards', 'Coach others in accountability practices'],
        ar: ['نمذجة ثقافة المساءلة', 'وضع معايير على مستوى المنظمة', 'تدريب الآخرين على ممارسات المساءلة']
      }
    },
    development: {
      low: {
        en: ['Hold regular one-on-ones focused on growth', 'Ask about team members\' career aspirations', 'Provide specific feedback on performance'],
        ar: ['عقد لقاءات فردية منتظمة تركز على النمو', 'السؤال عن تطلعات أعضاء الفريق المهنية', 'تقديم تغذية راجعة محددة حول الأداء']
      },
      medium: {
        en: ['Create individual development plans', 'Schedule regular coaching conversations', 'Provide growth opportunities'],
        ar: ['إنشاء خطط تطوير فردية', 'جدولة محادثات توجيه منتظمة', 'توفير فرص النمو']
      },
      high: {
        en: ['Formalize coaching approach', 'Lead talent development initiatives', 'Develop next generation of leaders'],
        ar: ['ترسيم نهج التوجيه', 'قيادة مبادرات تطوير المواهب', 'تطوير الجيل القادم من القادة']
      }
    },
    integrity: {
      low: {
        en: ['Keep all commitments including small ones', 'Admit mistakes openly', 'Ensure actions align with stated values'],
        ar: ['الحفاظ على جميع الالتزامات بما فيها الصغيرة', 'الاعتراف بالأخطاء صراحة', 'ضمان توافق الأفعال مع القيم المعلنة']
      },
      medium: {
        en: ['Communicate reasoning more openly', 'Be more transparent in decisions', 'Model ethical behavior consistently'],
        ar: ['توصيل الأسباب بشكل أكثر انفتاحاً', 'كن أكثر شفافية في القرارات', 'نمذجة السلوك الأخلاقي باستمرار']
      },
      high: {
        en: ['Champion ethics initiatives', 'Mentor others in ethical dilemmas', 'Build trust-based culture'],
        ar: ['دعم مبادرات الأخلاق', 'توجيه الآخرين في المعضلات الأخلاقية', 'بناء ثقافة قائمة على الثقة']
      }
    },
    innovation: {
      low: {
        en: ['Be more open to others\' ideas', 'Try small experiments before major changes', 'Celebrate learning from failures'],
        ar: ['كن أكثر انفتاحاً لأفكار الآخرين', 'جرب تجارب صغيرة قبل التغييرات الكبرى', 'احتفل بالتعلم من الإخفاقات']
      },
      medium: {
        en: ['Create space for experimentation', 'Ask "what if" questions more often', 'Encourage calculated risk-taking'],
        ar: ['أنشئ مساحة للتجريب', 'اطرح أسئلة "ماذا لو" أكثر', 'شجع المخاطرة المحسوبة']
      },
      high: {
        en: ['Lead innovation initiatives', 'Create structures for capturing new ideas', 'Drive continuous improvement culture'],
        ar: ['قيادة مبادرات الابتكار', 'إنشاء هياكل لالتقاط الأفكار الجديدة', 'دفع ثقافة التحسين المستمر']
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

// Analyze behavioral tendencies from responses (supports both Kafaat and 360)
const analyzeBehavioralTendencies = (responses, competencies, language) => {
  if (!competencies || competencies.length === 0) return [];
  
  const tendencies = [];
  const strongCompetencies = competencies.filter(c => (c.score || 0) >= 80);
  const weakCompetencies = competencies.filter(c => (c.score || 0) < 60);

  // Check for people-oriented tendencies (supports both assessment types)
  if (strongCompetencies.some(c => 
    ['emotionalIntelligence', 'emotional_intelligence'].includes(c.key) ||
    ['teamBuilding', 'team_building', 'teamLeadership', 'development'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'People-Oriented Leader' : 'قائد موجه نحو الناس',
      description: language === 'en'
        ? 'You show strong capabilities in building relationships and understanding emotions, which helps create engaged teams.'
        : 'تُظهر قدرات قوية في بناء العلاقات وفهم المشاعر، مما يساعد على إنشاء فرق منخرطة.'
    });
  }

  // Check for results-driven tendencies (supports both assessment types)
  if (strongCompetencies.some(c => 
    ['strategicImplementation', 'strategic_implementation', 'accountability', 'decisionMaking'].includes(c.key) ||
    ['problemSolving', 'problem_solving'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'Results-Driven Leader' : 'قائد موجه نحو النتائج',
      description: language === 'en'
        ? 'You excel at translating strategy into action and solving complex problems systematically.'
        : 'تتفوق في ترجمة الاستراتيجية إلى عمل وحل المشكلات المعقدة بشكل منهجي.'
    });
  }

  // Check for change agent tendencies (supports both assessment types)
  if (strongCompetencies.some(c => 
    ['changeManagement', 'change_management', 'innovation'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'Change Agent' : 'وكيل التغيير',
      description: language === 'en'
        ? 'You have strong capabilities in leading organizational transformation and managing transitions.'
        : 'لديك قدرات قوية في قيادة التحول المؤسسي وإدارة الانتقالات.'
    });
  }

  // Check for visionary tendencies (360 specific)
  if (strongCompetencies.some(c => 
    ['vision'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'Visionary Leader' : 'قائد رؤيوي',
      description: language === 'en'
        ? 'You excel at setting direction, communicating vision, and aligning teams with strategic goals.'
        : 'تتفوق في تحديد الاتجاه وتوصيل الرؤية ومواءمة الفرق مع الأهداف الاستراتيجية.'
    });
  }

  // Check for ethical leader tendencies (360 specific)
  if (strongCompetencies.some(c => 
    ['integrity'].includes(c.key)
  )) {
    tendencies.push({
      type: language === 'en' ? 'Ethical Leader' : 'قائد أخلاقي',
      description: language === 'en'
        ? 'You demonstrate exceptional integrity and build deep trust through consistent ethical behavior.'
        : 'تُظهر نزاهة استثنائية وتبني ثقة عميقة من خلال السلوك الأخلاقي المتسق.'
    });
  }

  // Add development focus
  if (weakCompetencies.length > 0) {
    const focusAreas = weakCompetencies.map(c => 
      getItemDisplayName(c, language)
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
  if (!competencies || competencies.length === 0) return [];
  
  const sortedByScore = [...competencies].sort((a, b) => (a.score || 0) - (b.score || 0));
  const lowestCompetency = sortedByScore[0];
  const highestCompetency = sortedByScore[sortedByScore.length - 1];
  
  const lowestName = lowestCompetency ? getItemDisplayName(lowestCompetency, language) : (language === 'en' ? 'your lowest area' : 'مجالك الأدنى');
  const highestName = highestCompetency ? getItemDisplayName(highestCompetency, language) : (language === 'en' ? 'your highest area' : 'مجالك الأعلى');
  
  const steps = [
    {
      timeframe: language === 'en' ? 'Immediate (Week 1)' : 'فوري (الأسبوع 1)',
      action: language === 'en'
        ? `Reflect on your assessment results and identify one specific behavior to change in ${lowestName}.`
        : `تأمل في نتائج تقييمك وحدد سلوكًا واحدًا محددًا للتغيير في ${lowestName}.`
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
        ? `Leverage your strength in ${highestName} to compensate for development areas and create greater impact.`
        : `استفد من قوتك في ${highestName} لتعويض مجالات التطوير وخلق تأثير أكبر.`
    }
  ];

  return steps;
};

// Identify leadership style based on competencies (supports both Kafaat and 360)
const identifyLeadershipStyle = (competencies, language) => {
  if (!competencies || competencies.length === 0) return null;
  
  const scores = {};
  competencies.forEach(c => {
    const key = competencyKeyMap[c.key] || c.key;
    scores[key] = c.score || 0;
  });

  // Detect assessment type based on available keys
  const is360 = scores.vision !== undefined || scores.teamLeadership !== undefined || scores.accountability !== undefined;

  // Calculate style scores
  const styles = [];
  let transformationalScore, taskScore, peopleScore;

  if (is360) {
    // 360 Assessment scoring
    transformationalScore = (
      (scores.vision || 0) * 0.3 +
      (scores.changeManagement || 0) * 0.25 +
      (scores.communication || 0) * 0.25 +
      (scores.emotionalIntelligence || 0) * 0.2
    );

    taskScore = (
      (scores.accountability || 0) * 0.35 +
      (scores.decisionMaking || 0) * 0.35 +
      (scores.innovation || 0) * 0.3
    );

    peopleScore = (
      (scores.teamLeadership || 0) * 0.35 +
      (scores.emotionalIntelligence || 0) * 0.3 +
      (scores.development || 0) * 0.35
    );
  } else {
    // Kafaat Assessment scoring
    transformationalScore = (
      (scores.leadershipFundamentals || 0) * 0.3 +
      (scores.changeManagement || 0) * 0.25 +
      (scores.communication || 0) * 0.25 +
      (scores.emotionalIntelligence || 0) * 0.2
    );

    taskScore = (
      (scores.performanceManagement || 0) * 0.3 +
      (scores.problemSolving || 0) * 0.3 +
      (scores.strategicImplementation || 0) * 0.4
    );

    peopleScore = (
      (scores.teamBuilding || 0) * 0.35 +
      (scores.emotionalIntelligence || 0) * 0.35 +
      (scores.communication || 0) * 0.3
    );
  }

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
  if (!competencies || competencies.length === 0) {
    return { currentOverall: 0, targetOverall: 0, competencyTargets: [], milestones: [] };
  }
  
  const totalScore = competencies.reduce((sum, c) => sum + (c.score || 0), 0);
  const avgScore = totalScore / competencies.length;
  
  return {
    currentOverall: Math.round(avgScore),
    targetOverall: Math.min(Math.round(avgScore) + 15, 100),
    competencyTargets: competencies.map(c => {
      const score = c.score || 0;
      return {
        name: getItemDisplayName(c, language),
        current: score,
        target: Math.min(score + 15, 100),
        gap: Math.max(0, Math.min(score + 15, 100) - score)
      };
    }),
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
  if (!competencies || competencies.length === 0) {
    return {
      scoreInterpretation: language === 'en' ? 'Assessment data not available.' : 'بيانات التقييم غير متوفرة.',
      leadershipProfile: null,
      dominantStyle: null,
      topStrengths: [],
      priorityDevelopment: [],
      keyRecommendation: ''
    };
  }
  
  const profile = generateOverallProfile(competencies, language);
  const leadershipStyle = identifyLeadershipStyle(competencies, language);
  const strengths = competencies.filter(c => (c.score || 0) >= 70).slice(0, 3);
  const development = competencies.filter(c => (c.score || 0) < 70).slice(0, 3);
  
  const topStrengthName = strengths[0] ? getItemDisplayName(strengths[0], language) : (language === 'en' ? 'your highest scoring area' : 'مجالك الأعلى درجة');
  const topDevName = development[0] ? getItemDisplayName(development[0], language) : (language === 'en' ? 'your lowest scoring area' : 'مجالك الأدنى درجة');

  return {
    scoreInterpretation: language === 'en'
      ? `Your overall score of ${overallScore}% places you in the ${profile.type} category.`
      : `نتيجتك الإجمالية ${overallScore}% تضعك في فئة ${profile.type}.`,
    leadershipProfile: profile,
    dominantStyle: leadershipStyle,
    topStrengths: strengths.map(s => getItemDisplayName(s, language)),
    priorityDevelopment: development.map(d => getItemDisplayName(d, language)),
    keyRecommendation: language === 'en'
      ? `Focus your development efforts on ${topDevName} while leveraging your strength in ${topStrengthName}.`
      : `ركز جهودك التطويرية على ${topDevName} مع الاستفادة من قوتك في ${topStrengthName}.`
  };
};

export default {
  generatePersonalizedAnalysis,
  generateExecutiveSummary
};
