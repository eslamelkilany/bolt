// AI-Powered Course Content Analyzer
// Extracts content from uploaded files and generates intelligent assessments

import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
 * Parse DOCX file using basic XML extraction
 */
const parseDOCX = async (file) => {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Extract document.xml which contains the main content
  const docXml = await zip.file('word/document.xml')?.async('text');
  
  if (!docXml) {
    throw new Error('Invalid DOCX file structure');
  }

  // Parse XML and extract text
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, 'text/xml');
  
  // Extract all text nodes from paragraphs
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
  
  // Find all slide files
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  ).sort();

  for (const slideFile of slideFiles) {
    const slideXml = await zip.file(slideFile)?.async('text');
    if (slideXml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(slideXml, 'text/xml');
      
      // Extract text from slide
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

// ==================== AI CONTENT ANALYSIS ====================

/**
 * Analyze course content and extract structured information
 */
export const analyzeContent = (parsedContent) => {
  const text = parsedContent.text;
  
  // Extract key information
  const analysis = {
    title: extractTitle(text),
    description: extractDescription(text),
    duration: estimateDuration(text, parsedContent),
    modules: extractModules(text),
    keyTopics: extractKeyTopics(text),
    learningObjectives: extractLearningObjectives(text),
    keyTerms: extractKeyTerms(text),
    concepts: extractConcepts(text),
    contentType: detectContentType(text),
    difficulty: assessDifficulty(text),
    language: detectLanguage(text),
    wordCount: text.split(/\s+/).length,
    estimatedReadingTime: Math.ceil(text.split(/\s+/).length / 200) // ~200 words per minute
  };

  return analysis;
};

/**
 * Extract course title from content
 */
const extractTitle = (text) => {
  // Look for common title patterns
  const lines = text.split('\n').filter(l => l.trim());
  
  // First non-empty line is often the title
  const firstLine = lines[0]?.trim() || '';
  
  // Check for explicit title markers
  const titlePatterns = [
    /^(?:course|training|workshop|program|module)[\s:]+(.+)/i,
    /^(?:title|subject|topic)[\s:]+(.+)/i,
    /^(.+?)(?:\s*[-–—]\s*training|\s*course|\s*workshop)/i
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        en: match[1].trim().substring(0, 100),
        ar: match[1].trim().substring(0, 100)
      };
    }
  }

  // Use first line if short enough
  if (firstLine.length <= 100 && firstLine.length > 3) {
    return { en: firstLine, ar: firstLine };
  }

  return { en: 'Training Course', ar: 'دورة تدريبية' };
};

/**
 * Extract course description
 */
const extractDescription = (text) => {
  // Look for description/overview sections
  const descPatterns = [
    /(?:description|overview|introduction|about this course|course summary)[\s:]*([^.]+\.[^.]+\.)/i,
    /(?:this course|this training|this program|this workshop)([^.]+\.[^.]+\.)/i
  ];

  for (const pattern of descPatterns) {
    const match = text.match(pattern);
    if (match) {
      const desc = match[1].trim().substring(0, 300);
      return { en: desc, ar: desc };
    }
  }

  // Use first paragraph if available
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  if (paragraphs[0]) {
    const desc = paragraphs[0].substring(0, 300).trim();
    return { en: desc, ar: desc };
  }

  return { en: '', ar: '' };
};

/**
 * Estimate course duration based on content
 */
const estimateDuration = (text, parsedContent) => {
  // Check for explicit duration mentions
  const durationPatterns = [
    /(\d+)\s*(?:hour|hr)s?\s*(?:training|course|session)?/i,
    /(\d+)\s*(?:day)s?\s*(?:training|course|program)?/i,
    /duration[\s:]*(\d+)\s*(?:hour|hr|day|minute|min)/i
  ];

  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (match[0].toLowerCase().includes('day')) {
        return `${num} day${num > 1 ? 's' : ''}`;
      } else if (match[0].toLowerCase().includes('min')) {
        return num >= 60 ? `${Math.round(num / 60)} hours` : `${num} minutes`;
      }
      return `${num} hour${num > 1 ? 's' : ''}`;
    }
  }

  // Estimate based on content length
  const wordCount = text.split(/\s+/).length;
  const pageCount = parsedContent.pages || parsedContent.slideCount || Math.ceil(wordCount / 300);

  if (pageCount <= 10) return 'half day';
  if (pageCount <= 30) return '1 day';
  if (pageCount <= 60) return '2 days';
  return '3 days';
};

