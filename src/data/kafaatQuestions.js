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
  },

  // ============ ADDITIONAL QUESTIONS (Total: 40) ============
  
  // Leadership Fundamentals - Additional Questions (3 more = 5 total)
  {
    id: "lf3",
    competency: "leadershipFundamentals",
    type: "scenario",
    scenario: {
      en: "During a critical project phase, your most experienced team member submits their resignation. Other team members are demoralized, and the project timeline is tight.",
      ar: "خلال مرحلة حرجة من المشروع، يقدم أكثر أعضاء فريقك خبرة استقالته. أعضاء الفريق الآخرون محبطون، والجدول الزمني للمشروع ضيق."
    },
    question: {
      en: "As a transformational leader, what should be your immediate response?",
      ar: "كقائد تحويلي، ما الذي يجب أن تكون استجابتك الفورية؟"
    },
    options: {
      en: [
        { text: "Panic and request an extension immediately", score: 1, feedback: "Leaders must remain composed and solution-focused" },
        { text: "Acknowledge the challenge openly, reassure the team, quickly assess skills distribution, and create a transition plan while inspiring confidence", score: 5, feedback: "Excellent! Transformational leaders turn crises into growth opportunities" },
        { text: "Demand that the resigning employee stays until project completion", score: 2, feedback: "This approach is coercive and damages relationships" },
        { text: "Start looking for a replacement immediately without communicating to the team", score: 2, feedback: "Lack of communication creates uncertainty and fear" }
      ],
      ar: [
        { text: "الذعر وطلب تمديد فوراً", score: 1, feedback: "القادة يجب أن يبقوا متماسكين ومركزين على الحلول" },
        { text: "الاعتراف بالتحدي صراحة، طمأنة الفريق، تقييم سريع لتوزيع المهارات، وإنشاء خطة انتقالية مع إلهام الثقة", score: 5, feedback: "ممتاز! القادة التحويليون يحولون الأزمات إلى فرص نمو" },
        { text: "المطالبة بأن يبقى الموظف المستقيل حتى إتمام المشروع", score: 2, feedback: "هذا النهج قسري ويضر العلاقات" },
        { text: "البدء بالبحث عن بديل فوراً دون التواصل مع الفريق", score: 2, feedback: "نقص التواصل يخلق عدم اليقين والخوف" }
      ]
    }
  },
  {
    id: "lf4",
    competency: "leadershipFundamentals",
    type: "scenario",
    scenario: {
      en: "You've been leading your team successfully for two years. A new opportunity arises that requires you to lead a cross-departmental initiative with people who don't report to you.",
      ar: "قدت فريقك بنجاح لمدة عامين. تظهر فرصة جديدة تتطلب منك قيادة مبادرة عبر الأقسام مع أشخاص لا يخضعون لك."
    },
    question: {
      en: "How should you adapt your leadership approach for this new challenge?",
      ar: "كيف يجب أن تكيّف نهجك القيادي لهذا التحدي الجديد؟"
    },
    options: {
      en: [
        { text: "Use the same approach that worked with your team", score: 2, feedback: "Different contexts require different leadership adaptations" },
        { text: "Build influence through expertise, establish shared goals, demonstrate value to each stakeholder, and lead through persuasion rather than authority", score: 5, feedback: "Perfect! Leading without authority requires influence-based leadership" },
        { text: "Request formal authority over the cross-departmental team", score: 2, feedback: "This may not be possible and misses the opportunity to develop influence skills" },
        { text: "Decline the opportunity as it's outside your comfort zone", score: 1, feedback: "Avoiding growth opportunities limits leadership development" }
      ],
      ar: [
        { text: "استخدام نفس النهج الذي نجح مع فريقك", score: 2, feedback: "السياقات المختلفة تتطلب تكييفات قيادية مختلفة" },
        { text: "بناء التأثير من خلال الخبرة، إنشاء أهداف مشتركة، إظهار القيمة لكل صاحب مصلحة، والقيادة من خلال الإقناع بدلاً من السلطة", score: 5, feedback: "مثالي! القيادة بدون سلطة تتطلب قيادة قائمة على التأثير" },
        { text: "طلب سلطة رسمية على الفريق عبر الأقسام", score: 2, feedback: "قد لا يكون هذا ممكناً ويفوت فرصة تطوير مهارات التأثير" },
        { text: "رفض الفرصة لأنها خارج منطقة راحتك", score: 1, feedback: "تجنب فرص النمو يحد من التطور القيادي" }
      ]
    }
  },
  {
    id: "lf5",
    competency: "leadershipFundamentals",
    type: "scenario",
    scenario: {
      en: "Your organization is undergoing a cultural shift towards more innovation and risk-taking. However, many team members are comfortable with the existing conservative approach.",
      ar: "تمر مؤسستك بتحول ثقافي نحو مزيد من الابتكار والمخاطرة. ومع ذلك، العديد من أعضاء الفريق مرتاحون للنهج المحافظ الحالي."
    },
    question: {
      en: "How can you embody transformational leadership in this context?",
      ar: "كيف يمكنك تجسيد القيادة التحويلية في هذا السياق؟"
    },
    options: {
      en: [
        { text: "Force immediate change through directives and mandates", score: 1, feedback: "Forced change creates resistance rather than engagement" },
        { text: "Model innovative behavior yourself, create psychological safety for experimentation, celebrate learning from failures, and connect innovation to team members' values", score: 5, feedback: "Excellent! Transformational leaders inspire change through vision and example" },
        { text: "Wait for the organization to change first before adapting your approach", score: 2, feedback: "Leaders should be change agents, not followers" },
        { text: "Focus only on team members who are naturally innovative", score: 2, feedback: "This excludes potential contributors and creates division" }
      ],
      ar: [
        { text: "فرض التغيير الفوري من خلال التوجيهات والأوامر", score: 1, feedback: "التغيير القسري يخلق مقاومة بدلاً من المشاركة" },
        { text: "نمذجة السلوك الابتكاري بنفسك، خلق أمان نفسي للتجريب، الاحتفاء بالتعلم من الإخفاقات، وربط الابتكار بقيم أعضاء الفريق", score: 5, feedback: "ممتاز! القادة التحويليون يلهمون التغيير من خلال الرؤية والقدوة" },
        { text: "الانتظار حتى تتغير المؤسسة أولاً قبل تكييف نهجك", score: 2, feedback: "القادة يجب أن يكونوا عوامل تغيير وليس تابعين" },
        { text: "التركيز فقط على أعضاء الفريق المبتكرين بطبيعتهم", score: 2, feedback: "هذا يستبعد المساهمين المحتملين ويخلق انقساماً" }
      ]
    }
  },

  // Change Management - Additional Questions (3 more = 5 total)
  {
    id: "cm3",
    competency: "changeManagement",
    type: "scenario",
    scenario: {
      en: "Six months into a major change initiative, you notice that initial enthusiasm has faded. Employees have reverted to old habits, and only 40% of the new processes are being followed.",
      ar: "بعد ستة أشهر من مبادرة تغيير كبرى، تلاحظ أن الحماس الأولي قد تلاشى. عاد الموظفون للعادات القديمة، ويتم اتباع 40% فقط من العمليات الجديدة."
    },
    question: {
      en: "According to Kotter's model, which step is failing and what should you do?",
      ar: "وفقاً لنموذج كوتر، أي خطوة تفشل وماذا يجب أن تفعل؟"
    },
    options: {
      en: [
        { text: "The change has failed - start over with a new approach", score: 1, feedback: "Abandoning progress isn't the answer; reinforcement is needed" },
        { text: "Step 8 'Anchor Changes' is failing - institutionalize the new approaches by connecting them to organizational success, updating policies, and recognizing adopters", score: 5, feedback: "Correct! Anchoring changes in culture is critical for sustainability" },
        { text: "Punish those not following the new processes", score: 1, feedback: "Punishment creates fear, not commitment to change" },
        { text: "Accept partial adoption as success", score: 2, feedback: "40% adoption represents significant risk of full reversion" }
      ],
      ar: [
        { text: "فشل التغيير - ابدأ من جديد بنهج جديد", score: 1, feedback: "التخلي عن التقدم ليس الجواب؛ التعزيز مطلوب" },
        { text: "الخطوة 8 'ترسيخ التغييرات' تفشل - إضفاء الطابع المؤسسي على المناهج الجديدة بربطها بنجاح المؤسسة، تحديث السياسات، والاعتراف بالمتبنين", score: 5, feedback: "صحيح! ترسيخ التغييرات في الثقافة حاسم للاستدامة" },
        { text: "معاقبة من لا يتبعون العمليات الجديدة", score: 1, feedback: "العقاب يخلق الخوف وليس الالتزام بالتغيير" },
        { text: "قبول التبني الجزئي كنجاح", score: 2, feedback: "تبني 40% يمثل مخاطر كبيرة للعودة الكاملة" }
      ]
    }
  },
  {
    id: "cm4",
    competency: "changeManagement",
    type: "scenario",
    scenario: {
      en: "A powerful middle manager is actively undermining your change initiative by spreading skepticism and encouraging others to resist. They have significant influence within the organization.",
      ar: "مدير متوسط المستوى ذو نفوذ يقوض بنشاط مبادرة التغيير الخاصة بك بنشر الشك وتشجيع الآخرين على المقاومة. لديه تأثير كبير داخل المؤسسة."
    },
    question: {
      en: "How should you address this influential resister?",
      ar: "كيف يجب أن تتعامل مع هذا المقاوم المؤثر؟"
    },
    options: {
      en: [
        { text: "Go to their supervisor to have them disciplined", score: 2, feedback: "Escalation without engagement damages relationships and may backfire" },
        { text: "Engage them directly: understand their concerns, involve them in finding solutions, give them a meaningful role in the change, and turn them into a champion", score: 5, feedback: "Excellent! Converting influential resisters into champions is a powerful change strategy" },
        { text: "Work around them by focusing on supportive employees", score: 2, feedback: "This leaves a powerful voice of opposition unchecked" },
        { text: "Publicly challenge their concerns in front of others", score: 1, feedback: "Public confrontation escalates conflict and creates sides" }
      ],
      ar: [
        { text: "الذهاب لمشرفهم لتأديبهم", score: 2, feedback: "التصعيد دون تفاعل يضر العلاقات وقد يأتي بنتائج عكسية" },
        { text: "التفاعل معهم مباشرة: فهم مخاوفهم، إشراكهم في إيجاد الحلول، منحهم دوراً مهماً في التغيير، وتحويلهم إلى أبطال", score: 5, feedback: "ممتاز! تحويل المقاومين المؤثرين إلى أبطال استراتيجية تغيير قوية" },
        { text: "العمل حولهم بالتركيز على الموظفين الداعمين", score: 2, feedback: "هذا يترك صوت معارضة قوي بدون رقابة" },
        { text: "تحدي مخاوفهم علناً أمام الآخرين", score: 1, feedback: "المواجهة العلنية تصعد الصراع وتخلق أطرافاً" }
      ]
    }
  },
  {
    id: "cm5",
    competency: "changeManagement",
    type: "scenario",
    scenario: {
      en: "Your organization has successfully implemented phase one of a transformation. Senior leadership is eager to accelerate phase two, but your assessment shows the team needs consolidation time.",
      ar: "نفذت مؤسستك بنجاح المرحلة الأولى من التحول. القيادة العليا متحمسة لتسريع المرحلة الثانية، لكن تقييمك يظهر أن الفريق يحتاج وقتاً للتوحيد."
    },
    question: {
      en: "How do you balance leadership expectations with change sustainability?",
      ar: "كيف توازن بين توقعات القيادة واستدامة التغيير؟"
    },
    options: {
      en: [
        { text: "Simply follow leadership's directive to accelerate", score: 2, feedback: "Blindly following may lead to change fatigue and failure" },
        { text: "Present data on change readiness, propose quick wins that create momentum without overwhelming, and recommend a phased acceleration with clear milestones", score: 5, feedback: "Perfect! Balancing speed with sustainability ensures long-term success" },
        { text: "Refuse to proceed until the team is fully ready", score: 2, feedback: "Rigid positions damage relationships with leadership" },
        { text: "Let the team struggle through accelerated change", score: 1, feedback: "This risks burnout and undermines the entire transformation" }
      ],
      ar: [
        { text: "ببساطة اتباع توجيه القيادة للتسريع", score: 2, feedback: "الاتباع الأعمى قد يؤدي لإرهاق التغيير والفشل" },
        { text: "تقديم بيانات عن جاهزية التغيير، اقتراح مكاسب سريعة تخلق زخماً دون إرهاق، والتوصية بتسريع مرحلي مع معالم واضحة", score: 5, feedback: "مثالي! الموازنة بين السرعة والاستدامة تضمن النجاح طويل المدى" },
        { text: "رفض المتابعة حتى يكون الفريق جاهزاً تماماً", score: 2, feedback: "المواقف الجامدة تضر العلاقات مع القيادة" },
        { text: "ترك الفريق يكافح خلال التغيير المتسارع", score: 1, feedback: "هذا يخاطر بالإرهاق ويقوض التحول بأكمله" }
      ]
    }
  },

  // Performance Management - Additional Questions (3 more = 5 total)
  {
    id: "pm3",
    competency: "performanceManagement",
    type: "scenario",
    scenario: {
      en: "A high-performing team member consistently exceeds targets but has a negative attitude that affects team morale. Other team members have started complaining.",
      ar: "عضو فريق عالي الأداء يتجاوز الأهداف باستمرار لكن لديه موقف سلبي يؤثر على معنويات الفريق. بدأ أعضاء الفريق الآخرون بالشكوى."
    },
    question: {
      en: "How should you address this performance-behavior disconnect?",
      ar: "كيف يجب أن تعالج هذا الانفصال بين الأداء والسلوك؟"
    },
    options: {
      en: [
        { text: "Overlook the attitude since their performance is excellent", score: 1, feedback: "Ignoring toxic behavior damages team culture and productivity" },
        { text: "Have a direct conversation using SBI about the behavioral impact, set clear expectations for both results AND collaboration, and establish accountability measures", score: 5, feedback: "Excellent! High performance doesn't excuse negative behaviors" },
        { text: "Transfer them to work independently away from the team", score: 2, feedback: "This avoids the problem rather than developing the individual" },
        { text: "Give them a formal warning immediately", score: 2, feedback: "Formal action without coaching conversation is premature" }
      ],
      ar: [
        { text: "التغاضي عن الموقف لأن أداءهم ممتاز", score: 1, feedback: "تجاهل السلوك السام يضر ثقافة الفريق والإنتاجية" },
        { text: "إجراء محادثة مباشرة باستخدام SBI حول التأثير السلوكي، وضع توقعات واضحة للنتائج والتعاون معاً، وإنشاء إجراءات مساءلة", score: 5, feedback: "ممتاز! الأداء العالي لا يبرر السلوكيات السلبية" },
        { text: "نقلهم للعمل بشكل مستقل بعيداً عن الفريق", score: 2, feedback: "هذا يتجنب المشكلة بدلاً من تطوير الفرد" },
        { text: "إعطائهم تحذيراً رسمياً فوراً", score: 2, feedback: "الإجراء الرسمي بدون محادثة توجيهية سابق لأوانه" }
      ]
    }
  },
  {
    id: "pm4",
    competency: "performanceManagement",
    type: "scenario",
    scenario: {
      en: "During your quarterly review, you notice that a team member's performance has dropped significantly over the past two months. They used to be a strong performer.",
      ar: "خلال مراجعتك الفصلية، تلاحظ أن أداء أحد أعضاء الفريق قد انخفض بشكل كبير خلال الشهرين الماضيين. كانوا من الأداء القوي سابقاً."
    },
    question: {
      en: "What is the most effective first step in addressing this performance decline?",
      ar: "ما هي الخطوة الأولى الأكثر فعالية في معالجة هذا الانخفاض في الأداء؟"
    },
    options: {
      en: [
        { text: "Put them on a formal performance improvement plan immediately", score: 2, feedback: "Formal action without understanding the cause is premature" },
        { text: "Have a supportive one-on-one to understand what's changed, listen for personal or work-related factors, and collaborate on a recovery plan", score: 5, feedback: "Perfect! Understanding root causes enables targeted support" },
        { text: "Wait to see if performance naturally improves", score: 1, feedback: "Delayed intervention allows problems to compound" },
        { text: "Assign easier tasks to reduce their workload", score: 2, feedback: "This may not address the underlying cause" }
      ],
      ar: [
        { text: "وضعهم على خطة تحسين أداء رسمية فوراً", score: 2, feedback: "الإجراء الرسمي بدون فهم السبب سابق لأوانه" },
        { text: "إجراء لقاء فردي داعم لفهم ما تغير، الاستماع للعوامل الشخصية أو المتعلقة بالعمل، والتعاون على خطة تعافي", score: 5, feedback: "مثالي! فهم الأسباب الجذرية يمكّن من الدعم المستهدف" },
        { text: "الانتظار لمعرفة إذا تحسن الأداء طبيعياً", score: 1, feedback: "التدخل المتأخر يسمح للمشاكل بالتراكم" },
        { text: "تعيين مهام أسهل لتقليل عبء عملهم", score: 2, feedback: "قد لا يعالج هذا السبب الأساسي" }
      ]
    }
  },
  {
    id: "pm5",
    competency: "performanceManagement",
    type: "scenario",
    scenario: {
      en: "You need to implement a new KPI dashboard for your department. Some team members are skeptical, saying 'we're doing fine without metrics' and fearing micromanagement.",
      ar: "تحتاج لتنفيذ لوحة مؤشرات أداء جديدة لقسمك. بعض أعضاء الفريق متشككون، يقولون 'نحن نعمل بشكل جيد بدون مقاييس' ويخشون الإدارة التفصيلية."
    },
    question: {
      en: "How should you introduce performance metrics effectively?",
      ar: "كيف يجب أن تقدم مقاييس الأداء بفعالية؟"
    },
    options: {
      en: [
        { text: "Mandate the dashboard usage without discussion", score: 1, feedback: "Top-down mandates without buy-in create resistance" },
        { text: "Involve the team in selecting meaningful metrics, explain how data empowers rather than controls, demonstrate quick wins, and use metrics for coaching not punishment", score: 5, feedback: "Excellent! Participative implementation increases adoption" },
        { text: "Delay implementation until everyone agrees", score: 2, feedback: "Waiting for unanimous agreement may never happen" },
        { text: "Implement secretly and reveal results later", score: 1, feedback: "Lack of transparency destroys trust" }
      ],
      ar: [
        { text: "فرض استخدام اللوحة بدون نقاش", score: 1, feedback: "الأوامر من الأعلى بدون قبول تخلق مقاومة" },
        { text: "إشراك الفريق في اختيار مقاييس ذات معنى، شرح كيف تمكّن البيانات بدلاً من التحكم، إظهار مكاسب سريعة، واستخدام المقاييس للتوجيه وليس العقاب", score: 5, feedback: "ممتاز! التنفيذ التشاركي يزيد التبني" },
        { text: "تأخير التنفيذ حتى يوافق الجميع", score: 2, feedback: "الانتظار للاتفاق الجماعي قد لا يحدث أبداً" },
        { text: "التنفيذ سراً وكشف النتائج لاحقاً", score: 1, feedback: "عدم الشفافية يدمر الثقة" }
      ]
    }
  },

  // Team Building - Additional Questions (3 more = 5 total)
  {
    id: "tb3",
    competency: "teamBuilding",
    type: "scenario",
    scenario: {
      en: "Your team has been working well together for a year. A new member joins with very different working styles and cultural background. Initial interactions have been awkward.",
      ar: "فريقك يعمل معاً بشكل جيد منذ عام. ينضم عضو جديد بأساليب عمل وخلفية ثقافية مختلفة جداً. التفاعلات الأولى كانت محرجة."
    },
    question: {
      en: "How do you facilitate successful integration of the new team member?",
      ar: "كيف تسهّل الاندماج الناجح للعضو الجديد؟"
    },
    options: {
      en: [
        { text: "Let them adapt naturally over time", score: 2, feedback: "Passive integration is slow and may fail" },
        { text: "Assign a buddy from the team, create structured opportunities for connection, acknowledge different perspectives as strengths, and set clear integration milestones", score: 5, feedback: "Excellent! Active integration accelerates team cohesion" },
        { text: "Ask them to adjust their style to match the team", score: 1, feedback: "Demanding conformity loses the value of diversity" },
        { text: "Keep them on separate tasks until they fit in", score: 1, feedback: "Isolation prevents integration and wastes potential" }
      ],
      ar: [
        { text: "تركهم يتكيفون طبيعياً مع الوقت", score: 2, feedback: "الاندماج السلبي بطيء وقد يفشل" },
        { text: "تعيين رفيق من الفريق، خلق فرص منظمة للتواصل، الاعتراف بالمنظورات المختلفة كنقاط قوة، ووضع معالم اندماج واضحة", score: 5, feedback: "ممتاز! الاندماج النشط يسرع تماسك الفريق" },
        { text: "طلب منهم تعديل أسلوبهم ليتناسب مع الفريق", score: 1, feedback: "المطالبة بالتوافق يفقد قيمة التنوع" },
        { text: "إبقاؤهم على مهام منفصلة حتى يندمجوا", score: 1, feedback: "العزلة تمنع الاندماج وتهدر الإمكانات" }
      ]
    }
  },
  {
    id: "tb4",
    competency: "teamBuilding",
    type: "scenario",
    scenario: {
      en: "Two strong performers in your team are in open conflict. Their disagreement started professionally but has become personal. It's affecting the entire team's productivity.",
      ar: "اثنان من الأداء القوي في فريقك في صراع مفتوح. بدأ خلافهم مهنياً لكنه أصبح شخصياً. يؤثر على إنتاجية الفريق بأكمله."
    },
    question: {
      en: "How should you address this escalating conflict?",
      ar: "كيف يجب أن تعالج هذا الصراع المتصاعد؟"
    },
    options: {
      en: [
        { text: "Let them work it out themselves - adults should manage their own issues", score: 1, feedback: "Unmanaged conflict typically escalates and spreads" },
        { text: "Meet with each individually to understand perspectives, facilitate a structured mediation session, establish ground rules for professional interaction, and monitor with follow-up", score: 5, feedback: "Perfect! Structured conflict resolution addresses root causes" },
        { text: "Transfer one of them to another team", score: 2, feedback: "This removes the symptom but not the problem" },
        { text: "Issue formal warnings to both parties", score: 2, feedback: "Punitive measures don't resolve underlying conflicts" }
      ],
      ar: [
        { text: "تركهم يحلون الأمر بأنفسهم - البالغون يجب أن يديروا مشاكلهم", score: 1, feedback: "الصراع غير المُدار عادة يتصاعد وينتشر" },
        { text: "الاجتماع مع كل منهم على حدة لفهم المنظورات، تسهيل جلسة وساطة منظمة، إنشاء قواعد أساسية للتفاعل المهني، والمتابعة", score: 5, feedback: "مثالي! حل النزاع المنظم يعالج الأسباب الجذرية" },
        { text: "نقل أحدهما لفريق آخر", score: 2, feedback: "هذا يزيل العرض لكن ليس المشكلة" },
        { text: "إصدار تحذيرات رسمية لكلا الطرفين", score: 2, feedback: "الإجراءات العقابية لا تحل النزاعات الأساسية" }
      ]
    }
  },
  {
    id: "tb5",
    competency: "teamBuilding",
    type: "scenario",
    scenario: {
      en: "You notice that team meetings have become unproductive. Some members dominate discussions while others stay silent. Important decisions are being delayed.",
      ar: "تلاحظ أن اجتماعات الفريق أصبحت غير منتجة. بعض الأعضاء يهيمنون على النقاشات بينما يبقى آخرون صامتين. يتم تأخير القرارات المهمة."
    },
    question: {
      en: "How can you restore effective team collaboration in meetings?",
      ar: "كيف يمكنك استعادة التعاون الفعال للفريق في الاجتماعات؟"
    },
    options: {
      en: [
        { text: "Reduce meeting frequency since they're not working", score: 1, feedback: "Fewer bad meetings doesn't solve the underlying dynamics" },
        { text: "Implement structured facilitation: use round-robin for input, establish psychological safety, assign rotating facilitator roles, and create pre-meeting preparation expectations", score: 5, feedback: "Excellent! Structured facilitation ensures all voices are heard" },
        { text: "Speak privately to dominant members about talking less", score: 2, feedback: "This addresses one symptom but not the systemic issue" },
        { text: "Make all decisions yourself to speed things up", score: 1, feedback: "This undermines team development and buy-in" }
      ],
      ar: [
        { text: "تقليل تكرار الاجتماعات لأنها لا تعمل", score: 1, feedback: "اجتماعات سيئة أقل لا يحل الديناميكيات الأساسية" },
        { text: "تنفيذ تسهيل منظم: استخدام التناوب للمدخلات، إنشاء أمان نفسي، تعيين أدوار ميسر متناوبة، وخلق توقعات تحضير قبل الاجتماع", score: 5, feedback: "ممتاز! التسهيل المنظم يضمن سماع جميع الأصوات" },
        { text: "التحدث بشكل خاص للأعضاء المهيمنين حول التكلم أقل", score: 2, feedback: "هذا يعالج عرضاً واحداً لكن ليس المشكلة النظامية" },
        { text: "اتخاذ جميع القرارات بنفسك لتسريع الأمور", score: 1, feedback: "هذا يقوض تطور الفريق والقبول" }
      ]
    }
  },

  // Communication - Additional Questions (3 more = 5 total)
  {
    id: "co3",
    competency: "communication",
    type: "scenario",
    scenario: {
      en: "You need to deliver difficult news to your team: budget cuts will eliminate some positions. Rumors are already spreading, and anxiety is high.",
      ar: "تحتاج لإيصال أخبار صعبة لفريقك: سيؤدي خفض الميزانية للاستغناء عن بعض المناصب. الشائعات تنتشر بالفعل، والقلق مرتفع."
    },
    question: {
      en: "How should you communicate this difficult news?",
      ar: "كيف يجب أن توصل هذه الأخبار الصعبة؟"
    },
    options: {
      en: [
        { text: "Wait until you have all the details before saying anything", score: 2, feedback: "Silence allows harmful rumors to grow" },
        { text: "Call an immediate team meeting, be direct and honest, acknowledge emotions, share what you know and what you don't, and outline next steps and support available", score: 5, feedback: "Excellent! Transparent, empathetic communication builds trust even in difficult times" },
        { text: "Send an email to avoid emotional reactions", score: 1, feedback: "Email is too impersonal for sensitive news" },
        { text: "Only tell those directly affected privately", score: 2, feedback: "This allows rumors to continue for others" }
      ],
      ar: [
        { text: "الانتظار حتى تحصل على كل التفاصيل قبل قول أي شيء", score: 2, feedback: "الصمت يسمح للشائعات الضارة بالنمو" },
        { text: "عقد اجتماع فريق فوري، كن مباشراً وصادقاً، اعترف بالمشاعر، شارك ما تعرفه وما لا تعرفه، وحدد الخطوات التالية والدعم المتاح", score: 5, feedback: "ممتاز! التواصل الشفاف والمتعاطف يبني الثقة حتى في الأوقات الصعبة" },
        { text: "إرسال بريد إلكتروني لتجنب ردود الفعل العاطفية", score: 1, feedback: "البريد الإلكتروني غير شخصي جداً للأخبار الحساسة" },
        { text: "إخبار المتأثرين مباشرة فقط بشكل خاص", score: 2, feedback: "هذا يسمح للشائعات بالاستمرار للآخرين" }
      ]
    }
  },
  {
    id: "co4",
    competency: "communication",
    type: "scenario",
    scenario: {
      en: "In a virtual meeting with international stakeholders, you notice cultural differences affecting communication. Some participants from high-context cultures aren't speaking up.",
      ar: "في اجتماع افتراضي مع أصحاب مصلحة دوليين، تلاحظ أن الاختلافات الثقافية تؤثر على التواصل. بعض المشاركين من ثقافات عالية السياق لا يتحدثون."
    },
    question: {
      en: "How can you facilitate more inclusive cross-cultural communication?",
      ar: "كيف يمكنك تسهيل تواصل عبر ثقافي أكثر شمولاً؟"
    },
    options: {
      en: [
        { text: "Continue with standard meeting format - everyone has equal opportunity to speak", score: 1, feedback: "Equal opportunity isn't equitable when cultural barriers exist" },
        { text: "Use multiple input methods (chat, small breakouts), directly invite quieter participants to share, provide questions in advance, and follow up individually for private input", score: 5, feedback: "Excellent! Adapting to cultural communication styles ensures inclusive participation" },
        { text: "Speak more slowly and loudly for clarity", score: 1, feedback: "This addresses language but not cultural communication styles" },
        { text: "Schedule separate meetings for different cultural groups", score: 2, feedback: "Separation doesn't build cross-cultural collaboration" }
      ],
      ar: [
        { text: "الاستمرار بتنسيق الاجتماع القياسي - الجميع لديهم فرصة متساوية للتحدث", score: 1, feedback: "الفرصة المتساوية ليست منصفة عند وجود حواجز ثقافية" },
        { text: "استخدام طرق إدخال متعددة (محادثة، مجموعات صغيرة)، دعوة المشاركين الهادئين مباشرة للمشاركة، توفير الأسئلة مسبقاً، والمتابعة بشكل فردي للمدخلات الخاصة", score: 5, feedback: "ممتاز! التكيف مع أساليب التواصل الثقافية يضمن مشاركة شاملة" },
        { text: "التحدث ببطء وبصوت عالٍ للوضوح", score: 1, feedback: "هذا يعالج اللغة لكن ليس أساليب التواصل الثقافية" },
        { text: "جدولة اجتماعات منفصلة لمجموعات ثقافية مختلفة", score: 2, feedback: "الفصل لا يبني التعاون عبر الثقافات" }
      ]
    }
  },
  {
    id: "co5",
    competency: "communication",
    type: "scenario",
    scenario: {
      en: "Your written report to senior leadership has been misinterpreted, leading to confusion about your team's recommendations. You need to clarify without appearing to blame others.",
      ar: "تم إساءة تفسير تقريرك المكتوب للقيادة العليا، مما أدى لارتباك حول توصيات فريقك. تحتاج للتوضيح دون الظهور بمظهر من يلوم الآخرين."
    },
    question: {
      en: "How should you handle this communication breakdown?",
      ar: "كيف يجب أن تتعامل مع انهيار التواصل هذا؟"
    },
    options: {
      en: [
        { text: "Point out how clearly you wrote the report and suggest others read more carefully", score: 1, feedback: "Defensive responses damage relationships and don't solve the problem" },
        { text: "Take ownership of the confusion, request a brief meeting to clarify key points, provide a clear executive summary, and learn from this to improve future communications", score: 5, feedback: "Excellent! Taking responsibility while clarifying shows leadership maturity" },
        { text: "Send another email restating the same points", score: 2, feedback: "If written communication failed once, repeating may not help" },
        { text: "Ask someone else to explain on your behalf", score: 2, feedback: "This distances you from your own work and recommendations" }
      ],
      ar: [
        { text: "الإشارة إلى مدى وضوح كتابتك للتقرير واقتراح أن يقرأ الآخرون بعناية أكبر", score: 1, feedback: "الردود الدفاعية تضر العلاقات ولا تحل المشكلة" },
        { text: "تحمل مسؤولية الارتباك، طلب اجتماع موجز لتوضيح النقاط الرئيسية، تقديم ملخص تنفيذي واضح، والتعلم من هذا لتحسين التواصل المستقبلي", score: 5, feedback: "ممتاز! تحمل المسؤولية مع التوضيح يظهر نضج قيادي" },
        { text: "إرسال بريد إلكتروني آخر يعيد ذكر نفس النقاط", score: 2, feedback: "إذا فشل التواصل المكتوب مرة، التكرار قد لا يساعد" },
        { text: "طلب من شخص آخر الشرح نيابة عنك", score: 2, feedback: "هذا يبعدك عن عملك وتوصياتك" }
      ]
    }
  },

  // Problem Solving - Additional Questions (3 more = 5 total)
  {
    id: "ps3",
    competency: "problemSolving",
    type: "scenario",
    scenario: {
      en: "Your team faces a complex problem with multiple possible solutions, but there's significant disagreement about which approach to take. Each option has merit but also significant trade-offs.",
      ar: "يواجه فريقك مشكلة معقدة مع حلول محتملة متعددة، لكن هناك خلاف كبير حول أي نهج يتبع. كل خيار له ميزة لكن أيضاً مقايضات كبيرة."
    },
    question: {
      en: "How should you facilitate the decision-making process?",
      ar: "كيف يجب أن تسهّل عملية اتخاذ القرار؟"
    },
    options: {
      en: [
        { text: "Make the final decision yourself since you're the leader", score: 2, feedback: "Autocratic decisions miss valuable perspectives and reduce buy-in" },
        { text: "Create a structured decision matrix weighing criteria, facilitate objective evaluation of each option, build consensus on evaluation criteria first, then apply to options", score: 5, feedback: "Excellent! Structured decision-making increases quality and acceptance" },
        { text: "Vote and go with the majority preference", score: 2, feedback: "Voting without analysis may select popular but suboptimal options" },
        { text: "Delay the decision until consensus emerges naturally", score: 1, feedback: "Waiting for natural consensus often leads to indefinite delay" }
      ],
      ar: [
        { text: "اتخاذ القرار النهائي بنفسك لأنك القائد", score: 2, feedback: "القرارات الاستبدادية تفوت وجهات نظر قيمة وتقلل القبول" },
        { text: "إنشاء مصفوفة قرار منظمة تزن المعايير، تسهيل تقييم موضوعي لكل خيار، بناء إجماع على معايير التقييم أولاً، ثم تطبيقها على الخيارات", score: 5, feedback: "ممتاز! اتخاذ القرار المنظم يزيد الجودة والقبول" },
        { text: "التصويت والذهاب مع تفضيل الأغلبية", score: 2, feedback: "التصويت بدون تحليل قد يختار خيارات شعبية لكن غير مثلى" },
        { text: "تأخير القرار حتى يظهر إجماع طبيعياً", score: 1, feedback: "الانتظار للإجماع الطبيعي غالباً يؤدي لتأخير غير محدد" }
      ]
    }
  },
  {
    id: "ps4",
    competency: "problemSolving",
    type: "scenario",
    scenario: {
      en: "A critical system failure occurs during a high-profile event. There's chaos, blame is flying, and multiple teams are pointing fingers at each other instead of solving the problem.",
      ar: "يحدث عطل حرج في النظام خلال فعالية رفيعة المستوى. هناك فوضى، اللوم يتطاير، وفرق متعددة توجه أصابع الاتهام لبعضها البعض بدلاً من حل المشكلة."
    },
    question: {
      en: "How should you lead through this crisis?",
      ar: "كيف يجب أن تقود خلال هذه الأزمة؟"
    },
    options: {
      en: [
        { text: "Identify who caused the problem first so they can fix it", score: 1, feedback: "Blame-finding wastes critical time and increases chaos" },
        { text: "Take charge, stop the blame game, focus everyone on immediate solutions, create rapid response teams with clear roles, and save root cause analysis for after the crisis", score: 5, feedback: "Excellent! Crisis leadership requires focus on solutions, not blame" },
        { text: "Escalate immediately to senior management to take over", score: 2, feedback: "Waiting for escalation loses precious response time" },
        { text: "Document everything for the post-incident report", score: 1, feedback: "Documentation priority during crisis misses the urgent need for action" }
      ],
      ar: [
        { text: "تحديد من تسبب بالمشكلة أولاً حتى يتمكنوا من إصلاحها", score: 1, feedback: "البحث عن اللوم يضيع وقتاً حرجاً ويزيد الفوضى" },
        { text: "تولي القيادة، إيقاف لعبة اللوم، تركيز الجميع على الحلول الفورية، إنشاء فرق استجابة سريعة بأدوار واضحة، وتأجيل تحليل السبب الجذري لما بعد الأزمة", score: 5, feedback: "ممتاز! القيادة في الأزمات تتطلب التركيز على الحلول وليس اللوم" },
        { text: "التصعيد فوراً للإدارة العليا لتولي الأمر", score: 2, feedback: "الانتظار للتصعيد يفقد وقت استجابة ثمين" },
        { text: "توثيق كل شيء لتقرير ما بعد الحادث", score: 1, feedback: "أولوية التوثيق خلال الأزمة تفوت الحاجة العاجلة للعمل" }
      ]
    }
  },
  {
    id: "ps5",
    competency: "problemSolving",
    type: "scenario",
    scenario: {
      en: "You've implemented what you thought was a good solution, but it created unexpected new problems. Stakeholders are questioning your judgment.",
      ar: "نفذت ما ظننت أنه حل جيد، لكنه خلق مشاكل جديدة غير متوقعة. أصحاب المصلحة يشككون في حكمك."
    },
    question: {
      en: "How should you respond to this implementation failure?",
      ar: "كيف يجب أن تستجيب لهذا الفشل في التنفيذ؟"
    },
    options: {
      en: [
        { text: "Defend the original solution - the new problems are unrelated", score: 1, feedback: "Defensive responses prevent learning and damage credibility" },
        { text: "Acknowledge the unintended consequences, analyze what was missed, communicate transparently, develop a corrective plan, and implement lessons learned for future decisions", score: 5, feedback: "Excellent! Learning from failures builds credibility and improves future decisions" },
        { text: "Blame the implementation team for not following the plan correctly", score: 1, feedback: "Shifting blame destroys trust and prevents real learning" },
        { text: "Quickly implement another solution to fix the new problems", score: 2, feedback: "Rushing without analysis may create even more problems" }
      ],
      ar: [
        { text: "الدفاع عن الحل الأصلي - المشاكل الجديدة غير مرتبطة", score: 1, feedback: "الردود الدفاعية تمنع التعلم وتضر المصداقية" },
        { text: "الاعتراف بالعواقب غير المقصودة، تحليل ما تم تفويته، التواصل بشفافية، تطوير خطة تصحيحية، وتنفيذ الدروس المستفادة للقرارات المستقبلية", score: 5, feedback: "ممتاز! التعلم من الإخفاقات يبني المصداقية ويحسن القرارات المستقبلية" },
        { text: "إلقاء اللوم على فريق التنفيذ لعدم اتباع الخطة بشكل صحيح", score: 1, feedback: "نقل اللوم يدمر الثقة ويمنع التعلم الحقيقي" },
        { text: "تنفيذ حل آخر بسرعة لإصلاح المشاكل الجديدة", score: 2, feedback: "التسرع بدون تحليل قد يخلق مزيداً من المشاكل" }
      ]
    }
  },

  // Emotional Intelligence - Additional Questions (3 more = 5 total)
  {
    id: "ei3",
    competency: "emotionalIntelligence",
    type: "scenario",
    scenario: {
      en: "You realize that you've been consistently impatient with a team member, and this has affected their confidence. Looking back, you recognize your behavior may have been influenced by personal stress.",
      ar: "تدرك أنك كنت نافد الصبر باستمرار مع أحد أعضاء الفريق، وهذا أثر على ثقتهم. عند النظر للوراء، تدرك أن سلوكك ربما تأثر بالضغط الشخصي."
    },
    question: {
      en: "How should you address this situation using emotional intelligence?",
      ar: "كيف يجب أن تعالج هذا الموقف باستخدام الذكاء العاطفي؟"
    },
    options: {
      en: [
        { text: "Keep this realization private - admitting it would undermine your authority", score: 1, feedback: "Hiding mistakes prevents repair and growth" },
        { text: "Acknowledge your behavior to the team member, apologize sincerely, commit to change, implement stress management practices, and rebuild trust through consistent positive interactions", score: 5, feedback: "Excellent! Self-awareness, accountability, and relationship repair demonstrate EQ maturity" },
        { text: "Compensate by being extra nice to them going forward", score: 2, feedback: "Changed behavior without acknowledgment doesn't address the damage done" },
        { text: "Attribute your impatience to high work standards", score: 1, feedback: "Rationalizing poor behavior prevents genuine growth" }
      ],
      ar: [
        { text: "إبقاء هذا الإدراك خاصاً - الاعتراف به سيقوض سلطتك", score: 1, feedback: "إخفاء الأخطاء يمنع الإصلاح والنمو" },
        { text: "الاعتراف بسلوكك لعضو الفريق، الاعتذار بصدق، الالتزام بالتغيير، تنفيذ ممارسات إدارة الضغط، وإعادة بناء الثقة من خلال تفاعلات إيجابية متسقة", score: 5, feedback: "ممتاز! الوعي الذاتي والمساءلة وإصلاح العلاقات يظهر نضج الذكاء العاطفي" },
        { text: "التعويض بأن تكون لطيفاً جداً معهم من الآن فصاعداً", score: 2, feedback: "السلوك المتغير بدون اعتراف لا يعالج الضرر الحاصل" },
        { text: "عزو نفاد صبرك لمعايير العمل العالية", score: 1, feedback: "تبرير السلوك السيئ يمنع النمو الحقيقي" }
      ]
    }
  },
  {
    id: "ei4",
    competency: "emotionalIntelligence",
    type: "scenario",
    scenario: {
      en: "During a team celebration, you notice that one member seems withdrawn and unhappy despite the positive occasion. Others haven't noticed.",
      ar: "خلال احتفال الفريق، تلاحظ أن أحد الأعضاء يبدو منعزلاً وغير سعيد رغم المناسبة الإيجابية. الآخرون لم يلاحظوا."
    },
    question: {
      en: "How should you use social awareness and empathy in this situation?",
      ar: "كيف يجب أن تستخدم الوعي الاجتماعي والتعاطف في هذا الموقف؟"
    },
    options: {
      en: [
        { text: "It's a celebration - they should adjust their mood or leave", score: 1, feedback: "Dismissing emotional cues damages relationships" },
        { text: "Find a discreet moment to check in privately, express genuine concern without pressure, offer support if needed, and respect their privacy", score: 5, feedback: "Perfect! Noticing and responding to emotional cues with sensitivity shows high EQ" },
        { text: "Ask them publicly if everything is okay", score: 1, feedback: "Public attention may embarrass and worsen the situation" },
        { text: "Ignore it - everyone has off moments", score: 2, feedback: "Consistently ignoring emotional signals damages trust over time" }
      ],
      ar: [
        { text: "إنه احتفال - يجب أن يعدلوا مزاجهم أو يغادروا", score: 1, feedback: "تجاهل الإشارات العاطفية يضر العلاقات" },
        { text: "إيجاد لحظة متحفظة للتحقق بشكل خاص، التعبير عن اهتمام حقيقي بدون ضغط، عرض الدعم إذا لزم الأمر، واحترام خصوصيتهم", score: 5, feedback: "مثالي! ملاحظة والاستجابة للإشارات العاطفية بحساسية يظهر ذكاء عاطفي عالي" },
        { text: "سؤالهم علناً إذا كان كل شيء على ما يرام", score: 1, feedback: "الاهتمام العام قد يحرجهم ويزيد الوضع سوءاً" },
        { text: "تجاهلها - الجميع لديهم لحظات سيئة", score: 2, feedback: "تجاهل الإشارات العاطفية باستمرار يضر الثقة مع الوقت" }
      ]
    }
  },
  {
    id: "ei5",
    competency: "emotionalIntelligence",
    type: "scenario",
    scenario: {
      en: "A colleague whom you've had a competitive relationship with receives a major promotion. You feel a mix of jealousy and disappointment, though you know they're qualified.",
      ar: "زميل كانت لديك علاقة تنافسية معه يحصل على ترقية كبرى. تشعر بمزيج من الغيرة وخيبة الأمل، رغم أنك تعلم أنه مؤهل."
    },
    question: {
      en: "How should you manage these complex emotions professionally?",
      ar: "كيف يجب أن تدير هذه المشاعر المعقدة بشكل مهني؟"
    },
    options: {
      en: [
        { text: "Distance yourself from them to avoid showing negative emotions", score: 2, feedback: "Avoidance damages professional relationships" },
        { text: "Acknowledge your feelings privately (self-awareness), separate emotions from facts (self-regulation), genuinely congratulate them (social skills), and reflect on your own growth path", score: 5, feedback: "Excellent! Managing complex emotions while maintaining relationships is advanced EQ" },
        { text: "Express your disappointment to mutual colleagues", score: 1, feedback: "Venting to others damages your reputation and relationships" },
        { text: "Congratulate them publicly while harboring resentment privately", score: 2, feedback: "Inauthentic responses eventually show and damage trust" }
      ],
      ar: [
        { text: "إبعاد نفسك عنهم لتجنب إظهار المشاعر السلبية", score: 2, feedback: "التجنب يضر العلاقات المهنية" },
        { text: "الاعتراف بمشاعرك بشكل خاص (الوعي الذاتي)، فصل المشاعر عن الحقائق (إدارة الذات)، تهنئتهم بصدق (المهارات الاجتماعية)، والتأمل في مسار نموك الخاص", score: 5, feedback: "ممتاز! إدارة المشاعر المعقدة مع الحفاظ على العلاقات هو ذكاء عاطفي متقدم" },
        { text: "التعبير عن خيبة أملك لزملاء مشتركين", score: 1, feedback: "التنفيس للآخرين يضر سمعتك وعلاقاتك" },
        { text: "تهنئتهم علناً مع إخفاء الاستياء داخلياً", score: 2, feedback: "الردود غير الأصيلة تظهر في النهاية وتضر الثقة" }
      ]
    }
  },

  // Strategic Implementation - Additional Questions (3 more = 5 total)
  {
    id: "si3",
    competency: "strategicImplementation",
    type: "scenario",
    scenario: {
      en: "You've identified an opportunity to improve efficiency by 30%, but it requires significant initial investment and will take 18 months to show results. Management prefers quick wins.",
      ar: "حددت فرصة لتحسين الكفاءة بنسبة 30%، لكنها تتطلب استثماراً أولياً كبيراً وستستغرق 18 شهراً لإظهار النتائج. الإدارة تفضل المكاسب السريعة."
    },
    question: {
      en: "How should you build the case for this strategic initiative?",
      ar: "كيف يجب أن تبني حالة هذه المبادرة الاستراتيجية؟"
    },
    options: {
      en: [
        { text: "Abandon the idea since management wants quick results", score: 1, feedback: "Giving up on valuable initiatives limits organizational potential" },
        { text: "Create a phased approach with early deliverables, demonstrate ROI with data, identify quick wins along the way, and build a coalition of supporters before presenting", score: 5, feedback: "Excellent! Strategic proposals need to balance long-term vision with short-term validation" },
        { text: "Implement quietly without approval to prove the concept", score: 1, feedback: "Unauthorized implementation risks careers and organizational trust" },
        { text: "Present the full 18-month plan and hope they see the vision", score: 2, feedback: "Hope is not a strategy; you need to address management concerns" }
      ],
      ar: [
        { text: "التخلي عن الفكرة لأن الإدارة تريد نتائج سريعة", score: 1, feedback: "التخلي عن المبادرات القيمة يحد من إمكانات المؤسسة" },
        { text: "إنشاء نهج مرحلي مع مخرجات مبكرة، إظهار العائد على الاستثمار بالبيانات، تحديد مكاسب سريعة على طول الطريق، وبناء تحالف من المؤيدين قبل التقديم", score: 5, feedback: "ممتاز! المقترحات الاستراتيجية تحتاج للموازنة بين الرؤية طويلة المدى والتحقق قصير المدى" },
        { text: "التنفيذ بهدوء بدون موافقة لإثبات المفهوم", score: 1, feedback: "التنفيذ غير المصرح به يخاطر بالمهن والثقة المؤسسية" },
        { text: "تقديم الخطة الكاملة لـ 18 شهراً وأمل أن يروا الرؤية", score: 2, feedback: "الأمل ليس استراتيجية؛ تحتاج لمعالجة مخاوف الإدارة" }
      ]
    }
  },
  {
    id: "si4",
    competency: "strategicImplementation",
    type: "scenario",
    scenario: {
      en: "Your project is behind schedule due to factors outside your control (vendor delays, regulatory changes). Stakeholders are getting anxious and some are suggesting cancellation.",
      ar: "مشروعك متأخر عن الجدول الزمني بسبب عوامل خارج سيطرتك (تأخيرات الموردين، تغييرات تنظيمية). أصحاب المصلحة قلقون وبعضهم يقترح الإلغاء."
    },
    question: {
      en: "How do you maintain stakeholder confidence and project momentum?",
      ar: "كيف تحافظ على ثقة أصحاب المصلحة وزخم المشروع؟"
    },
    options: {
      en: [
        { text: "Blame external factors to protect your reputation", score: 1, feedback: "Blame-shifting damages credibility even when factors are external" },
        { text: "Communicate transparently about challenges, present a revised realistic timeline, show completed milestones to demonstrate progress, and offer risk mitigation strategies", score: 5, feedback: "Excellent! Transparent communication with solutions maintains trust" },
        { text: "Push the team harder to make up lost time", score: 2, feedback: "Unsustainable pressure leads to burnout and quality issues" },
        { text: "Agree that cancellation might be the best option", score: 1, feedback: "Premature surrender wastes invested resources" }
      ],
      ar: [
        { text: "إلقاء اللوم على العوامل الخارجية لحماية سمعتك", score: 1, feedback: "نقل اللوم يضر المصداقية حتى عندما تكون العوامل خارجية" },
        { text: "التواصل بشفافية حول التحديات، تقديم جدول زمني منقح واقعي، إظهار المعالم المكتملة لإثبات التقدم، وعرض استراتيجيات تخفيف المخاطر", score: 5, feedback: "ممتاز! التواصل الشفاف مع الحلول يحافظ على الثقة" },
        { text: "الضغط على الفريق بشكل أكبر لتعويض الوقت الضائع", score: 2, feedback: "الضغط غير المستدام يؤدي للإرهاق ومشاكل الجودة" },
        { text: "الموافقة على أن الإلغاء قد يكون الخيار الأفضل", score: 1, feedback: "الاستسلام المبكر يهدر الموارد المستثمرة" }
      ]
    }
  },
  {
    id: "si5",
    competency: "strategicImplementation",
    type: "scenario",
    scenario: {
      en: "Your successful pilot project is ready to scale organization-wide. However, different departments have varying levels of readiness and some are resistant to adoption.",
      ar: "مشروعك التجريبي الناجح جاهز للتوسع على مستوى المؤسسة. ومع ذلك، الأقسام المختلفة لديها مستويات جاهزية متفاوتة وبعضها مقاوم للتبني."
    },
    question: {
      en: "How should you approach the scale-up strategy?",
      ar: "كيف يجب أن تتعامل مع استراتيجية التوسع؟"
    },
    options: {
      en: [
        { text: "Roll out to all departments simultaneously for fairness", score: 2, feedback: "One-size-fits-all ignores readiness differences" },
        { text: "Prioritize willing departments first to build success stories, create department-specific implementation plans, assign champions in each area, and use early successes to persuade resistant units", score: 5, feedback: "Excellent! Phased rollout with champions creates sustainable adoption" },
        { text: "Focus only on resistant departments to convert them first", score: 2, feedback: "This delays momentum and may demotivate willing adopters" },
        { text: "Make adoption mandatory with executive directive", score: 2, feedback: "Forced adoption without support creates superficial compliance" }
      ],
      ar: [
        { text: "الطرح لجميع الأقسام في وقت واحد للعدالة", score: 2, feedback: "النهج الموحد يتجاهل اختلافات الجاهزية" },
        { text: "إعطاء الأولوية للأقسام الراغبة أولاً لبناء قصص نجاح، إنشاء خطط تنفيذ خاصة بكل قسم، تعيين أبطال في كل مجال، واستخدام النجاحات المبكرة لإقناع الوحدات المقاومة", score: 5, feedback: "ممتاز! الطرح المرحلي مع الأبطال يخلق تبنياً مستداماً" },
        { text: "التركيز فقط على الأقسام المقاومة لتحويلها أولاً", score: 2, feedback: "هذا يؤخر الزخم وقد يثبط المتبنين الراغبين" },
        { text: "جعل التبني إلزامياً بتوجيه تنفيذي", score: 2, feedback: "التبني القسري بدون دعم يخلق امتثالاً سطحياً" }
      ]
    }
  }
];

export default kafaatQuestionBank;
