// Comprehensive Report Recommendations Engine
// Provides accurate, assessment-aligned recommendations based on competency scores

// Kafaat Assessment Competency Definitions and Recommendations
export const kafaatCompetencyData = {
  leadershipFundamentals: {
    en: {
      name: "Leadership Fundamentals",
      description: "Core leadership identity, transformational leadership, and situational leadership skills",
      highPerformance: {
        insight: "You demonstrate exceptional leadership fundamentals with a strong grasp of transformational and situational leadership principles.",
        recommendation: "Continue modeling excellence. Consider mentoring emerging leaders and sharing your adaptive leadership approach with peers."
      },
      mediumPerformance: {
        insight: "You have a solid foundation in leadership fundamentals with room to deepen situational adaptability.",
        recommendation: "Focus on practicing different leadership styles (directing, coaching, supporting, delegating) based on team readiness levels."
      },
      lowPerformance: {
        insight: "Building stronger leadership fundamentals will enhance your effectiveness as a leader.",
        recommendation: "Study the Hersey-Blanchard Situational Leadership model. Practice identifying team members' readiness levels and adapting your approach accordingly."
      }
    },
    ar: {
      name: "أساسيات القيادة الحديثة",
      description: "الهوية القيادية الأساسية، القيادة التحويلية، والقيادة الموقفية",
      highPerformance: {
        insight: "تُظهر أساسيات قيادية استثنائية مع فهم قوي لمبادئ القيادة التحويلية والموقفية.",
        recommendation: "استمر في تقديم نموذج للتميز. فكر في توجيه القادة الناشئين ومشاركة نهجك القيادي التكيفي مع الزملاء."
      },
      mediumPerformance: {
        insight: "لديك أساس متين في أساسيات القيادة مع مجال لتعميق القدرة على التكيف الموقفي.",
        recommendation: "ركز على ممارسة أساليب القيادة المختلفة (التوجيه، التدريب، الدعم، التفويض) بناءً على مستويات جاهزية الفريق."
      },
      lowPerformance: {
        insight: "بناء أساسيات قيادية أقوى سيعزز فعاليتك كقائد.",
        recommendation: "ادرس نموذج هيرسي-بلانشارد للقيادة الموقفية. تدرب على تحديد مستويات جاهزية أعضاء الفريق وتكييف نهجك وفقاً لذلك."
      }
    },
    resources: [
      { en: "The Leadership Challenge by Kouzes & Posner", ar: "تحدي القيادة لكوزيس وبوسنر" },
      { en: "Situational Leadership II Training", ar: "تدريب القيادة الموقفية II" },
      { en: "Harvard Business Review - Leadership Articles", ar: "هارفارد بزنس ريفيو - مقالات القيادة" }
    ]
  },
  changeManagement: {
    en: {
      name: "Change Management",
      description: "Leading organizational transformation using Kotter's 8-step model and managing resistance",
      highPerformance: {
        insight: "You excel at leading change initiatives and effectively managing organizational transformation.",
        recommendation: "Lead larger transformation initiatives. Share your change management expertise by facilitating workshops for other teams."
      },
      mediumPerformance: {
        insight: "You demonstrate good change management skills with opportunity to strengthen stakeholder engagement.",
        recommendation: "Deepen your understanding of Kotter's 8-Step model. Practice creating urgency and building guiding coalitions for change initiatives."
      },
      lowPerformance: {
        insight: "Strengthening change management capabilities will help you navigate organizational transitions more effectively.",
        recommendation: "Study Kotter's 8-Step Change Model thoroughly. Start with small changes to practice creating urgency and addressing resistance constructively."
      }
    },
    ar: {
      name: "قيادة التغيير والتحول المؤسسي",
      description: "قيادة التحول المؤسسي باستخدام نموذج كوتر ذو الثماني خطوات وإدارة المقاومة",
      highPerformance: {
        insight: "تتفوق في قيادة مبادرات التغيير وإدارة التحول المؤسسي بفاعلية.",
        recommendation: "قد مبادرات تحول أكبر. شارك خبرتك في إدارة التغيير من خلال تسهيل ورش عمل للفرق الأخرى."
      },
      mediumPerformance: {
        insight: "تُظهر مهارات جيدة في إدارة التغيير مع فرصة لتعزيز إشراك أصحاب المصلحة.",
        recommendation: "عمّق فهمك لنموذج كوتر ذو الخطوات الثماني. تدرب على خلق الاستعجال وبناء التحالفات الموجهة لمبادرات التغيير."
      },
      lowPerformance: {
        insight: "تعزيز قدرات إدارة التغيير سيساعدك على التنقل في التحولات المؤسسية بفاعلية أكبر.",
        recommendation: "ادرس نموذج كوتر للتغيير بشكل شامل. ابدأ بتغييرات صغيرة للتدرب على خلق الاستعجال ومعالجة المقاومة بشكل بناء."
      }
    },
    resources: [
      { en: "Leading Change by John Kotter", ar: "قيادة التغيير لجون كوتر" },
      { en: "ADKAR Change Management Model", ar: "نموذج ADKAR لإدارة التغيير" },
      { en: "Switch: How to Change Things When Change Is Hard", ar: "التحول: كيف تغير الأشياء عندما يكون التغيير صعباً" }
    ]
  },
  performanceManagement: {
    en: {
      name: "Effective Supervision & Performance",
      description: "SMART goal setting, performance feedback using SBI model, and KPI management",
      highPerformance: {
        insight: "You demonstrate excellent performance management skills with strong goal-setting and feedback capabilities.",
        recommendation: "Mentor others in performance management best practices. Consider implementing advanced performance analytics and OKR frameworks."
      },
      mediumPerformance: {
        insight: "Your performance management skills are developing well with room to enhance feedback delivery.",
        recommendation: "Practice the SBI (Situation-Behavior-Impact) feedback model regularly. Focus on making goals more specific, measurable, and time-bound."
      },
      lowPerformance: {
        insight: "Developing stronger performance management skills will significantly improve team results.",
        recommendation: "Master SMART goal setting. Practice delivering feedback using the SBI model in low-stakes situations before applying to performance reviews."
      }
    },
    ar: {
      name: "الإشراف الفعال وإدارة الأداء",
      description: "وضع أهداف SMART، التغذية الراجعة باستخدام نموذج SBI، وإدارة مؤشرات الأداء",
      highPerformance: {
        insight: "تُظهر مهارات ممتازة في إدارة الأداء مع قدرات قوية في وضع الأهداف والتغذية الراجعة.",
        recommendation: "وجّه الآخرين في أفضل ممارسات إدارة الأداء. فكر في تطبيق تحليلات الأداء المتقدمة وإطارات OKR."
      },
      mediumPerformance: {
        insight: "مهارات إدارة الأداء لديك تتطور بشكل جيد مع مجال لتعزيز تقديم التغذية الراجعة.",
        recommendation: "تدرب على نموذج SBI (الموقف-السلوك-الأثر) للتغذية الراجعة بانتظام. ركز على جعل الأهداف أكثر تحديداً وقابلية للقياس ومحددة زمنياً."
      },
      lowPerformance: {
        insight: "تطوير مهارات أقوى في إدارة الأداء سيحسن نتائج الفريق بشكل كبير.",
        recommendation: "أتقن وضع أهداف SMART. تدرب على تقديم التغذية الراجعة باستخدام نموذج SBI في مواقف منخفضة المخاطر قبل تطبيقها في مراجعات الأداء."
      }
    },
    resources: [
      { en: "Measure What Matters by John Doerr", ar: "قياس ما يهم لجون دور" },
      { en: "Thanks for the Feedback by Stone & Heen", ar: "شكراً على التغذية الراجعة لستون وهين" },
      { en: "The One Minute Manager by Blanchard", ar: "مدير الدقيقة الواحدة لبلانشارد" }
    ]
  },
  teamBuilding: {
    en: {
      name: "Building High-Performance Teams",
      description: "Team development stages (Tuckman), Belbin roles, trust building, and conflict management",
      highPerformance: {
        insight: "You excel at building cohesive, high-performing teams with strong trust foundations.",
        recommendation: "Focus on developing team leaders within your team. Apply advanced team dynamics concepts like psychological safety and collective intelligence."
      },
      mediumPerformance: {
        insight: "You build effective teams with opportunity to strengthen conflict resolution and role optimization.",
        recommendation: "Study Belbin team roles to optimize team composition. Practice navigating the Storming phase of team development more effectively."
      },
      lowPerformance: {
        insight: "Strengthening team building skills will enhance collaboration and team performance.",
        recommendation: "Learn Tuckman's team development stages (Forming, Storming, Norming, Performing). Focus on building trust through consistent follow-through and open communication."
      }
    },
    ar: {
      name: "بناء فرق العمل عالية الأداء",
      description: "مراحل تطور الفريق (Tuckman)، أدوار Belbin، بناء الثقة، وإدارة النزاعات",
      highPerformance: {
        insight: "تتفوق في بناء فرق متماسكة وعالية الأداء مع أسس ثقة قوية.",
        recommendation: "ركز على تطوير قادة الفريق داخل فريقك. طبق مفاهيم ديناميكيات الفريق المتقدمة مثل الأمان النفسي والذكاء الجماعي."
      },
      mediumPerformance: {
        insight: "تبني فرقاً فعالة مع فرصة لتعزيز حل النزاعات وتحسين الأدوار.",
        recommendation: "ادرس أدوار Belbin للفريق لتحسين تكوين الفريق. تدرب على التنقل في مرحلة العصف من تطور الفريق بفاعلية أكبر."
      },
      lowPerformance: {
        insight: "تعزيز مهارات بناء الفريق سيحسن التعاون وأداء الفريق.",
        recommendation: "تعلم مراحل تطور الفريق لـ Tuckman (التشكيل، العصف، التوافق، الأداء). ركز على بناء الثقة من خلال المتابعة المستمرة والتواصل المفتوح."
      }
    },
    resources: [
      { en: "The Five Dysfunctions of a Team by Lencioni", ar: "الخلل الخمسة للفريق للينسيوني" },
      { en: "Team of Teams by General McChrystal", ar: "فريق الفرق للجنرال ماكريستال" },
      { en: "Belbin Team Role Assessment", ar: "تقييم أدوار الفريق لـ Belbin" }
    ]
  },
  communication: {
    en: {
      name: "Advanced Leadership Communication",
      description: "Non-verbal communication, persuasion techniques, meeting management, and presentations",
      highPerformance: {
        insight: "Your communication skills are exceptional, effectively conveying complex ideas and influencing stakeholders.",
        recommendation: "Coach others in executive communication. Consider developing thought leadership content and representing the organization externally."
      },
      mediumPerformance: {
        insight: "You communicate effectively with room to enhance persuasion and non-verbal communication skills.",
        recommendation: "Study Cialdini's principles of persuasion. Practice reading and responding to non-verbal cues in meetings. Record and review your presentations."
      },
      lowPerformance: {
        insight: "Strengthening communication skills will significantly enhance your leadership effectiveness.",
        recommendation: "Focus on active listening first - summarize what others say before responding. Practice structured communication frameworks like the Pyramid Principle."
      }
    },
    ar: {
      name: "مهارات التواصل القيادي المتقدم",
      description: "التواصل غير اللفظي، تقنيات الإقناع، إدارة الاجتماعات، والعروض التقديمية",
      highPerformance: {
        insight: "مهارات التواصل لديك استثنائية، تنقل الأفكار المعقدة بفاعلية وتؤثر في أصحاب المصلحة.",
        recommendation: "درّب الآخرين على التواصل التنفيذي. فكر في تطوير محتوى قيادة الفكر وتمثيل المنظمة خارجياً."
      },
      mediumPerformance: {
        insight: "تتواصل بفاعلية مع مجال لتعزيز مهارات الإقناع والتواصل غير اللفظي.",
        recommendation: "ادرس مبادئ تشالديني للإقناع. تدرب على قراءة والاستجابة للإشارات غير اللفظية في الاجتماعات. سجل وراجع عروضك التقديمية."
      },
      lowPerformance: {
        insight: "تعزيز مهارات التواصل سيحسن فعاليتك القيادية بشكل كبير.",
        recommendation: "ركز على الاستماع الفعال أولاً - لخص ما يقوله الآخرون قبل الرد. تدرب على أطر التواصل المنظم مثل مبدأ الهرم."
      }
    },
    resources: [
      { en: "Influence by Robert Cialdini", ar: "التأثير لروبرت تشالديني" },
      { en: "Crucial Conversations by Patterson et al.", ar: "المحادثات الحاسمة لباترسون وآخرين" },
      { en: "Talk Like TED by Carmine Gallo", ar: "تحدث مثل TED لكارمين جالو" }
    ]
  },
  problemSolving: {
    en: {
      name: "Problem Solving & Decision Making",
      description: "Critical thinking, root cause analysis (5 Whys, Fishbone), and decision-making under pressure",
      highPerformance: {
        insight: "You demonstrate excellent analytical and decision-making capabilities under pressure.",
        recommendation: "Lead complex cross-functional problem-solving initiatives. Train others in root cause analysis and structured decision-making frameworks."
      },
      mediumPerformance: {
        insight: "Your problem-solving skills are solid with opportunity to strengthen rapid decision-making.",
        recommendation: "Practice the OODA Loop (Observe-Orient-Decide-Act) for faster decisions. Apply 5 Whys analysis to everyday problems to build analytical habits."
      },
      lowPerformance: {
        insight: "Developing stronger problem-solving capabilities will enhance your effectiveness in challenging situations.",
        recommendation: "Start with the 5 Whys technique for simple problems. Learn the Fishbone (Ishikawa) diagram for categorizing root causes systematically."
      }
    },
    ar: {
      name: "حل المشكلات واتخاذ القرارات الاستراتيجية",
      description: "التفكير النقدي، تحليل الأسباب الجذرية (5 Whys, Fishbone)، واتخاذ القرارات تحت الضغط",
      highPerformance: {
        insight: "تُظهر قدرات تحليلية واتخاذ قرارات ممتازة تحت الضغط.",
        recommendation: "قد مبادرات حل مشكلات معقدة عبر الوظائف. درّب الآخرين على تحليل الأسباب الجذرية وأطر اتخاذ القرار المنظمة."
      },
      mediumPerformance: {
        insight: "مهارات حل المشكلات لديك متينة مع فرصة لتعزيز اتخاذ القرارات السريعة.",
        recommendation: "تدرب على حلقة OODA (المراقبة-التوجيه-القرار-الفعل) لقرارات أسرع. طبق تحليل الخمسة لماذا على المشاكل اليومية لبناء عادات تحليلية."
      },
      lowPerformance: {
        insight: "تطوير قدرات أقوى في حل المشكلات سيعزز فعاليتك في المواقف الصعبة.",
        recommendation: "ابدأ بتقنية الخمسة لماذا للمشاكل البسيطة. تعلم مخطط عظم السمكة (إيشيكاوا) لتصنيف الأسباب الجذرية بشكل منهجي."
      }
    },
    resources: [
      { en: "Thinking, Fast and Slow by Daniel Kahneman", ar: "التفكير السريع والبطيء لدانيال كانيمان" },
      { en: "The Decision Book by Krogerus & Tschäppeler", ar: "كتاب القرارات لكروجيروس وتشابلر" },
      { en: "Six Thinking Hats by Edward de Bono", ar: "قبعات التفكير الست لإدوارد دي بونو" }
    ]
  },
  emotionalIntelligence: {
    en: {
      name: "Emotional Intelligence",
      description: "Self-awareness, emotion management, empathy, and relationship building",
      highPerformance: {
        insight: "You demonstrate exceptional emotional intelligence, effectively managing your emotions and connecting with others.",
        recommendation: "Use your EQ to navigate complex stakeholder situations. Coach others in developing emotional intelligence and creating psychologically safe environments."
      },
      mediumPerformance: {
        insight: "Your emotional intelligence is developing well with opportunity to deepen empathy and self-regulation.",
        recommendation: "Practice the pause before responding technique. Keep an emotion journal to increase self-awareness of triggers and patterns."
      },
      lowPerformance: {
        insight: "Strengthening emotional intelligence will significantly enhance your relationships and leadership impact.",
        recommendation: "Start with self-awareness - notice your emotions throughout the day without judgment. Practice active empathy by asking questions and reflecting back what you hear."
      }
    },
    ar: {
      name: "الذكاء العاطفي والقيادة المؤثرة",
      description: "الوعي الذاتي، إدارة الانفعالات، التعاطف، وبناء العلاقات",
      highPerformance: {
        insight: "تُظهر ذكاءً عاطفياً استثنائياً، تدير انفعالاتك بفاعلية وتتواصل مع الآخرين.",
        recommendation: "استخدم ذكاءك العاطفي للتنقل في مواقف أصحاب المصلحة المعقدة. درّب الآخرين على تطوير الذكاء العاطفي وخلق بيئات آمنة نفسياً."
      },
      mediumPerformance: {
        insight: "ذكاؤك العاطفي يتطور بشكل جيد مع فرصة لتعميق التعاطف وإدارة الذات.",
        recommendation: "تدرب على تقنية التوقف قبل الاستجابة. احتفظ بمفكرة للمشاعر لزيادة الوعي الذاتي بالمحفزات والأنماط."
      },
      lowPerformance: {
        insight: "تعزيز الذكاء العاطفي سيحسن علاقاتك وتأثيرك القيادي بشكل كبير.",
        recommendation: "ابدأ بالوعي الذاتي - لاحظ مشاعرك طوال اليوم دون حكم. تدرب على التعاطف الفعال بطرح الأسئلة وعكس ما تسمعه."
      }
    },
    resources: [
      { en: "Emotional Intelligence 2.0 by Bradberry & Greaves", ar: "الذكاء العاطفي 2.0 لبرادبيري وجريفز" },
      { en: "Primal Leadership by Goleman", ar: "القيادة الأولية لجولمان" },
      { en: "Nonviolent Communication by Marshall Rosenberg", ar: "التواصل اللاعنيف لمارشال روزنبرج" }
    ]
  },
  strategicImplementation: {
    en: {
      name: "Strategic Implementation",
      description: "Project leadership, stakeholder management, and driving organizational impact",
      highPerformance: {
        insight: "You excel at translating strategy into action and managing complex stakeholder landscapes.",
        recommendation: "Lead enterprise-level strategic initiatives. Mentor others in stakeholder management and strategic project execution."
      },
      mediumPerformance: {
        insight: "Your strategic implementation skills are developing with room to enhance stakeholder alignment.",
        recommendation: "Practice DMAIC methodology for improvement projects. Create stakeholder maps and tailored engagement strategies for your initiatives."
      },
      lowPerformance: {
        insight: "Strengthening strategic implementation skills will help you drive greater organizational impact.",
        recommendation: "Start with smaller improvement projects using a structured approach. Learn basic stakeholder analysis and create simple engagement plans."
      }
    },
    ar: {
      name: "المشروع القيادي والتطبيق العملي",
      description: "قيادة المشاريع، إدارة أصحاب المصلحة، وتحقيق الأثر المؤسسي",
      highPerformance: {
        insight: "تتفوق في ترجمة الاستراتيجية إلى عمل وإدارة مشاهد أصحاب المصلحة المعقدة.",
        recommendation: "قد مبادرات استراتيجية على مستوى المؤسسة. وجّه الآخرين في إدارة أصحاب المصلحة وتنفيذ المشاريع الاستراتيجية."
      },
      mediumPerformance: {
        insight: "مهارات التنفيذ الاستراتيجي لديك تتطور مع مجال لتعزيز مواءمة أصحاب المصلحة.",
        recommendation: "تدرب على منهجية DMAIC لمشاريع التحسين. أنشئ خرائط لأصحاب المصلحة واستراتيجيات مشاركة مخصصة لمبادراتك."
      },
      lowPerformance: {
        insight: "تعزيز مهارات التنفيذ الاستراتيجي سيساعدك على تحقيق تأثير مؤسسي أكبر.",
        recommendation: "ابدأ بمشاريع تحسين أصغر باستخدام نهج منظم. تعلم تحليل أصحاب المصلحة الأساسي وأنشئ خطط مشاركة بسيطة."
      }
    },
    resources: [
      { en: "Good Strategy Bad Strategy by Rumelt", ar: "استراتيجية جيدة استراتيجية سيئة لروملت" },
      { en: "Stakeholder Theory by Freeman", ar: "نظرية أصحاب المصلحة لفريمان" },
      { en: "The Lean Startup by Eric Ries", ar: "الشركة الناشئة الرشيقة لإريك ريس" }
    ]
  }
};