/**
 * Extract modules/sections from content
 */
const extractModules = (text) => {
  const modules = [];
  
  // Common section patterns
  const sectionPatterns = [
    /(?:module|section|unit|chapter|part)\s*(\d+)[\s:.-]*([^\n]+)/gi,
    /(?:^|\n)(\d+\.?\s*)([A-Z][^.\n]{10,80})/gm,
    /(?:^|\n)((?:I{1,3}|IV|V|VI{0,3}|IX|X)\.?\s*)([A-Z][^.\n]{10,80})/gm
  ];

  for (const pattern of sectionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const title = match[2]?.trim();
      if (title && title.length > 5 && !modules.some(m => m.title.en === title)) {
        modules.push({
          id: `module-${modules.length + 1}`,
          title: { en: title, ar: title },
          objectives: [],
          topics: []
        });
      }
    }
  }

  // If no modules found, create based on content structure
  if (modules.length === 0) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 100);
    const moduleCount = Math.min(Math.ceil(paragraphs.length / 3), 5);
    
    for (let i = 0; i < moduleCount; i++) {
      modules.push({
        id: `module-${i + 1}`,
        title: { en: `Module ${i + 1}`, ar: `الوحدة ${i + 1}` },
        objectives: [],
        topics: []
      });
    }
  }

  return modules.slice(0, 10); // Max 10 modules
};

/**
 * Extract key topics from content
 */
const extractKeyTopics = (text) => {
  const topics = [];
  
  // Look for bullet points, numbered lists, and key terms
  const topicPatterns = [
    /(?:^|\n)\s*[•●○►▪-]\s*([A-Za-z][^.\n]{5,60})/gm,
    /(?:^|\n)\s*\d+[.)]\s*([A-Za-z][^.\n]{5,60})/gm,
    /(?:key\s*(?:topic|point|concept|term)s?[\s:]*)((?:[^.\n]+[,;]\s*)+[^.\n]+)/gi
  ];

  for (const pattern of topicPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const topic = match[1]?.trim();
      if (topic && topic.length > 5 && topic.length < 100 && !topics.includes(topic)) {
        topics.push(topic);
      }
    }
  }

  return topics.slice(0, 20);
};

/**
 * Extract learning objectives
 */
const extractLearningObjectives = (text) => {
  const objectives = [];
  
  // Bloom's taxonomy action verbs
  const actionVerbs = [
    'define', 'list', 'recall', 'identify', 'name', 'state', 'describe',
    'explain', 'summarize', 'interpret', 'classify', 'discuss', 'recognize',
    'apply', 'demonstrate', 'use', 'implement', 'solve', 'execute', 'practice',
    'analyze', 'compare', 'contrast', 'examine', 'differentiate', 'distinguish',
    'evaluate', 'assess', 'justify', 'critique', 'recommend', 'judge',
    'create', 'design', 'develop', 'formulate', 'propose', 'construct', 'plan'
  ];

  // Look for explicit learning objectives
  const objectivePatterns = [
    /(?:learning\s*objective|by the end|after this|you will|participant.*will|able to)[\s:]*([^.\n]+\.)/gi,
    new RegExp(`(?:^|\\n)\\s*[•●○►▪-]?\\s*(${actionVerbs.join('|')})\\s+[^.\\n]{10,100}\\.?`, 'gmi')
  ];

  for (const pattern of objectivePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const objective = match[1]?.trim() || match[0]?.trim();
      if (objective && objective.length > 10 && !objectives.some(o => o.en === objective)) {
        objectives.push({
          en: objective.replace(/^[•●○►▪-]\s*/, ''),
          ar: objective.replace(/^[•●○►▪-]\s*/, '')
        });
      }
    }
  }

  // Generate objectives from key topics if none found
  if (objectives.length === 0) {
    const topics = extractKeyTopics(text);
    topics.slice(0, 5).forEach((topic, idx) => {
      const verb = actionVerbs[idx % actionVerbs.length];
      objectives.push({
        en: `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${topic.toLowerCase()}`,
        ar: `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${topic.toLowerCase()}`
      });
    });
  }

  return objectives.slice(0, 15);
};

