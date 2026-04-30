// AI-Powered Course Content Analyzer
// Generates SMART, COURSE-SPECIFIC questions based on actual course content
// Questions are directly derived from course objectives, modules, and key concepts

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ==================== FILE PARSING ====================

/**
 * Parse uploaded file and extract text content
 */
export const parseUploadedFile = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await parsePDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await parseDOCX(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileName.endsWith('.pptx')
    ) {
      return await parsePPTX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await parseTXT(file);
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, PPTX, or TXT files.');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw error;
  }
};

/**
 * Parse PDF file
 */
const parsePDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    pageTexts.push(pageText);
    fullText += pageText + '\n\n';
  }

  return {
    text: fullText.trim(),
    pages: pdf.numPages,
    pageTexts,
    fileName: file.name,
    fileType: 'pdf'
  };
};

/**
 * Parse DOCX file
 */
const parseDOCX = async (file) => {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const docXml = await zip.file('word/document.xml')?.async('text');
  
  if (!docXml) {
    throw new Error('Invalid DOCX file structure');
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, 'text/xml');
  const paragraphs = xmlDoc.getElementsByTagName('w:t');
  let fullText = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    fullText += paragraphs[i].textContent + ' ';
  }

  return {
    text: fullText.trim(),
    fileName: file.name,
    fileType: 'docx'
  };
};

/**
 * Parse PPTX file
 */
const parsePPTX = async (file) => {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  let fullText = '';
  const slides = [];
  
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  ).sort();

  for (const slideFile of slideFiles) {
    const slideXml = await zip.file(slideFile)?.async('text');
    if (slideXml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      let slideText = '';
      
      for (let i = 0; i < textNodes.length; i++) {
        slideText += textNodes[i].textContent + ' ';
      }
      
      slides.push(slideText.trim());
      fullText += slideText + '\n\n';
    }
  }

  return {
    text: fullText.trim(),
    slides,
    slideCount: slides.length,
    fileName: file.name,
    fileType: 'pptx'
  };
};

/**
 * Parse plain text file
 */
const parseTXT = async (file) => {
  const text = await file.text();
  return {
    text: text.trim(),
    fileName: file.name,
    fileType: 'txt'
  };
};

// ==================== SMART CONTENT EXTRACTION ====================

/**
 * Extract course-specific content for question generation
 * Focuses on: Course Overview, Objectives, Modules/Contents
 */
export const extractCourseContent = (text) => {
  const content = {
    title: '',
    overview: '',
    objectives: [],
    modules: [],
    keyFacts: [],
    definitions: [],
    processes: [],
    principles: [],
    examples: [],
    statistics: [],
    comparisons: []
  };

  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);

  // 1. Extract Title (first meaningful line or explicit title)
  content.title = extractCourseTitle(lines, cleanText);

  // 2. Extract Course Overview/Description
  content.overview = extractCourseOverview(cleanText);

  // 3. Extract Learning Objectives (critical for question generation)
  content.objectives = extractLearningObjectives(cleanText, lines);

  // 4. Extract Modules/Sections/Contents
  content.modules = extractModulesAndTopics(cleanText, lines);

  // 5. Extract Key Facts (statements that can become questions)
  content.keyFacts = extractKeyFacts(cleanText);

  // 6. Extract Definitions (term: definition patterns)
  content.definitions = extractDefinitions(cleanText);

  // 7. Extract Processes/Steps (procedural knowledge)
  content.processes = extractProcesses(cleanText);

  // 8. Extract Principles/Rules (conceptual knowledge)
  content.principles = extractPrinciples(cleanText);

  // 9. Extract Examples (concrete instances)
  content.examples = extractExamples(cleanText);

  // 10. Extract Statistics/Numbers (factual data)
  content.statistics = extractStatistics(cleanText);

  // 11. Extract Comparisons (X vs Y patterns)
  content.comparisons = extractComparisons(cleanText);

  return content;
};

/**
 * Extract course title
 */
const extractCourseTitle = (lines, text) => {
  // Look for explicit title patterns
  const titlePatterns = [
    /(?:course\s*(?:title|name)?|training\s*(?:program|course)?|workshop|seminar)[\s:]+([^\n.]{5,100})/i,
    /^([A-Z][^.]{10,80})(?:\s*[-–]\s*(?:course|training|workshop))?$/m
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Use first substantive line
  for (const line of lines.slice(0, 5)) {
    if (line.length >= 10 && line.length <= 100 && !line.match(/^(page|slide|\d+|table of contents)/i)) {
      return line;
    }
  }

  return 'Training Course';
};

/**
 * Extract course overview/description
 */
const extractCourseOverview = (text) => {
  const overviewPatterns = [
    /(?:course\s*(?:overview|description|summary|introduction)|about\s*this\s*(?:course|training)|program\s*overview)[\s:]*([^]+?)(?=(?:learning\s*objectives|course\s*(?:content|outline|modules)|target\s*audience|prerequisites|$))/i,
    /(?:this\s*(?:course|training|program|workshop)\s*(?:is designed to|will|covers|provides|focuses on))([^.]+\.(?:[^.]+\.)?)/i
  ];

  for (const pattern of overviewPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500);
    }
  }

  return '';
};

