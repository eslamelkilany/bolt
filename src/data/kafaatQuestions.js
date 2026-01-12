// AI-powered Kafaat Assessment Questions Bank
// Based on Kafaat Leadership Development Curriculum

export const competencyAreas = {
  leadershipFundamentals: {
    en: {
      name: "Leadership Fundamentals",
      description: "Core leadership identity, transformational leadership, and situational leadership skills"
    },
    ar: {
      name: "أساسيات القيادة الحديثة",
      description: "الهوية القيادية الأساسية، القيادة التحويلية، والقيادة الموقفية"
    }
  },
  changeManagement: {
    en: {
      name: "Change Management",
      description: "Leading organizational transformation using Kotter's 8-step model and managing resistance"
    },
    ar: {
      name: "قيادة التغيير والتحول المؤسسي",
      description: "قيادة التحول المؤسسي باستخدام نموذج كوتر ذو الثماني خطوات وإدارة المقاومة"
    }
  },
  performanceManagement: {
    en: {
      name: "Effective Supervision & Performance",
      description: "SMART goal setting, performance feedback using SBI model, and KPI management"
    },
    ar: {
      name: "الإشراف الفعال وإدارة الأداء",
      description: "وضع أهداف SMART، التغذية الراجعة باستخدام نموذج SBI، وإدارة مؤشرات الأداء"
    }
  },
  teamBuilding: {
    en: {
      name: "Building High-Performance Teams",
      description: "Team development stages (Tuckman), Belbin roles, trust building, and conflict management"
    },
    ar: {
      name: "بناء فرق العمل عالية الأداء",
      description: "مراحل تطور الفريق (Tuckman)، أدوار Belbin، بناء الثقة، وإدارة النزاعات"
    }
  },
  communication: {
    en: {
      name: "Advanced Leadership Communication",
      description: "Non-verbal communication, persuasion techniques, meeting management, and presentations"
    },
    ar: {
      name: "مهارات التواصل القيادي المتقدم",
      description: "التواصل غير اللفظي، تقنيات الإقناع، إدارة الاجتماعات، والعروض التقديمية"
    }
  },
  problemSolving: {
    en: {
      name: "Problem Solving & Decision Making",
      description: "Critical thinking, root cause analysis (5 Whys, Fishbone), and decision-making under pressure"
    },
    ar: {
      name: "حل المشكلات واتخاذ القرارات الاستراتيجية",
      description: "التفكير النقدي، تحليل الأسباب الجذرية (5 Whys, Fishbone)، واتخاذ القرارات تحت الضغط"
    }
  },
  emotionalIntelligence: {
    en: {
      name: "Emotional Intelligence",
      description: "Self-awareness, emotion management, empathy, and relationship building"
    },
    ar: {
      name: "الذكاء العاطفي والقيادة المؤثرة",
      description: "الوعي الذاتي، إدارة الانفعالات، التعاطف، وبناء العلاقات"
    }
  },
  strategicImplementation: {
    en: {
      name: "Strategic Implementation",
      description: "Project leadership, stakeholder management, and driving organizational impact"
    },
    ar: {
      name: "المشروع القيادي والتطبيق العملي",
      description: "قيادة المشاريع، إدارة أصحاب المصلحة، وتحقيق الأثر المؤسسي"
    }
  }
};