/**
 * Extract key terms and definitions
 */
const extractKeyTerms = (text) => {
  const terms = [];
  
  // Look for definition patterns
  const termPatterns = [
    /([A-Z][a-zA-Z\s]{2,30})(?:\s*[-:–]\s*|\s+is\s+|\s+means\s+|\s+refers to\s+)([^.\n]{20,150})/g,
    /(?:definition|glossary|term)[\s:]*([A-Za-z][^:.\n]{2,30})[\s:]+([^.\n]{20,150})/gi
  ];

  for (const pattern of termPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1]?.trim();
      const definition = match[2]?.trim();
      if (term && definition && term.length > 2 && !terms.some(t => t.term === term)) {
        terms.push({ term, definition });
      }
    }
  }

  return terms.slice(0, 20);
};

/**
 * Extract main concepts for question generation
 */
const extractConcepts = (text) => {
  const concepts = [];
  
  // Extract sentences that contain important information
  const sentences = text.match(/[A-Z][^.!?]*[.!?]/g) || [];
  
  // Filter for informative sentences
  const informativeSentences = sentences.filter(s => {
    const words = s.split(/\s+/).length;
    return words >= 8 && words <= 40 && 
           !s.match(/^(the|this|that|these|those|a|an)\s/i) &&
           (s.includes(' is ') || s.includes(' are ') || s.includes(' means ') || 
            s.includes(' includes ') || s.includes(' requires ') || s.includes(' involves '));
  });

  informativeSentences.slice(0, 30).forEach(sentence => {
    concepts.push({
      text: sentence.trim(),
      type: detectConceptType(sentence)
    });
  });

  return concepts;
};

/**
 * Detect the type of concept (definition, process, fact, principle)
 */
const detectConceptType = (sentence) => {
  if (sentence.match(/\b(is defined as|means|refers to|is a|are a)\b/i)) return 'definition';
  if (sentence.match(/\b(steps?|process|procedure|method|how to)\b/i)) return 'process';
  if (sentence.match(/\b(principle|rule|law|theory|concept)\b/i)) return 'principle';
  if (sentence.match(/\b(must|should|always|never|important|critical)\b/i)) return 'rule';
  return 'fact';
};

/**
 * Detect content type (technical, soft skills, compliance, etc.)
 */
const detectContentType = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/\b(leadership|management|team|communication|soft skills)\b/)) return 'leadership';
  if (lowerText.match(/\b(compliance|regulation|policy|legal|safety)\b/)) return 'compliance';
  if (lowerText.match(/\b(technical|programming|software|system|engineering)\b/)) return 'technical';
  if (lowerText.match(/\b(sales|marketing|customer|service|client)\b/)) return 'sales';
  if (lowerText.match(/\b(finance|accounting|budget|investment)\b/)) return 'finance';
  if (lowerText.match(/\b(hr|human resource|recruitment|employee)\b/)) return 'hr';
  
  return 'general';
};

/**
 * Assess content difficulty level
 */
const assessDifficulty = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for advanced terminology
  const advancedTerms = (text.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g) || []).length; // CamelCase terms
  const complexSentences = (text.match(/[^.!?]*,[^.!?]*,[^.!?]*[.!?]/g) || []).length;
  const technicalTerms = (lowerText.match(/\b(methodology|framework|paradigm|implementation|optimization|architecture)\b/g) || []).length;

  const complexityScore = advancedTerms * 0.5 + complexSentences * 0.3 + technicalTerms * 2;
  const wordCount = text.split(/\s+/).length;
  const normalizedScore = complexityScore / (wordCount / 1000);

  if (normalizedScore > 15) return 'advanced';
  if (normalizedScore > 8) return 'intermediate';
  return 'beginner';
};

/**
 * Detect primary language of content
 */
const detectLanguage = (text) => {
  // Check for Arabic characters
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;

  if (arabicChars > latinChars) return 'ar';
  return 'en';
};

// ==================== INTELLIGENT QUESTION GENERATION ====================

/**
 * Generate intelligent questions based on analyzed content
 */