/**
 * Extract learning objectives - CRITICAL for question generation
 */
const extractLearningObjectives = (text, lines) => {
  const objectives = [];
  
  // Bloom's taxonomy verbs for recognition
  const bloomVerbs = 'define|describe|explain|identify|list|name|recall|recognize|state|understand|apply|demonstrate|implement|use|solve|analyze|compare|contrast|differentiate|examine|evaluate|assess|critique|justify|create|design|develop|formulate|plan|propose';
  
  // Pattern 1: Explicit objectives section
  const objectivesSection = text.match(
    /(?:learning\s*objectives?|course\s*objectives?|training\s*objectives?|by\s*the\s*end\s*of\s*this\s*(?:course|training)|after\s*(?:completing|this)\s*(?:course|training)|you\s*will\s*(?:be\s*able\s*to|learn))[\s:]*([^]+?)(?=(?:course\s*(?:content|outline|modules|agenda)|target\s*audience|prerequisites|methodology|$))/i
  );

  if (objectivesSection && objectivesSection[1]) {
    // Extract individual objectives from the section
    const sectionText = objectivesSection[1];
    
    // Look for bullet points, numbers, or verb-starting sentences
    const objPatterns = [
      new RegExp(`(?:^|[•●○►▪\\-\\d+\\.\\)])\\s*((?:${bloomVerbs})\\s+[^.\\n]{10,150}[.])`, 'gim'),
      /(?:^|[•●○►▪\-\d+\.\)])\s*([A-Z][^.\n]{15,150}\.)/gm
    ];

    for (const pattern of objPatterns) {
      let match;
      while ((match = pattern.exec(sectionText)) !== null) {
        const obj = match[1].trim();
        if (obj.length > 15 && !objectives.includes(obj)) {
          objectives.push(obj);
        }
      }
    }
  }

  // Pattern 2: Individual objective statements throughout text
  const individualObjPattern = new RegExp(
    `(?:participants?\\s*will|you\\s*will|learners?\\s*will|be\\s*able\\s*to)\\s*((?:${bloomVerbs})\\s+[^.]{10,120}\\.)`,
    'gi'
  );

  let match;
  while ((match = individualObjPattern.exec(text)) !== null) {
    const obj = match[1].trim();
    if (obj.length > 15 && !objectives.includes(obj)) {
      objectives.push(obj);
    }
  }

  // Pattern 3: Lines starting with Bloom's verbs
  for (const line of lines) {
    const verbMatch = line.match(new RegExp(`^(${bloomVerbs})\\s+[^.]{10,120}\\.?$`, 'i'));
    if (verbMatch && !objectives.includes(line)) {
      objectives.push(line);
    }
  }

  return objectives.slice(0, 20);
};

/**
 * Extract modules, sections, and topics
 */
const extractModulesAndTopics = (text, lines) => {
  const modules = [];
  
  // Pattern 1: Explicit module/section headers
  const modulePatterns = [
    /(?:module|unit|section|chapter|part|session|day)\s*(\d+|[IVX]+)[\s:.\-]+([^\n]{5,100})/gi,
    /(\d+)\.\s*([A-Z][^\n]{10,100})/gm
  ];

  for (const pattern of modulePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const title = match[2]?.trim();
      if (title && title.length > 5 && !modules.some(m => m.title === title)) {
        modules.push({
          number: match[1],
          title: title,
          topics: []
        });
      }
    }
  }

  // Pattern 2: Course content/outline section
  const contentSection = text.match(
    /(?:course\s*(?:content|outline|agenda|topics|curriculum)|table\s*of\s*contents)[\s:]*([^]+?)(?=(?:learning\s*objectives|methodology|assessment|target\s*audience|$))/i
  );

  if (contentSection && contentSection[1]) {
    const lines = contentSection[1].split(/\n/).filter(l => l.trim().length > 5);
    for (const line of lines) {
      const cleanLine = line.replace(/^[\s•●○►▪\-\d+\.]+/, '').trim();
      if (cleanLine.length > 5 && cleanLine.length < 100 && !modules.some(m => m.title === cleanLine)) {
        modules.push({
          number: String(modules.length + 1),
          title: cleanLine,
          topics: []
        });
      }
    }
  }

  // Extract sub-topics for each module
  for (const module of modules) {
    const moduleStart = text.indexOf(module.title);
    if (moduleStart !== -1) {
      const nextSection = text.slice(moduleStart + module.title.length, moduleStart + 1000);
      const topics = nextSection.match(/(?:^|\n)\s*[•●○►▪\-]\s*([^\n]{10,80})/g) || [];
      module.topics = topics.slice(0, 5).map(t => t.replace(/^[\s•●○►▪\-]+/, '').trim());
    }
  }

  return modules.slice(0, 15);
};