// 360 Assessment Category Definitions and Recommendations
export const leadership360Data = {
  vision: {
    en: {
      name: "Vision & Strategic Thinking",
      description: "Ability to see the big picture, set direction, and align team with organizational goals",
      highPerformance: {
        insight: "Exceptional visionary leadership - consistently articulates compelling direction and inspires strategic alignment.",
        recommendation: "Share your strategic thinking approach with peers. Consider leading cross-functional strategic planning initiatives."
      },
      mediumPerformance: {
        insight: "Good strategic thinking with opportunity to strengthen vision communication and long-term planning.",
        recommendation: "Practice translating high-level strategy into clear team objectives. Communicate the 'why' behind initiatives more frequently."
      },
      lowPerformance: {
        insight: "Developing strategic vision will enhance your ability to guide and inspire your team.",
        recommendation: "Schedule regular time for strategic reflection. Practice connecting daily tasks to broader organizational goals in team communications."
      }
    },
    ar: {
      name: "الرؤية والتفكير الاستراتيجي",
      description: "القدرة على رؤية الصورة الكبيرة وتحديد الاتجاه ومواءمة الفريق مع أهداف المنظمة",
      highPerformance: {
        insight: "قيادة رؤيوية استثنائية - تصيغ باستمرار اتجاهاً مقنعاً وتلهم المواءمة الاستراتيجية.",
        recommendation: "شارك نهجك في التفكير الاستراتيجي مع الزملاء. فكر في قيادة مبادرات التخطيط الاستراتيجي عبر الوظائف."
      },
      mediumPerformance: {
        insight: "تفكير استراتيجي جيد مع فرصة لتعزيز إيصال الرؤية والتخطيط طويل المدى.",
        recommendation: "تدرب على ترجمة الاستراتيجية عالية المستوى إلى أهداف فريق واضحة. وصّل 'لماذا' وراء المبادرات بشكل أكثر تكراراً."
      },
      lowPerformance: {
        insight: "تطوير الرؤية الاستراتيجية سيعزز قدرتك على توجيه وإلهام فريقك.",
        recommendation: "خصص وقتاً منتظماً للتأمل الاستراتيجي. تدرب على ربط المهام اليومية بالأهداف المؤسسية الأوسع في اتصالات الفريق."
      }
    }
  },
  communication: {
    en: {
      name: "Communication",
      description: "Clarity, listening, openness, and effectiveness in conveying information",
      highPerformance: {
        insight: "Outstanding communicator who listens actively, speaks clearly, and creates open dialogue.",
        recommendation: "Model communication excellence for others. Consider facilitating organization-wide communication training."
      },
      mediumPerformance: {
        insight: "Effective communicator with opportunity to enhance listening and difficult conversation skills.",
        recommendation: "Practice reflective listening - summarize what you hear before responding. Seek feedback on your communication style regularly."
      },
      lowPerformance: {
        insight: "Strengthening communication will significantly improve team engagement and alignment.",
        recommendation: "Focus on asking more questions and listening without interrupting. Keep messages simple and check for understanding."
      }
    },
    ar: {
      name: "التواصل",
      description: "الوضوح والاستماع والانفتاح والفعالية في نقل المعلومات",
      highPerformance: {
        insight: "متواصل متميز يستمع بفاعلية ويتحدث بوضوح ويخلق حواراً مفتوحاً.",
        recommendation: "كن نموذجاً للتميز في التواصل للآخرين. فكر في تسهيل تدريب التواصل على مستوى المنظمة."
      },
      mediumPerformance: {
        insight: "متواصل فعال مع فرصة لتعزيز مهارات الاستماع والمحادثات الصعبة.",
        recommendation: "تدرب على الاستماع التأملي - لخص ما تسمعه قبل الرد. اطلب ملاحظات على أسلوب تواصلك بانتظام."
      },
      lowPerformance: {
        insight: "تعزيز التواصل سيحسن بشكل كبير انخراط الفريق ومواءمته.",
        recommendation: "ركز على طرح المزيد من الأسئلة والاستماع دون مقاطعة. حافظ على بساطة الرسائل وتحقق من الفهم."
      }
    }
  },
  teamLeadership: {
    en: {
      name: "Team Leadership",
      description: "Building teams, delegation, trust, conflict management, and motivation",
      highPerformance: {
        insight: "Exceptional team leader who builds high-trust, high-performing teams.",
        recommendation: "Develop team leaders within your team. Share your team-building approach through internal leadership programs."
      },
      mediumPerformance: {
        insight: "Effective team leader with opportunity to strengthen delegation and conflict resolution.",
        recommendation: "Practice delegating with clear expectations and appropriate follow-up. Address conflicts early before they escalate."
      },
      lowPerformance: {
        insight: "Developing team leadership skills will enhance team cohesion and performance.",
        recommendation: "Focus on building one-on-one relationships first. Start with small delegation tasks and provide clear guidance."
      }
    },
    ar: {
      name: "قيادة الفريق",
      description: "بناء الفرق والتفويض والثقة وإدارة النزاعات والتحفيز",
      highPerformance: {
        insight: "قائد فريق استثنائي يبني فرقاً عالية الثقة وعالية الأداء.",
        recommendation: "طوّر قادة الفريق داخل فريقك. شارك نهجك في بناء الفريق من خلال برامج القيادة الداخلية."
      },
      mediumPerformance: {
        insight: "قائد فريق فعال مع فرصة لتعزيز التفويض وحل النزاعات.",
        recommendation: "تدرب على التفويض مع توقعات واضحة ومتابعة مناسبة. عالج النزاعات مبكراً قبل تصعيدها."
      },
      lowPerformance: {
        insight: "تطوير مهارات قيادة الفريق سيعزز تماسك الفريق وأدائه.",
        recommendation: "ركز على بناء علاقات فردية أولاً. ابدأ بمهام تفويض صغيرة وقدم توجيهاً واضحاً."
      }
    }
  },
  decisionMaking: {
    en: {
      name: "Decision Making",
      description: "Analytical thinking, timeliness, inclusion, and accountability in decisions",
      highPerformance: {
        insight: "Excellent decision-maker who balances analysis, speed, and stakeholder input effectively.",
        recommendation: "Lead complex organizational decisions. Mentor others in structured decision-making approaches."
      },
      mediumPerformance: {
        insight: "Good decision-making with opportunity to improve speed and stakeholder involvement.",
        recommendation: "Set decision deadlines to avoid analysis paralysis. Create a simple framework for which decisions need input from whom."
      },
      lowPerformance: {
        insight: "Strengthening decision-making will increase your confidence and team effectiveness.",
        recommendation: "Start with reversible decisions to build confidence. Use pros/cons lists and seek input from trusted advisors."
      }
    },
    ar: {
      name: "اتخاذ القرارات",
      description: "التفكير التحليلي والتوقيت والشمول والمساءلة في القرارات",
      highPerformance: {
        insight: "صانع قرار ممتاز يوازن بين التحليل والسرعة ومدخلات أصحاب المصلحة بفاعلية.",
        recommendation: "قد القرارات المؤسسية المعقدة. وجّه الآخرين في نهج اتخاذ القرار المنظم."
      },
      mediumPerformance: {
        insight: "اتخاذ قرارات جيد مع فرصة لتحسين السرعة وإشراك أصحاب المصلحة.",
        recommendation: "حدد مواعيد نهائية للقرارات لتجنب شلل التحليل. أنشئ إطاراً بسيطاً لأي القرارات تحتاج مدخلات من من."
      },
      lowPerformance: {
        insight: "تعزيز اتخاذ القرارات سيزيد ثقتك وفعالية فريقك.",
        recommendation: "ابدأ بالقرارات القابلة للعكس لبناء الثقة. استخدم قوائم الإيجابيات/السلبيات واطلب المدخلات من المستشارين الموثوقين."
      }
    }
  },
  emotionalIntelligence: {
    en: {
      name: "Emotional Intelligence",
      description: "Self-awareness, empathy, emotion management, and relationship building",
      highPerformance: {
        insight: "Exceptional EQ - creates positive emotional climate and handles difficult situations with grace.",
        recommendation: "Coach others in EQ development. Lead initiatives to improve organizational culture and psychological safety."
      },
      mediumPerformance: {
        insight: "Good emotional intelligence with opportunity to deepen empathy and stress management.",
        recommendation: "Practice naming your emotions to increase awareness. Ask more questions about how others are feeling."
      },
      lowPerformance: {
        insight: "Developing EQ will significantly improve your relationships and leadership impact.",
        recommendation: "Start with self-awareness - notice emotions without judgment. Practice the pause before reacting in stressful situations."
      }
    },
    ar: {
      name: "الذكاء العاطفي",
      description: "الوعي الذاتي والتعاطف وإدارة المشاعر وبناء العلاقات",
      highPerformance: {
        insight: "ذكاء عاطفي استثنائي - يخلق مناخاً عاطفياً إيجابياً ويتعامل مع المواقف الصعبة برشاقة.",
        recommendation: "درّب الآخرين على تطوير الذكاء العاطفي. قد مبادرات لتحسين الثقافة المؤسسية والأمان النفسي."
      },
      mediumPerformance: {
        insight: "ذكاء عاطفي جيد مع فرصة لتعميق التعاطف وإدارة الضغط.",
        recommendation: "تدرب على تسمية مشاعرك لزيادة الوعي. اطرح المزيد من الأسئلة حول شعور الآخرين."
      },
      lowPerformance: {
        insight: "تطوير الذكاء العاطفي سيحسن علاقاتك وتأثيرك القيادي بشكل كبير.",
        recommendation: "ابدأ بالوعي الذاتي - لاحظ المشاعر دون حكم. تدرب على التوقف قبل الرد في المواقف المجهدة."
      }
    }
  },
  changeManagement: {
    en: {
      name: "Change Management",
      description: "Leading change, managing resistance, and maintaining stability during transitions",
      highPerformance: {
        insight: "Exceptional change leader who guides teams through transitions smoothly.",
        recommendation: "Lead major organizational transformations. Share change management expertise across the organization."
      },
      mediumPerformance: {
        insight: "Good change management with opportunity to better address resistance and maintain momentum.",
        recommendation: "Communicate the reasons for change more proactively. Celebrate small wins during change initiatives."
      },
      lowPerformance: {
        insight: "Developing change management skills will help you navigate transitions more effectively.",
        recommendation: "Start by understanding why people resist change. Communicate early and often, focusing on benefits and support."
      }
    },
    ar: {
      name: "إدارة التغيير",
      description: "قيادة التغيير وإدارة المقاومة والحفاظ على الاستقرار خلال التحولات",
      highPerformance: {
        insight: "قائد تغيير استثنائي يوجه الفرق خلال التحولات بسلاسة.",
        recommendation: "قد تحولات مؤسسية كبرى. شارك خبرة إدارة التغيير عبر المنظمة."
      },
      mediumPerformance: {
        insight: "إدارة تغيير جيدة مع فرصة لمعالجة المقاومة بشكل أفضل والحفاظ على الزخم.",
        recommendation: "وصّل أسباب التغيير بشكل أكثر استباقية. احتفل بالانتصارات الصغيرة خلال مبادرات التغيير."
      },
      lowPerformance: {
        insight: "تطوير مهارات إدارة التغيير سيساعدك على التنقل في التحولات بفاعلية أكبر.",
        recommendation: "ابدأ بفهم لماذا يقاوم الناس التغيير. تواصل مبكراً وبشكل متكرر، مع التركيز على الفوائد والدعم."
      }
    }
  },
  accountability: {
    en: {
      name: "Accountability & Results",
      description: "Setting standards, follow-through, feedback, and delivering results",
      highPerformance: {
        insight: "Exceptional at setting standards and driving consistent high-quality results.",
        recommendation: "Model accountability culture. Help establish performance standards across the organization."
      },
      mediumPerformance: {
        insight: "Good accountability with opportunity to strengthen follow-through and feedback consistency.",
        recommendation: "Create clear tracking systems for commitments. Provide feedback more frequently, not just during reviews."
      },
      lowPerformance: {
        insight: "Strengthening accountability will improve team performance and trust.",
        recommendation: "Start by keeping your own commitments consistently. Set clear, written expectations for deliverables."
      }
    },
    ar: {
      name: "المساءلة والنتائج",
      description: "وضع المعايير والمتابعة والتغذية الراجعة وتحقيق النتائج",
      highPerformance: {
        insight: "استثنائي في وضع المعايير وتحقيق نتائج عالية الجودة باستمرار.",
        recommendation: "كن نموذجاً لثقافة المساءلة. ساعد في وضع معايير الأداء عبر المنظمة."
      },
      mediumPerformance: {
        insight: "مساءلة جيدة مع فرصة لتعزيز المتابعة واتساق التغذية الراجعة.",
        recommendation: "أنشئ أنظمة تتبع واضحة للالتزامات. قدم التغذية الراجعة بشكل أكثر تكراراً، ليس فقط خلال المراجعات."
      },
      lowPerformance: {
        insight: "تعزيز المساءلة سيحسن أداء الفريق والثقة.",
        recommendation: "ابدأ بالحفاظ على التزاماتك باستمرار. ضع توقعات واضحة ومكتوبة للمخرجات."
      }
    }
  },
  development: {
    en: {
      name: "Development & Coaching",
      description: "Supporting growth, mentoring, feedback, and developing future leaders",
      highPerformance: {
        insight: "Outstanding developer of talent who actively invests in others' growth.",
        recommendation: "Formalize your coaching approach. Lead talent development initiatives across the organization."
      },
      mediumPerformance: {
        insight: "Good development focus with opportunity to provide more consistent coaching.",
        recommendation: "Schedule regular development conversations. Create individual development plans with your team members."
      },
      lowPerformance: {
        insight: "Investing in others' development will multiply your impact as a leader.",
        recommendation: "Start with regular one-on-ones focused on growth. Ask team members about their career aspirations."
      }
    },
    ar: {
      name: "التطوير والتوجيه",
      description: "دعم النمو والإرشاد والتغذية الراجعة وتطوير القادة المستقبليين",
      highPerformance: {
        insight: "مطوّر متميز للمواهب يستثمر بفاعلية في نمو الآخرين.",
        recommendation: "رسّم نهجك في التوجيه. قد مبادرات تطوير المواهب عبر المنظمة."
      },
      mediumPerformance: {
        insight: "تركيز جيد على التطوير مع فرصة لتقديم توجيه أكثر اتساقاً.",
        recommendation: "جدول محادثات تطوير منتظمة. أنشئ خطط تطوير فردية مع أعضاء فريقك."
      },
      lowPerformance: {
        insight: "الاستثمار في تطوير الآخرين سيضاعف تأثيرك كقائد.",
        recommendation: "ابدأ بلقاءات فردية منتظمة تركز على النمو. اسأل أعضاء الفريق عن تطلعاتهم المهنية."
      }
    }
  },
  integrity: {
    en: {
      name: "Integrity & Ethics",
      description: "Honesty, fairness, consistency, and ethical behavior",
      highPerformance: {
        insight: "Exemplary integrity that builds deep trust and serves as a role model.",
        recommendation: "Champion ethics and integrity initiatives. Mentor others in navigating ethical dilemmas."
      },
      mediumPerformance: {
        insight: "Strong integrity with opportunity to be more transparent and consistent.",
        recommendation: "Communicate your reasoning more openly. Ensure actions align with stated values consistently."
      },
      lowPerformance: {
        insight: "Strengthening integrity will build the trust foundation for effective leadership.",
        recommendation: "Focus on keeping all commitments, even small ones. Admit mistakes openly and take corrective action."
      }
    },
    ar: {
      name: "النزاهة والأخلاق",
      description: "الصدق والإنصاف والاتساق والسلوك الأخلاقي",
      highPerformance: {
        insight: "نزاهة مثالية تبني ثقة عميقة وتكون قدوة.",
        recommendation: "كن داعماً لمبادرات الأخلاق والنزاهة. وجّه الآخرين في التنقل في المعضلات الأخلاقية."
      },
      mediumPerformance: {
        insight: "نزاهة قوية مع فرصة لتكون أكثر شفافية واتساقاً.",
        recommendation: "وصّل أسبابك بشكل أكثر انفتاحاً. تأكد من توافق الأفعال مع القيم المعلنة باستمرار."
      },
      lowPerformance: {
        insight: "تعزيز النزاهة سيبني أساس الثقة للقيادة الفعالة.",
        recommendation: "ركز على الحفاظ على جميع الالتزامات، حتى الصغيرة منها. اعترف بالأخطاء صراحة واتخذ إجراءات تصحيحية."
      }
    }
  },
  innovation: {
    en: {
      name: "Innovation & Adaptability",
      description: "Creativity, openness to change, risk-taking, and learning from failure",
      highPerformance: {
        insight: "Outstanding innovator who creates safe space for experimentation and drives continuous improvement.",
        recommendation: "Lead innovation initiatives. Create structures for capturing and implementing new ideas across teams."
      },
      mediumPerformance: {
        insight: "Good adaptability with opportunity to encourage more experimentation.",
        recommendation: "Create space for experimentation by celebrating learning from failures. Ask 'what if' questions more often."
      },
      lowPerformance: {
        insight: "Developing innovation mindset will keep your team relevant and engaged.",
        recommendation: "Start by being more open to others' ideas. Try small experiments before major changes."
      }
    },
    ar: {
      name: "الابتكار والتكيف",
      description: "الإبداع والانفتاح على التغيير والمخاطرة والتعلم من الفشل",
      highPerformance: {
        insight: "مبتكر متميز يخلق مساحة آمنة للتجريب ويدفع التحسين المستمر.",
        recommendation: "قد مبادرات الابتكار. أنشئ هياكل لالتقاط وتنفيذ الأفكار الجديدة عبر الفرق."
      },
      mediumPerformance: {
        insight: "قدرة تكيف جيدة مع فرصة لتشجيع المزيد من التجريب.",
        recommendation: "أنشئ مساحة للتجريب من خلال الاحتفال بالتعلم من الإخفاقات. اطرح أسئلة 'ماذا لو' أكثر."
      },
      lowPerformance: {
        insight: "تطوير عقلية الابتكار سيبقي فريقك مواكباً ومنخرطاً.",
        recommendation: "ابدأ بكونك أكثر انفتاحاً لأفكار الآخرين. جرب تجارب صغيرة قبل التغييرات الكبرى."
      }
    }
  }
};