export const generateIntelligentQuestions = (analysis, config = {}) => {
  const {
    minQuestions = 10,
    maxQuestions = 20,
    language = 'en'
  } = config;

  // Determine number of questions based on content
  const questionCount = calculateQuestionCount(analysis, minQuestions, maxQuestions);
  
  const questions = [];
  const usedConcepts = new Set();

  // Generate questions from different sources
  const questionSources = [
    { generator: generateConceptQuestions, weight: 0.4 },
    { generator: generateObjectiveQuestions, weight: 0.3 },
    { generator: generateTermQuestions, weight: 0.15 },
    { generator: generateTopicQuestions, weight: 0.15 }
  ];

  // Generate questions proportionally
  for (const source of questionSources) {
    const count = Math.ceil(questionCount * source.weight);
    const generated = source.generator(analysis, count, usedConcepts, language);
    questions.push(...generated);
  }

  // Shuffle and trim to target count
  const shuffled = shuffleArray(questions);
  const finalQuestions = shuffled.slice(0, questionCount);

  // Distribute between pre and post test
  const preTestCount = Math.ceil(finalQuestions.length / 2);
  
  return {
    preTest: finalQuestions.slice(0, preTestCount).map((q, i) => ({
      ...q,
      id: `pre-${i + 1}`,
      testType: 'pre'
    })),
    postTest: finalQuestions.slice(preTestCount).map((q, i) => ({
      ...q,
      id: `post-${i + 1}`,
      testType: 'post'
    })),
    all: finalQuestions,
    metadata: {
      totalQuestions: finalQuestions.length,
      contentAnalysis: {
        title: analysis.title,
        duration: analysis.duration,
        difficulty: analysis.difficulty,
        contentType: analysis.contentType
      }
    }
  };
};

/**
 * Calculate appropriate number of questions based on content
 */
const calculateQuestionCount = (analysis, min, max) => {
  let baseCount = 10;
  
  // Adjust based on content length
  if (analysis.wordCount > 5000) baseCount += 3;
  if (analysis.wordCount > 10000) baseCount += 3;
  
  // Adjust based on duration
  if (analysis.duration.includes('2') || analysis.duration.includes('3')) baseCount += 2;
  if (analysis.duration.includes('day')) baseCount += 2;
  
  // Adjust based on modules
  baseCount += Math.min(analysis.modules.length, 5);
  
  // Adjust based on objectives
  baseCount += Math.floor(analysis.learningObjectives.length / 3);
  
  return Math.max(min, Math.min(max, baseCount));
};

/**
 * Generate questions from concepts
 */
const generateConceptQuestions = (analysis, count, usedConcepts, language) => {
  const questions = [];
  
  for (const concept of analysis.concepts) {
    if (questions.length >= count) break;
    if (usedConcepts.has(concept.text)) continue;
    
    usedConcepts.add(concept.text);
    
    const question = createQuestionFromConcept(concept, analysis, language);
    if (question) questions.push(question);
  }
  
  return questions;
};

/**
 * Create a question from a concept
 */
const createQuestionFromConcept = (concept, analysis, language) => {
  const text = concept.text;
  
  // Determine question type based on concept type
  let questionType = 'multipleChoice';
  let bloomLevel = 'understand';
  
  if (concept.type === 'definition') {
    questionType = 'multipleChoice';
    bloomLevel = 'remember';
  } else if (concept.type === 'process') {
    questionType = 'scenario';
    bloomLevel = 'apply';
  } else if (concept.type === 'principle') {
    questionType = 'trueFalse';
    bloomLevel = 'understand';
  } else if (concept.type === 'rule') {
    questionType = 'multipleChoice';
    bloomLevel = 'apply';
  }

  // Extract key information from the concept
  const keyPart = extractKeyPart(text);
  
  if (questionType === 'multipleChoice') {
    return createMultipleChoiceFromConcept(text, keyPart, bloomLevel, analysis.title);
  } else if (questionType === 'trueFalse') {
    return createTrueFalseFromConcept(text, keyPart, bloomLevel, analysis.title);
  } else if (questionType === 'scenario') {
    return createScenarioFromConcept(text, keyPart, bloomLevel, analysis);
  }
  
  return null;
};

/**
 * Extract key part from a sentence for question creation
 */
