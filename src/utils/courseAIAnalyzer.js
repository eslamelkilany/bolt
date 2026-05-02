// AI-Powered Course Content Analyzer
// Generates SMART, COURSE-SPECIFIC questions based on actual course content
// Supports both ENGLISH and ARABIC content extraction and question generation

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ==================== ARABIC LANGUAGE SUPPORT ====================

// Arabic Bloom's taxonomy verbs
const arabicBloomVerbs = {
  remember: ['يعرّف', 'يذكر', 'يسمي', 'يحدد', 'يتعرف', 'يستذكر', 'يصف', 'يعدد', 'يسترجع'],
  understand: ['يفسر', 'يشرح', 'يوضح', 'يلخص', 'يصنف', 'يناقش', 'يترجم', 'يعبر', 'يستنتج'],
  apply: ['يطبق', 'يستخدم', 'ينفذ', 'يوظف', 'يحل', 'يمارس', 'يجرب', 'يستعمل', 'يبرهن'],
  analyze: ['يحلل', 'يقارن', 'يميز', 'يفحص', 'يختبر', 'يفرق', 'يستقصي', 'يبحث', 'يدقق'],
  evaluate: ['يقيّم', 'يحكم', 'يبرر', 'ينقد', 'يوصي', 'يقرر', 'يختار', 'يثمن', 'يراجع'],
  create: ['يصمم', 'يبتكر', 'يطور', 'يخطط', 'يقترح', 'ينشئ', 'يؤلف', 'يبني', 'يركب']
};

// Arabic section headers for detection
const arabicSectionHeaders = {
  title: ['عنوان الدورة', 'اسم الدورة', 'اسم البرنامج', 'عنوان البرنامج', 'الدورة التدريبية'],
  overview: ['نظرة عامة', 'مقدمة', 'وصف الدورة', 'عن الدورة', 'ملخص', 'تمهيد', 'المقدمة'],
  objectives: ['أهداف الدورة', 'الأهداف التعليمية', 'أهداف التعلم', 'الأهداف', 'أهداف البرنامج', 'ماذا ستتعلم', 'بنهاية الدورة', 'سيتمكن المتدرب من', 'سيكون المشارك قادراً على'],
  modules: ['محتوى الدورة', 'محاور الدورة', 'موضوعات الدورة', 'الوحدات', 'المحاور', 'فهرس المحتويات', 'جدول المحتويات', 'الموضوعات'],
  duration: ['مدة الدورة', 'المدة', 'الفترة الزمنية', 'عدد الساعات', 'عدد الأيام'],
  audience: ['الفئة المستهدفة', 'المستهدفون', 'لمن هذه الدورة', 'الجمهور المستهدف']
};

// Arabic question templates
const arabicQuestionTemplates = {
  objective: {
    mcq: 'وفقاً لأهداف دورة "{title}"، أي مما يلي صحيح؟',
    trueFalse: 'صح أم خطأ: من أهداف هذه الدورة {objective}',
    scenario: 'بعد إتمام دورة "{title}"، ما هو أفضل أسلوب لتطبيق ما تعلمته؟'
  },
  module: {
    mcq: 'أي من المواضيع التالية يتم تناولها في دورة "{title}"؟',
    trueFalse: 'صح أم خطأ: يتضمن محتوى الدورة موضوع "{topic}"'
  },
  definition: {
    mcq: 'ما هو التعريف الصحيح لـ "{term}"؟'
  },
  fact: {
    trueFalse: 'صح أم خطأ: {fact}',
    mcq: 'وفقاً لمحتوى الدورة، أي العبارات التالية صحيحة؟'
  }
};

/**
 * Detect if text is primarily Arabic
 */
const detectLanguage = (text) => {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return arabicChars > latinChars ? 'ar' : 'en';
};

/**
 * Get all Arabic Bloom's verbs as a single regex pattern
 */
const getArabicBloomVerbsPattern = () => {
  const allVerbs = Object.values(arabicBloomVerbs).flat();
  return allVerbs.join('|');
};

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

// ==================== BILINGUAL CONTENT EXTRACTION ====================