// Scenario-based questions for AI Assessment (storytelling approach)
export const kafaatQuestionBank = [
  // Leadership Fundamentals
  {
    id: "lf1",
    competency: "leadershipFundamentals",
    type: "scenario",
    scenario: {
      en: "Ahmed is a newly appointed team leader. His team includes experienced members who have been with the company for years. During the first team meeting, some members seem resistant to his leadership, questioning his decisions based on his shorter tenure.",
      ar: "تم تعيين أحمد مؤخراً كقائد فريق. يضم فريقه أعضاء ذوي خبرة يعملون في الشركة منذ سنوات. خلال أول اجتماع للفريق، بدا بعض الأعضاء مقاومين لقيادته، متسائلين عن قراراته بناءً على فترة عمله الأقصر."
    },
    question: {
      en: "What leadership approach should Ahmed adopt in this situation?",
      ar: "ما هو النهج القيادي الذي يجب أن يتبناه أحمد في هذا الموقف؟"
    },
    options: {
      en: [
        { text: "Assert his authority firmly to establish respect", score: 1, feedback: "Asserting authority without building relationships may increase resistance" },
        { text: "Build trust through transparent communication and acknowledging team expertise while sharing his vision", score: 5, feedback: "Excellent! This demonstrates transformational leadership and builds authentic relationships" },
        { text: "Avoid confrontation and let the team continue as before", score: 2, feedback: "Avoiding the situation doesn't address the leadership challenge" },
        { text: "Request management intervention to support his position", score: 2, feedback: "Relying on external authority undermines personal leadership development" }
      ],
      ar: [
        { text: "فرض سلطته بحزم لترسيخ الاحترام", score: 1, feedback: "فرض السلطة دون بناء علاقات قد يزيد المقاومة" },
        { text: "بناء الثقة من خلال التواصل الشفاف والاعتراف بخبرة الفريق مع مشاركة رؤيته", score: 5, feedback: "ممتاز! هذا يظهر القيادة التحويلية ويبني علاقات حقيقية" },
        { text: "تجنب المواجهة وترك الفريق يستمر كما كان", score: 2, feedback: "تجنب الموقف لا يعالج تحدي القيادة" },
        { text: "طلب تدخل الإدارة لدعم موقفه", score: 2, feedback: "الاعتماد على سلطة خارجية يقوض تطور القيادة الشخصية" }
      ]
    }
  },
  {
    id: "lf2",
    competency: "leadershipFundamentals",
    type: "scenario",
    scenario: {
      en: "Sara manages a diverse team preparing for a high-profile government event. She notices that her leadership style works well with some team members but seems to create tension with others who prefer more autonomy.",
      ar: "تدير سارة فريقاً متنوعاً يستعد لحدث حكومي رفيع المستوى. لاحظت أن أسلوبها القيادي يعمل جيداً مع بعض أعضاء الفريق لكنه يخلق توتراً مع آخرين يفضلون المزيد من الاستقلالية."
    },
    question: {
      en: "Based on situational leadership principles, what should Sara do?",
      ar: "بناءً على مبادئ القيادة الموقفية، ماذا يجب أن تفعل سارة؟"
    },
    options: {
      en: [
        { text: "Adapt her leadership style based on each team member's readiness and capability level", score: 5, feedback: "Correct! Situational leadership requires adapting style to individual needs" },
        { text: "Apply one consistent style for fairness across all team members", score: 2, feedback: "A one-size-fits-all approach ignores individual differences and needs" },
        { text: "Focus only on the resistant team members to resolve tensions", score: 2, feedback: "This may neglect other team members and create imbalance" },
        { text: "Delegate all decisions to the team to avoid conflicts", score: 1, feedback: "Avoiding leadership responsibility doesn't resolve the underlying issue" }
      ],
      ar: [
        { text: "تكييف أسلوبها القيادي بناءً على مستوى جاهزية وقدرة كل عضو في الفريق", score: 5, feedback: "صحيح! القيادة الموقفية تتطلب تكييف الأسلوب حسب الاحتياجات الفردية" },
        { text: "تطبيق أسلوب واحد ثابت لضمان العدالة بين جميع أعضاء الفريق", score: 2, feedback: "النهج الموحد يتجاهل الفروقات والاحتياجات الفردية" },
        { text: "التركيز فقط على أعضاء الفريق المقاومين لحل التوترات", score: 2, feedback: "قد يهمل هذا أعضاء الفريق الآخرين ويخلق اختلالاً" },
        { text: "تفويض جميع القرارات للفريق لتجنب الصراعات", score: 1, feedback: "تجنب مسؤولية القيادة لا يحل المشكلة الأساسية" }
      ]
    }
  },
  
  // Change Management
  {
    id: "cm1",
    competency: "changeManagement",
    type: "scenario",
    scenario: {
      en: "The organization is implementing a new digital system that will change how the Protocol Department operates. Initial reactions show that 60% of staff are resistant, citing concerns about job security and lack of training.",
      ar: "تقوم المؤسسة بتطبيق نظام رقمي جديد سيغير طريقة عمل إدارة التشريفات. تظهر ردود الفعل الأولية أن 60% من الموظفين مقاومون، مشيرين إلى مخاوف بشأن الأمان الوظيفي ونقص التدريب."
    },
    question: {
      en: "According to Kotter's 8-Step Change Model, what should be the first priority?",
      ar: "وفقاً لنموذج كوتر ذو الثماني خطوات للتغيير، ما الذي يجب أن يكون الأولوية الأولى؟"
    },
    options: {
      en: [
        { text: "Start training sessions immediately to address skill gaps", score: 2, feedback: "Training is important but not the first step in Kotter's model" },
        { text: "Create a sense of urgency by communicating the need for change with data and facts", score: 5, feedback: "Excellent! Creating urgency is Step 1 of Kotter's model" },
        { text: "Implement the change quickly to minimize the resistance period", score: 1, feedback: "Rushing change without preparation typically increases resistance" },
        { text: "Replace resistant staff with those more accepting of change", score: 1, feedback: "This approach is counterproductive and ignores change management principles" }
      ],
      ar: [
        { text: "البدء بجلسات التدريب فوراً لمعالجة فجوات المهارات", score: 2, feedback: "التدريب مهم لكنه ليس الخطوة الأولى في نموذج كوتر" },
        { text: "خلق حالة من الاستعجال من خلال إيصال الحاجة للتغيير بالبيانات والحقائق", score: 5, feedback: "ممتاز! خلق الاستعجال هو الخطوة الأولى في نموذج كوتر" },
        { text: "تنفيذ التغيير بسرعة لتقليل فترة المقاومة", score: 1, feedback: "التسرع في التغيير دون تحضير يزيد المقاومة عادة" },
        { text: "استبدال الموظفين المقاومين بآخرين أكثر قبولاً للتغيير", score: 1, feedback: "هذا النهج يأتي بنتائج عكسية ويتجاهل مبادئ إدارة التغيير" }
      ]
    }
  },
  {
    id: "cm2",
    competency: "changeManagement",
    type: "scenario",
    scenario: {
      en: "During a major organizational restructuring, Khalid notices that some team members are openly expressing concerns in meetings while others remain silent but show signs of disengagement.",
      ar: "خلال إعادة هيكلة تنظيمية كبرى، لاحظ خالد أن بعض أعضاء الفريق يعبرون عن مخاوفهم صراحة في الاجتماعات بينما يبقى آخرون صامتين لكن يظهرون علامات الانفصال."
    },
    question: {
      en: "How should Khalid address the different types of resistance?",
      ar: "كيف يجب أن يتعامل خالد مع أنواع المقاومة المختلفة؟"
    },
    options: {
      en: [
        { text: "Address only the vocal resisters as they are the most disruptive", score: 2, feedback: "Silent resistance can be equally damaging and should not be ignored" },
        { text: "Create safe spaces for dialogue, actively listen to all concerns, and involve resisters in finding solutions", score: 5, feedback: "Perfect! Addressing all forms of resistance through engagement is key" },
        { text: "Send an email explaining the benefits of the change to everyone", score: 2, feedback: "One-way communication rarely addresses deep-seated concerns" },
        { text: "Ignore the resistance as it will naturally fade with time", score: 1, feedback: "Unaddressed resistance typically grows stronger and more disruptive" }
      ],
      ar: [
        { text: "التعامل فقط مع المقاومين الصريحين لأنهم الأكثر إزعاجاً", score: 2, feedback: "المقاومة الصامتة يمكن أن تكون ضارة بنفس القدر ولا ينبغي تجاهلها" },
        { text: "إنشاء مساحات آمنة للحوار، الاستماع الفعال لجميع المخاوف، وإشراك المقاومين في إيجاد الحلول", score: 5, feedback: "مثالي! معالجة جميع أشكال المقاومة من خلال المشاركة هو المفتاح" },
        { text: "إرسال بريد إلكتروني يشرح فوائد التغيير للجميع", score: 2, feedback: "التواصل أحادي الاتجاه نادراً ما يعالج المخاوف العميقة" },
        { text: "تجاهل المقاومة لأنها ستتلاشى طبيعياً مع الوقت", score: 1, feedback: "المقاومة التي لا تُعالج تنمو عادة وتصبح أكثر تعطيلاً" }
      ]
    }
  },

  // Performance Management
  {
    id: "pm1",
    competency: "performanceManagement",
    type: "scenario",
    scenario: {
      en: "Fatima needs to set performance goals for her team member who is responsible for coordinating VIP protocol events. The current instruction is vague: 'Improve event coordination quality.'",
      ar: "تحتاج فاطمة إلى وضع أهداف أداء لعضو فريقها المسؤول عن تنسيق فعاليات البروتوكول لكبار الشخصيات. التعليمات الحالية غامضة: 'تحسين جودة تنسيق الفعاليات.'"
    },
    question: {
      en: "How should Fatima transform this into a SMART goal?",
      ar: "كيف يجب أن تحول فاطمة هذا إلى هدف SMART؟"
    },
    options: {
      en: [
        { text: "Work harder on making events better this year", score: 1, feedback: "This is vague and not measurable" },
        { text: "Achieve 95% guest satisfaction rating and zero protocol errors in all VIP events within Q1 2024", score: 5, feedback: "Excellent! This is Specific, Measurable, Achievable, Relevant, and Time-bound" },
        { text: "Coordinate events more professionally", score: 1, feedback: "This lacks specificity and measurability" },
        { text: "Reduce event problems by some percentage", score: 2, feedback: "This is partially measurable but lacks specificity and timeline" }
      ],
      ar: [
        { text: "العمل بجدية أكبر على تحسين الفعاليات هذا العام", score: 1, feedback: "هذا غامض وغير قابل للقياس" },
        { text: "تحقيق 95% معدل رضا الضيوف وصفر أخطاء بروتوكولية في جميع فعاليات كبار الشخصيات خلال الربع الأول 2024", score: 5, feedback: "ممتاز! هذا محدد وقابل للقياس وقابل للتحقيق وذو صلة ومحدد زمنياً" },
        { text: "تنسيق الفعاليات بشكل أكثر احترافية", score: 1, feedback: "يفتقر هذا للتحديد والقابلية للقياس" },
        { text: "تقليل مشاكل الفعاليات بنسبة ما", score: 2, feedback: "هذا قابل للقياس جزئياً لكن يفتقر للتحديد والإطار الزمني" }
      ]
    }
  },
  {
    id: "pm2",
    competency: "performanceManagement",
    type: "scenario",
    scenario: {
      en: "During a protocol event, Omar made an error in seating arrangements that caused minor embarrassment. As his supervisor, you need to provide feedback.",
      ar: "خلال فعالية بروتوكولية، ارتكب عمر خطأ في ترتيبات الجلوس تسبب في إحراج بسيط. كمشرفه، تحتاج إلى تقديم تغذية راجعة."
    },
    question: {
      en: "Using the SBI (Situation-Behavior-Impact) model, which feedback approach is most effective?",
      ar: "باستخدام نموذج SBI (الموقف-السلوك-الأثر)، أي نهج للتغذية الراجعة هو الأكثر فعالية؟"
    },
    options: {
      en: [
        { text: "\"You always make mistakes. You need to be more careful.\"", score: 1, feedback: "This is generalizing and doesn't follow SBI" },
        { text: "\"In yesterday's event (S), when you placed the ambassador in the wrong seat (B), it created an awkward moment that required diplomatic intervention (I).\"", score: 5, feedback: "Perfect SBI application - specific situation, observable behavior, clear impact" },
        { text: "\"That was a serious mistake. Make sure it doesn't happen again.\"", score: 2, feedback: "This lacks specificity and constructive guidance" },
        { text: "\"Good job overall, but watch the seating next time.\"", score: 2, feedback: "This minimizes the feedback and lacks the SBI structure" }
      ],
      ar: [
        { text: "\"أنت دائماً ترتكب الأخطاء. تحتاج أن تكون أكثر حذراً.\"", score: 1, feedback: "هذا تعميم ولا يتبع نموذج SBI" },
        { text: "\"في فعالية الأمس (الموقف)، عندما وضعت السفير في المقعد الخطأ (السلوك)، خلق ذلك لحظة محرجة تطلبت تدخلاً دبلوماسياً (الأثر).\"", score: 5, feedback: "تطبيق مثالي لـ SBI - موقف محدد، سلوك ملاحظ، أثر واضح" },
        { text: "\"كان هذا خطأ جسيماً. تأكد من عدم تكراره.\"", score: 2, feedback: "يفتقر للتحديد والتوجيه البناء" },
        { text: "\"عمل جيد بشكل عام، لكن انتبه للجلوس المرة القادمة.\"", score: 2, feedback: "يقلل من التغذية الراجعة ويفتقر لهيكل SBI" }
      ]
    }
  },

  // Team Building
  {
    id: "tb1",
    competency: "teamBuilding",
    type: "scenario",
    scenario: {
      en: "A new project team has just been formed. In the first few meetings, members are polite but cautious, avoiding disagreements and looking to the leader for all direction. According to Tuckman's model, which stage is this?",
      ar: "تم تشكيل فريق مشروع جديد للتو. في الاجتماعات الأولى، كان الأعضاء مهذبين لكن حذرين، يتجنبون الخلافات ويتطلعون للقائد للتوجيه في كل شيء. وفقاً لنموذج Tuckman، أي مرحلة هذه؟"
    },
    question: {
      en: "What stage is the team in and what should the leader do?",
      ar: "في أي مرحلة يتواجد الفريق وماذا يجب أن يفعل القائد؟"
    },
    options: {
      en: [
        { text: "Storming stage - the leader should mediate conflicts", score: 1, feedback: "This is not Storming; there are no visible conflicts yet" },
        { text: "Forming stage - the leader should provide clear direction, facilitate introductions, and establish norms", score: 5, feedback: "Correct! The described behaviors match Forming stage characteristics" },
        { text: "Norming stage - the leader should step back and let the team self-organize", score: 1, feedback: "The team hasn't reached Norming yet; too early for reduced direction" },
        { text: "Performing stage - the leader should delegate fully", score: 1, feedback: "The team is not yet performing autonomously" }
      ],
      ar: [
        { text: "مرحلة العصف - يجب على القائد التوسط في النزاعات", score: 1, feedback: "هذه ليست مرحلة العصف؛ لا توجد نزاعات مرئية بعد" },
        { text: "مرحلة التشكيل - يجب على القائد تقديم توجيه واضح، تسهيل التعارف، وإنشاء المعايير", score: 5, feedback: "صحيح! السلوكيات الموصوفة تتطابق مع خصائص مرحلة التشكيل" },
        { text: "مرحلة التوافق - يجب على القائد التراجع وترك الفريق ينظم نفسه", score: 1, feedback: "لم يصل الفريق لمرحلة التوافق بعد؛ من المبكر تقليل التوجيه" },
        { text: "مرحلة الأداء - يجب على القائد التفويض بالكامل", score: 1, feedback: "الفريق لا يعمل باستقلالية بعد" }
      ]
    }
  },
  {
    id: "tb2",
    competency: "teamBuilding",
    type: "scenario",
    scenario: {
      en: "Using the Belbin team roles model, you notice your events team has multiple \"Plants\" (creative thinkers) but lacks \"Completer-Finishers\" (detail-oriented executors). The team often generates brilliant ideas but struggles with execution.",
      ar: "باستخدام نموذج Belbin لأدوار الفريق، لاحظت أن فريق الفعاليات لديك يضم عدة \"مبتكرين\" (مفكرين إبداعيين) لكنه يفتقر لـ \"المُنجزين\" (المنفذين المهتمين بالتفاصيل). الفريق غالباً ما يولد أفكاراً رائعة لكنه يعاني مع التنفيذ."
    },
    question: {
      en: "What is the best approach to address this team imbalance?",
      ar: "ما هو أفضل نهج لمعالجة هذا الاختلال في الفريق؟"
    },
    options: {
      en: [
        { text: "Ask the Plants to also focus on execution details", score: 2, feedback: "This goes against natural strengths and may reduce creativity" },
        { text: "Add team members who naturally excel at completion and detail-oriented work, or partner with other teams who have these skills", score: 5, feedback: "Excellent! Balancing team roles improves overall performance" },
        { text: "Accept that the team will always struggle with execution", score: 1, feedback: "This doesn't solve the problem and limits team potential" },
        { text: "Remove some of the creative thinkers to make room for executors", score: 2, feedback: "Losing creativity is not the solution; balance is key" }
      ],
      ar: [
        { text: "طلب من المبتكرين أيضاً التركيز على تفاصيل التنفيذ", score: 2, feedback: "هذا يتعارض مع نقاط القوة الطبيعية وقد يقلل الإبداع" },
        { text: "إضافة أعضاء فريق يتفوقون طبيعياً في الإنجاز والعمل المهتم بالتفاصيل، أو الشراكة مع فرق أخرى لديها هذه المهارات", score: 5, feedback: "ممتاز! موازنة أدوار الفريق تحسن الأداء العام" },
        { text: "القبول بأن الفريق سيعاني دائماً مع التنفيذ", score: 1, feedback: "هذا لا يحل المشكلة ويحد من إمكانات الفريق" },
        { text: "إزالة بعض المفكرين المبدعين لإفساح المجال للمنفذين", score: 2, feedback: "خسارة الإبداع ليست الحل؛ التوازن هو المفتاح" }
      ]
    }
  },

  // Communication
  {
    id: "co1",
    competency: "communication",
    type: "scenario",
    scenario: {
      en: "During an executive presentation to senior leadership, Mariam notices that some audience members are checking their phones, while others have crossed arms and skeptical expressions.",
      ar: "خلال عرض تقديمي للقيادة العليا، لاحظت مريم أن بعض الحضور يتفقدون هواتفهم، بينما البعض الآخر يعقدون أذرعهم بتعابير متشككة."
    },
    question: {
      en: "How should Mariam respond to these non-verbal cues?",
      ar: "كيف يجب أن تستجيب مريم لهذه الإشارات غير اللفظية؟"
    },
    options: {
      en: [
        { text: "Ignore the signals and continue as planned to avoid disruption", score: 1, feedback: "Ignoring audience disengagement will likely worsen the situation" },
        { text: "Stop and ask if there are questions, adjust pacing, use stories or data to re-engage, and make eye contact with skeptics", score: 5, feedback: "Perfect! Reading and responding to non-verbal cues is essential for effective communication" },
        { text: "Speed up the presentation to finish quickly", score: 1, feedback: "Rushing may increase disconnection" },
        { text: "Call out specific individuals for not paying attention", score: 1, feedback: "This would be inappropriate and damage relationships" }
      ],
      ar: [
        { text: "تجاهل الإشارات والاستمرار كما هو مخطط لتجنب التعطيل", score: 1, feedback: "تجاهل انفصال الجمهور سيزيد الوضع سوءاً على الأرجح" },
        { text: "التوقف والسؤال إن كانت هناك أسئلة، تعديل الإيقاع، استخدام القصص أو البيانات لإعادة الانخراط، والتواصل البصري مع المتشككين", score: 5, feedback: "مثالي! قراءة والاستجابة للإشارات غير اللفظية أساسي للتواصل الفعال" },
        { text: "تسريع العرض للإنهاء بسرعة", score: 1, feedback: "التسرع قد يزيد الانفصال" },
        { text: "مناداة أفراد محددين لعدم انتباههم", score: 1, feedback: "هذا سيكون غير لائق ويضر العلاقات" }
      ]
    }
  },
  {
    id: "co2",
    competency: "communication",
    type: "scenario",
    scenario: {
      en: "You need to persuade senior management to approve budget for a new initiative that will improve protocol services. You know some managers are skeptical about spending during cost-cutting measures.",
      ar: "تحتاج إلى إقناع الإدارة العليا بالموافقة على ميزانية لمبادرة جديدة ستحسن خدمات البروتوكول. تعلم أن بعض المديرين متشككون بشأن الإنفاق خلال تدابير خفض التكاليف."
    },
    question: {
      en: "Using Cialdini's principles of persuasion, which approach would be most effective?",
      ar: "باستخدام مبادئ تشالديني للإقناع، أي نهج سيكون الأكثر فعالية؟"
    },
    options: {
      en: [
        { text: "Simply present the benefits and hope they see the value", score: 2, feedback: "This passive approach may not overcome skepticism" },
        { text: "Combine data showing ROI (authority), success stories from similar organizations (social proof), and emphasize the limited window of opportunity (scarcity)", score: 5, feedback: "Excellent! Combining multiple persuasion principles is most effective" },
        { text: "Threaten that quality will decline without the budget", score: 1, feedback: "Threats damage relationships and rarely persuade" },
        { text: "Go over their heads to higher management", score: 1, feedback: "This bypasses proper channels and damages trust" }
      ],
      ar: [
        { text: "ببساطة عرض الفوائد وأمل أن يروا القيمة", score: 2, feedback: "هذا النهج السلبي قد لا يتغلب على الشك" },
        { text: "الجمع بين البيانات التي تظهر العائد على الاستثمار (السلطة)، قصص النجاح من منظمات مماثلة (البرهان الاجتماعي)، والتأكيد على نافذة الفرصة المحدودة (الندرة)", score: 5, feedback: "ممتاز! الجمع بين مبادئ الإقناع المتعددة هو الأكثر فعالية" },
        { text: "التهديد بأن الجودة ستنخفض بدون الميزانية", score: 1, feedback: "التهديدات تضر العلاقات ونادراً ما تقنع" },
        { text: "تجاوزهم للإدارة الأعلى", score: 1, feedback: "هذا يتجاوز القنوات المناسبة ويضر الثقة" }
      ]
    }
  },

  // Problem Solving
  {
    id: "ps1",
    competency: "problemSolving",
    type: "scenario",
    scenario: {
      en: "A major protocol event had multiple issues: late arrivals, wrong seating arrangements, and catering problems. The team is blaming each other, and management wants answers.",
      ar: "واجهت فعالية بروتوكولية كبرى مشاكل متعددة: تأخر الوصول، ترتيبات جلوس خاطئة، ومشاكل في الضيافة. الفريق يلقي اللوم على بعضه البعض، والإدارة تريد إجابات."
    },
    question: {
      en: "Which analytical approach should be used first to find the root causes?",
      ar: "أي نهج تحليلي يجب استخدامه أولاً لإيجاد الأسباب الجذرية؟"
    },
    options: {
      en: [
        { text: "Assign blame to individuals responsible for each area", score: 1, feedback: "Blame culture prevents learning and problem-solving" },
        { text: "Apply the 5 Whys technique to each problem, then use a Fishbone diagram to categorize root causes across People, Process, Equipment, and Environment", score: 5, feedback: "Excellent! Combining analytical tools provides comprehensive root cause analysis" },
        { text: "Accept that events always have issues and move on", score: 1, feedback: "This prevents learning and improvement" },
        { text: "Fire the team members who made mistakes", score: 1, feedback: "This punitive approach doesn't address systemic issues" }
      ],
      ar: [
        { text: "تحديد المسؤولية على الأفراد المسؤولين عن كل مجال", score: 1, feedback: "ثقافة اللوم تمنع التعلم وحل المشكلات" },
        { text: "تطبيق تقنية الخمسة لماذا على كل مشكلة، ثم استخدام مخطط عظم السمكة لتصنيف الأسباب الجذرية عبر الناس والعمليات والمعدات والبيئة", score: 5, feedback: "ممتاز! الجمع بين الأدوات التحليلية يوفر تحليلاً شاملاً للأسباب الجذرية" },
        { text: "القبول بأن الفعاليات دائماً لديها مشاكل والمضي قدماً", score: 1, feedback: "هذا يمنع التعلم والتحسين" },
        { text: "فصل أعضاء الفريق الذين ارتكبوا الأخطاء", score: 1, feedback: "هذا النهج العقابي لا يعالج المشاكل النظامية" }
      ]
    }
  },
  {
    id: "ps2",
    competency: "problemSolving",
    type: "scenario",
    scenario: {
      en: "You have 60 seconds to decide: A VIP dignitary's flight has been delayed 2 hours. The entire event schedule, including a state dinner with other dignitaries, needs adjustment. Other guests are already arriving.",
      ar: "لديك 60 ثانية للقرار: تأخرت رحلة شخصية VIP مهمة ساعتين. يحتاج جدول الفعالية بأكمله، بما في ذلك عشاء رسمي مع شخصيات مهمة أخرى، إلى تعديل. الضيوف الآخرون يصلون بالفعل."
    },
    question: {
      en: "Using the OODA Loop (Observe-Orient-Decide-Act), what's the best immediate approach?",
      ar: "باستخدام حلقة OODA (المراقبة-التوجيه-القرار-الفعل)، ما هو أفضل نهج فوري؟"
    },
    options: {
      en: [
        { text: "Wait for more information before making any changes", score: 2, feedback: "Waiting too long in a crisis can worsen the situation" },
        { text: "Observe the current situation, orient by assessing options (delay dinner, start without VIP with honors later, reschedule), decide on best option, and act by communicating immediately to all parties", score: 5, feedback: "Perfect OODA application for rapid decision-making under pressure" },
        { text: "Cancel the entire event to avoid complications", score: 1, feedback: "This overreaction wastes resources and damages reputation" },
        { text: "Proceed as planned and hope the VIP arrives in time", score: 1, feedback: "Ignoring reality doesn't solve the problem" }
      ],
      ar: [
        { text: "الانتظار للمزيد من المعلومات قبل إجراء أي تغييرات", score: 2, feedback: "الانتظار طويلاً في الأزمة قد يزيد الوضع سوءاً" },
        { text: "مراقبة الوضع الحالي، التوجه بتقييم الخيارات (تأخير العشاء، البدء بدون الـ VIP مع تكريم لاحق، إعادة الجدولة)، القرار على أفضل خيار، والتصرف بالتواصل فوراً مع جميع الأطراف", score: 5, feedback: "تطبيق مثالي لحلقة OODA لاتخاذ القرارات السريعة تحت الضغط" },
        { text: "إلغاء الفعالية بأكملها لتجنب المضاعفات", score: 1, feedback: "رد الفعل المبالغ فيه يهدر الموارد ويضر السمعة" },
        { text: "المضي قدماً كما هو مخطط وأمل أن يصل الـ VIP في الوقت المناسب", score: 1, feedback: "تجاهل الواقع لا يحل المشكلة" }
      ]
    }
  },

  // Emotional Intelligence
  {
    id: "ei1",
    competency: "emotionalIntelligence",
    type: "scenario",
    scenario: {
      en: "During a high-pressure event preparation, your team member breaks down in tears after receiving criticism about their work. Other team members are watching, and the deadline is approaching.",
      ar: "خلال تحضير فعالية عالية الضغط، ينهار أحد أعضاء فريقك بالبكاء بعد تلقي انتقاد بشأن عملهم. أعضاء الفريق الآخرون يشاهدون، والموعد النهائي يقترب."
    },
    question: {
      en: "How should you respond using emotional intelligence?",
      ar: "كيف يجب أن تستجيب باستخدام الذكاء العاطفي؟"
    },
    options: {
      en: [
        { text: "Tell them to compose themselves and focus on work - deadlines don't wait", score: 1, feedback: "Dismissing emotions damages trust and worsens the situation" },
        { text: "Give them space privately, acknowledge their feelings with empathy, help them regulate emotions, then refocus on tasks with support", score: 5, feedback: "Excellent EQ application: self-awareness of your impact, empathy, helping them regulate, and maintaining relationships" },
        { text: "Ignore the situation and continue working with others", score: 1, feedback: "Ignoring emotional distress damages team morale" },
        { text: "Criticize whoever gave the harsh feedback in front of everyone", score: 1, feedback: "Public criticism escalates conflict and doesn't help" }
      ],
      ar: [
        { text: "إخبارهم بالتماسك والتركيز على العمل - المواعيد النهائية لا تنتظر", score: 1, feedback: "تجاهل المشاعر يضر الثقة ويزيد الوضع سوءاً" },
        { text: "منحهم مساحة خاصة، الاعتراف بمشاعرهم بتعاطف، مساعدتهم على تنظيم انفعالاتهم، ثم إعادة التركيز على المهام مع الدعم", score: 5, feedback: "تطبيق ممتاز للذكاء العاطفي: الوعي الذاتي بأثرك، التعاطف، المساعدة في التنظيم، والحفاظ على العلاقات" },
        { text: "تجاهل الموقف والاستمرار بالعمل مع الآخرين", score: 1, feedback: "تجاهل الضيق العاطفي يضر بمعنويات الفريق" },
        { text: "انتقاد من قدم الملاحظات القاسية أمام الجميع", score: 1, feedback: "الانتقاد العلني يصعد الصراع ولا يساعد" }
      ]
    }
  },
  {
    id: "ei2",
    competency: "emotionalIntelligence",
    type: "scenario",
    scenario: {
      en: "You receive news that your budget for an important initiative has been cut by 50%. You feel frustrated and angry, especially as you've worked hard on this project.",
      ar: "تتلقى خبراً بأن ميزانيتك لمبادرة مهمة قد تم قطعها بنسبة 50%. تشعر بالإحباط والغضب، خاصة أنك عملت بجد على هذا المشروع."
    },
    question: {
      en: "According to Goleman's EQ model, how should you manage your response?",
      ar: "وفقاً لنموذج جولمان للذكاء العاطفي، كيف يجب أن تدير استجابتك؟"
    },
    options: {
      en: [
        { text: "Immediately express your frustration to management to show you care about the project", score: 1, feedback: "Reacting emotionally can damage your credibility" },
        { text: "Recognize your emotions (self-awareness), pause before responding (self-regulation), consider the organizational constraints (social awareness), then propose solutions constructively (relationship management)", score: 5, feedback: "Perfect application of all four EQ domains" },
        { text: "Suppress your feelings and accept the decision without question", score: 2, feedback: "Suppressing emotions isn't healthy; constructive engagement is better" },
        { text: "Complain to colleagues about management's decision", score: 1, feedback: "Venting negatively damages team morale and your reputation" }
      ],
      ar: [
        { text: "التعبير فوراً عن إحباطك للإدارة لإظهار اهتمامك بالمشروع", score: 1, feedback: "الاستجابة العاطفية يمكن أن تضر بمصداقيتك" },
        { text: "التعرف على مشاعرك (الوعي الذاتي)، التوقف قبل الاستجابة (إدارة الذات)، مراعاة القيود المؤسسية (الوعي الاجتماعي)، ثم اقتراح حلول بشكل بناء (إدارة العلاقات)", score: 5, feedback: "تطبيق مثالي لجميع مجالات الذكاء العاطفي الأربعة" },
        { text: "كبت مشاعرك وقبول القرار دون تساؤل", score: 2, feedback: "كبت المشاعر ليس صحياً؛ التفاعل البناء أفضل" },
        { text: "الشكوى للزملاء حول قرار الإدارة", score: 1, feedback: "التنفيس السلبي يضر بمعنويات الفريق وسمعتك" }
      ]
    }
  },

  // Strategic Implementation
  {
    id: "si1",
    competency: "strategicImplementation",
    type: "scenario",
    scenario: {
      en: "You are leading a major initiative to digitize protocol processes. Stakeholders include senior leadership (who want quick results), IT department (concerned about security), and frontline staff (worried about job changes).",
      ar: "أنت تقود مبادرة كبرى لرقمنة عمليات البروتوكول. أصحاب المصلحة يشملون القيادة العليا (التي تريد نتائج سريعة)، قسم تقنية المعلومات (قلق بشأن الأمان)، والموظفين الميدانيين (قلقون بشأن تغييرات العمل)."
    },
    question: {
      en: "Using DMAIC methodology, what should be your approach to manage these diverse stakeholders?",
      ar: "باستخدام منهجية DMAIC، ما الذي يجب أن يكون نهجك لإدارة أصحاب المصلحة المتنوعين هؤلاء؟"
    },
    options: {
      en: [
        { text: "Focus only on senior leadership as they have the most power", score: 2, feedback: "Ignoring other stakeholders will create resistance and project failure" },
        { text: "Define clear success metrics for each stakeholder group, Measure current processes, Analyze each group's concerns, Improve by addressing concerns through tailored communication and involvement, Control through regular stakeholder updates", score: 5, feedback: "Excellent DMAIC application with comprehensive stakeholder management" },
        { text: "Implement quickly before resistance grows", score: 1, feedback: "Rushing without stakeholder buy-in typically leads to failure" },
        { text: "Delay the project until all concerns are resolved", score: 2, feedback: "Indefinite delay doesn't solve the problem; proactive engagement does" }
      ],
      ar: [
        { text: "التركيز فقط على القيادة العليا لأن لديهم أكبر قوة", score: 2, feedback: "تجاهل أصحاب المصلحة الآخرين سيخلق مقاومة وفشل المشروع" },
        { text: "تحديد مقاييس نجاح واضحة لكل مجموعة من أصحاب المصلحة، قياس العمليات الحالية، تحليل مخاوف كل مجموعة، التحسين بمعالجة المخاوف من خلال تواصل ومشاركة مخصصة، التحكم من خلال تحديثات منتظمة لأصحاب المصلحة", score: 5, feedback: "تطبيق ممتاز لـ DMAIC مع إدارة شاملة لأصحاب المصلحة" },
        { text: "التنفيذ بسرعة قبل نمو المقاومة", score: 1, feedback: "التسرع دون موافقة أصحاب المصلحة يؤدي عادة للفشل" },
        { text: "تأخير المشروع حتى تُحل جميع المخاوف", score: 2, feedback: "التأخير إلى أجل غير مسمى لا يحل المشكلة؛ التفاعل الاستباقي يفعل" }
      ]
    }
  },
  {
    id: "si2",
    competency: "strategicImplementation",
    type: "scenario",
    scenario: {
      en: "Your leadership project is 70% complete when a new senior executive joins and questions the entire approach, suggesting a different direction that would require starting over.",
      ar: "مشروعك القيادي مكتمل بنسبة 70% عندما ينضم مسؤول تنفيذي جديد ويتساءل عن النهج بأكمله، مقترحاً اتجاهاً مختلفاً يتطلب البدء من جديد."
    },
    question: {
      en: "How should you handle this challenge to your leadership project?",
      ar: "كيف يجب أن تتعامل مع هذا التحدي لمشروعك القيادي؟"
    },
    options: {
      en: [
        { text: "Abandon your approach and adopt the new executive's direction to gain favor", score: 1, feedback: "Abandoning sound work for politics undermines project integrity" },
        { text: "Listen actively to concerns, present data supporting your approach, explore hybrid solutions, and involve the executive in constructive refinements while protecting core project value", score: 5, feedback: "Excellent leadership: balancing stakeholder relations with project integrity" },
        { text: "Ignore the new executive and continue as planned", score: 1, feedback: "Ignoring senior stakeholders creates organizational conflicts" },
        { text: "Escalate immediately to higher leadership to override the new executive", score: 2, feedback: "Escalation without attempting resolution damages relationships" }
      ],
      ar: [
        { text: "التخلي عن نهجك وتبني اتجاه المسؤول التنفيذي الجديد لكسب الرضا", score: 1, feedback: "التخلي عن عمل سليم لأسباب سياسية يقوض نزاهة المشروع" },
        { text: "الاستماع بفاعلية للمخاوف، تقديم بيانات تدعم نهجك، استكشاف حلول هجينة، وإشراك المسؤول التنفيذي في تحسينات بناءة مع حماية القيمة الأساسية للمشروع", score: 5, feedback: "قيادة ممتازة: التوازن بين علاقات أصحاب المصلحة ونزاهة المشروع" },
        { text: "تجاهل المسؤول التنفيذي الجديد والاستمرار كما هو مخطط", score: 1, feedback: "تجاهل أصحاب المصلحة الكبار يخلق صراعات مؤسسية" },
        { text: "التصعيد فوراً للقيادة الأعلى لتجاوز المسؤول التنفيذي الجديد", score: 2, feedback: "التصعيد دون محاولة الحل يضر العلاقات" }
      ]
    }
  }
];

export default kafaatQuestionBank;