const extractKeyPart = (sentence) => {
  // Try to find the subject and predicate
  const parts = sentence.split(/\s+(is|are|means|includes|requires|involves)\s+/i);
  if (parts.length >= 2) {
    return {
      subject: parts[0].trim(),
      verb: parts[1] || 'is',
      predicate: parts.slice(2).join(' ').trim()
    };
  }
  return { subject: sentence, verb: 'is', predicate: '' };
};

/**
 * Create multiple choice question from concept
 */
const createMultipleChoiceFromConcept = (concept, keyPart, bloomLevel, courseTitle) => {
  const question = {
    type: 'multipleChoice',
    bloomLevel,
    points: bloomLevel === 'remember' ? 1 : bloomLevel === 'understand' ? 2 : 3,
    sourceContent: concept,
    question: {
      en: `According to the ${courseTitle.en} course content, which of the following statements is correct?`,
      ar: `وفقاً لمحتوى دورة ${courseTitle.ar}، أي من العبارات التالية صحيحة؟`
    },
    options: [
      {
        id: 'a',
        text: { en: concept, ar: concept },
        isCorrect: true
      },
      {
        id: 'b',
        text: {
          en: generateDistractor(concept, 1),
          ar: generateDistractor(concept, 1)
        },
        isCorrect: false
      },
      {
        id: 'c',
        text: {
          en: generateDistractor(concept, 2),
          ar: generateDistractor(concept, 2)
        },
        isCorrect: false
      },
      {
        id: 'd',
        text: {
          en: generateDistractor(concept, 3),
          ar: generateDistractor(concept, 3)
        },
        isCorrect: false
      }
    ],
    feedback: {
      correct: { en: 'Correct! You understand this concept well.', ar: 'صحيح! أنت تفهم هذا المفهوم جيداً.' },
      incorrect: { en: 'Review this concept in the course material.', ar: 'راجع هذا المفهوم في مادة الدورة.' }
    }
  };

  // Shuffle options
  question.options = shuffleArray(question.options);
  
  return question;
};

/**
 * Generate distractor (wrong answer) from correct answer
 */
const generateDistractor = (correctAnswer, variant) => {
  const modifications = [
    // Variant 1: Negate or reverse
    (text) => {
      if (text.includes(' not ')) return text.replace(' not ', ' ');
      if (text.includes(' always ')) return text.replace(' always ', ' never ');
      if (text.includes(' is ')) return text.replace(' is ', ' is not ');
      return 'The opposite of: ' + text.substring(0, 50) + '...';
    },
    // Variant 2: Change key terms
    (text) => {
      const words = text.split(' ');
      if (words.length > 5) {
        words[Math.floor(words.length / 2)] = 'alternatively';
      }
      return words.join(' ').substring(0, 100);
    },
    // Variant 3: Partial/incomplete
    (text) => {
      const half = Math.floor(text.length / 2);
      return text.substring(0, half) + ' (incomplete information)';
    }
  ];

  const modifier = modifications[(variant - 1) % modifications.length];
  return modifier(correctAnswer);
};

/**
 * Create true/false question from concept
 */
const createTrueFalseFromConcept = (concept, keyPart, bloomLevel, courseTitle) => {
  const isTrue = Math.random() > 0.5;
  
  let statementText = concept;
  if (!isTrue) {
    // Create false statement by negating or modifying
    if (concept.includes(' is ')) {
      statementText = concept.replace(' is ', ' is not ');
    } else if (concept.includes(' are ')) {
      statementText = concept.replace(' are ', ' are not ');
    } else {
      statementText = 'It is incorrect that ' + concept.toLowerCase();
    }
  }

  return {
    type: 'trueFalse',
    bloomLevel,
    points: 1,
    sourceContent: concept,
    question: {
      en: `True or False: ${statementText}`,
      ar: `صح أو خطأ: ${statementText}`
    },
    correctAnswer: isTrue,
    feedback: {
      correct: { en: 'Correct!', ar: 'صحيح!' },
      incorrect: { en: `The statement is ${isTrue ? 'true' : 'false'}. Review the course material.`, ar: `العبارة ${isTrue ? 'صحيحة' : 'خاطئة'}. راجع مادة الدورة.` }
    }
  };
};

/**
 * Create scenario-based question from concept
 */
