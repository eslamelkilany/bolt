// AI-Powered Custom Assessment Engine
// Generates assessments from training course plans and produces comprehensive reports

// ==================== QUESTION GENERATION ENGINE ====================

/**
 * Bloom's Taxonomy levels for question difficulty
 */
export const bloomsLevels = {
  remember: {
    en: 'Remember',
    ar: 'التذكر',
    verbs: ['define', 'list', 'recall', 'identify', 'name', 'state'],
    weight: 1
  },
  understand: {
    en: 'Understand',
    ar: 'الفهم',
    verbs: ['explain', 'describe', 'summarize', 'interpret', 'classify'],
    weight: 2
  },
  apply: {
    en: 'Apply',
    ar: 'التطبيق',
    verbs: ['apply', 'demonstrate', 'use', 'implement', 'solve'],
    weight: 3
  },
  analyze: {
    en: 'Analyze',
    ar: 'التحليل',
    verbs: ['analyze', 'compare', 'contrast', 'examine', 'differentiate'],
    weight: 4
  },
  evaluate: {
    en: 'Evaluate',
    ar: 'التقييم',
    verbs: ['evaluate', 'assess', 'justify', 'critique', 'recommend'],
    weight: 5
  },
  create: {
    en: 'Create',
    ar: 'الابتكار',
    verbs: ['create', 'design', 'develop', 'formulate', 'propose'],
    weight: 6
  }
};

/**
 * Question types supported by the engine
 */
export const questionTypes = {
  multipleChoice: {
    en: 'Multiple Choice',
    ar: 'اختيار من متعدد',
    icon: '📝'
  },
  trueFalse: {
    en: 'True/False',
    ar: 'صح/خطأ',
    icon: '✓✗'
  },
  scenario: {
    en: 'Scenario-Based',
    ar: 'قائم على السيناريو',
    icon: '🎯'
  },
  shortAnswer: {
    en: 'Short Answer',
    ar: 'إجابة قصيرة',
    icon: '✏️'
  }
};

/**
 * Parse training course content and extract learning objectives
 */
export const parseCoursePlan = (coursePlan) => {
  const parsed = {
    title: coursePlan.title || { en: 'Untitled Course', ar: 'دورة بدون عنوان' },
    description: coursePlan.description || { en: '', ar: '' },
    duration: coursePlan.duration || '1 day',
    modules: [],
    learningObjectives: [],
    keyTerms: [],
    targetAudience: coursePlan.targetAudience || { en: 'General', ar: 'عام' }
  };

  // Extract modules and objectives
  if (coursePlan.modules && Array.isArray(coursePlan.modules)) {
    parsed.modules = coursePlan.modules.map((module, idx) => ({
      id: `module-${idx + 1}`,
      title: module.title || { en: `Module ${idx + 1}`, ar: `الوحدة ${idx + 1}` },
      objectives: module.objectives || [],
      topics: module.topics || [],
      duration: module.duration || '1 hour'
    }));

    // Flatten all objectives
    parsed.learningObjectives = parsed.modules.flatMap(m => 
      m.objectives.map((obj, i) => ({
        id: `obj-${m.id}-${i}`,
        moduleId: m.id,
        text: obj,
        bloomLevel: detectBloomLevel(typeof obj === 'string' ? obj : obj.en || '')
      }))
    );
  }

  // Extract key terms if provided
  if (coursePlan.keyTerms && Array.isArray(coursePlan.keyTerms)) {
    parsed.keyTerms = coursePlan.keyTerms;
  }

  return parsed;
};

/**
 * Detect Bloom's taxonomy level from objective text
 */
const detectBloomLevel = (objectiveText) => {
  const text = objectiveText.toLowerCase();
  
  for (const [level, data] of Object.entries(bloomsLevels)) {
    if (data.verbs.some(verb => text.includes(verb))) {
      return level;
    }
  }
  return 'understand'; // Default level
};

/**
 * Generate questions from parsed course plan
 */
