// 360° Leadership Assessment - 75 Questions
// Multi-rater feedback questionnaire for comprehensive leadership evaluation

export const leadership360Categories = {
  vision: {
    en: { name: "Vision & Strategic Thinking", icon: "🎯" },
    ar: { name: "الرؤية والتفكير الاستراتيجي", icon: "🎯" }
  },
  communication: {
    en: { name: "Communication", icon: "💬" },
    ar: { name: "التواصل", icon: "💬" }
  },
  teamLeadership: {
    en: { name: "Team Leadership", icon: "👥" },
    ar: { name: "قيادة الفريق", icon: "👥" }
  },
  decisionMaking: {
    en: { name: "Decision Making", icon: "⚖️" },
    ar: { name: "اتخاذ القرارات", icon: "⚖️" }
  },
  emotionalIntelligence: {
    en: { name: "Emotional Intelligence", icon: "❤️" },
    ar: { name: "الذكاء العاطفي", icon: "❤️" }
  },
  changeManagement: {
    en: { name: "Change Management", icon: "🔄" },
    ar: { name: "إدارة التغيير", icon: "🔄" }
  },
  accountability: {
    en: { name: "Accountability & Results", icon: "📊" },
    ar: { name: "المساءلة والنتائج", icon: "📊" }
  },
  development: {
    en: { name: "Development & Coaching", icon: "🌱" },
    ar: { name: "التطوير والتوجيه", icon: "🌱" }
  },
  integrity: {
    en: { name: "Integrity & Ethics", icon: "⭐" },
    ar: { name: "النزاهة والأخلاق", icon: "⭐" }
  },
  innovation: {
    en: { name: "Innovation & Adaptability", icon: "💡" },
    ar: { name: "الابتكار والتكيف", icon: "💡" }
  }
};

export const ratingScale = [
  { value: 1, en: "Strongly Disagree", ar: "أعارض بشدة" },
  { value: 2, en: "Disagree", ar: "أعارض" },
  { value: 3, en: "Neutral", ar: "محايد" },
  { value: 4, en: "Agree", ar: "أوافق" },
  { value: 5, en: "Strongly Agree", ar: "أوافق بشدة" }
];