/**
 * Extract course-specific content for question generation
 * Supports both English and Arabic
 */
export const extractCourseContent = (text) => {
  // Detect primary language
  const language = detectLanguage(text);
  
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
    comparisons: [],
    language: language
  };

  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);

  if (language === 'ar') {
    // Arabic content extraction
    content.title = extractArabicTitle(lines, cleanText);
    content.overview = extractArabicOverview(cleanText);
    content.objectives = extractArabicObjectives(cleanText, lines);
    content.modules = extractArabicModules(cleanText, lines);
    content.keyFacts = extractArabicFacts(cleanText);
    content.definitions = extractArabicDefinitions(cleanText);
    content.processes = extractArabicProcesses(cleanText);
    content.principles = extractArabicPrinciples(cleanText);
  } else {
    // English content extraction
    content.title = extractEnglishTitle(lines, cleanText);
    content.overview = extractEnglishOverview(cleanText);
    content.objectives = extractEnglishObjectives(cleanText, lines);
    content.modules = extractEnglishModules(cleanText, lines);
    content.keyFacts = extractEnglishFacts(cleanText);
    content.definitions = extractEnglishDefinitions(cleanText);
    content.processes = extractEnglishProcesses(cleanText);
    content.principles = extractEnglishPrinciples(cleanText);
  }

  return content;
};

// ==================== ARABIC EXTRACTION FUNCTIONS ====================

/**
 * Extract Arabic course title
 */
const extractArabicTitle = (lines, text) => {
  // Look for explicit Arabic title patterns
  for (const header of arabicSectionHeaders.title) {
    const pattern = new RegExp(`${header}[\\s:]*([^\\n]{5,100})`, 'i');
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Look for title in first few lines
  for (const line of lines.slice(0, 5)) {
    // Skip very short lines or lines that look like page numbers
    if (line.length >= 10 && line.length <= 150 && !line.match(/^\d+$/) && !line.match(/^صفحة/)) {
      // Check if it contains Arabic characters
      if (/[\u0600-\u06FF]/.test(line)) {
        return line;
      }
    }
  }

  return 'دورة تدريبية';
};

/**
 * Extract Arabic course overview
 */
const extractArabicOverview = (text) => {
  // Look for overview section
  for (const header of arabicSectionHeaders.overview) {
    const pattern = new RegExp(`${header}[\\s:]*([^]+?)(?=${arabicSectionHeaders.objectives.join('|')}|${arabicSectionHeaders.modules.join('|')}|$)`, 'i');
    const match = text.match(pattern);
    if (match && match[1]) {
      const overview = match[1].trim().substring(0, 500);
      if (overview.length > 20) {
        return overview;
      }
    }
  }

  // Try to find introductory paragraph
  const introPatterns = [
    /(?:هذه الدورة|هذا البرنامج|تهدف هذه الدورة|يهدف هذا البرنامج)([^.]+\.[^.]*\.?)/,
    /(?:تقدم هذه الدورة|يقدم هذا البرنامج)([^.]+\.[^.]*\.?)/
  ];

  for (const pattern of introPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim().substring(0, 500);
    }
  }

  return '';
};

/**
 * Extract Arabic learning objectives
 */