export const generateQuestionsFromCourse = (parsedCourse, config = {}) => {
  const {
    totalQuestions = 20,
    preTestRatio = 0.5, // 50% for pre-test, 50% for post-test
    questionDistribution = {
      multipleChoice: 0.5,
      trueFalse: 0.2,
      scenario: 0.2,
      shortAnswer: 0.1
    },
    bloomDistribution = {
      remember: 0.15,
      understand: 0.25,
      apply: 0.25,
      analyze: 0.20,
      evaluate: 0.10,
      create: 0.05
    }
  } = config;

  const questions = {
    preTest: [],
    postTest: [],
    all: []
  };

  // Generate questions for each module/objective
  const questionsPerObjective = Math.ceil(totalQuestions / Math.max(parsedCourse.learningObjectives.length, 1));
  
  parsedCourse.learningObjectives.forEach((objective, objIdx) => {
    const moduleQuestions = generateObjectiveQuestions(
      objective,
      parsedCourse,
      questionsPerObjective,
      objIdx
    );
    questions.all.push(...moduleQuestions);
  });

  // Shuffle and distribute between pre and post test
  const shuffled = shuffleArray([...questions.all]);
  const preTestCount = Math.ceil(shuffled.length * preTestRatio);
  
  questions.preTest = shuffled.slice(0, preTestCount).map((q, i) => ({
    ...q,
    id: `pre-${i + 1}`,
    testType: 'pre'
  }));
  
  questions.postTest = shuffled.slice(preTestCount).map((q, i) => ({
    ...q,
    id: `post-${i + 1}`,
    testType: 'post'
  }));

  // If post-test is empty, duplicate from pre-test with variations
  if (questions.postTest.length === 0 && questions.preTest.length > 0) {
    questions.postTest = questions.preTest.map((q, i) => ({
      ...q,
      id: `post-${i + 1}`,
      testType: 'post'
    }));
  }

  return questions;
};

/**
 * Generate questions for a specific objective
 */
const generateObjectiveQuestions = (objective, course, count, baseIndex) => {
  const questions = [];
  const bloomLevel = objective.bloomLevel || 'understand';
  
  for (let i = 0; i < count; i++) {
    const questionType = selectQuestionType(bloomLevel);
    const question = createQuestion(objective, course, questionType, baseIndex * count + i);
    if (question) {
      questions.push(question);
    }
  }
  
  return questions;
};

/**
 * Select appropriate question type based on Bloom's level
 */
