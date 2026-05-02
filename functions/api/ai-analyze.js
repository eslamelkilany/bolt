// Cloudflare Function for AI-powered course analysis
// This handles LLM API calls securely on the server side

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { action, courseText, analysis, config, systemPrompt, userPrompt, maxTokens } = body;

    // Get API configuration from environment
    const apiKey = env.OPENAI_API_KEY || env.GENSPARK_API_KEY;
    const baseUrl = env.OPENAI_BASE_URL || 'https://www.genspark.ai/api/llm_proxy/v1';
    const model = env.LLM_MODEL || 'gpt-5';

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'AI API not configured. Please set OPENAI_API_KEY in Cloudflare Pages environment variables.',
        details: 'Go to Cloudflare Dashboard > Pages > Your Project > Settings > Environment variables'
      }), { status: 500, headers: corsHeaders });
    }

    // Handle direct LLM call
    if (action === 'direct') {
      const result = await callLLM(systemPrompt, userPrompt, apiKey, baseUrl, model, maxTokens || 4000);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: corsHeaders });
    }
    // Handle analyze action
    else if (action === 'analyze') {
      const result = await analyzeCourseContent(courseText, apiKey, baseUrl, model);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: corsHeaders });
    } 
    // Handle generate action
    else if (action === 'generate') {
      const result = await generateQuestions(analysis, courseText, config, apiKey, baseUrl, model);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: corsHeaders });
    }
    else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid action. Use "analyze", "generate", or "direct".'
      }), { status: 400, headers: corsHeaders });
    }

  } catch (error) {
    console.error('AI API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process AI request'
    }), { status: 500, headers: corsHeaders });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// Analyze course content with AI
async function analyzeCourseContent(courseText, apiKey, baseUrl, model) {
  const maxLength = 15000;
  const truncatedText = courseText.length > maxLength 
    ? courseText.substring(0, maxLength) + '\n\n[Content truncated...]'
    : courseText;

  // Detect language
  const arabicChars = (courseText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
  const latinChars = (courseText.match(/[a-zA-Z]/g) || []).length;
  const detectedLang = arabicChars > latinChars ? 'ar' : 'en';

  const systemPrompt = `You are an expert instructional designer and course content analyst. Your task is to analyze training course content and extract the most important educational information.

CRITICAL INSTRUCTIONS:
1. Identify the MAIN TOPIC/SUBJECT of the course
2. Extract LEARNING OBJECTIVES (what the learner will be able to do after completing)
3. Identify KEY CONCEPTS, DEFINITIONS, and IMPORTANT FACTS
4. Detect MODULES or SECTIONS of the course
5. Detect the language and respond in THE SAME LANGUAGE as the content

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

  const response = await callLLM(systemPrompt, userPrompt, apiKey, baseUrl, model, 3000);
  return parseJSONResponse(response);
}

// Generate questions with AI
async function generateQuestions(analysis, courseText, config, apiKey, baseUrl, model) {
  const { minQuestions = 10, maxQuestions = 20 } = config || {};
  const language = analysis.language || 'en';
  const targetCount = Math.min(maxQuestions, Math.max(minQuestions, 15));

  const courseContext = `
COURSE TITLE: ${analysis.title}
DESCRIPTION: ${analysis.description || 'Training course'}
LEARNING OBJECTIVES: ${(analysis.objectives || []).join('; ')}
MODULES: ${(analysis.modules || []).map(m => `${m.title}: ${(m.keyPoints || []).join(', ')}`).join('; ')}
KEY CONCEPTS: ${(analysis.keyConcepts || []).map(c => `${c.term}: ${c.definition}`).join('; ')}
KEY FACTS: ${(analysis.keyFacts || []).join('; ')}
SKILLS: ${(analysis.skills || []).join(', ')}
`;

  const maxTextLength = 12000;
  const truncatedText = courseText.length > maxTextLength
    ? courseText.substring(0, maxTextLength)
    : courseText;

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
2. True/False: Clear statement that is definitively true or false
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

  const response = await callLLM(systemPrompt, userPrompt, apiKey, baseUrl, model, 5000);
  return parseJSONResponse(response);
}

// Call LLM API
async function callLLM(systemPrompt, userPrompt, apiKey, baseUrl, model, maxTokens) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
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
    throw new Error(`LLM API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// Parse JSON from LLM response
function parseJSONResponse(response) {
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
}