// Function to get performance tier
export const getPerformanceTier = (score) => {
  if (score >= 80) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

// Function to get competency recommendation
export const getCompetencyRecommendation = (competencyKey, score, language, assessmentType = 'kafaat') => {
  const tier = getPerformanceTier(score);
  const data = assessmentType === 'kafaat' ? kafaatCompetencyData : leadership360Data;
  const competency = data[competencyKey];
  
  if (!competency) return null;
  
  const langData = competency[language] || competency.en;
  const performanceKey = tier === 'high' ? 'highPerformance' : tier === 'medium' ? 'mediumPerformance' : 'lowPerformance';
  
  return {
    name: langData.name,
    description: langData.description,
    insight: langData[performanceKey]?.insight,
    recommendation: langData[performanceKey]?.recommendation,
    resources: competency.resources || []
  };
};

// Function to generate development plan
export const generateDevelopmentPlan = (developmentAreas, language) => {
  const phases = [
    {
      en: {
        phase: "Days 1-30: Foundation & Awareness",
        focus: "Self-reflection and skill assessment",
        activities: [
          "Complete self-assessment exercises for identified development areas",
          "Seek feedback from trusted colleagues on specific behaviors",
          "Identify a mentor or coach for guidance",
          "Create specific SMART goals for each development area"
        ]
      },
      ar: {
        phase: "الأيام 1-30: الأساس والوعي",
        focus: "التأمل الذاتي وتقييم المهارات",
        activities: [
          "إكمال تمارين التقييم الذاتي لمجالات التطوير المحددة",
          "طلب الملاحظات من الزملاء الموثوقين حول سلوكيات محددة",
          "تحديد مرشد أو مدرب للتوجيه",
          "إنشاء أهداف SMART محددة لكل مجال تطوير"
        ]
      }
    },
    {
      en: {
        phase: "Days 31-60: Skill Building & Practice",
        focus: "Active learning and application",
        activities: [
          "Attend relevant training programs or workshops",
          "Practice new behaviors in low-risk situations first",
          "Keep a learning journal to track progress and insights",
          "Request ongoing feedback from mentor and colleagues"
        ]
      },
      ar: {
        phase: "الأيام 31-60: بناء المهارات والممارسة",
        focus: "التعلم النشط والتطبيق",
        activities: [
          "حضور البرامج التدريبية أو ورش العمل ذات الصلة",
          "ممارسة السلوكيات الجديدة في مواقف منخفضة المخاطر أولاً",
          "الاحتفاظ بمفكرة تعلم لتتبع التقدم والرؤى",
          "طلب ملاحظات مستمرة من المرشد والزملاء"
        ]
      }
    },
    {
      en: {
        phase: "Days 61-90: Integration & Reinforcement",
        focus: "Embedding changes and measuring progress",
        activities: [
          "Apply skills in increasingly challenging situations",
          "Measure progress against initial goals",
          "Celebrate improvements and acknowledge remaining gaps",
          "Create a long-term development roadmap for continued growth"
        ]
      },
      ar: {
        phase: "الأيام 61-90: التكامل والتعزيز",
        focus: "ترسيخ التغييرات وقياس التقدم",
        activities: [
          "تطبيق المهارات في مواقف متزايدة التحدي",
          "قياس التقدم مقابل الأهداف الأولية",
          "الاحتفال بالتحسينات والاعتراف بالفجوات المتبقية",
          "إنشاء خارطة طريق تطوير طويلة المدى للنمو المستمر"
        ]
      }
    }
  ];
  
  return phases.map(phase => phase[language] || phase.en);
};

export default {
  kafaatCompetencyData,
  leadership360Data,
  getPerformanceTier,
  getCompetencyRecommendation,
  generateDevelopmentPlan
};