/**
 * Extract key facts that can become questions
 */
const extractKeyFacts = (text) => {
  const facts = [];
  
  // Pattern: Declarative statements with key information
  const factPatterns = [
    // "X is Y" statements
    /([A-Z][^.]{5,30})\s+(?:is|are|refers to|means|represents)\s+([^.]{10,100})\./g,
    // "The key/main/primary X" statements
    /(?:the\s+)?(?:key|main|primary|essential|critical|important)\s+([^.]{10,80})\s+(?:is|are|include[s]?)\s+([^.]{10,100})\./gi,
    // Percentage and number facts
    /([^.]*\d+\s*(?:%|percent|percentage)[^.]*)\./gi,
    // "According to" statements
    /(?:according to|research shows|studies indicate)\s+([^.]{20,150})\./gi
  ];

  for (const pattern of factPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const fact = match[0].trim();
      if (fact.length > 20 && fact.length < 200 && !facts.includes(fact)) {
        facts.push(fact);
      }
    }
  }

  return facts.slice(0, 30);
};

/**
 * Extract definitions (term: definition)
 */
const extractDefinitions = (text) => {
  const definitions = [];
  
  const defPatterns = [
    // "Term is defined as..."
    /([A-Z][a-zA-Z\s]{2,40})(?:\s+is\s+defined\s+as|\s*[-:–]\s*)([^.]{20,150})\./g,
    // "Term: definition" or "Term - definition"
    /([A-Z][a-zA-Z\s]{2,30})[\s]*[:–-][\s]*([^.\n]{20,150})/g,
    // "What is X? X is..."
    /(?:what\s+is\s+)?([A-Za-z\s]{3,30})\?\s*(?:it\s+)?(?:is|refers to)\s+([^.]{20,150})\./gi
  ];

  for (const pattern of defPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1].trim();
      const definition = match[2].trim();
      if (term.length > 2 && definition.length > 20 && !definitions.some(d => d.term === term)) {
        definitions.push({ term, definition });
      }
    }
  }

  return definitions.slice(0, 15);
};

/**
 * Extract processes and steps
 */
const extractProcesses = (text) => {
  const processes = [];
  
  // Look for numbered steps or process descriptions
  const processPatterns = [
    /(?:step|phase)\s*(\d+)[\s:.\-]+([^\n]{10,100})/gi,
    /(?:first|second|third|fourth|fifth|finally|next|then)[\s,]+([^.]{10,100})\./gi,
    /(?:the\s+process\s+(?:of|for)|how\s+to)\s+([^.]{10,100})\s+(?:involves?|includes?|requires?)\s+([^.]{10,100})\./gi
  ];

  for (const pattern of processPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const process = match[0].trim();
      if (process.length > 15 && !processes.includes(process)) {
        processes.push(process);
      }
    }
  }

  return processes.slice(0, 15);
};

/**
 * Extract principles and rules
 */
const extractPrinciples = (text) => {
  const principles = [];
  
  const principlePatterns = [
    /(?:the\s+)?(?:principle|rule|law|theory|concept)\s+(?:of\s+)?([^.]{5,50})\s+(?:states?|suggests?|indicates?)\s+(?:that\s+)?([^.]{10,100})\./gi,
    /(?:it\s+is\s+important\s+to|always|never|must|should)\s+([^.]{10,100})\./gi,
    /(?:a\s+key\s+principle|the\s+main\s+rule|best\s+practice)\s+(?:is\s+)?(?:to\s+)?([^.]{10,100})\./gi
  ];

  for (const pattern of principlePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const principle = match[0].trim();
      if (principle.length > 20 && !principles.includes(principle)) {
        principles.push(principle);
      }
    }
  }

  return principles.slice(0, 15);
};

/**
 * Extract examples
 */
const extractExamples = (text) => {
  const examples = [];
  
  const examplePatterns = [
    /(?:for\s+example|e\.g\.|for\s+instance|such\s+as)[\s,]+([^.]{10,150})\./gi,
    /(?:an?\s+example\s+(?:of|is)|examples?\s+include)\s+([^.]{10,150})\./gi
  ];

  for (const pattern of examplePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const example = match[1].trim();
      if (example.length > 10 && !examples.includes(example)) {
        examples.push(example);
      }
    }
  }

  return examples.slice(0, 10);
};

/**
 * Extract statistics and numerical data
 */
const extractStatistics = (text) => {
  const statistics = [];
  
  const statPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:%|percent)\s+(?:of\s+)?([^.]{5,80})/gi,
    /([^.]*(?:\$|USD|EUR|SAR)?\s*\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|thousand))?[^.]*)\./gi
  ];

  for (const pattern of statPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const stat = match[0].trim();
      if (stat.length > 10 && !statistics.includes(stat)) {
        statistics.push(stat);
      }
    }
  }

  return statistics.slice(0, 10);
};

/**
 * Extract comparisons
 */
