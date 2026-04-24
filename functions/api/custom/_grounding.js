// Grounding validators for server-generated assessment questions.
//
// Split out from generate-questions.js so the validation logic — which is
// the core hallucination guard — is unit-testable without pulling in the
// Anthropic SDK. Keep this file pure: no imports, no side effects.
//
// Filename starts with `_` so Cloudflare Pages does not treat it as a
// route (only files without a leading underscore are routed).

// Whitespace-tolerant substring check. PDF/DOCX text often comes out with
// odd spacing, so we normalize both sides before comparing. The citation
// is still required to appear in the source — we just don't punish the
// model for collapsing a line break into a space.
export const normalizeForCitation = (s) => (s || '').replace(/\s+/g, ' ').trim();

export const isCitationValid = (citation, normalizedContent) => {
  const normalizedCitation = normalizeForCitation(citation);
  if (normalizedCitation.length < 12) return false; // too short to be meaningful
  return normalizedContent.includes(normalizedCitation);
};

export const validateQuestion = (q, normalizedContent) => {
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
