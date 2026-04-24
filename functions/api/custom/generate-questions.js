// Cloudflare Pages Function: POST /api/custom/generate-questions
//
// Generates assessment questions for a single course module using Claude
// with strict source-grounding:
//   - system prompt forbids questions that cannot be sourced from the
//     provided module content
//   - every question must carry a `citation` field containing a verbatim
//     excerpt from that content
//   - citations are validated server-side against the submitted content;
//     questions whose citation does not match are dropped
//
// If the ANTHROPIC_API_KEY secret is not set or Claude fails, the endpoint
// returns a 503 so the client can fall back to the rule-based generator.

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-opus-4-7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: corsHeaders });

const err = (message, status = 400, extra = {}) =>
  json({ success: false, error: message, ...extra }, status);

const SYSTEM_PROMPT = `You generate assessment questions grounded ONLY in the course module content the user provides. Follow these rules without exception:

1. Every question must be answerable from the provided module text alone.
2. For every question the \`citation\` field MUST contain a verbatim excerpt copied from the module content that directly supports the correct answer. Preserve original casing, punctuation, and whitespace inside the excerpt. Do not paraphrase, translate, or summarize for the citation.
3. If the module content is too short, too vague, or off-topic to support the requested number of questions, return fewer questions. Never invent facts.
4. Distractors (incorrect options) must be plausible but clearly wrong according to the provided content. Do not use "all of the above" / "none of the above". Do not recycle the stem as an option.
5. Write the question stem, options, and explanation in the target language the user specifies. Keep technical terms, proper nouns, and acronyms as they appear in the source.
6. Do not use outside knowledge, current events, or anything not present in the module content. If asked about something not in the text, skip it.
7. Return ONLY the JSON object defined by the schema. No preamble, no commentary.`;

const QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      description: 'Generated questions grounded in the module content.',
      items: {
        type: 'object',
        properties: {
          stem: { type: 'string', description: 'The question text.' },
          options: {
            type: 'array',
            description: 'Answer choices, 2-6 entries. Exactly one must be correct.',
            items: { type: 'string' }
          },
          correctIndex: {
            type: 'integer',
            description: '0-based index into options identifying the correct answer.'
          },
          explanation: {
            type: 'string',
            description: 'Short justification (1-3 sentences) for why the chosen option is correct, grounded in the module content.'
          },
          citation: {
            type: 'string',
            description: 'Verbatim excerpt copied from the module content that directly supports the correct answer.'
          }
        },
        required: ['stem', 'options', 'correctIndex', 'explanation', 'citation'],
        additionalProperties: false
      }
    }
  },
  required: ['questions'],
  additionalProperties: false
};

// Whitespace-tolerant substring check. PDF/DOCX text often comes out with
// odd spacing, so we normalize both sides before comparing. The citation
// is still required to appear in the source — we just don't punish the
// model for collapsing a line break into a space.
const normalizeForCitation = (s) => (s || '').replace(/\s+/g, ' ').trim();

const isCitationValid = (citation, normalizedContent) => {
  const normalizedCitation = normalizeForCitation(citation);
  if (normalizedCitation.length < 12) return false; // too short to be meaningful
  return normalizedContent.includes(normalizedCitation);
};

const validateQuestion = (q, normalizedContent) => {
  if (!q || typeof q !== 'object') return false;
  if (typeof q.stem !== 'string' || q.stem.trim().length < 5) return false;
  if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) return false;
  if (!q.options.every((o) => typeof o === 'string' && o.trim().length > 0)) return false;
  if (!Number.isInteger(q.correctIndex)) return false;
  if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return false;
  if (typeof q.explanation !== 'string') return false;
  if (!isCitationValid(q.citation, normalizedContent)) return false;
  return true;
};