const createScenarioFromConcept = (concept, keyPart, bloomLevel, analysis) => {
  const contentType = analysis.contentType;
  
  // Generate scenario based on content type
  const scenarios = {
    leadership: `You are leading a team and face a situation where ${keyPart.subject.toLowerCase()} becomes relevant.`,
    technical: `During a project implementation, you encounter a scenario involving ${keyPart.subject.toLowerCase()}.`,
    compliance: `An audit reveals a situation related to ${keyPart.subject.toLowerCase()}.`,
    sales: `A customer interaction requires you to apply knowledge about ${keyPart.subject.toLowerCase()}.`,
    general: `In your workplace, you encounter a situation where ${keyPart.subject.toLowerCase()} applies.`
  };

  const scenario = scenarios[contentType] || scenarios.general;

  return {
    type: 'scenario',
    bloomLevel: 'apply',
    points: 4,
    sourceContent: concept,
    scenario: {
      en: scenario,
      ar: scenario
    },
    question: {
      en: 'What would be the most appropriate action based on the course content?',
      ar: 'ما هو الإجراء الأنسب بناءً على محتوى الدورة؟'
    },
    options: [
      { id: 'a', text: { en: `Apply the principle: ${concept.substring(0, 80)}`, ar: `تطبيق المبدأ: ${concept.substring(0, 80)}` }, isCorrect: true, score: 4 },
      { id: 'b', text: { en: 'Seek additional guidance before taking action', ar: 'طلب توجيه إضافي قبل اتخاذ إجراء' }, isCorrect: false, score: 2 },
      { id: 'c', text: { en: 'Proceed without considering this principle', ar: 'المتابعة دون النظر في هذا المبدأ' }, isCorrect: false, score: 1 },
      { id: 'd', text: { en: 'Delegate the decision to someone else', ar: 'تفويض القرار لشخص آخر' }, isCorrect: false, score: 1 }
    ],
    feedback: {
      en: 'This scenario tests your ability to apply course concepts in real situations.',
      ar: 'يختبر هذا السيناريو قدرتك على تطبيق مفاهيم الدورة في مواقف حقيقية.'
    }
  };
};

/**
 * Generate questions from learning objectives
 */
const generateObjectiveQuestions = (analysis, count, usedConcepts, language) => {
  const questions = [];
  
  for (const objective of analysis.learningObjectives) {
    if (questions.length >= count) break;
    
    const objText = objective.en || objective;
    if (usedConcepts.has(objText)) continue;
    
    usedConcepts.add(objText);
    
    // Detect Bloom's level from objective
    const bloomLevel = detectBloomLevelFromObjective(objText);
    
    questions.push({
      type: 'multipleChoice',
      bloomLevel,
      points: 2,
      sourceContent: objText,
      question: {
        en: `Which of the following best demonstrates the ability to: "${objText}"?`,
        ar: `أي مما يلي يوضح بشكل أفضل القدرة على: "${objText}"؟`
      },
      options: [
        { id: 'a', text: { en: 'Successfully applying the learned concept in practice', ar: 'تطبيق المفهوم المكتسب بنجاح في الممارسة' }, isCorrect: true },
        { id: 'b', text: { en: 'Memorizing the theory without application', ar: 'حفظ النظرية دون تطبيق' }, isCorrect: false },
        { id: 'c', text: { en: 'Avoiding situations that require this skill', ar: 'تجنب المواقف التي تتطلب هذه المهارة' }, isCorrect: false },
        { id: 'd', text: { en: 'Relying solely on others for this task', ar: 'الاعتماد كلياً على الآخرين في هذه المهمة' }, isCorrect: false }
      ],
      feedback: {
        correct: { en: 'Excellent! You understand how to achieve this learning objective.', ar: 'ممتاز! أنت تفهم كيفية تحقيق هدف التعلم هذا.' },
        incorrect: { en: 'Review the learning objective and related content.', ar: 'راجع هدف التعلم والمحتوى ذي الصلة.' }
      }
    });
  }
  
  return questions;
};

/**
 * Detect Bloom's taxonomy level from objective text
 */
const detectBloomLevelFromObjective = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/\b(create|design|develop|formulate|propose|construct)\b/)) return 'create';
  if (lowerText.match(/\b(evaluate|assess|justify|critique|recommend|judge)\b/)) return 'evaluate';
  if (lowerText.match(/\b(analyze|compare|contrast|examine|differentiate)\b/)) return 'analyze';
  if (lowerText.match(/\b(apply|demonstrate|use|implement|solve|execute)\b/)) return 'apply';
  if (lowerText.match(/\b(explain|describe|summarize|interpret|classify)\b/)) return 'understand';
  
  return 'remember';
};

