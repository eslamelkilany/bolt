// AI-Powered Course Content Analyzer
// Uses LLM (GPT) to truly UNDERSTAND course content and generate intelligent assessments
// Supports both English and Arabic content

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ==================== LLM API CONFIGURATION ====================

const LLM_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || null,
  baseUrl: import.meta.env.VITE_OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1',
  model: 'gpt-5'
};

/**
 * Call LLM API to analyze content
 */
const callLLM = async (systemPrompt, userPrompt, maxTokens = 4000) => {
  try {
    // Try to get API key from environment or use the proxy
    const apiKey = LLM_CONFIG.apiKey || 'gsk-proxy';
    
    const response = await fetch(`${LLM_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', errorText);
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('LLM call failed:', error);
    throw error;
  }
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

// ==================== AI-POWERED CONTENT ANALYSIS ====================

/**
 * Use AI to analyze and understand course content
 */
const analyzeWithAI = async (courseText, onProgress) => {
  // Limit text to avoid token limits (approximately 15000 characters = ~4000 tokens)
  const maxLength = 15000;
  const truncatedText = courseText.length > maxLength 
    ? courseText.substring(0, maxLength) + '\n\n[Content truncated for analysis...]'
    : courseText;

  const systemPrompt = `You are an expert instructional designer and assessment specialist. Your task is to analyze training course content and extract key information for assessment creation.

You MUST respond ONLY with valid JSON, no markdown, no explanations. The JSON must follow this exact structure:
{
  "language": "en" or "ar",
  "title": "Course title",
  "description": "Brief course description (2-3 sentences)",
  "duration": "Estimated duration",
  "objectives": ["objective 1", "objective 2", ...],
  "modules": [
    {"title": "Module title", "keyPoints": ["point 1", "point 2"]}
  ],
  "keyConcepts": [
    {"term": "concept name", "definition": "what it means", "importance": "why it matters"}
  ],
  "skills": ["skill 1", "skill 2"],
  "targetAudience": "Who this course is for"
}`;

  const userPrompt = `Analyze this training course content and extract the structured information. Detect the language (Arabic or English) and respond in the SAME language as the content.

COURSE CONTENT:
${truncatedText}

Remember: Respond ONLY with valid JSON, no markdown code blocks, no additional text.`;

  if (onProgress) onProgress('analyzing', 30);
  
  const response = await callLLM(systemPrompt, userPrompt, 2000);
  
  // Parse the JSON response
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7);
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();
    
    return JSON.parse(cleanResponse);
  } catch (parseError) {
    console.error('Failed to parse AI analysis:', parseError);
    console.log('Raw response:', response);
    // Return a basic structure if parsing fails
    return {
      language: detectLanguage(courseText),
      title: extractBasicTitle(courseText),
      description: '',
      objectives: [],
      modules: [],
      keyConcepts: [],
      skills: [],
      targetAudience: ''
    };
  }
};

/**
 * Detect language from text
 */
const detectLanguage = (text) => {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return arabicChars > latinChars ? 'ar' : 'en';
};

/**
 * Extract basic title from text
 */
const extractBasicTitle = (text) => {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  for (const line of lines.slice(0, 5)) {
    if (line.trim().length >= 5 && line.trim().length <= 100) {
      return line.trim();
    }
  }
  return 'Training Course';
};

// ==================== AI-POWERED QUESTION GENERATION ====================

/**
 * Generate intelligent questions using AI
 */
const generateQuestionsWithAI = async (analysis, courseText, config, onProgress) => {
  const { minQuestions = 10, maxQuestions = 20 } = config;
  const language = analysis.language || 'en';
  const targetCount = Math.min(maxQuestions, Math.max(minQuestions, 15));
  
  // Prepare context for AI
  const courseContext = `
COURSE TITLE: ${analysis.title}
DESCRIPTION: ${analysis.description}
OBJECTIVES: ${(analysis.objectives || []).join('; ')}
MODULES: ${(analysis.modules || []).map(m => m.title).join('; ')}
KEY CONCEPTS: ${(analysis.keyConcepts || []).map(c => `${c.term}: ${c.definition}`).join('; ')}
SKILLS: ${(analysis.skills || []).join('; ')}
`;

  // Limit course text for question generation
  const maxTextLength = 10000;
  const truncatedCourseText = courseText.length > maxTextLength
    ? courseText.substring(0, maxTextLength)
    : courseText;

  const systemPrompt = `You are an expert assessment designer creating questions for a training course assessment. Generate high-quality questions that test understanding of the course content.

CRITICAL RULES:
1. Questions MUST be directly based on the SPECIFIC course content provided
2. Questions should test real understanding, not just memorization
3. Include a mix of question types: multiple choice (MCQ), true/false, and scenario-based
4. Each question must have clear correct answers
5. For MCQ: provide 4 options with only ONE correct answer
6. Generate questions in ${language === 'ar' ? 'Arabic' : 'English'} language
7. Questions should cover different cognitive levels (knowledge, understanding, application, analysis)

You MUST respond ONLY with valid JSON array, no markdown, no explanations:
[
  {
    "type": "mcq",
    "question": "The question text",
    "options": [
      {"id": "a", "text": "Option A", "isCorrect": false},
      {"id": "b", "text": "Option B", "isCorrect": true},
      {"id": "c", "text": "Option C", "isCorrect": false},
      {"id": "d", "text": "Option D", "isCorrect": false}
    ],
    "explanation": "Why the correct answer is correct",
    "bloomLevel": "understand",
    "topic": "Related course topic"
  },
  {
    "type": "trueFalse",
    "question": "Statement to evaluate",
    "correctAnswer": true,
    "explanation": "Explanation",
    "bloomLevel": "remember",
    "topic": "Related topic"
  },
  {
    "type": "scenario",
    "scenario": "Describe a realistic situation",
    "question": "What should be done?",
    "options": [
      {"id": "a", "text": "Option A", "isCorrect": true, "score": 4},
      {"id": "b", "text": "Option B", "isCorrect": false, "score": 2},
      {"id": "c", "text": "Option C", "isCorrect": false, "score": 1},
      {"id": "d", "text": "Option D", "isCorrect": false, "score": 0}
    ],
    "explanation": "Why the best answer is correct",
    "bloomLevel": "apply",
    "topic": "Related topic"
  }
]`;

  const userPrompt = `Generate exactly ${targetCount} assessment questions for this training course.

${courseContext}

ACTUAL COURSE CONTENT TO BASE QUESTIONS ON:
${truncatedCourseText}

REQUIREMENTS:
- Generate ${Math.floor(targetCount * 0.5)} multiple choice questions
- Generate ${Math.floor(targetCount * 0.3)} true/false questions  
- Generate ${Math.ceil(targetCount * 0.2)} scenario-based questions
- All questions must be based on the ACTUAL course content above
- Questions should be practical and test real understanding
- Language: ${language === 'ar' ? 'Arabic (العربية)' : 'English'}

Respond with a JSON array only, no markdown code blocks.`;

  if (onProgress) onProgress('generating', 60);

  const response = await callLLM(systemPrompt, userPrompt, 4000);
  
  // Parse questions
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7);
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();
    
    const questions = JSON.parse(cleanResponse);
    return Array.isArray(questions) ? questions : [];
  } catch (parseError) {
    console.error('Failed to parse AI questions:', parseError);
    console.log('Raw response:', response);
    return [];
  }
};

/**
 * Format questions for the assessment system
 */
const formatQuestions = (aiQuestions, language) => {
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
          en: language === 'en' ? q.question : q.question,
          ar: language === 'ar' ? q.question : q.question
        },
        correctAnswer: q.correctAnswer,
        feedback: {
          correct: { 
            en: 'Correct!', 
            ar: 'صحيح!' 
          },
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
          en: language === 'en' ? q.scenario : q.scenario,
          ar: language === 'ar' ? q.scenario : q.scenario
        },
        question: {
          en: language === 'en' ? q.question : q.question,
          ar: language === 'ar' ? q.question : q.question
        },
        options: (q.options || []).map(opt => ({
          id: opt.id,
          text: {
            en: language === 'en' ? opt.text : opt.text,
            ar: language === 'ar' ? opt.text : opt.text
          },
          isCorrect: opt.isCorrect,
          score: opt.score || (opt.isCorrect ? 4 : 0)
        })),
        feedback: {
          en: q.explanation || 'Review the course material for more details.',
          ar: q.explanation || 'راجع مادة الدورة لمزيد من التفاصيل.'
        }
      };
    } else {
      // MCQ
      return {
        ...baseQuestion,
        question: {
          en: language === 'en' ? q.question : q.question,
          ar: language === 'ar' ? q.question : q.question
        },
        options: (q.options || []).map(opt => ({
          id: opt.id,
          text: {
            en: language === 'en' ? opt.text : opt.text,
            ar: language === 'ar' ? opt.text : opt.text
          },
          isCorrect: opt.isCorrect
        })),
        feedback: {
          correct: { 
            en: 'Correct! ' + (q.explanation || ''), 
            ar: 'صحيح! ' + (q.explanation || '')
          },
          incorrect: { 
            en: q.explanation || 'Review this topic in the course material.', 
            ar: q.explanation || 'راجع هذا الموضوع في مادة الدورة.' 
          }
        }
      };
    }
  });

  return formatted;
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

    // Step 2: Analyze content with AI
    if (onProgress) onProgress('analyzing', 25);
    let analysis;
    try {
      analysis = await analyzeWithAI(parsedContent.text, onProgress);
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError);
      // Fallback to basic extraction
      analysis = {
        language: detectLanguage(parsedContent.text),
        title: extractBasicTitle(parsedContent.text),
        description: '',
        objectives: [],
        modules: [],
        keyConcepts: [],
        skills: [],
        targetAudience: ''
      };
    }

    if (onProgress) onProgress('analyzing', 50);

    // Step 3: Generate questions with AI
    if (onProgress) onProgress('generating', 55);
    let aiQuestions = [];
    try {
      aiQuestions = await generateQuestionsWithAI(
        analysis, 
        parsedContent.text, 
        {
          minQuestions: options.minQuestions || 10,
          maxQuestions: options.maxQuestions || 20
        },
        onProgress
      );
    } catch (qError) {
      console.error('AI question generation failed:', qError);
      throw new Error('Failed to generate questions. Please try again. / فشل إنشاء الأسئلة. يرجى المحاولة مرة أخرى.');
    }

    if (aiQuestions.length === 0) {
      throw new Error('No questions could be generated from this content. / لم يتم إنشاء أي أسئلة من هذا المحتوى.');
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

// Helper functions
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

export default {
  parseUploadedFile,
  processUploadedCourse
};