// Match the session/role gate used elsewhere in the app. We reuse the
// same sessions table the rest of the API writes to.
const requireAdminSession = async (db, sessionId) => {
  if (!sessionId) return { ok: false, status: 401, error: 'Missing session' };
  const session = await db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expiresAt > ?')
    .bind(sessionId, new Date().toISOString())
    .first();
  if (!session) return { ok: false, status: 401, error: 'Invalid or expired session' };
  if (session.role !== 'admin') return { ok: false, status: 403, error: 'Admin only' };
  return { ok: true, session };
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return err('Method not allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return err('Invalid JSON body');
  }

  const {
    sessionId,
    moduleTitle = '',
    moduleContent = '',
    count = 5,
    language = 'en',
    questionType = 'multiple_choice'
  } = body || {};

  if (typeof moduleContent !== 'string' || moduleContent.trim().length < 80) {
    return err('moduleContent is too short to generate grounded questions', 400);
  }
  if (!Number.isInteger(count) || count < 1 || count > 25) {
    return err('count must be an integer between 1 and 25', 400);
  }
  if (language !== 'en' && language !== 'ar') {
    return err('language must be "en" or "ar"', 400);
  }
  if (questionType !== 'multiple_choice') {
    // Only MCQ supported in Phase 2. Short-answer comes later.
    return err('questionType must be "multiple_choice"', 400);
  }

  if (env.DB) {
    const gate = await requireAdminSession(env.DB, sessionId);
    if (!gate.ok) return err(gate.error, gate.status);
  }

  if (!env.ANTHROPIC_API_KEY) {
    return err('ANTHROPIC_API_KEY is not configured on the server', 503, {
      fallback: true
    });
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const userMessage = [
    `Target language: ${language === 'ar' ? 'Arabic' : 'English'}`,
    `Number of questions requested: ${count}`,
    `Question type: multiple choice`,
    moduleTitle ? `Module title: ${moduleTitle}` : null,
    ``,
    `Module content (the only source you may use):`,
    `"""`,
    moduleContent,
    `"""`,
    ``,
    `Generate the questions now, following every rule in the system instructions. Remember: the citation field must be a verbatim excerpt of the module content above.`
  ]
    .filter(Boolean)
    .join('\n');

  let claudeResponse;
  try {
    claudeResponse = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: { type: 'json_schema', schema: QUESTION_SCHEMA }
      },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: userMessage }]
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) {
      return err('Claude rate limit hit, try again shortly', 429, { fallback: true });
    }
    if (e instanceof Anthropic.APIError) {
      return err(`Claude API error: ${e.message}`, 502, { fallback: true });
    }
    return err(`Unexpected error calling Claude: ${e?.message || 'unknown'}`, 500, {
      fallback: true
    });
  }

  // Structured-output responses land as a single text block containing
  // the JSON. Extract and parse.
  const textBlock = (claudeResponse.content || []).find((b) => b.type === 'text');
  if (!textBlock) {
    return err('Claude returned no text content', 502, { fallback: true });
  }

  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return err('Claude returned non-JSON output', 502, { fallback: true });
  }
  if (!parsed || !Array.isArray(parsed.questions)) {
    return err('Claude response missing questions[]', 502, { fallback: true });
  }

  const normalizedContent = normalizeForCitation(moduleContent);
  const accepted = [];
  const rejected = [];
  for (const q of parsed.questions) {
    if (validateQuestion(q, normalizedContent)) {
      accepted.push({
        stem: q.stem.trim(),
        options: q.options.map((o) => o.trim()),
        correctIndex: q.correctIndex,
        explanation: q.explanation.trim(),
        citation: q.citation.trim()
      });
    } else {
      rejected.push({ reason: 'citation or structure invalid', raw: q });
    }
  }

  if (accepted.length === 0) {
    return err('No generated question passed citation validation', 422, {
      fallback: true,
      rejected
    });
  }

  return json({
    success: true,
    source: 'llm',
    model: CLAUDE_MODEL,
    generated: accepted.length,
    rejectedCount: rejected.length,
    questions: accepted,
    usage: {
      input_tokens: claudeResponse.usage?.input_tokens,
      output_tokens: claudeResponse.usage?.output_tokens,
      cache_creation_input_tokens: claudeResponse.usage?.cache_creation_input_tokens,
      cache_read_input_tokens: claudeResponse.usage?.cache_read_input_tokens
    }
  });
}