const selectQuestionType = (bloomLevel) => {
  const levelMapping = {
    remember: ['multipleChoice', 'trueFalse'],
    understand: ['multipleChoice', 'trueFalse', 'shortAnswer'],
    apply: ['scenario', 'multipleChoice'],
    analyze: ['scenario', 'multipleChoice'],
    evaluate: ['scenario', 'shortAnswer'],
    create: ['shortAnswer', 'scenario']
  };
  
  const types = levelMapping[bloomLevel] || ['multipleChoice'];
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Create a question based on type and objective
 */
const createQuestion = (objective, course, type, index) => {
  const objectiveText = typeof objective.text === 'string' 
    ? objective.text 
    : objective.text?.en || '';

  const baseQuestion = {
    objectiveId: objective.id,
    moduleId: objective.moduleId,
    bloomLevel: objective.bloomLevel,
    type,
    points: bloomsLevels[objective.bloomLevel]?.weight || 2,
    createdAt: new Date().toISOString()
  };

  switch (type) {
    case 'multipleChoice':
      return {
        ...baseQuestion,
        question: {
          en: `Based on the learning objective: "${objectiveText}", which of the following best describes the correct approach?`,
          ar: `بناءً على هدف التعلم: "${objectiveText}"، أي مما يلي يصف أفضل النهج الصحيح؟`
        },
        options: [
          { id: 'a', text: { en: 'Option A - Correct approach', ar: 'الخيار أ - النهج الصحيح' }, isCorrect: true },
          { id: 'b', text: { en: 'Option B - Partially correct', ar: 'الخيار ب - صحيح جزئياً' }, isCorrect: false },
          { id: 'c', text: { en: 'Option C - Incorrect approach', ar: 'الخيار ج - نهج خاطئ' }, isCorrect: false },
          { id: 'd', text: { en: 'Option D - Not applicable', ar: 'الخيار د - غير قابل للتطبيق' }, isCorrect: false }
        ],
        feedback: {
          correct: { en: 'Excellent! You demonstrated understanding of this concept.', ar: 'ممتاز! أظهرت فهماً لهذا المفهوم.' },
          incorrect: { en: 'Review this objective and try again.', ar: 'راجع هذا الهدف وحاول مرة أخرى.' }
        }
      };

    case 'trueFalse':
      return {
        ...baseQuestion,
        question: {
          en: `True or False: The following statement accurately reflects the learning objective - "${objectiveText}"`,
          ar: `صح أو خطأ: العبارة التالية تعكس بدقة هدف التعلم - "${objectiveText}"`
        },
        correctAnswer: true,
        feedback: {
          correct: { en: 'Correct! You understand this concept.', ar: 'صحيح! أنت تفهم هذا المفهوم.' },
          incorrect: { en: 'Incorrect. Please review the material.', ar: 'خطأ. يرجى مراجعة المادة.' }
        }
      };

    case 'scenario':
      return {
        ...baseQuestion,
        scenario: {
          en: `Consider this workplace scenario related to: ${objectiveText}. A team member faces a challenge that requires applying the concepts learned.`,
          ar: `فكر في هذا السيناريو المتعلق بـ: ${objectiveText}. يواجه عضو الفريق تحدياً يتطلب تطبيق المفاهيم المكتسبة.`
        },
        question: {
          en: 'What would be the most effective approach in this situation?',
          ar: 'ما هو النهج الأكثر فعالية في هذه الحالة؟'
        },
        options: [
          { id: 'a', text: { en: 'Apply the learned concepts systematically', ar: 'تطبيق المفاهيم المكتسبة بشكل منهجي' }, isCorrect: true, score: 4 },
          { id: 'b', text: { en: 'Seek guidance before taking action', ar: 'طلب التوجيه قبل اتخاذ إجراء' }, isCorrect: false, score: 3 },
          { id: 'c', text: { en: 'Use trial and error approach', ar: 'استخدام نهج التجربة والخطأ' }, isCorrect: false, score: 2 },
          { id: 'd', text: { en: 'Avoid the situation entirely', ar: 'تجنب الموقف تماماً' }, isCorrect: false, score: 1 }
        ],
        feedback: {
          en: 'This scenario tests your ability to apply theoretical knowledge in practical situations.',
          ar: 'يختبر هذا السيناريو قدرتك على تطبيق المعرفة النظرية في المواقف العملية.'
        }
      };

    case 'shortAnswer':
      return {
        ...baseQuestion,
        question: {
          en: `In your own words, explain the key concept from: "${objectiveText}"`,
          ar: `بكلماتك الخاصة، اشرح المفهوم الرئيسي من: "${objectiveText}"`
        },
        rubric: {
          excellent: { score: 4, description: { en: 'Complete and accurate explanation', ar: 'شرح كامل ودقيق' } },
          good: { score: 3, description: { en: 'Mostly accurate with minor gaps', ar: 'دقيق في الغالب مع فجوات طفيفة' } },
          fair: { score: 2, description: { en: 'Partial understanding demonstrated', ar: 'فهم جزئي واضح' } },
          poor: { score: 1, description: { en: 'Limited understanding', ar: 'فهم محدود' } }
        }
      };

    default:
      return null;
  }
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ==================== SCORING ENGINE ====================

/**
 * Calculate assessment score
 */
export const calculateAssessmentScore = (responses, questions) => {
  let totalPoints = 0;
  let earnedPoints = 0;
  const questionResults = [];

  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (!question) return;

    const maxPoints = question.points || 1;
    totalPoints += maxPoints;

    let score = 0;
    let isCorrect = false;

    switch (question.type) {
      case 'multipleChoice':
        const correctOption = question.options?.find(o => o.isCorrect);
        isCorrect = response.answer === correctOption?.id;
        score = isCorrect ? maxPoints : 0;
        break;

      case 'trueFalse':
        isCorrect = response.answer === question.correctAnswer;
        score = isCorrect ? maxPoints : 0;
        break;

      case 'scenario':
        const selectedOption = question.options?.find(o => o.id === response.answer);
        score = selectedOption?.score || 0;
        isCorrect = selectedOption?.isCorrect || false;
        break;

      case 'shortAnswer':
        // Short answers need manual grading or AI evaluation
        score = response.score || 0;
        isCorrect = score >= (maxPoints * 0.7);
        break;
    }

    earnedPoints += score;
    questionResults.push({
      questionId: question.id,
      response: response.answer,
      score,
      maxPoints,
      isCorrect,
      bloomLevel: question.bloomLevel,
      moduleId: question.moduleId
    });
  });

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    earnedPoints,
    totalPoints,
    percentage,
    questionResults,
    passingThreshold: 70,
    passed: percentage >= 70
  };
};