const extractComparisons = (text) => {
  const comparisons = [];
  
  const compPatterns = [
    /([A-Za-z\s]{3,30})\s+(?:vs\.?|versus|compared to|differs? from|unlike)\s+([A-Za-z\s]{3,30})(?:[^.]{0,100})\./gi,
    /(?:the\s+difference\s+between)\s+([^.]{10,50})\s+and\s+([^.]{10,50})\s+is\s+([^.]{10,100})\./gi
  ];

  for (const pattern of compPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const comparison = match[0].trim();
      if (comparison.length > 20 && !comparisons.includes(comparison)) {
        comparisons.push(comparison);
      }
    }
  }

  return comparisons.slice(0, 10);
};

// ==================== SMART QUESTION GENERATION ====================

/**
 * Generate smart, course-specific questions
 * Questions are DIRECTLY derived from the actual course content
 */
export const generateSmartQuestions = (courseContent, config = {}) => {
  const {
    minQuestions = 10,
    maxQuestions = 20,
    language = 'en'
  } = config;

  const questions = [];
  const usedContent = new Set();

  // 1. Generate questions from Learning Objectives (highest priority)
  const objectiveQuestions = generateObjectiveBasedQuestions(courseContent.objectives, courseContent.title, usedContent);
  questions.push(...objectiveQuestions);

  // 2. Generate questions from Modules/Topics
  const moduleQuestions = generateModuleBasedQuestions(courseContent.modules, courseContent.title, usedContent);
  questions.push(...moduleQuestions);

  // 3. Generate questions from Definitions
  const definitionQuestions = generateDefinitionQuestions(courseContent.definitions, usedContent);
  questions.push(...definitionQuestions);

  // 4. Generate questions from Key Facts
  const factQuestions = generateFactBasedQuestions(courseContent.keyFacts, courseContent.title, usedContent);
  questions.push(...factQuestions);

  // 5. Generate questions from Processes
  const processQuestions = generateProcessQuestions(courseContent.processes, usedContent);
  questions.push(...processQuestions);

  // 6. Generate questions from Principles
  const principleQuestions = generatePrincipleQuestions(courseContent.principles, usedContent);
  questions.push(...principleQuestions);

  // 7. Generate questions from Comparisons
  const comparisonQuestions = generateComparisonQuestions(courseContent.comparisons, usedContent);
  questions.push(...comparisonQuestions);

  // Ensure minimum questions
  if (questions.length < minQuestions && courseContent.overview) {
    const overviewQuestions = generateOverviewQuestions(courseContent.overview, courseContent.title, minQuestions - questions.length);
    questions.push(...overviewQuestions);
  }

  // Shuffle and balance
  const shuffled = shuffleArray(questions);
  const finalQuestions = shuffled.slice(0, maxQuestions);

  // Assign IDs and distribute to pre/post tests
  const numbered = finalQuestions.map((q, idx) => ({
    ...q,
    id: `q-${idx + 1}`
  }));

  // Split evenly between pre and post test
  const halfPoint = Math.ceil(numbered.length / 2);
  const preTest = numbered.slice(0, halfPoint).map(q => ({ ...q, testType: 'pre' }));
  const postTest = numbered.slice(halfPoint).map(q => ({ ...q, testType: 'post' }));

  return {
    preTest,
    postTest,
    all: numbered,
    metadata: {
      totalQuestions: numbered.length,
      preTestCount: preTest.length,
      postTestCount: postTest.length,
      questionTypes: countQuestionTypes(numbered),
      bloomLevels: countBloomLevels(numbered),
      courseName: courseContent.title
    }
  };
};

/**
 * Generate questions from learning objectives
 */
const generateObjectiveBasedQuestions = (objectives, courseTitle, usedContent) => {
  const questions = [];

  for (const objective of objectives) {
    if (usedContent.has(objective)) continue;
    usedContent.add(objective);

    // Detect the verb and create appropriate question type
    const verb = detectBloomVerb(objective);
    const bloomLevel = getBloomLevel(verb);

    if (bloomLevel === 'remember' || bloomLevel === 'understand') {
      // Multiple choice about the objective
      questions.push(createObjectiveMCQ(objective, courseTitle, bloomLevel));
    } else if (bloomLevel === 'apply' || bloomLevel === 'analyze') {
      // Scenario-based question
      questions.push(createObjectiveScenario(objective, courseTitle, bloomLevel));
    } else {
      // True/False for higher levels
      questions.push(createObjectiveTrueFalse(objective, courseTitle, bloomLevel));
    }
  }

  return questions;
};

/**
 * Create MCQ from objective
 */