/**
 * Generate questions from key terms
 */
const generateTermQuestions = (analysis, count, usedConcepts, language) => {
  const questions = [];
  
  for (const term of analysis.keyTerms) {
    if (questions.length >= count) break;
    if (usedConcepts.has(term.term)) continue;
    
    usedConcepts.add(term.term);
    
    questions.push({
      type: 'multipleChoice',
      bloomLevel: 'remember',
      points: 1,
      sourceContent: `${term.term}: ${term.definition}`,
      question: {
        en: `What is the correct definition of "${term.term}"?`,
        ar: `ما هو التعريف الصحيح لـ "${term.term}"؟`
      },
      options: [
        { id: 'a', text: { en: term.definition, ar: term.definition }, isCorrect: true },
        { id: 'b', text: { en: generateDistractor(term.definition, 1), ar: generateDistractor(term.definition, 1) }, isCorrect: false },
        { id: 'c', text: { en: generateDistractor(term.definition, 2), ar: generateDistractor(term.definition, 2) }, isCorrect: false },
        { id: 'd', text: { en: 'None of the above', ar: 'لا شيء مما سبق' }, isCorrect: false }
      ],
      feedback: {
        correct: { en: 'Correct! You know this term well.', ar: 'صحيح! أنت تعرف هذا المصطلح جيداً.' },
        incorrect: { en: 'Review the glossary in the course material.', ar: 'راجع المصطلحات في مادة الدورة.' }
      }
    });
  }
  
  return questions;
};

/**
 * Generate questions from key topics
 */
const generateTopicQuestions = (analysis, count, usedConcepts, language) => {
  const questions = [];
  
  for (const topic of analysis.keyTopics) {
    if (questions.length >= count) break;
    if (usedConcepts.has(topic)) continue;
    
    usedConcepts.add(topic);
    
    questions.push({
      type: 'trueFalse',
      bloomLevel: 'understand',
      points: 1,
      sourceContent: topic,
      question: {
        en: `"${topic}" is a key topic covered in this course.`,
        ar: `"${topic}" هو موضوع رئيسي يتم تناوله في هذه الدورة.`
      },
      correctAnswer: true,
      feedback: {
        correct: { en: 'Correct!', ar: 'صحيح!' },
        incorrect: { en: 'This is indeed a key topic from the course.', ar: 'هذا بالفعل موضوع رئيسي من الدورة.' }
      }
    });
  }
  
  return questions;
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

// ==================== MAIN EXPORT ====================

/**
 * Process uploaded file and generate course with assessment
 */
export const processUploadedCourse = async (file, options = {}) => {
  // Step 1: Parse the file
  const parsedContent = await parseUploadedFile(file);
  
  // Step 2: Analyze the content
  const analysis = analyzeContent(parsedContent);
  
  // Step 3: Generate questions
  const questions = generateIntelligentQuestions(analysis, options);
  
  // Step 4: Create course object
  const course = {
    id: `course-${Date.now()}`,
    title: analysis.title,
    description: analysis.description,
    duration: analysis.duration,
    targetAudience: { en: 'General', ar: 'عام' },
    modules: analysis.modules.map((m, idx) => ({
      ...m,
      objectives: analysis.learningObjectives.slice(idx * 3, (idx + 1) * 3)
    })),
    sourceFile: {
      name: file.name,
      type: parsedContent.fileType,
      size: file.size,
      uploadedAt: new Date().toISOString()
    },
    analysis: {
      wordCount: analysis.wordCount,
      difficulty: analysis.difficulty,
      contentType: analysis.contentType,
      language: analysis.language,
      keyTopics: analysis.keyTopics.slice(0, 10),
      objectivesCount: analysis.learningObjectives.length,
      conceptsExtracted: analysis.concepts.length
    },
    createdAt: new Date().toISOString(),
    status: 'draft'
  };

  return {
    course,
    questions,
    analysis
  };
};

export default {
  parseUploadedFile,
  analyzeContent,
  generateIntelligentQuestions,
  processUploadedCourse
};
