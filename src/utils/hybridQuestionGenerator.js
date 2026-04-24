// Hybrid question generator for custom assessments.
//
//   1. First try POST /api/custom/generate-questions (Claude-grounded).
//   2. If that returns 2xx with questions, use them.
//   3. Otherwise (missing key, rate limit, network drop, 0 valid
//      citations, etc.) fall back to a grounded cloze-style generator
//      that runs fully client-side.
//
// Both paths return the same shape so downstream UI (Phase 4 review)
// doesn't care which source produced them:
//
//   {
//     source: 'llm' | 'rule-based',
//     reason?: string,          // only set on fallback
//     questions: Array<{
//       stem, options, correctIndex, explanation, citation,
//       needsReview?: boolean    // true on rule-based questions
//     }>
//   }
//
// The rule-based path is deliberately simple and conservative — every
// option, every correct answer, and every citation is a verbatim token
// or sentence from the module content. It won't invent facts. Quality
// is lower than the LLM path; that's the tradeoff for zero-dep fallback.

const SESSION_KEY = 'kafaat-session';

const getSessionId = () => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.id || null;
  } catch {
    return null;
  }
};

// ---- Grounded rule-based fallback -----------------------------------

// Exported so it can be unit-tested directly in Node (no DOM needed).
export const splitSentences = (text) => {
  if (!text || typeof text !== 'string') return [];
  // Split on sentence terminators but keep the terminator attached to
  // the sentence so the citation we emit is readable.
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && /[A-Za-z؀-ۿ]/.test(s));
};

// Words that are poor cloze targets (too generic, punctuation artifacts,
// function words that make nonsense questions).
const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can',
  'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him',
  'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
  'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'that',
  'this', 'with', 'from', 'they', 'been', 'have', 'were', 'will', 'your',
  'there', 'their', 'what', 'when', 'which', 'would', 'should', 'could',
  'must', 'into', 'also', 'than', 'then', 'them', 'these', 'those'
]);

const pickClozeTarget = (sentence) => {
  // Strip punctuation, find the longest non-stopword token >= 5 chars.
  // Prefer capitalized-mid-sentence tokens (proper nouns / key concepts).
  const tokens = sentence.match(/[A-Za-z؀-ۿ][A-Za-z؀-ۿ'-]*/g) || [];
  if (tokens.length < 4) return null;

  // Skip the first token (often just the capitalized sentence start).
  const candidates = tokens.slice(1).filter(
    (t) => t.length >= 5 && !STOPWORDS.has(t.toLowerCase())
  );
  if (candidates.length === 0) return null;

  // Prefer mid-sentence capitalized terms, else the longest candidate.
  const capitalized = candidates.find((t) => /^[A-Z]/.test(t));
  if (capitalized) return capitalized;
  return candidates.reduce((a, b) => (b.length > a.length ? b : a));
};

const makeClozeStem = (sentence, target) => {
  // Replace the first occurrence of the target (as a whole word) with a blank.
  const re = new RegExp(`\\b${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  return sentence.replace(re, '_____');
};

const uniquePreserveOrder = (arr) => {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = x.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
};

// Small deterministic shuffle so tests are stable but options aren't
// always "correct-first". Seed is derived from the stem text so
// regenerating gives the same order for the same input.
const deterministicShuffle = (arr, seedString) => {
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) seed = (seed * 31 + seedString.charCodeAt(i)) >>> 0;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const generateGroundedClozeQuestions = ({ moduleContent, count = 5 }) => {
  const sentences = splitSentences(moduleContent || '');
  if (sentences.length < 2) return [];

  // Build a pool of every usable target across the module so we have
  // candidate distractors that are genuinely from the source text.
  const perSentence = sentences.map((s) => ({ sentence: s, target: pickClozeTarget(s) }));
  const targetPool = uniquePreserveOrder(
    perSentence.map((x) => x.target).filter(Boolean)
  );
  if (targetPool.length < 4) return []; // not enough distinct grounded options

  const questions = [];
  for (const { sentence, target } of perSentence) {
    if (questions.length >= count) break;
    if (!target) continue;

    // Draw 3 distractors: other targets from the module, case-insensitive
    // distinct from the correct answer.
    const distractors = targetPool
      .filter((t) => t.toLowerCase() !== target.toLowerCase())
      .slice(0, 3);
    if (distractors.length < 3) continue;

    const options = [target, ...distractors];
    const shuffled = deterministicShuffle(options, sentence + target);
    const correctIndex = shuffled.findIndex((o) => o.toLowerCase() === target.toLowerCase());

    questions.push({
      stem: makeClozeStem(sentence, target),
      options: shuffled,
      correctIndex,
      explanation: `Source sentence from the module: "${sentence}"`,
      citation: sentence,
      needsReview: true
    });
  }
  return questions;
};

// ---- Public API -----------------------------------------------------

const buildFallback = ({ moduleContent, count, reason }) => {
  const questions = generateGroundedClozeQuestions({ moduleContent, count });
  return {
    source: 'rule-based',
    reason: reason || 'unknown',
    questions
  };
};

// Dependency-injected fetch so tests can swap in a fake. In the browser
// this is just window.fetch.
export const generateQuestionsForModule = async (
  { course, module, count = 5, language = 'en' },
  opts = {}
) => {
  const fetchImpl = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);
  const moduleContent = module?.content || '';
  const moduleTitle = module?.title?.[language] || module?.title?.en || '';

  if (!moduleContent || moduleContent.trim().length < 80) {
    return {
      source: 'rule-based',
      reason: 'module content too short',
      questions: []
    };
  }

  // No fetch available (e.g. server-side Node without undici) — go
  // straight to the fallback rather than crash.
  if (!fetchImpl) {
    return buildFallback({ moduleContent, count, reason: 'fetch unavailable' });
  }

  let res;
  try {
    res = await fetchImpl('/api/custom/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: opts.sessionId || getSessionId(),
        moduleTitle,
        moduleContent,
        count,
        language,
        questionType: 'multiple_choice'
      })
    });
  } catch (e) {
    return buildFallback({ moduleContent, count, reason: `network error: ${e?.message || e}` });
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return buildFallback({ moduleContent, count, reason: 'non-JSON server response' });
  }

  if (res.ok && data?.success && Array.isArray(data.questions) && data.questions.length > 0) {
    return {
      source: 'llm',
      model: data.model,
      usage: data.usage,
      questions: data.questions.map((q) => ({ ...q, needsReview: false }))
    };
  }

  // Any non-success path (401, 429, 503, 422, etc.) → fall back.
  const reason = data?.error || `server returned ${res.status}`;
  return buildFallback({ moduleContent, count, reason });
};