const extractArabicObjectives = (text, lines) => {
  const objectives = [];
  const arabicVerbsPattern = getArabicBloomVerbsPattern();

  // Pattern 1: Look for objectives section
  for (const header of arabicSectionHeaders.objectives) {
    const sectionPattern = new RegExp(`${header}[\\s:]*([^]+?)(?=${arabicSectionHeaders.modules.join('|')}|${arabicSectionHeaders.duration.join('|')}|${arabicSectionHeaders.audience.join('|')}|$)`, 'i');
    const sectionMatch = text.match(sectionPattern);
    
    if (sectionMatch && sectionMatch[1]) {
      const sectionText = sectionMatch[1];
      
      // Extract bullet points or numbered items
      const bulletPatterns = [
        /(?:^|[\n•●○►▪\-\d+\.])[\s]*([\u0600-\u06FF][^\n]{10,150})/gm,
        new RegExp(`(?:^|[\\n•●○►▪\\-\\d+\\.])\\s*((?:${arabicVerbsPattern})[^\\n]{5,150})`, 'gm')
      ];

      for (const pattern of bulletPatterns) {
        let match;
        while ((match = pattern.exec(sectionText)) !== null) {
          const obj = match[1].trim().replace(/^[•●○►▪\-\d+\.]+\s*/, '');
          if (obj.length > 10 && !objectives.includes(obj)) {
            objectives.push(obj);
          }
        }
      }
    }
  }

  // Pattern 2: Look for verb-starting sentences throughout text
  const verbPattern = new RegExp(`(?:^|[.،])\\s*((?:${arabicVerbsPattern})\\s+[^.،]{10,100}[.،])`, 'gm');
  let match;
  while ((match = verbPattern.exec(text)) !== null) {
    const obj = match[1].trim();
    if (obj.length > 10 && !objectives.includes(obj)) {
      objectives.push(obj);
    }
  }

  // Pattern 3: "سيتمكن المتدرب من" or "سيكون قادراً على" patterns
  const abilityPatterns = [
    /سيتمكن (?:المتدرب|المشارك|المتعلم) من\s+([^.،]+[.،])/g,
    /سيكون (?:المتدرب|المشارك|قادراً) على\s+([^.،]+[.،])/g,
    /يستطيع (?:المتدرب|المشارك) أن\s+([^.،]+[.،])/g
  ];

  for (const pattern of abilityPatterns) {
    while ((match = pattern.exec(text)) !== null) {
      const obj = match[1].trim();
      if (obj.length > 10 && !objectives.includes(obj)) {
        objectives.push(obj);
      }
    }
  }

  return objectives.slice(0, 20);
};

/**
 * Extract Arabic modules and topics
 */
const extractArabicModules = (text, lines) => {
  const modules = [];

  // Pattern 1: Look for modules section
  for (const header of arabicSectionHeaders.modules) {
    const sectionPattern = new RegExp(`${header}[\\s:]*([^]+?)(?=${arabicSectionHeaders.duration.join('|')}|${arabicSectionHeaders.audience.join('|')}|$)`, 'i');
    const sectionMatch = text.match(sectionPattern);
    
    if (sectionMatch && sectionMatch[1]) {
      const sectionText = sectionMatch[1];
      
      // Extract items
      const itemPatterns = [
        /(?:^|[\n•●○►▪])[\s]*([\u0600-\u06FF][^\n]{5,100})/gm,
        /(?:الوحدة|المحور|الموضوع|الجلسة|اليوم)\s*(?:الأول|الثاني|الثالث|الرابع|الخامس|\d+)[:\s]+([^\n]{5,100})/gi,
        /(\d+)[.\-)\s]+([\u0600-\u06FF][^\n]{5,100})/gm
      ];

      for (const pattern of itemPatterns) {
        let match;
        while ((match = pattern.exec(sectionText)) !== null) {
          const title = (match[2] || match[1]).trim().replace(/^[•●○►▪\-\d+\.]+\s*/, '');
          if (title.length > 5 && title.length < 150 && !modules.some(m => m.title === title)) {
            modules.push({
              number: String(modules.length + 1),
              title: title,
              topics: []
            });
          }
        }
      }
    }
  }

  // Pattern 2: Look for numbered sections in lines
  if (modules.length === 0) {
    const numberPattern = /^(\d+)[.\-)\s]+([\u0600-\u06FF][^\n]{5,100})/;
    for (const line of lines) {
      const match = line.match(numberPattern);
      if (match && match[2]) {
        const title = match[2].trim();
        if (title.length > 5 && !modules.some(m => m.title === title)) {
          modules.push({
            number: match[1],
            title: title,
            topics: []
          });
        }
      }
    }
  }

  return modules.slice(0, 15);
};

/**
 * Extract Arabic key facts
 */