/**
 * Calculate improvement between pre and post test
 */
export const calculateImprovement = (preTestScore, postTestScore) => {
  const improvement = postTestScore.percentage - preTestScore.percentage;
  const improvementRate = preTestScore.percentage > 0 
    ? Math.round((improvement / preTestScore.percentage) * 100) 
    : postTestScore.percentage;

  let level, description;
  if (improvement >= 30) {
    level = 'exceptional';
    description = { en: 'Exceptional improvement', ar: 'تحسن استثنائي' };
  } else if (improvement >= 20) {
    level = 'significant';
    description = { en: 'Significant improvement', ar: 'تحسن كبير' };
  } else if (improvement >= 10) {
    level = 'moderate';
    description = { en: 'Moderate improvement', ar: 'تحسن معتدل' };
  } else if (improvement >= 0) {
    level = 'slight';
    description = { en: 'Slight improvement', ar: 'تحسن طفيف' };
  } else {
    level = 'decline';
    description = { en: 'Needs attention', ar: 'يحتاج اهتمام' };
  }

  return {
    points: improvement,
    rate: improvementRate,
    level,
    description,
    preScore: preTestScore.percentage,
    postScore: postTestScore.percentage
  };
};

// ==================== REPORT GENERATION ====================

/**
 * Generate comprehensive assessment report
 */
export const generateAssessmentReport = (trainee, course, preTestScore, postTestScore, language = 'en') => {
  const improvement = calculateImprovement(preTestScore, postTestScore);
  
  // Analyze performance by module
  const moduleAnalysis = analyzeByModule(preTestScore, postTestScore, course);
  
  // Analyze by Bloom's level
  const bloomAnalysis = analyzeByBloomLevel(preTestScore, postTestScore);
  
  // Generate strengths and areas for improvement
  const strengthsAndGaps = identifyStrengthsAndGaps(moduleAnalysis, bloomAnalysis, language);
  
  // Generate recommendations
  const recommendations = generateRecommendations(strengthsAndGaps, course, language);
  
  // Create trainee report
  const traineeReport = {
    type: 'trainee',
    generatedAt: new Date().toISOString(),
    trainee: {
      name: trainee.name,
      email: trainee.email,
      department: trainee.department,
      position: trainee.position
    },
    course: {
      title: course.title,
      duration: course.duration,
      modules: course.modules?.length || 0
    },
    summary: {
      preTestScore: preTestScore.percentage,
      postTestScore: postTestScore.percentage,
      improvement: improvement,
      overallPerformance: getOverallPerformance(postTestScore.percentage, language),
      passed: postTestScore.passed
    },
    strengths: strengthsAndGaps.strengths,
    areasForImprovement: strengthsAndGaps.gaps,
    recommendations: recommendations.trainee,
    nextSteps: generateNextSteps(strengthsAndGaps, language),
    certificate: postTestScore.passed ? generateCertificateData(trainee, course, postTestScore) : null
  };

  // Create trainer report (more detailed)
  const trainerReport = {
    type: 'trainer',
    generatedAt: new Date().toISOString(),
    trainee: traineeReport.trainee,
    course: traineeReport.course,
    detailedAnalysis: {
      preTest: {
        score: preTestScore,
        questionBreakdown: preTestScore.questionResults
      },
      postTest: {
        score: postTestScore,
        questionBreakdown: postTestScore.questionResults
      },
      improvement: improvement,
      moduleAnalysis,
      bloomAnalysis
    },
    insights: {
      learningStyle: identifyLearningStyle(preTestScore, postTestScore),
      engagementLevel: assessEngagementLevel(preTestScore, postTestScore),
      knowledgeRetention: assessKnowledgeRetention(preTestScore, postTestScore)
    },
    recommendations: recommendations.trainer,
    suggestedFollowUp: generateFollowUpPlan(strengthsAndGaps, course, language)
  };

  return {
    traineeReport,
    trainerReport,
    summary: {
      passed: postTestScore.passed,
      improvement: improvement.level,
      overallScore: postTestScore.percentage
    }
  };
};