const createObjectiveMCQ = (objective, courseTitle, bloomLevel) => {
  // Extract key action and content from objective
  const cleanObjective = objective.replace(/\.$/, '');
  
  return {
    type: 'multipleChoice',
    bloomLevel,
    points: bloomLevel === 'remember' ? 1 : 2,
    source: 'objective',
    sourceContent: objective,
    question: {
      en: `According to the course "${courseTitle}", what is expected regarding: "${cleanObjective}"?`,
      ar: `وفقاً لدورة "${courseTitle}"، ما المتوقع فيما يتعلق بـ: "${cleanObjective}"؟`
    },
    options: shuffleArray([
      {
        id: 'a',
        text: {
          en: `Participants will be able to ${cleanObjective.toLowerCase()}`,
          ar: `سيتمكن المشاركون من ${cleanObjective.toLowerCase()}`
        },
        isCorrect: true
      },
      {
        id: 'b',
        text: {
          en: `This is optional and not covered in the course`,
          ar: `هذا اختياري وغير مشمول في الدورة`
        },
        isCorrect: false
      },
      {
        id: 'c',
        text: {
          en: `Only advanced learners need to achieve this`,
          ar: `يحتاج المتعلمون المتقدمون فقط لتحقيق هذا`
        },
        isCorrect: false
      },
      {
        id: 'd',
        text: {
          en: `This is covered in a different course`,
          ar: `هذا مشمول في دورة مختلفة`
        },
        isCorrect: false
      }
    ]),
    feedback: {
      correct: {
        en: `Correct! This is a key learning objective of the course.`,
        ar: `صحيح! هذا هو هدف تعلم رئيسي في الدورة.`
      },
      incorrect: {
        en: `This learning objective is directly from the course content.`,
        ar: `هذا الهدف التعليمي مأخوذ مباشرة من محتوى الدورة.`
      }
    }
  };
};

/**
 * Create scenario question from objective
 */
const createObjectiveScenario = (objective, courseTitle, bloomLevel) => {
  const cleanObjective = objective.replace(/\.$/, '');
  
  return {
    type: 'scenario',
    bloomLevel,
    points: 3,
    source: 'objective',
    sourceContent: objective,
    scenario: {
      en: `You have completed the "${courseTitle}" training and are now applying what you learned.`,
      ar: `لقد أكملت تدريب "${courseTitle}" وتقوم الآن بتطبيق ما تعلمته.`
    },
    question: {
      en: `Which approach best demonstrates your ability to "${cleanObjective}"?`,
      ar: `أي نهج يُظهر بشكل أفضل قدرتك على "${cleanObjective}"؟`
    },
    options: shuffleArray([
      {
        id: 'a',
        text: {
          en: `Apply the concepts learned in the training systematically`,
          ar: `تطبيق المفاهيم المكتسبة في التدريب بشكل منهجي`
        },
        isCorrect: true,
        score: 3
      },
      {
        id: 'b',
        text: {
          en: `Rely on previous experience without using new knowledge`,
          ar: `الاعتماد على الخبرة السابقة دون استخدام المعرفة الجديدة`
        },
        isCorrect: false,
        score: 1
      },
      {
        id: 'c',
        text: {
          en: `Wait for someone else to demonstrate first`,
          ar: `الانتظار حتى يُظهر شخص آخر أولاً`
        },
        isCorrect: false,
        score: 0
      },
      {
        id: 'd',
        text: {
          en: `Skip this and focus on other tasks`,
          ar: `تخطي هذا والتركيز على مهام أخرى`
        },
        isCorrect: false,
        score: 0
      }
    ]),
    feedback: {
      en: `The course objective "${cleanObjective}" requires active application of learned concepts.`,
      ar: `يتطلب هدف الدورة "${cleanObjective}" تطبيقاً فعالاً للمفاهيم المكتسبة.`
    }
  };
};

/**
 * Create True/False from objective
 */
const createObjectiveTrueFalse = (objective, courseTitle, bloomLevel) => {
  const isTrue = Math.random() > 0.3; // 70% true questions
  const cleanObjective = objective.replace(/\.$/, '');
  
  let statement = cleanObjective;
  if (!isTrue) {
    // Create false statement by negating
    statement = `NOT ${cleanObjective}`;
  }

  return {
    type: 'trueFalse',
    bloomLevel,
    points: 1,
    source: 'objective',
    sourceContent: objective,
    question: {
      en: `True or False: In the "${courseTitle}" course, participants will learn to ${statement.toLowerCase()}.`,
      ar: `صح أم خطأ: في دورة "${courseTitle}"، سيتعلم المشاركون ${statement.toLowerCase()}.`
    },
    correctAnswer: isTrue,
    feedback: {
      correct: { en: 'Correct!', ar: 'صحيح!' },
      incorrect: {
        en: `The correct answer is ${isTrue ? 'True' : 'False'}. This is ${isTrue ? '' : 'not '}a learning objective of the course.`,
        ar: `الإجابة الصحيحة هي ${isTrue ? 'صح' : 'خطأ'}. هذا ${isTrue ? '' : 'ليس '}هدفاً تعليمياً للدورة.`
      }
    }
  };
};

/**
 * Generate questions from modules
 */