const extractArabicFacts = (text) => {
  const facts = [];
  
  // Look for declarative statements
  const factPatterns = [
    /([\u0600-\u06FF][^.،]{10,50})\s+(?:هو|هي|يعني|تعني|يشير إلى|تشير إلى)\s+([^.،]{10,100}[.،])/g,
    /(?:من أهم|من أبرز|يعتبر|تعتبر|يُعد|تُعد)\s+([^.،]{10,100}[.،])/g,
    /(?:يجب|ينبغي|لا بد من|من الضروري)\s+([^.،]{10,100}[.،])/g
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
 * Extract Arabic definitions
 */
const extractArabicDefinitions = (text) => {
  const definitions = [];
  
  const defPatterns = [
    /([\u0600-\u06FF\s]{3,40})(?:\s*[:\-–]\s*|\s+هو\s+|\s+هي\s+|\s+يُعرَّف بأنه\s+|\s+تُعرَّف بأنها\s+)([\u0600-\u06FF][^.،]{20,150}[.،])/g,
    /(?:تعريف|معنى|مفهوم)\s+([\u0600-\u06FF\s]{3,30})[:\s]+([\u0600-\u06FF][^.،]{20,150}[.،])/g
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
 * Extract Arabic processes
 */
const extractArabicProcesses = (text) => {
  const processes = [];
  
  const processPatterns = [
    /(?:الخطوة|المرحلة)\s*(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|\d+)[:\s]+([^\n]{10,100})/gi,
    /(?:أولاً|ثانياً|ثالثاً|رابعاً|خامساً|أخيراً)[،:\s]+([^.،]{10,100}[.،])/gi,
    /(?:يبدأ|نبدأ|ابدأ)\s+(?:بـ|من)\s+([^.،]{10,100}[.،])/gi
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
 * Extract Arabic principles
 */
const extractArabicPrinciples = (text) => {
  const principles = [];
  
  const principlePatterns = [
    /(?:مبدأ|قاعدة|أساس|نظرية)\s+([\u0600-\u06FF][^.،]{5,50})\s+(?:ينص على|تنص على|يقول|تقول)\s+([^.،]{10,100}[.،])/gi,
    /(?:من المهم|من الضروري|يجب مراعاة|لا بد من)\s+([^.،]{10,100}[.،])/gi,
    /(?:القاعدة الذهبية|المبدأ الأساسي|الأساس)\s+(?:هو|هي)\s+([^.،]{10,100}[.،])/gi
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

// ==================== ENGLISH EXTRACTION FUNCTIONS ====================

/**
 * Extract English course title
 */
const extractEnglishTitle = (lines, text) => {
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

  for (const line of lines.slice(0, 5)) {
    if (line.length >= 10 && line.length <= 100 && !line.match(/^(page|slide|\d+|table of contents)/i)) {
      return line;
    }
  }

  return 'Training Course';
};

/**
 * Extract English course overview
 */
const extractEnglishOverview = (text) => {
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
 * Extract English learning objectives
 */
const extractEnglishObjectives = (text, lines) => {
  const objectives = [];
  const bloomVerbs = 'define|describe|explain|identify|list|name|recall|recognize|state|understand|apply|demonstrate|implement|use|solve|analyze|compare|contrast|differentiate|examine|evaluate|assess|critique|justify|create|design|develop|formulate|plan|propose';
  
  const objectivesSection = text.match(
    /(?:learning\s*objectives?|course\s*objectives?|training\s*objectives?|by\s*the\s*end\s*of\s*this\s*(?:course|training)|after\s*(?:completing|this)\s*(?:course|training)|you\s*will\s*(?:be\s*able\s*to|learn))[\s:]*([^]+?)(?=(?:course\s*(?:content|outline|modules|agenda)|target\s*audience|prerequisites|methodology|$))/i
  );

  if (objectivesSection && objectivesSection[1]) {
    const sectionText = objectivesSection[1];
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

  return objectives.slice(0, 20);
};

/**
 * Extract English modules
 */
const extractEnglishModules = (text, lines) => {
  const modules = [];
  
  const sectionPatterns = [
    /(?:module|unit|section|chapter|part|session|day)\s*(\d+|[IVX]+)[\s:.\-]+([^\n]{5,100})/gi,
    /(\d+)\.\s*([A-Z][^\n]{10,100})/gm
  ];

  for (const pattern of sectionPatterns) {
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

  return modules.slice(0, 15);
};

/**
 * Extract English key facts
 */
const extractEnglishFacts = (text) => {
  const facts = [];
  
  const factPatterns = [
    /([A-Z][^.]{5,30})\s+(?:is|are|refers to|means|represents)\s+([^.]{10,100})\./g,
    /(?:the\s+)?(?:key|main|primary|essential|critical|important)\s+([^.]{10,80})\s+(?:is|are|include[s]?)\s+([^.]{10,100})\./gi,
    /([^.]*\d+\s*(?:%|percent|percentage)[^.]*)\./gi
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
 * Extract English definitions
 */
const extractEnglishDefinitions = (text) => {
  const definitions = [];
  
  const defPatterns = [
    /([A-Z][a-zA-Z\s]{2,40})(?:\s+is\s+defined\s+as|\s*[-:–]\s*)([^.]{20,150})\./g,
    /([A-Z][a-zA-Z\s]{2,30})[\s]*[:–-][\s]*([^.\n]{20,150})/g
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
 * Extract English processes
 */
const extractEnglishProcesses = (text) => {
  const processes = [];
  
  const processPatterns = [
    /(?:step|phase)\s*(\d+)[\s:.\-]+([^\n]{10,100})/gi,
    /(?:first|second|third|fourth|fifth|finally|next|then)[\s,]+([^.]{10,100})\./gi
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
 * Extract English principles
 */
const extractEnglishPrinciples = (text) => {
  const principles = [];
  
  const principlePatterns = [
    /(?:the\s+)?(?:principle|rule|law|theory|concept)\s+(?:of\s+)?([^.]{5,50})\s+(?:states?|suggests?|indicates?)\s+(?:that\s+)?([^.]{10,100})\./gi,
    /(?:it\s+is\s+important\s+to|always|never|must|should)\s+([^.]{10,100})\./gi
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

// ==================== BILINGUAL QUESTION GENERATION ====================

/**
 * Generate smart, course-specific questions (bilingual support)
 */
export const generateSmartQuestions = (courseContent, config = {}) => {
  const {
    minQuestions = 10,
    maxQuestions = 20
  } = config;

  const contentLanguage = courseContent.language || 'en';
  const questions = [];
  const usedContent = new Set();

  // 1. Generate questions from Learning Objectives (highest priority)
  const objectiveQuestions = generateObjectiveQuestions(courseContent.objectives, courseContent.title, contentLanguage, usedContent);
  questions.push(...objectiveQuestions);

  // 2. Generate questions from Modules/Topics
  const moduleQuestions = generateModuleQuestions(courseContent.modules, courseContent.title, contentLanguage, usedContent);
  questions.push(...moduleQuestions);

  // 3. Generate questions from Definitions
  const definitionQuestions = generateDefinitionQuestions(courseContent.definitions, contentLanguage, usedContent);
  questions.push(...definitionQuestions);

  // 4. Generate questions from Key Facts
  const factQuestions = generateFactQuestions(courseContent.keyFacts, courseContent.title, contentLanguage, usedContent);
  questions.push(...factQuestions);

  // 5. Generate questions from Processes
  const processQuestions = generateProcessQuestions(courseContent.processes, contentLanguage, usedContent);
  questions.push(...processQuestions);

  // 6. Generate questions from Principles
  const principleQuestions = generatePrincipleQuestions(courseContent.principles, contentLanguage, usedContent);
  questions.push(...principleQuestions);

  // Ensure minimum questions
  if (questions.length < minQuestions && courseContent.overview) {
    const overviewQuestions = generateOverviewQuestions(courseContent.overview, courseContent.title, contentLanguage, minQuestions - questions.length);
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
      courseName: courseContent.title,
      contentLanguage: contentLanguage
    }
  };
};

/**
 * Generate questions from objectives (bilingual)
 */
const generateObjectiveQuestions = (objectives, courseTitle, language, usedContent) => {
  const questions = [];

  for (const objective of objectives) {
    if (usedContent.has(objective)) continue;
    usedContent.add(objective);

    const bloomLevel = detectBloomLevel(objective, language);
    const questionType = Math.random() > 0.5 ? 'mcq' : 'trueFalse';

    if (questionType === 'mcq') {
      questions.push(createObjectiveMCQ(objective, courseTitle, bloomLevel, language));
    } else {
      questions.push(createObjectiveTrueFalse(objective, courseTitle, bloomLevel, language));
    }
  }

  return questions;
};

/**
 * Create MCQ from objective (bilingual)
 */
const createObjectiveMCQ = (objective, courseTitle, bloomLevel, language) => {
  const cleanObjective = objective.replace(/[.،]$/, '');
  
  if (language === 'ar') {
    return {
      type: 'multipleChoice',
      bloomLevel,
      points: bloomLevel === 'remember' ? 1 : 2,
      source: 'objective',
      sourceContent: objective,
      question: {
        en: `According to the course objectives, which statement is correct?`,
        ar: `وفقاً لأهداف الدورة، أي العبارات التالية صحيحة؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: {
            en: `Participants will be able to: ${cleanObjective}`,
            ar: `سيتمكن المشاركون من: ${cleanObjective}`
          },
          isCorrect: true
        },
        {
          id: 'b',
          text: {
            en: `This is optional and not required`,
            ar: `هذا اختياري وغير مطلوب`
          },
          isCorrect: false
        },
        {
          id: 'c',
          text: {
            en: `Only for advanced participants`,
            ar: `للمشاركين المتقدمين فقط`
          },
          isCorrect: false
        },
        {
          id: 'd',
          text: {
            en: `Not covered in this course`,
            ar: `غير مشمول في هذه الدورة`
          },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: {
          en: `Correct! This is a key learning objective.`,
          ar: `صحيح! هذا هدف تعليمي رئيسي.`
        },
        incorrect: {
          en: `This learning objective is from the course content.`,
          ar: `هذا الهدف التعليمي من محتوى الدورة.`
        }
      }
    };
  }

  // English version
  return {
    type: 'multipleChoice',
    bloomLevel,
    points: bloomLevel === 'remember' ? 1 : 2,
    source: 'objective',
    sourceContent: objective,
    question: {
      en: `According to the course "${courseTitle}", what is expected regarding: "${cleanObjective}"?`,
      ar: `وفقاً للدورة، ما المتوقع فيما يتعلق بـ: "${cleanObjective}"؟`
    },
    options: shuffleArray([
      {
        id: 'a',
        text: {
          en: `Participants will be able to ${cleanObjective.toLowerCase()}`,
          ar: `سيتمكن المشاركون من تحقيق هذا الهدف`
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
          ar: `المتعلمون المتقدمون فقط يحتاجون لتحقيق هذا`
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
        ar: `صحيح! هذا هدف تعليمي رئيسي في الدورة.`
      },
      incorrect: {
        en: `This learning objective is directly from the course content.`,
        ar: `هذا الهدف التعليمي مأخوذ مباشرة من محتوى الدورة.`
      }
    }
  };
};

/**
 * Create True/False from objective (bilingual)
 */
const createObjectiveTrueFalse = (objective, courseTitle, bloomLevel, language) => {
  const isTrue = Math.random() > 0.3;
  const cleanObjective = objective.replace(/[.،]$/, '');
  
  let questionText;
  if (language === 'ar') {
    questionText = isTrue
      ? `من أهداف هذه الدورة: ${cleanObjective}`
      : `ليس من أهداف هذه الدورة: ${cleanObjective}`;
  } else {
    questionText = isTrue
      ? `A learning objective of this course is to: ${cleanObjective.toLowerCase()}`
      : `This course does NOT aim to: ${cleanObjective.toLowerCase()}`;
  }

  return {
    type: 'trueFalse',
    bloomLevel,
    points: 1,
    source: 'objective',
    sourceContent: objective,
    question: {
      en: `True or False: ${language === 'en' ? questionText : `A course objective is: ${cleanObjective}`}`,
      ar: `صح أم خطأ: ${language === 'ar' ? questionText : `من أهداف الدورة: ${cleanObjective}`}`
    },
    correctAnswer: isTrue,
    feedback: {
      correct: { en: 'Correct!', ar: 'صحيح!' },
      incorrect: {
        en: `The correct answer is ${isTrue ? 'True' : 'False'}. Review the course objectives.`,
        ar: `الإجابة الصحيحة هي ${isTrue ? 'صح' : 'خطأ'}. راجع أهداف الدورة.`
      }
    }
  };
};

/**
 * Generate questions from modules (bilingual)
 */
const generateModuleQuestions = (modules, courseTitle, language, usedContent) => {
  const questions = [];

  for (const module of modules) {
    if (usedContent.has(module.title)) continue;
    usedContent.add(module.title);

    questions.push({
      type: 'multipleChoice',
      bloomLevel: 'remember',
      points: 1,
      source: 'module',
      sourceContent: module.title,
      question: {
        en: `Which topic is covered in this training course?`,
        ar: `أي من المواضيع التالية يتم تناولها في هذه الدورة التدريبية؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: { en: module.title, ar: module.title },
          isCorrect: true
        },
        {
          id: 'b',
          text: { 
            en: 'Advanced quantum physics', 
            ar: 'فيزياء الكم المتقدمة' 
          },
          isCorrect: false
        },
        {
          id: 'c',
          text: { 
            en: 'Medieval European history', 
            ar: 'تاريخ أوروبا في العصور الوسطى' 
          },
          isCorrect: false
        },
        {
          id: 'd',
          text: { 
            en: 'Marine biology fundamentals', 
            ar: 'أساسيات علم الأحياء البحرية' 
          },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { 
          en: 'Correct! This is a key topic in the course.', 
          ar: 'صحيح! هذا موضوع رئيسي في الدورة.' 
        },
        incorrect: { 
          en: 'Review the course content and modules.', 
          ar: 'راجع محتوى الدورة والوحدات.' 
        }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from definitions (bilingual)
 */
const generateDefinitionQuestions = (definitions, language, usedContent) => {
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
            en: `The opposite of ${def.term}`,
            ar: `عكس ${def.term}`
          },
          isCorrect: false
        },
        {
          id: 'c',
          text: {
            en: `An unrelated concept`,
            ar: `مفهوم غير ذي صلة`
          },
          isCorrect: false
        },
        {
          id: 'd',
          text: { 
            en: 'None of the above', 
            ar: 'لا شيء مما سبق' 
          },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { 
          en: 'Excellent! You understand this key term.', 
          ar: 'ممتاز! أنت تفهم هذا المصطلح الرئيسي.' 
        },
        incorrect: { 
          en: 'Review the definition in the course material.', 
          ar: 'راجع التعريف في مادة الدورة.' 
        }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from facts (bilingual)
 */
const generateFactQuestions = (facts, courseTitle, language, usedContent) => {
  const questions = [];

  for (const fact of facts) {
    if (usedContent.has(fact)) continue;
    usedContent.add(fact);

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
        incorrect: { 
          en: 'This statement is from the course content.', 
          ar: 'هذه العبارة من محتوى الدورة.' 
        }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from processes (bilingual)
 */
const generateProcessQuestions = (processes, language, usedContent) => {
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
        en: `Which is a correct step or process from the course?`,
        ar: `أي مما يلي خطوة أو عملية صحيحة من الدورة؟`
      },
      options: shuffleArray([
        {
          id: 'a',
          text: { en: process, ar: process },
          isCorrect: true
        },
        {
          id: 'b',
          text: { 
            en: 'Skip all procedures', 
            ar: 'تخطي جميع الإجراءات' 
          },
          isCorrect: false
        },
        {
          id: 'c',
          text: { 
            en: 'Do the opposite of recommendations', 
            ar: 'فعل عكس التوصيات' 
          },
          isCorrect: false
        },
        {
          id: 'd',
          text: { 
            en: 'This is not covered in the course', 
            ar: 'هذا غير مشمول في الدورة' 
          },
          isCorrect: false
        }
      ]),
      feedback: {
        correct: { 
          en: 'Correct! You understand the process.', 
          ar: 'صحيح! أنت تفهم العملية.' 
        },
        incorrect: { 
          en: 'Review the processes in the course.', 
          ar: 'راجع العمليات في الدورة.' 
        }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from principles (bilingual)
 */
const generatePrincipleQuestions = (principles, language, usedContent) => {
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
        correct: { 
          en: 'Correct! This is a key principle from the course.', 
          ar: 'صحيح! هذا مبدأ رئيسي من الدورة.' 
        },
        incorrect: { 
          en: 'This principle is taught in the course.', 
          ar: 'هذا المبدأ يُدرس في الدورة.' 
        }
      }
    });
  }

  return questions;
};

/**
 * Generate questions from overview (bilingual)
 */
const generateOverviewQuestions = (overview, courseTitle, language, count) => {
  const questions = [];
  const sentences = overview.match(/[^.،!?]+[.،!?]+/g) || [];

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
        incorrect: { 
          en: 'This is stated in the course overview.', 
          ar: 'هذا مذكور في نظرة عامة على الدورة.' 
        }
      }
    });
  }

  return questions;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Detect Bloom's level from text (bilingual)
 */
const detectBloomLevel = (text, language) => {
  const lowerText = text.toLowerCase();
  
  if (language === 'ar') {
    for (const [level, verbs] of Object.entries(arabicBloomVerbs)) {
      for (const verb of verbs) {
        if (text.includes(verb)) {
          return level;
        }
      }
    }
  } else {
    const levels = {
      create: ['create', 'design', 'develop', 'formulate', 'propose', 'construct', 'plan'],
      evaluate: ['evaluate', 'assess', 'justify', 'critique', 'recommend', 'judge'],
      analyze: ['analyze', 'compare', 'contrast', 'examine', 'differentiate', 'distinguish'],
      apply: ['apply', 'demonstrate', 'use', 'implement', 'solve', 'execute', 'practice'],
      understand: ['explain', 'describe', 'summarize', 'interpret', 'classify', 'discuss'],
      remember: ['define', 'list', 'recall', 'identify', 'name', 'state', 'label']
    };

    for (const [level, verbs] of Object.entries(levels)) {
      for (const verb of verbs) {
        if (lowerText.includes(verb)) {
          return level;
        }
      }
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
 * Process uploaded course file and generate smart assessment (bilingual)
 */
export const processUploadedCourse = async (file, options = {}) => {
  try {
    // Step 1: Parse the file
    const parsedContent = await parseUploadedFile(file);
    
    if (!parsedContent.text || parsedContent.text.length < 100) {
      throw new Error('The uploaded file does not contain enough text content to generate an assessment. / الملف المرفوع لا يحتوي على محتوى نصي كافٍ لإنشاء تقييم.');
    }

    // Step 2: Extract course-specific content (auto-detects language)
    const courseContent = extractCourseContent(parsedContent.text);

    // Step 3: Generate smart, course-specific questions
    const questions = generateSmartQuestions(courseContent, {
      minQuestions: options.minQuestions || 10,
      maxQuestions: options.maxQuestions || 20
    });

    // Step 4: Create course object
    const course = {
      id: `course-${Date.now()}`,
      title: {
        en: courseContent.language === 'ar' ? courseContent.title : courseContent.title,
        ar: courseContent.language === 'ar' ? courseContent.title : courseContent.title
      },
      description: {
        en: courseContent.overview || 'A comprehensive training course.',
        ar: courseContent.overview || 'دورة تدريبية شاملة.'
      },
      modules: courseContent.modules.map((m, idx) => ({
        id: `module-${idx + 1}`,
        title: { en: m.title, ar: m.title },
        topics: (m.topics || []).map(t => ({ en: t, ar: t }))
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
        questionsGenerated: questions.all.length,
        contentLanguage: courseContent.language
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
        postTestQuestions: questions.postTest.length,
        contentLanguage: courseContent.language
      }
    };

  } catch (error) {
    console.error('Course processing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process the course file. / فشل في معالجة ملف الدورة.'
    };
  }
};

export default {
  parseUploadedFile,
  extractCourseContent,
  generateSmartQuestions,
  processUploadedCourse
};