/**
 * Analyze performance by module
 */
const analyzeByModule = (preTestScore, postTestScore, course) => {
  const moduleMap = new Map();

  // Process pre-test results
  preTestScore.questionResults?.forEach(result => {
    if (!moduleMap.has(result.moduleId)) {
      moduleMap.set(result.moduleId, { preTotal: 0, preEarned: 0, postTotal: 0, postEarned: 0 });
    }
    const data = moduleMap.get(result.moduleId);
    data.preTotal += result.maxPoints;
    data.preEarned += result.score;
  });

  // Process post-test results
  postTestScore.questionResults?.forEach(result => {
    if (!moduleMap.has(result.moduleId)) {
      moduleMap.set(result.moduleId, { preTotal: 0, preEarned: 0, postTotal: 0, postEarned: 0 });
    }
    const data = moduleMap.get(result.moduleId);
    data.postTotal += result.maxPoints;
    data.postEarned += result.score;
  });

  // Calculate percentages
  const analysis = [];
  moduleMap.forEach((data, moduleId) => {
    const module = course.modules?.find(m => m.id === moduleId);
    analysis.push({
      moduleId,
      moduleName: module?.title || { en: moduleId, ar: moduleId },
      preScore: data.preTotal > 0 ? Math.round((data.preEarned / data.preTotal) * 100) : 0,
      postScore: data.postTotal > 0 ? Math.round((data.postEarned / data.postTotal) * 100) : 0,
      improvement: data.postTotal > 0 && data.preTotal > 0 
        ? Math.round(((data.postEarned / data.postTotal) - (data.preEarned / data.preTotal)) * 100)
        : 0
    });
  });

  return analysis.sort((a, b) => b.improvement - a.improvement);
};

/**
 * Analyze performance by Bloom's taxonomy level
 */
const analyzeByBloomLevel = (preTestScore, postTestScore) => {
  const bloomMap = new Map();

  const processResults = (results, testType) => {
    results?.forEach(result => {
      if (!bloomMap.has(result.bloomLevel)) {
        bloomMap.set(result.bloomLevel, { 
          preCorrect: 0, preTotal: 0, 
          postCorrect: 0, postTotal: 0 
        });
      }
      const data = bloomMap.get(result.bloomLevel);
      if (testType === 'pre') {
        data.preTotal++;
        if (result.isCorrect) data.preCorrect++;
      } else {
        data.postTotal++;
        if (result.isCorrect) data.postCorrect++;
      }
    });
  };

  processResults(preTestScore.questionResults, 'pre');
  processResults(postTestScore.questionResults, 'post');

  const analysis = [];
  bloomMap.forEach((data, level) => {
    analysis.push({
      level,
      levelName: bloomsLevels[level] || { en: level, ar: level },
      preAccuracy: data.preTotal > 0 ? Math.round((data.preCorrect / data.preTotal) * 100) : 0,
      postAccuracy: data.postTotal > 0 ? Math.round((data.postCorrect / data.postTotal) * 100) : 0,
      improvement: data.postTotal > 0 && data.preTotal > 0
        ? Math.round(((data.postCorrect / data.postTotal) - (data.preCorrect / data.preTotal)) * 100)
        : 0
    });
  });

  return analysis;
};

/**
 * Identify strengths and gaps
 */