export const leadership360Questions = [
  // Vision & Strategic Thinking (8 questions)
  {
    id: "v1",
    category: "vision",
    en: "This leader clearly communicates the organization's vision and goals.",
    ar: "يوصل هذا القائد رؤية المنظمة وأهدافها بوضوح."
  },
  {
    id: "v2",
    category: "vision",
    en: "This leader demonstrates strong strategic thinking capabilities.",
    ar: "يُظهر هذا القائد قدرات تفكير استراتيجي قوية."
  },
  {
    id: "v3",
    category: "vision",
    en: "This leader aligns team objectives with broader organizational priorities.",
    ar: "يربط هذا القائد أهداف الفريق بالأولويات المؤسسية الأوسع."
  },
  {
    id: "v4",
    category: "vision",
    en: "This leader anticipates future challenges and opportunities.",
    ar: "يتوقع هذا القائد التحديات والفرص المستقبلية."
  },
  {
    id: "v5",
    category: "vision",
    en: "This leader creates a sense of purpose and direction for the team.",
    ar: "يخلق هذا القائد شعوراً بالهدف والاتجاه للفريق."
  },
  {
    id: "v6",
    category: "vision",
    en: "This leader effectively translates strategy into actionable plans.",
    ar: "يترجم هذا القائد الاستراتيجية بفاعلية إلى خطط قابلة للتنفيذ."
  },
  {
    id: "v7",
    category: "vision",
    en: "This leader helps team members understand how their work contributes to organizational success.",
    ar: "يساعد هذا القائد أعضاء الفريق على فهم كيف يساهم عملهم في نجاح المنظمة."
  },
  {
    id: "v8",
    category: "vision",
    en: "This leader maintains focus on long-term goals while managing day-to-day operations.",
    ar: "يحافظ هذا القائد على التركيز على الأهداف طويلة المدى أثناء إدارة العمليات اليومية."
  },

  // Communication (8 questions)
  {
    id: "c1",
    category: "communication",
    en: "This leader listens actively and attentively to others.",
    ar: "يستمع هذا القائد بفاعلية واهتمام للآخرين."
  },
  {
    id: "c2",
    category: "communication",
    en: "This leader communicates clearly and concisely.",
    ar: "يتواصل هذا القائد بوضوح وإيجاز."
  },
  {
    id: "c3",
    category: "communication",
    en: "This leader provides timely and relevant information to the team.",
    ar: "يقدم هذا القائد معلومات في الوقت المناسب وذات صلة للفريق."
  },
  {
    id: "c4",
    category: "communication",
    en: "This leader is approachable and open to discussion.",
    ar: "هذا القائد ودود ومنفتح للنقاش."
  },
  {
    id: "c5",
    category: "communication",
    en: "This leader adapts communication style to different audiences.",
    ar: "يكيف هذا القائد أسلوب تواصله مع جماهير مختلفة."
  },
  {
    id: "c6",
    category: "communication",
    en: "This leader effectively presents ideas in meetings.",
    ar: "يقدم هذا القائد الأفكار بفاعلية في الاجتماعات."
  },
  {
    id: "c7",
    category: "communication",
    en: "This leader encourages open dialogue and welcomes different perspectives.",
    ar: "يشجع هذا القائد الحوار المفتوح ويرحب بوجهات النظر المختلفة."
  },
  {
    id: "c8",
    category: "communication",
    en: "This leader delivers difficult messages with sensitivity and clarity.",
    ar: "يوصل هذا القائد الرسائل الصعبة بحساسية ووضوح."
  },

  // Team Leadership (8 questions)
  {
    id: "t1",
    category: "teamLeadership",
    en: "This leader builds cohesive and high-performing teams.",
    ar: "يبني هذا القائد فرقاً متماسكة وعالية الأداء."
  },
  {
    id: "t2",
    category: "teamLeadership",
    en: "This leader effectively delegates tasks and responsibilities.",
    ar: "يفوض هذا القائد المهام والمسؤوليات بفاعلية."
  },
  {
    id: "t3",
    category: "teamLeadership",
    en: "This leader creates an environment of trust and psychological safety.",
    ar: "يخلق هذا القائد بيئة من الثقة والأمان النفسي."
  },
  {
    id: "t4",
    category: "teamLeadership",
    en: "This leader effectively manages conflict within the team.",
    ar: "يدير هذا القائد النزاعات داخل الفريق بفاعلية."
  },
  {
    id: "t5",
    category: "teamLeadership",
    en: "This leader recognizes and leverages the strengths of team members.",
    ar: "يعترف هذا القائد بنقاط قوة أعضاء الفريق ويستثمرها."
  },
  {
    id: "t6",
    category: "teamLeadership",
    en: "This leader promotes collaboration across different teams and departments.",
    ar: "يعزز هذا القائد التعاون عبر الفرق والأقسام المختلفة."
  },
  {
    id: "t7",
    category: "teamLeadership",
    en: "This leader inspires and motivates the team to achieve excellence.",
    ar: "يلهم هذا القائد الفريق ويحفزه لتحقيق التميز."
  },
  {
    id: "t8",
    category: "teamLeadership",
    en: "This leader ensures equitable distribution of work among team members.",
    ar: "يضمن هذا القائد توزيعاً عادلاً للعمل بين أعضاء الفريق."
  },

  // Decision Making (7 questions)
  {
    id: "d1",
    category: "decisionMaking",
    en: "This leader makes well-informed and timely decisions.",
    ar: "يتخذ هذا القائد قرارات مدروسة وفي الوقت المناسب."
  },
  {
    id: "d2",
    category: "decisionMaking",
    en: "This leader considers multiple perspectives before making decisions.",
    ar: "يأخذ هذا القائد وجهات نظر متعددة بالاعتبار قبل اتخاذ القرارات."
  },
  {
    id: "d3",
    category: "decisionMaking",
    en: "This leader takes responsibility for decisions and their outcomes.",
    ar: "يتحمل هذا القائد المسؤولية عن القرارات ونتائجها."
  },
  {
    id: "d4",
    category: "decisionMaking",
    en: "This leader involves others appropriately in the decision-making process.",
    ar: "يشرك هذا القائد الآخرين بشكل مناسب في عملية صنع القرار."
  },
  {
    id: "d5",
    category: "decisionMaking",
    en: "This leader can make tough decisions when necessary.",
    ar: "يستطيع هذا القائد اتخاذ قرارات صعبة عند الضرورة."
  },
  {
    id: "d6",
    category: "decisionMaking",
    en: "This leader effectively analyzes problems before proposing solutions.",
    ar: "يحلل هذا القائد المشكلات بفاعلية قبل اقتراح الحلول."
  },
  {
    id: "d7",
    category: "decisionMaking",
    en: "This leader balances short-term needs with long-term implications in decisions.",
    ar: "يوازن هذا القائد بين الاحتياجات قصيرة المدى والتأثيرات طويلة المدى في القرارات."
  },

  // Emotional Intelligence (8 questions)
  {
    id: "e1",
    category: "emotionalIntelligence",
    en: "This leader demonstrates self-awareness and understands personal strengths and weaknesses.",
    ar: "يُظهر هذا القائد وعياً ذاتياً ويفهم نقاط القوة والضعف الشخصية."
  },
  {
    id: "e2",
    category: "emotionalIntelligence",
    en: "This leader manages emotions effectively, especially under pressure.",
    ar: "يدير هذا القائد المشاعر بفاعلية، خاصة تحت الضغط."
  },
  {
    id: "e3",
    category: "emotionalIntelligence",
    en: "This leader shows empathy and understanding toward others.",
    ar: "يُظهر هذا القائد التعاطف والتفهم تجاه الآخرين."
  },
  {
    id: "e4",
    category: "emotionalIntelligence",
    en: "This leader recognizes and responds appropriately to others' emotions.",
    ar: "يعترف هذا القائد بمشاعر الآخرين ويستجيب لها بشكل مناسب."
  },
  {
    id: "e5",
    category: "emotionalIntelligence",
    en: "This leader remains calm and composed during challenging situations.",
    ar: "يبقى هذا القائد هادئاً ومتماسكاً خلال المواقف الصعبة."
  },
  {
    id: "e6",
    category: "emotionalIntelligence",
    en: "This leader builds genuine relationships based on trust and respect.",
    ar: "يبني هذا القائد علاقات حقيقية قائمة على الثقة والاحترام."
  },
  {
    id: "e7",
    category: "emotionalIntelligence",
    en: "This leader is aware of how their behavior impacts others.",
    ar: "يدرك هذا القائد كيف يؤثر سلوكه على الآخرين."
  },
  {
    id: "e8",
    category: "emotionalIntelligence",
    en: "This leader creates a positive emotional climate within the team.",
    ar: "يخلق هذا القائد مناخاً عاطفياً إيجابياً داخل الفريق."
  },

  // Change Management (7 questions)
  {
    id: "ch1",
    category: "changeManagement",
    en: "This leader effectively leads and supports organizational change.",
    ar: "يقود هذا القائد التغيير المؤسسي ويدعمه بفاعلية."
  },
  {
    id: "ch2",
    category: "changeManagement",
    en: "This leader helps others understand the reasons for change.",
    ar: "يساعد هذا القائد الآخرين على فهم أسباب التغيير."
  },
  {
    id: "ch3",
    category: "changeManagement",
    en: "This leader addresses resistance to change constructively.",
    ar: "يتعامل هذا القائد مع مقاومة التغيير بشكل بناء."
  },
  {
    id: "ch4",
    category: "changeManagement",
    en: "This leader maintains team stability during periods of uncertainty.",
    ar: "يحافظ هذا القائد على استقرار الفريق خلال فترات عدم اليقين."
  },
  {
    id: "ch5",
    category: "changeManagement",
    en: "This leader continuously improves processes and practices.",
    ar: "يحسن هذا القائد العمليات والممارسات باستمرار."
  },
  {
    id: "ch6",
    category: "changeManagement",
    en: "This leader celebrates successes and milestones during change initiatives.",
    ar: "يحتفل هذا القائد بالنجاحات والمراحل الهامة خلال مبادرات التغيير."
  },
  {
    id: "ch7",
    category: "changeManagement",
    en: "This leader sustains momentum and commitment throughout change processes.",
    ar: "يحافظ هذا القائد على الزخم والالتزام طوال عمليات التغيير."
  },

  // Accountability & Results (8 questions)
  {
    id: "a1",
    category: "accountability",
    en: "This leader sets clear expectations and performance standards.",
    ar: "يضع هذا القائد توقعات ومعايير أداء واضحة."
  },
  {
    id: "a2",
    category: "accountability",
    en: "This leader holds themselves and others accountable for results.",
    ar: "يحمّل هذا القائد نفسه والآخرين المسؤولية عن النتائج."
  },
  {
    id: "a3",
    category: "accountability",
    en: "This leader follows through on commitments and promises.",
    ar: "ينفذ هذا القائد الالتزامات والوعود."
  },
  {
    id: "a4",
    category: "accountability",
    en: "This leader provides constructive feedback to improve performance.",
    ar: "يقدم هذا القائد تغذية راجعة بناءة لتحسين الأداء."
  },
  {
    id: "a5",
    category: "accountability",
    en: "This leader consistently meets goals and deadlines.",
    ar: "يحقق هذا القائد الأهداف والمواعيد النهائية باستمرار."
  },
  {
    id: "a6",
    category: "accountability",
    en: "This leader takes ownership of failures and learns from mistakes.",
    ar: "يتحمل هذا القائد مسؤولية الإخفاقات ويتعلم من الأخطاء."
  },
  {
    id: "a7",
    category: "accountability",
    en: "This leader monitors progress and adjusts plans as needed.",
    ar: "يراقب هذا القائد التقدم ويعدل الخطط حسب الحاجة."
  },
  {
    id: "a8",
    category: "accountability",
    en: "This leader drives high-quality results in all initiatives.",
    ar: "يحقق هذا القائد نتائج عالية الجودة في جميع المبادرات."
  },

  // Development & Coaching (8 questions)
  {
    id: "dev1",
    category: "development",
    en: "This leader actively supports the professional development of team members.",
    ar: "يدعم هذا القائد بفاعلية التطور المهني لأعضاء الفريق."
  },
  {
    id: "dev2",
    category: "development",
    en: "This leader provides regular coaching and mentoring.",
    ar: "يقدم هذا القائد التوجيه والإرشاد بانتظام."
  },
  {
    id: "dev3",
    category: "development",
    en: "This leader creates opportunities for others to learn and grow.",
    ar: "يخلق هذا القائد فرصاً للآخرين للتعلم والنمو."
  },
  {
    id: "dev4",
    category: "development",
    en: "This leader gives timely and specific feedback on performance.",
    ar: "يقدم هذا القائد تغذية راجعة في الوقت المناسب ومحددة حول الأداء."
  },
  {
    id: "dev5",
    category: "development",
    en: "This leader recognizes and celebrates achievements.",
    ar: "يعترف هذا القائد بالإنجازات ويحتفل بها."
  },
  {
    id: "dev6",
    category: "development",
    en: "This leader helps others identify their career goals and development needs.",
    ar: "يساعد هذا القائد الآخرين على تحديد أهدافهم المهنية واحتياجاتهم التطويرية."
  },
  {
    id: "dev7",
    category: "development",
    en: "This leader invests time in developing the next generation of leaders.",
    ar: "يستثمر هذا القائد الوقت في تطوير الجيل القادم من القادة."
  },
  {
    id: "dev8",
    category: "development",
    en: "This leader empowers others to take on new challenges.",
    ar: "يمكّن هذا القائد الآخرين من تحمل تحديات جديدة."
  },

  // Integrity & Ethics (6 questions)
  {
    id: "i1",
    category: "integrity",
    en: "This leader demonstrates consistent ethical behavior.",
    ar: "يُظهر هذا القائد سلوكاً أخلاقياً متسقاً."
  },
  {
    id: "i2",
    category: "integrity",
    en: "This leader is honest and transparent in communications.",
    ar: "هذا القائد صادق وشفاف في تواصله."
  },
  {
    id: "i3",
    category: "integrity",
    en: "This leader treats everyone fairly and with respect.",
    ar: "يعامل هذا القائد الجميع بإنصاف واحترام."
  },
  {
    id: "i4",
    category: "integrity",
    en: "This leader admits mistakes and takes corrective action.",
    ar: "يعترف هذا القائد بالأخطاء ويتخذ إجراءات تصحيحية."
  },
  {
    id: "i5",
    category: "integrity",
    en: "This leader maintains confidentiality appropriately.",
    ar: "يحافظ هذا القائد على السرية بشكل مناسب."
  },
  {
    id: "i6",
    category: "integrity",
    en: "This leader acts in accordance with organizational values.",
    ar: "يتصرف هذا القائد وفقاً لقيم المنظمة."
  },

  // Innovation & Adaptability (7 questions)
  {
    id: "in1",
    category: "innovation",
    en: "This leader encourages creative thinking and new ideas.",
    ar: "يشجع هذا القائد التفكير الإبداعي والأفكار الجديدة."
  },
  {
    id: "in2",
    category: "innovation",
    en: "This leader is open to trying new approaches.",
    ar: "هذا القائد منفتح على تجربة مناهج جديدة."
  },
  {
    id: "in3",
    category: "innovation",
    en: "This leader adapts quickly to changing circumstances.",
    ar: "يتكيف هذا القائد بسرعة مع الظروف المتغيرة."
  },
  {
    id: "in4",
    category: "innovation",
    en: "This leader challenges the status quo to drive improvement.",
    ar: "يتحدى هذا القائد الوضع الراهن لدفع التحسين."
  },
  {
    id: "in5",
    category: "innovation",
    en: "This leader creates a safe environment for taking calculated risks.",
    ar: "يخلق هذا القائد بيئة آمنة لاتخاذ مخاطر محسوبة."
  },
  {
    id: "in6",
    category: "innovation",
    en: "This leader learns from failures and uses them to improve.",
    ar: "يتعلم هذا القائد من الإخفاقات ويستخدمها للتحسين."
  },
  {
    id: "in7",
    category: "innovation",
    en: "This leader demonstrates flexibility when plans need to change.",
    ar: "يُظهر هذا القائد المرونة عندما تحتاج الخطط للتغيير."
  }
];

export default leadership360Questions;
