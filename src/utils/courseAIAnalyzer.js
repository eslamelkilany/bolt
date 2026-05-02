// AI-Powered Course Content Analyzer
// Uses LLM (GPT) to truly UNDERSTAND course content
// Supports both English and Arabic content

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ==================== API CONFIGURATION ====================

// GenSpark LLM API configuration
const GENSPARK_API_BASE = 'https://www.genspark.ai/api/llm_proxy/v1';
const LLM_MODEL = 'gpt-5';

/**
 * Call LLM API directly for course analysis
 */
const callLLMAPI = async (systemPrompt, userPrompt, maxTokens = 4000) => {
  // Try Cloudflare function first, then fallback to direct API
  try {
    const response = await fetch('/api/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'direct',
        systemPrompt,
        userPrompt,
        maxTokens
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (e) {
    console.log('Cloudflare function not available, using fallback');
  }

  // If Cloudflare function fails, throw error with helpful message
  throw new Error('AI service temporarily unavailable. Please ensure the API is configured.');
};

/**
 * Parse JSON from LLM response safely
 */
const parseJSONResponse = (response) => {
  let cleanResponse = response.trim();
  
  // Remove markdown code blocks
  if (cleanResponse.startsWith('```json')) {
    cleanResponse = cleanResponse.slice(7);
  }
  if (cleanResponse.startsWith('```')) {
    cleanResponse = cleanResponse.slice(3);
  }
  if (cleanResponse.endsWith('```')) {
    cleanResponse = cleanResponse.slice(0, -3);
  }
  
  // Find JSON array or object
  const jsonMatch = cleanResponse.match(/[\[{][\s\S]*[\]}]/);
  if (jsonMatch) {
    cleanResponse = jsonMatch[0];
  }
  
  return JSON.parse(cleanResponse.trim());
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

// ==================== AI ANALYSIS ====================

/**
 * Detect language from text
 */
const detectLanguage = (text) => {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return arabicChars > latinChars ? 'ar' : 'en';
};

/**
 * Analyze course content with AI
 */
const analyzeCourseContent = async (courseText) => {
  const maxLength = 15000;
  const truncatedText = courseText.length > maxLength 
    ? courseText.substring(0, maxLength) + '\n\n[Content truncated...]'
    : courseText;

  const detectedLang = detectLanguage(courseText);

  const systemPrompt = `You are an expert instructional designer and course content analyst. Your task is to analyze training course content and extract the most important educational information.

CRITICAL INSTRUCTIONS:
1. Identify the MAIN TOPIC/SUBJECT of the course
2. Extract LEARNING OBJECTIVES (what the learner will be able to do after completing the course)
3. Identify KEY CONCEPTS, DEFINITIONS, and IMPORTANT FACTS
4. Detect MODULES or SECTIONS of the course
5. Detect the language (Arabic or English) and respond in THE SAME LANGUAGE as the content

Respond ONLY with valid JSON (no markdown code blocks):
{
  "language": "en" or "ar",
  "title": "Main course title or topic",
  "description": "Brief description of what the course covers (2-3 sentences)",
  "duration": "Estimated duration if mentioned",
  "objectives": ["Learning objective 1", "Learning objective 2", ...],
  "modules": [
    {"title": "Module/Section name", "keyPoints": ["Key point 1", "Key point 2"]}
  ],
  "keyConcepts": [
    {"term": "Concept name", "definition": "What it means", "importance": "Why it matters"}
  ],
  "skills": ["Skill 1", "Skill 2"],
  "targetAudience": "Who this course is designed for",
  "keyFacts": ["Important fact 1", "Important fact 2"],
  "procedures": ["Step-by-step procedure if any"]
}`;

  const userPrompt = `Analyze this training course content carefully. Extract all educational information including:
- The main title/topic
- Learning objectives (what learners will be able to do)
- Modules or sections
- Key concepts and definitions
- Important facts and procedures
- Skills being taught

The content appears to be in ${detectedLang === 'ar' ? 'Arabic' : 'English'}. Respond in the SAME language.

COURSE CONTENT:
${truncatedText}

Respond with JSON only, no markdown.`;

  try {
    const response = await callLLMAPI(systemPrompt, userPrompt, 3000);
    return parseJSONResponse(response);
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Return basic fallback
    return {
      language: detectedLang,
      title: extractBasicTitle(courseText),
      description: '',
      objectives: [],
      modules: [],
      keyConcepts: [],
      skills: [],
      targetAudience: '',
      keyFacts: [],
      procedures: []
    };
  }
};

/**
 * Generate questions with AI based on course analysis
 */
const generateQuestionsWithAI = async (analysis, courseText, config) => {
  const { minQuestions = 10, maxQuestions = 20 } = config || {};
  const language = analysis.language || 'en';
  const targetCount = Math.min(maxQuestions, Math.max(minQuestions, 15));

  const maxTextLength = 12000;
  const truncatedText = courseText.length > maxTextLength
    ? courseText.substring(0, maxTextLength)
    : courseText;

  // Build context from analysis
  const courseContext = `
COURSE TITLE: ${analysis.title}
DESCRIPTION: ${analysis.description || 'Training course'}
LEARNING OBJECTIVES: ${(analysis.objectives || []).join('; ')}
MODULES: ${(analysis.modules || []).map(m => `${m.title}: ${(m.keyPoints || []).join(', ')}`).join('; ')}
KEY CONCEPTS: ${(analysis.keyConcepts || []).map(c => `${c.term}: ${c.definition}`).join('; ')}
KEY FACTS: ${(analysis.keyFacts || []).join('; ')}
SKILLS: ${(analysis.skills || []).join(', ')}
`;

  const systemPrompt = `You are an expert assessment designer specializing in creating educational assessments. Your task is to create questions that TEST REAL UNDERSTANDING of the course content.

CRITICAL RULES:
1. Questions MUST be directly based on the SPECIFIC course content provided
2. Questions should test UNDERSTANDING and APPLICATION, not just memorization
3. Each question MUST reference specific content from the course
4. Mix question types: Multiple Choice (MCQ), True/False, and Scenario-based
5. Generate questions in ${language === 'ar' ? 'Arabic (العربية)' : 'English'}
6. Cover different cognitive levels (remember, understand, apply, analyze)

QUESTION FORMATS:
1. MCQ: 4 options, exactly ONE correct answer
2. True/False: Clear statement that is definitively true or false based on course content
3. Scenario: Real-world situation applying course knowledge

Respond with a JSON array ONLY (no markdown):
[
  {
    "type": "mcq",
    "question": "Question testing specific course content",
    "options": [
      {"id": "a", "text": "Option A", "isCorrect": false},
      {"id": "b", "text": "Correct option", "isCorrect": true},
      {"id": "c", "text": "Option C", "isCorrect": false},
      {"id": "d", "text": "Option D", "isCorrect": false}
    ],
    "explanation": "Why this answer is correct based on course content",
    "bloomLevel": "understand",
    "topic": "Related topic from course"
  },
  {
    "type": "trueFalse",
    "question": "Statement about course content",
    "correctAnswer": true,
    "explanation": "Why this is true/false based on course content",
    "bloomLevel": "remember",
    "topic": "Related topic"
  },
  {
    "type": "scenario",
    "scenario": "Real-world situation description",
    "question": "What should the person do based on course knowledge?",
    "options": [
      {"id": "a", "text": "Best answer", "isCorrect": true, "score": 4},
      {"id": "b", "text": "Acceptable answer", "isCorrect": false, "score": 2},
      {"id": "c", "text": "Poor answer", "isCorrect": false, "score": 1},
      {"id": "d", "text": "Wrong answer", "isCorrect": false, "score": 0}
    ],
    "explanation": "Why this is the best approach",
    "bloomLevel": "apply",
    "topic": "Related topic"
  }
]`;

  const userPrompt = `Create ${targetCount} assessment questions for this course. The questions MUST be based on the ACTUAL CONTENT provided.

${courseContext}

FULL COURSE CONTENT FOR REFERENCE:
${truncatedText}

REQUIREMENTS:
- Generate approximately ${Math.floor(targetCount * 0.5)} MCQ questions
- Generate approximately ${Math.floor(targetCount * 0.3)} True/False questions  
- Generate approximately ${Math.ceil(targetCount * 0.2)} Scenario-based questions
- ALL questions must be based on SPECIFIC content from the course above
- Language: ${language === 'ar' ? 'Arabic (العربية)' : 'English'}
- Include explanations that reference the course content

Respond with JSON array only, no markdown.`;

  try {
    const response = await callLLMAPI(systemPrompt, userPrompt, 5000);
    return parseJSONResponse(response);
  } catch (error) {
    console.error('AI question generation failed:', error);
    throw new Error('Failed to generate questions. Please try again.');
  }
};

/**
 * Extract basic title (fallback)
 */
const extractBasicTitle = (text) => {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim();
    if (trimmed.length >= 5 && trimmed.length <= 150) {
      // Skip lines that look like page numbers or headers
      if (!/^\d+$/.test(trimmed) && !/^page\s*\d+/i.test(trimmed)) {
        return trimmed;
      }
    }
  }
  return 'Training Course';
};

// ==================== QUESTION FORMATTING ====================

/**
 * Format questions for the assessment system
 */
const formatQuestions = (aiQuestions, language) => {
  if (!Array.isArray(aiQuestions)) return [];
  
  const formatted = aiQuestions.map((q, idx) => {
    const baseQuestion = {
      id: `q-${idx + 1}`,
      type: q.type === 'trueFalse' ? 'trueFalse' : q.type === 'scenario' ? 'scenario' : 'multipleChoice',
      bloomLevel: q.bloomLevel || 'understand',
      points: q.type === 'scenario' ? 4 : q.type === 'trueFalse' ? 1 : 2,
      source: 'ai-generated',
      topic: q.topic || '',
      explanation: q.explanation || ''
    };

    if (q.type === 'trueFalse') {
      return {
        ...baseQuestion,
        question: {
          en: q.question,
          ar: q.question
        },
        correctAnswer: q.correctAnswer,
        feedback: {
          correct: { en: 'Correct!', ar: 'صحيح!' },
          incorrect: { 
            en: q.explanation || 'Review this topic in the course material.', 
            ar: q.explanation || 'راجع هذا الموضوع في مادة الدورة.' 
          }
        }
      };
    } else if (q.type === 'scenario') {
      return {
        ...baseQuestion,
        scenario: {
          en: q.scenario,
          ar: q.scenario
        },
        question: {
          en: q.question,
          ar: q.question
        },
        options: (q.options || []).map(opt => ({
          id: opt.id,
          text: { en: opt.text, ar: opt.text },
          isCorrect: opt.isCorrect,
          score: opt.score || (opt.isCorrect ? 4 : 0)
        })),
        feedback: {
          en: q.explanation || 'Review the course material.',
          ar: q.explanation || 'راجع مادة الدورة.'
        }
      };
    } else {
      // MCQ
      return {
        ...baseQuestion,
        question: {
          en: q.question,
          ar: q.question
        },
        options: (q.options || []).map(opt => ({
          id: opt.id,
          text: { en: opt.text, ar: opt.text },
          isCorrect: opt.isCorrect
        })),
        feedback: {
          correct: { 
            en: 'Correct! ' + (q.explanation || ''), 
            ar: 'صحيح! ' + (q.explanation || '')
          },
          incorrect: { 
            en: q.explanation || 'Review this topic.', 
            ar: q.explanation || 'راجع هذا الموضوع.' 
          }
        }
      };
    }
  });

  return formatted;
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
 * Process uploaded course file and generate AI-powered assessment
 */
export const processUploadedCourse = async (file, options = {}) => {
  const { onProgress } = options;
  
  try {
    // Step 1: Parse the file
    if (onProgress) onProgress('parsing', 10);
    const parsedContent = await parseUploadedFile(file);
    
    if (!parsedContent.text || parsedContent.text.length < 100) {
      throw new Error('The uploaded file does not contain enough text content. / الملف لا يحتوي على محتوى نصي كافٍ.');
    }

    if (onProgress) onProgress('parsing', 20);
    console.log('File parsed successfully, text length:', parsedContent.text.length);

    // Step 2: Analyze course content with AI
    if (onProgress) onProgress('analyzing', 25);
    
    let analysis;
    try {
      analysis = await analyzeCourseContent(parsedContent.text);
      console.log('AI Analysis completed:', analysis);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Use basic fallback
      analysis = {
        language: detectLanguage(parsedContent.text),
        title: extractBasicTitle(parsedContent.text),
        description: '',
        objectives: [],
        modules: [],
        keyConcepts: [],
        skills: [],
        targetAudience: '',
        keyFacts: []
      };
    }

    if (onProgress) onProgress('analyzing', 50);

    // Step 3: Generate questions with AI
    if (onProgress) onProgress('generating', 55);
    
    let aiQuestions = [];
    try {
      aiQuestions = await generateQuestionsWithAI(analysis, parsedContent.text, {
        minQuestions: options.minQuestions || 10,
        maxQuestions: options.maxQuestions || 20
      });
      console.log('AI Questions generated:', aiQuestions.length);
    } catch (qError) {
      console.error('AI question generation failed:', qError);
      throw new Error('Failed to generate questions. Please try again. / فشل إنشاء الأسئلة. يرجى المحاولة مرة أخرى.');
    }

    if (!aiQuestions || aiQuestions.length === 0) {
      throw new Error('No questions could be generated from this content. / لم يتم إنشاء أي أسئلة.');
    }

    if (onProgress) onProgress('generating', 80);

    // Step 4: Format questions
    const formattedQuestions = formatQuestions(aiQuestions, analysis.language);
    
    // Split into pre and post test
    const shuffled = [...formattedQuestions].sort(() => Math.random() - 0.5);
    const halfPoint = Math.ceil(shuffled.length / 2);
    const preTest = shuffled.slice(0, halfPoint).map(q => ({ ...q, testType: 'pre' }));
    const postTest = shuffled.slice(halfPoint).map(q => ({ ...q, testType: 'post' }));

    if (onProgress) onProgress('complete', 100);

    // Step 5: Create course object
    const course = {
      id: `course-${Date.now()}`,
      title: {
        en: analysis.title,
        ar: analysis.title
      },
      description: {
        en: analysis.description || 'AI-analyzed training course.',
        ar: analysis.description || 'دورة تدريبية محللة بالذكاء الاصطناعي.'
      },
      duration: analysis.duration || '',
      modules: (analysis.modules || []).map((m, idx) => ({
        id: `module-${idx + 1}`,
        title: { en: m.title, ar: m.title },
        keyPoints: m.keyPoints || []
      })),
      objectives: (analysis.objectives || []).map(obj => ({
        en: obj,
        ar: obj
      })),
      keyConcepts: analysis.keyConcepts || [],
      skills: analysis.skills || [],
      keyFacts: analysis.keyFacts || [],
      targetAudience: analysis.targetAudience || '',
      sourceFile: {
        name: file.name,
        type: parsedContent.fileType,
        size: file.size,
        uploadedAt: new Date().toISOString()
      },
      analysis: {
        objectivesFound: (analysis.objectives || []).length,
        modulesFound: (analysis.modules || []).length,
        conceptsFound: (analysis.keyConcepts || []).length,
        questionsGenerated: formattedQuestions.length,
        contentLanguage: analysis.language,
        aiPowered: true
      },
      createdAt: new Date().toISOString(),
      status: 'ready'
    };

    const questions = {
      preTest,
      postTest,
      all: formattedQuestions,
      metadata: {
        totalQuestions: formattedQuestions.length,
        preTestCount: preTest.length,
        postTestCount: postTest.length,
        questionTypes: countQuestionTypes(formattedQuestions),
        bloomLevels: countBloomLevels(formattedQuestions),
        courseName: analysis.title,
        contentLanguage: analysis.language,
        aiGenerated: true
      }
    };

    return {
      success: true,
      course,
      questions,
      analysis: {
        title: analysis.title,
        description: analysis.description,
        duration: analysis.duration,
        objectivesCount: (analysis.objectives || []).length,
        modulesCount: (analysis.modules || []).length,
        conceptsCount: (analysis.keyConcepts || []).length,
        questionsGenerated: formattedQuestions.length,
        preTestQuestions: preTest.length,
        postTestQuestions: postTest.length,
        contentLanguage: analysis.language,
        aiPowered: true
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
  processUploadedCourse
};