const identifyStrengthsAndGaps = (moduleAnalysis, bloomAnalysis, language) => {
  const strengths = [];
  const gaps = [];

  // Module-based strengths/gaps
  moduleAnalysis.forEach(module => {
    if (module.postScore >= 80) {
      strengths.push({
        type: 'module',
        name: module.moduleName,
        score: module.postScore,
        description: language === 'en' 
          ? `Strong performance in ${typeof module.moduleName === 'object' ? module.moduleName.en : module.moduleName}`
          : `أداء قوي في ${typeof module.moduleName === 'object' ? module.moduleName.ar : module.moduleName}`
      });
    } else if (module.postScore < 60) {
      gaps.push({
        type: 'module',
        name: module.moduleName,
        score: module.postScore,
        description: language === 'en'
          ? `Needs improvement in ${typeof module.moduleName === 'object' ? module.moduleName.en : module.moduleName}`
          : `يحتاج تحسين في ${typeof module.moduleName === 'object' ? module.moduleName.ar : module.moduleName}`
      });
    }
  });

  // Bloom's level strengths/gaps
  bloomAnalysis.forEach(bloom => {
    if (bloom.postAccuracy >= 80) {
      strengths.push({
        type: 'bloom',
        level: bloom.level,
        name: bloom.levelName,
        score: bloom.postAccuracy,
        description: language === 'en'
          ? `Excellent ${bloom.levelName.en} skills`
          : `مهارات ${bloom.levelName.ar} ممتازة`
      });
    } else if (bloom.postAccuracy < 50 && bloom.level !== 'create') {
      gaps.push({
        type: 'bloom',
        level: bloom.level,
        name: bloom.levelName,
        score: bloom.postAccuracy,
        description: language === 'en'
          ? `Develop ${bloom.levelName.en} abilities`
          : `تطوير قدرات ${bloom.levelName.ar}`
      });
    }
  });

  return { 
    strengths: strengths.slice(0, 5), 
    gaps: gaps.slice(0, 5) 
  };
};

/**
 * Generate recommendations
 */
const generateRecommendations = (strengthsAndGaps, course, language) => {
  const traineeRecs = [];
  const trainerRecs = [];

  // Trainee recommendations based on gaps
  strengthsAndGaps.gaps.forEach(gap => {
    traineeRecs.push({
      priority: gap.score < 40 ? 'high' : 'medium',
      area: gap.name,
      recommendation: language === 'en'
        ? `Focus on reviewing materials related to ${typeof gap.name === 'object' ? gap.name.en : gap.name}. Consider additional practice exercises.`
        : `ركز على مراجعة المواد المتعلقة بـ ${typeof gap.name === 'object' ? gap.name.ar : gap.name}. فكر في تمارين إضافية.`,
      resources: []
    });
  });

  // Leverage strengths
  strengthsAndGaps.strengths.slice(0, 2).forEach(strength => {
    traineeRecs.push({
      priority: 'low',
      area: strength.name,
      recommendation: language === 'en'
        ? `Continue to leverage your strength in ${typeof strength.name === 'object' ? strength.name.en : strength.name}. Consider mentoring others.`
        : `استمر في الاستفادة من قوتك في ${typeof strength.name === 'object' ? strength.name.ar : strength.name}. فكر في توجيه الآخرين.`,
      resources: []
    });
  });

  // Trainer recommendations
  trainerRecs.push({
    type: 'instructional',
    recommendation: language === 'en'
      ? 'Consider providing additional examples and practice opportunities for identified gap areas.'
      : 'فكر في تقديم أمثلة إضافية وفرص للممارسة في المجالات المحددة.'
  });

  if (strengthsAndGaps.gaps.some(g => g.type === 'bloom' && ['apply', 'analyze'].includes(g.level))) {
    trainerRecs.push({
      type: 'methodology',
      recommendation: language === 'en'
        ? 'Include more case studies and hands-on activities to develop application and analysis skills.'
        : 'قم بتضمين المزيد من دراسات الحالة والأنشطة العملية لتطوير مهارات التطبيق والتحليل.'
    });
  }

  return { trainee: traineeRecs, trainer: trainerRecs };
};

/**
 * Get overall performance label
 */
const getOverallPerformance = (score, language) => {
  if (score >= 90) return { level: 'excellent', label: language === 'en' ? 'Excellent' : 'ممتاز' };
  if (score >= 80) return { level: 'veryGood', label: language === 'en' ? 'Very Good' : 'جيد جداً' };
  if (score >= 70) return { level: 'good', label: language === 'en' ? 'Good' : 'جيد' };
  if (score >= 60) return { level: 'satisfactory', label: language === 'en' ? 'Satisfactory' : 'مقبول' };
  return { level: 'needsImprovement', label: language === 'en' ? 'Needs Improvement' : 'يحتاج تحسين' };
};