const generateModuleBasedQuestions = (modules, courseTitle, usedContent) => {
  const questions = [];

  for (const module of modules) {
    if (usedContent.has(module.title)) continue;
    usedContent.add(module.title);

    // Create question about module content
    questions.push({
      type: 'multipleChoice',
      bloomLevel: 'remember',
      points: 1,
      source: 'module',
      sourceContent: module.title,
      question: {
        en: `Which topic is covered in the "${courseTitle}" course?`,
        ar: `أي موضوع يتم تناوله في دورة "${courseTitle}"؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: { en: module.title, ar: module.title },
          isCorrect: true
        },
        {
          id: 'b',
          text: { en: 'Advanced quantum physics', ar: 'فيزياء الكم المتقدمة' },
          isCorrect: false
        },
        {
          id: 'c',
          text: { en: 'Medieval European history', ar: 'تاريخ أوروبا في العصور الوسطى' },
          isCorrect: false
        },
        {
          id: 'd',
          text: { en: 'Organic chemistry fundamentals', ar: 'أساسيات الكيمياء العضوية' },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { en: 'Correct! This is a key topic in the course.', ar: 'صحيح! هذا موضوع رئيسي في الدورة.' },
        incorrect: { en: 'Review the course content and modules.', ar: 'راجع محتوى الدورة والوحدات.' }
      }
    });

    // Add questions for module topics
    for (const topic of module.topics || []) {
      if (usedContent.has(topic)) continue;
      usedContent.add(topic);

      questions.push({
        type: 'trueFalse',
        bloomLevel: 'remember',
        points: 1,
        source: 'topic',
        sourceContent: topic,
        question: {
          en: `True or False: "${topic}" is discussed in the "${module.title}" section of the course.`,
          ar: `صح أم خطأ: يتم مناقشة "${topic}" في قسم "${module.title}" من الدورة.`
        },
        correctAnswer: true,
        feedback: {
          correct: { en: 'Correct!', ar: 'صحيح!' },
          incorrect: { en: 'This topic is indeed part of the course.', ar: 'هذا الموضوع هو بالفعل جزء من الدورة.' }
        }
      });
    }
  }

  return questions;
};

/**
 * Generate questions from definitions
 */
const generateDefinitionQuestions = (definitions, usedContent) => {
  const questions = [];

  for (const def of definitions) {
    if (usedContent.has(def.term)) continue;
    usedContent.add(def.term);

    questions.push({
      type: 'multipleChoice',
      bloomLevel: 'remember',
      points: 1,
      source: 'definition',
      sourceContent: `${def.term}: ${def.definition}`,
      question: {
        en: `What is the correct definition of "${def.term}"?`,
        ar: `ما هو التعريف الصحيح لـ "${def.term}"؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: { en: def.definition, ar: def.definition },
          isCorrect: true
        },
        {
          id: 'b',
          text: {
            en: `The opposite of ${def.term.toLowerCase()}`,
            ar: `عكس ${def.term.toLowerCase()}`
          },
          isCorrect: false
        },
        {
          id: 'c',
          text: {
            en: `An unrelated concept from a different field`,
            ar: `مفهوم غير ذي صلة من مجال مختلف`
          },
          isCorrect: false
        },
        {
          id: 'd',
          text: { en: 'None of the above', ar: 'لا شيء مما سبق' },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { en: 'Excellent! You understand this key term.', ar: 'ممتاز! أنت تفهم هذا المصطلح الرئيسي.' },
        incorrect: { en: 'Review the definition in the course material.', ar: 'راجع التعريف في مادة الدورة.' }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from key facts
 */
const generateFactBasedQuestions = (facts, courseTitle, usedContent) => {
  const questions = [];

  for (const fact of facts) {
    if (usedContent.has(fact)) continue;
    usedContent.add(fact);

    // Determine if this should be true/false or MCQ based on fact structure
    const hasNumber = /\d/.test(fact);
    
    if (hasNumber) {
      // MCQ for numerical facts
      questions.push({
        type: 'multipleChoice',
        bloomLevel: 'remember',
        points: 2,
        source: 'fact',
        sourceContent: fact,
        question: {
          en: `According to the course content, which statement is accurate?`,
          ar: `وفقاً لمحتوى الدورة، أي عبارة دقيقة؟`
        },
        options: shuffleArray([
          {
            id: 'a',
            text: { en: fact, ar: fact },
            isCorrect: true
          },
          {
            id: 'b',
            text: { en: fact.replace(/\d+/g, m => String(parseInt(m) * 2)), ar: fact.replace(/\d+/g, m => String(parseInt(m) * 2)) },
            isCorrect: false
          },
          {
            id: 'c',
            text: { en: fact.replace(/\d+/g, m => String(Math.floor(parseInt(m) / 2))), ar: fact.replace(/\d+/g, m => String(Math.floor(parseInt(m) / 2))) },
            isCorrect: false
          },
          {
            id: 'd',
            text: { en: 'The course does not mention this', ar: 'الدورة لا تذكر هذا' },
            isCorrect: false
          }
        ]),
        feedback: {
          correct: { en: 'Correct! You remembered this fact accurately.', ar: 'صحيح! لقد تذكرت هذه الحقيقة بدقة.' },
          incorrect: { en: 'Review the facts and figures in the course material.', ar: 'راجع الحقائق والأرقام في مادة الدورة.' }
        }
      });
    } else {
      // True/False for text-based facts
      questions.push({
        type: 'trueFalse',
        bloomLevel: 'understand',
        points: 1,
        source: 'fact',
        sourceContent: fact,
        question: {
          en: `True or False: ${fact}`,
          ar: `صح أم خطأ: ${fact}`
        },
        correctAnswer: true,
        feedback: {
          correct: { en: 'Correct!', ar: 'صحيح!' },
          incorrect: { en: 'This statement is from the course content.', ar: 'هذه العبارة من محتوى الدورة.' }
        }
      });
    }
  }

  return questions;
};

/**
 * Generate questions from processes
 */
const generateProcessQuestions = (processes, usedContent) => {
  const questions = [];

  for (const process of processes) {
    if (usedContent.has(process)) continue;
    usedContent.add(process);

    questions.push({
      type: 'multipleChoice',
      bloomLevel: 'apply',
      points: 2,
      source: 'process',
      sourceContent: process,
      question: {
        en: `What is a correct step or process mentioned in the course?`,
        ar: `ما هي الخطوة أو العملية الصحيحة المذكورة في الدورة؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: { en: process, ar: process },
          isCorrect: true
        },
        {
          id: 'b',
          text: { en: 'Skip all procedures and improvise', ar: 'تخطي جميع الإجراءات والارتجال' },
          isCorrect: false
        },
        {
          id: 'c',
          text: { en: 'Do the opposite of what is recommended', ar: 'فعل عكس ما هو موصى به' },
          isCorrect: false
        },
        {
          id: 'd',
          text: { en: 'This process is not covered in the course', ar: 'هذه العملية غير مشمولة في الدورة' },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { en: 'Correct! You understand the process.', ar: 'صحيح! أنت تفهم العملية.' },
        incorrect: { en: 'Review the processes and steps in the course.', ar: 'راجع العمليات والخطوات في الدورة.' }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from principles
 */
const generatePrincipleQuestions = (principles, usedContent) => {
  const questions = [];

  for (const principle of principles) {
    if (usedContent.has(principle)) continue;
    usedContent.add(principle);

    questions.push({
      type: 'trueFalse',
      bloomLevel: 'understand',
      points: 1,
      source: 'principle',
      sourceContent: principle,
      question: {
        en: `True or False: ${principle}`,
        ar: `صح أم خطأ: ${principle}`
      },
      correctAnswer: true,
      feedback: {
        correct: { en: 'Correct! This is a key principle from the course.', ar: 'صحيح! هذا مبدأ رئيسي من الدورة.' },
        incorrect: { en: 'This principle is taught in the course.', ar: 'هذا المبدأ يُدرس في الدورة.' }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from comparisons
 */
const generateComparisonQuestions = (comparisons, usedContent) => {
  const questions = [];

  for (const comparison of comparisons) {
    if (usedContent.has(comparison)) continue;
    usedContent.add(comparison);

    questions.push({
      type: 'multipleChoice',
      bloomLevel: 'analyze',
      points: 2,
      source: 'comparison',
      sourceContent: comparison,
      question: {
        en: `Which comparison or distinction is mentioned in the course?`,
        ar: `أي مقارنة أو تمييز مذكور في الدورة؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: { en: comparison, ar: comparison },
          isCorrect: true
        },
        {
          id: 'b',
          text: { en: 'They are exactly the same', ar: 'هما متماثلان تماماً' },
          isCorrect: false
        },
        {
          id: 'c',
          text: { en: 'No comparison is made in the course', ar: 'لا توجد مقارنة في الدورة' },
          isCorrect: false
        },
        {
          id: 'd',
          text: { en: 'This topic is not covered', ar: 'هذا الموضوع غير مشمول' },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { en: 'Excellent analysis!', ar: 'تحليل ممتاز!' },
        incorrect: { en: 'Review the comparisons in the course material.', ar: 'راجع المقارنات في مادة الدورة.' }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from course overview
 */
const generateOverviewQuestions = (overview, courseTitle, count) => {
  const questions = [];
  const sentences = overview.match(/[^.!?]+[.!?]+/g) || [];

  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length < 20) continue;

    questions.push({
      type: 'trueFalse',
      bloomLevel: 'understand',
      points: 1,
      source: 'overview',
      sourceContent: sentence,
      question: {
        en: `True or False: According to the course overview, "${sentence}"`,
        ar: `صح أم خطأ: وفقاً لنظرة عامة على الدورة، "${sentence}"`
      },
      correctAnswer: true,
      feedback: {
        correct: { en: 'Correct!', ar: 'صحيح!' },
        incorrect: { en: 'This is stated in the course overview.', ar: 'هذا مذكور في نظرة عامة على الدورة.' }
      }
    });
  }

  return questions;
};

// ==================== HELPER FUNCTIONS ====================

const detectBloomVerb = (text) => {
  const lowerText = text.toLowerCase();
  const verbs = {
    create: ['create', 'design', 'develop', 'formulate', 'propose', 'construct', 'plan', 'produce'],
    evaluate: ['evaluate', 'assess', 'justify', 'critique', 'recommend', 'judge', 'decide'],
    analyze: ['analyze', 'compare', 'contrast', 'examine', 'differentiate', 'distinguish', 'investigate'],
    apply: ['apply', 'demonstrate', 'use', 'implement', 'solve', 'execute', 'practice', 'perform'],
    understand: ['explain', 'describe', 'summarize', 'interpret', 'classify', 'discuss', 'recognize'],
    remember: ['define', 'list', 'recall', 'identify', 'name', 'state', 'label', 'match']
  };

  for (const [level, verbList] of Object.entries(verbs)) {
    for (const verb of verbList) {
      if (lowerText.includes(verb)) {
        return verb;
      }
    }
  }
  return 'understand';
};

const getBloomLevel = (verb) => {
  const levels = {
    create: ['create', 'design', 'develop', 'formulate', 'propose', 'construct', 'plan', 'produce'],
    evaluate: ['evaluate', 'assess', 'justify', 'critique', 'recommend', 'judge', 'decide'],
    analyze: ['analyze', 'compare', 'contrast', 'examine', 'differentiate', 'distinguish', 'investigate'],
    apply: ['apply', 'demonstrate', 'use', 'implement', 'solve', 'execute', 'practice', 'perform'],
    understand: ['explain', 'describe', 'summarize', 'interpret', 'classify', 'discuss', 'recognize'],
    remember: ['define', 'list', 'recall', 'identify', 'name', 'state', 'label', 'match']
  };

  for (const [level, verbs] of Object.entries(levels)) {
    if (verbs.includes(verb.toLowerCase())) {
      return level;
    }
  }
  return 'understand';
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const countQuestionTypes = (questions) => {
  const counts = {};
  for (const q of questions) {
    counts[q.type] = (counts[q.type] || 0) + 1;
  }
  return counts;
};

const countBloomLevels = (questions) => {
  const counts = {};
  for (const q of questions) {
    counts[q.bloomLevel] = (counts[q.bloomLevel] || 0) + 1;
  }
  return counts;
};

// ==================== MAIN EXPORT ====================

/**
 * Process uploaded course file and generate smart assessment
 */
export const processUploadedCourse = async (file, options = {}) => {
  try {
    // Step 1: Parse the file
    const parsedContent = await parseUploadedFile(file);
    
    if (!parsedContent.text || parsedContent.text.length < 100) {
      throw new Error('The uploaded file does not contain enough text content to generate an assessment.');
    }

    // Step 2: Extract course-specific content
    const courseContent = extractCourseContent(parsedContent.text);

    // Step 3: Generate smart, course-specific questions
    const questions = generateSmartQuestions(courseContent, {
      minQuestions: options.minQuestions || 10,
      maxQuestions: options.maxQuestions || 20,
      language: options.language || 'en'
    });

    // Step 4: Create course object
    const course = {
      id: `course-${Date.now()}`,
      title: {
        en: courseContent.title || 'Training Course',
        ar: courseContent.title || 'دورة تدريبية'
      },
      description: {
        en: courseContent.overview || 'A comprehensive training course.',
        ar: courseContent.overview || 'دورة تدريبية شاملة.'
      },
      modules: courseContent.modules.map((m, idx) => ({
        id: `module-${idx + 1}`,
        title: { en: m.title, ar: m.title },
        topics: m.topics.map(t => ({ en: t, ar: t }))
      })),
      objectives: courseContent.objectives.map(obj => ({
        en: obj,
        ar: obj
      })),
      sourceFile: {
        name: file.name,
        type: parsedContent.fileType,
        size: file.size,
        uploadedAt: new Date().toISOString()
      },
      analysis: {
        objectivesFound: courseContent.objectives.length,
        modulesFound: courseContent.modules.length,
        definitionsFound: courseContent.definitions.length,
        factsExtracted: courseContent.keyFacts.length,
        questionsGenerated: questions.all.length
      },
      createdAt: new Date().toISOString(),
      status: 'ready'
    };

    return {
      success: true,
      course,
      questions,
      analysis: {
        title: courseContent.title,
        objectivesCount: courseContent.objectives.length,
        modulesCount: courseContent.modules.length,
        questionsGenerated: questions.all.length,
        preTestQuestions: questions.preTest.length,
        postTestQuestions: questions.postTest.length
      }
    };

  } catch (error) {
    console.error('Course processing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process the course file.'
    };
  }
};

export default {
  parseUploadedFile,
  extractCourseContent,
  generateSmartQuestions,
  processUploadedCourse
};
