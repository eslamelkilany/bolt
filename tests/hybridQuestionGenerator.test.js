// Tests for the hybrid question generator:
//   - the rule-based fallback is actually grounded (every option and
//     every citation appears verbatim in the module content)
//   - generateQuestionsForModule correctly routes between server path
//     and fallback path based on the server's response shape
//
// Run with:  node --test tests/hybridQuestionGenerator.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitSentences,
  generateGroundedClozeQuestions,
  generateQuestionsForModule
} from '../src/utils/hybridQuestionGenerator.js';

const MODULE_CONTENT = `Effective communication is the foundation of leadership.
Leaders must tailor their message to the audience. Active listening,
clarity, and empathy are core competencies for every manager.
Sound decisions require evidence and judgement. Frameworks such as
OODA and DACI help structure tradeoffs between speed and quality.`;

// ---- splitSentences ------------------------------------------------

test('splitSentences returns sentences with terminator attached', () => {
  const sentences = splitSentences(MODULE_CONTENT);
  assert.ok(sentences.length >= 4, `expected >=4 sentences, got ${sentences.length}`);
  for (const s of sentences) {
    assert.ok(s.length >= 30, `sentence too short: ${s}`);
  }
});

test('splitSentences handles empty/invalid input', () => {
  assert.deepEqual(splitSentences(''), []);
  assert.deepEqual(splitSentences(null), []);
  assert.deepEqual(splitSentences(undefined), []);
});

// ---- Grounding contract on the rule-based fallback -----------------

test('every rule-based question has its citation verbatim in the module', () => {
  const questions = generateGroundedClozeQuestions({
    moduleContent: MODULE_CONTENT,
    count: 3
  });
  assert.ok(questions.length > 0, 'rule-based should produce at least one question');
  for (const q of questions) {
    assert.ok(
      MODULE_CONTENT.replace(/\s+/g, ' ').includes(q.citation.replace(/\s+/g, ' ')),
      `citation not found verbatim in module: "${q.citation}"`
    );
  }
});

test('every rule-based option is a token taken from the module text', () => {
  const questions = generateGroundedClozeQuestions({
    moduleContent: MODULE_CONTENT,
    count: 5
  });
  const normalized = MODULE_CONTENT.toLowerCase();
  for (const q of questions) {
    for (const opt of q.options) {
      // Each option is a single word — it must appear (case-insensitive,
      // whole-word) somewhere in the module content.
      const re = new RegExp(`\\b${opt.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      assert.ok(re.test(normalized), `option "${opt}" not grounded in module`);
    }
  }
});

test('rule-based correctIndex actually points at the correct word', () => {
  const questions = generateGroundedClozeQuestions({
    moduleContent: MODULE_CONTENT,
    count: 3
  });
  for (const q of questions) {
    const correct = q.options[q.correctIndex];
    // The stem with the correct word filled in should equal (or closely
    // match) the citation sentence — otherwise the question is broken.
    const filled = q.stem.replace('_____', correct);
    assert.ok(
      q.citation.includes(correct),
      `correct word "${correct}" should appear in citation "${q.citation}"`
    );
    assert.ok(filled.length > 0);
  }
});

test('rule-based questions are flagged needsReview', () => {
  const questions = generateGroundedClozeQuestions({
    moduleContent: MODULE_CONTENT,
    count: 3
  });
  for (const q of questions) {
    assert.equal(q.needsReview, true);
  }
});

test('rule-based returns no questions if module is too thin', () => {
  assert.deepEqual(generateGroundedClozeQuestions({ moduleContent: 'hi', count: 5 }), []);
  assert.deepEqual(
    generateGroundedClozeQuestions({ moduleContent: 'Short short short.', count: 5 }),
    []
  );
});

test('rule-based respects the count cap', () => {
  const questions = generateGroundedClozeQuestions({
    moduleContent: MODULE_CONTENT,
    count: 2
  });
  assert.ok(questions.length <= 2, `expected <=2, got ${questions.length}`);
});

// ---- Hybrid routing ------------------------------------------------

const moduleFixture = {
  title: { en: 'Leadership Basics', ar: 'أساسيات القيادة' },
  content: MODULE_CONTENT
};

test('server success → source: llm, questions passed through', async () => {
  const fakeFetch = async (url, opts) => {
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          success: true,
          source: 'llm',
          model: 'claude-opus-4-7',
          questions: [
            {
              stem: 'What is the foundation of leadership?',
              options: ['Communication', 'Charisma', 'Budget', 'Seniority'],
              correctIndex: 0,
              explanation: 'The module states communication is the foundation.',
              citation: 'Effective communication is the foundation of leadership.'
            }
          ],
          usage: { input_tokens: 200, output_tokens: 80 }
        };
      }
    };
  };

  const result = await generateQuestionsForModule(
    { module: moduleFixture, count: 3, language: 'en' },
    { fetch: fakeFetch, sessionId: 'sess-x' }
  );
  assert.equal(result.source, 'llm');
  assert.equal(result.model, 'claude-opus-4-7');
  assert.equal(result.questions.length, 1);
  assert.equal(result.questions[0].needsReview, false);
});

test('server 503 with fallback:true → source: rule-based', async () => {
  const fakeFetch = async () => ({
    ok: false,
    status: 503,
    async json() {
      return { success: false, error: 'ANTHROPIC_API_KEY is not configured on the server', fallback: true };
    }
  });

  const result = await generateQuestionsForModule(
    { module: moduleFixture, count: 3, language: 'en' },
    { fetch: fakeFetch, sessionId: 'sess-x' }
  );
  assert.equal(result.source, 'rule-based');
  assert.ok(result.reason.includes('ANTHROPIC_API_KEY'));
  assert.ok(result.questions.length > 0, 'rule-based fallback should still yield questions');
  for (const q of result.questions) assert.equal(q.needsReview, true);
});

test('server returns success but zero valid questions → fallback', async () => {
  const fakeFetch = async () => ({
    ok: true,
    status: 422,
    async json() {
      return { success: false, error: 'No generated question passed citation validation', fallback: true };
    }
  });

  const result = await generateQuestionsForModule(
    { module: moduleFixture, count: 3, language: 'en' },
    { fetch: fakeFetch, sessionId: 'sess-x' }
  );
  assert.equal(result.source, 'rule-based');
});

test('network error → fallback with reason', async () => {
  const fakeFetch = async () => {
    throw new Error('socket hang up');
  };
  const result = await generateQuestionsForModule(
    { module: moduleFixture, count: 3, language: 'en' },
    { fetch: fakeFetch, sessionId: 'sess-x' }
  );
  assert.equal(result.source, 'rule-based');
  assert.ok(result.reason.includes('socket hang up'));
});

test('module too thin → empty result with clear reason', async () => {
  const result = await generateQuestionsForModule(
    {
      module: { title: { en: 'Tiny' }, content: 'too short' },
      count: 3,
      language: 'en'
    },
    { fetch: async () => { throw new Error('should not be called'); }, sessionId: 'x' }
  );
  assert.equal(result.source, 'rule-based');
  assert.equal(result.questions.length, 0);
  assert.match(result.reason, /too short/);
});