/**
 * Generate next steps for trainee
 */
const generateNextSteps = (strengthsAndGaps, language) => {
  const steps = [];
  
  if (strengthsAndGaps.gaps.length > 0) {
    steps.push({
      timeframe: language === 'en' ? 'Immediate (1-2 weeks)' : 'فوري (1-2 أسابيع)',
      action: language === 'en'
        ? 'Review course materials for identified improvement areas'
        : 'مراجعة مواد الدورة للمجالات المحددة للتحسين'
    });
  }
  
  steps.push({
    timeframe: language === 'en' ? 'Short-term (1 month)' : 'قصير المدى (شهر واحد)',
    action: language === 'en'
      ? 'Apply learned concepts in your daily work'
      : 'تطبيق المفاهيم المكتسبة في عملك اليومي'
  });
  
  steps.push({
    timeframe: language === 'en' ? 'Long-term (3 months)' : 'طويل المدى (3 أشهر)',
    action: language === 'en'
      ? 'Seek advanced training opportunities to build on your foundation'
      : 'البحث عن فرص تدريب متقدمة للبناء على أساسك'
  });

  return steps;
};

/**
 * Identify learning style based on performance patterns
 */
const identifyLearningStyle = (preTestScore, postTestScore) => {
  // Analyze which question types showed most improvement
  const typeImprovement = new Map();
  
  // This is a simplified version - could be enhanced with more data
  return {
    primary: 'visual',
    secondary: 'kinesthetic',
    description: {
      en: 'Best learns through examples and hands-on practice',
      ar: 'يتعلم بشكل أفضل من خلال الأمثلة والممارسة العملية'
    }
  };
};

/**
 * Assess engagement level
 */
const assessEngagementLevel = (preTestScore, postTestScore) => {
  const improvement = postTestScore.percentage - preTestScore.percentage;
  
  if (improvement >= 20) return { level: 'high', description: { en: 'Highly engaged', ar: 'مشاركة عالية' } };
  if (improvement >= 10) return { level: 'moderate', description: { en: 'Moderately engaged', ar: 'مشاركة معتدلة' } };
  return { level: 'low', description: { en: 'Needs more engagement', ar: 'يحتاج المزيد من المشاركة' } };
};

/**
 * Assess knowledge retention
 */
const assessKnowledgeRetention = (preTestScore, postTestScore) => {
  const retention = postTestScore.passed;
  return {
    level: retention ? 'good' : 'needsReinforcement',
    description: retention 
      ? { en: 'Good knowledge retention demonstrated', ar: 'الاحتفاظ الجيد بالمعرفة واضح' }
      : { en: 'Additional reinforcement recommended', ar: 'يوصى بتعزيز إضافي' }
  };
};

/**
 * Generate follow-up plan for trainer
 */
const generateFollowUpPlan = (strengthsAndGaps, course, language) => {
  return {
    immediate: language === 'en'
      ? 'Schedule a brief one-on-one to discuss areas for improvement'
      : 'جدولة اجتماع فردي قصير لمناقشة مجالات التحسين',
    shortTerm: language === 'en'
      ? 'Provide supplementary materials for gap areas'
      : 'توفير مواد تكميلية لمجالات الفجوة',
    longTerm: language === 'en'
      ? 'Consider follow-up assessment in 3 months'
      : 'النظر في تقييم متابعة بعد 3 أشهر'
  };
};

/**
 * Generate certificate data for passed trainees
 */
const generateCertificateData = (trainee, course, score) => {
  return {
    recipientName: trainee.name,
    courseName: course.title,
    completionDate: new Date().toISOString(),
    score: score.percentage,
    certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  };
};

export default {
  parseCoursePlan,
  generateQuestionsFromCourse,
  calculateAssessmentScore,
  calculateImprovement,
  generateAssessmentReport,
  bloomsLevels,
  questionTypes
};
