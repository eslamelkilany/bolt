// Unit tests for the grounding validators in
// functions/api/custom/_grounding.js.
//
// Node has a builtin assert module and a builtin test runner (node:test),
// which keeps the repo from taking on a test-framework dependency for
// what is effectively a single pure module.
//
// Run with:   node --test tests/grounding.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeForCitation,
  isCitationValid,
  validateQuestion
} from '../functions/api/custom/_grounding.js';

const MODULE_CONTENT = `Module 3: Conflict Resolution

Conflict is inevitable in teams.
Interest-based negotiation outperforms positional bargaining.
A skilled leader separates the people from the problem.`;

const NORMALIZED = normalizeForCitation(MODULE_CONTENT);

// ---- normalizeForCitation ---------------------------------------------

test('normalizeForCitation collapses all whitespace runs', () => {
  assert.equal(normalizeForCitation('  a  b\n\nc\t\td  '), 'a b c d');
});

test('normalizeForCitation handles null/undefined', () => {
  assert.equal(normalizeForCitation(null), '');
  assert.equal(normalizeForCitation(undefined), '');
});

// ---- isCitationValid --------------------------------------------------

test('accepts a verbatim citation from the source', () => {
  assert.equal(
    isCitationValid('Interest-based negotiation outperforms positional bargaining.', NORMALIZED),
    true
  );
});

test('accepts a citation with different whitespace than the source', () => {
  // Source has it on one line; model might copy with extra spaces.
  assert.equal(
    isCitationValid('Interest-based   negotiation  outperforms\npositional bargaining.', NORMALIZED),
    true
  );
});

test('rejects a citation that is not in the source (hallucination)', () => {
  assert.equal(
    isCitationValid('Leaders must always avoid all conflict at all costs.', NORMALIZED),
    false
  );
});

test('rejects a near-miss paraphrase', () => {
  // Present in source: "Interest-based negotiation outperforms positional bargaining."
  // Paraphrase: should NOT pass — we require verbatim.
  assert.equal(
    isCitationValid('Interest-based bargaining beats positional negotiation.', NORMALIZED),
    false
  );
});

test('rejects an empty / very short citation', () => {
  assert.equal(isCitationValid('', NORMALIZED), false);
  assert.equal(isCitationValid('Conflict.', NORMALIZED), false); // <12 chars
});

// ---- validateQuestion -------------------------------------------------

const goodQuestion = {
  stem: 'Which negotiation style does the module recommend?',
  options: ['Interest-based', 'Positional', 'Avoidant', 'Coercive'],
  correctIndex: 0,
  explanation: 'The module states that interest-based negotiation outperforms positional bargaining.',
  citation: 'Interest-based negotiation outperforms positional bargaining.'
};

test('validateQuestion accepts a well-formed grounded question', () => {
  assert.equal(validateQuestion(goodQuestion, NORMALIZED), true);
});

test('validateQuestion rejects a question with a hallucinated citation', () => {
  const bad = { ...goodQuestion, citation: 'Leaders should fire any team member who disagrees.' };
  assert.equal(validateQuestion(bad, NORMALIZED), false);
});

test('validateQuestion rejects correctIndex out of bounds', () => {
  assert.equal(validateQuestion({ ...goodQuestion, correctIndex: 99 }, NORMALIZED), false);
  assert.equal(validateQuestion({ ...goodQuestion, correctIndex: -1 }, NORMALIZED), false);
});

test('validateQuestion rejects fewer than 2 options', () => {
  assert.equal(validateQuestion({ ...goodQuestion, options: ['Only one'] }, NORMALIZED), false);
});

test('validateQuestion rejects more than 6 options', () => {
  const sevenOpts = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  assert.equal(validateQuestion({ ...goodQuestion, options: sevenOpts }, NORMALIZED), false);
});

test('validateQuestion rejects empty stem', () => {
  assert.equal(validateQuestion({ ...goodQuestion, stem: '' }, NORMALIZED), false);
});

test('validateQuestion rejects a non-object input', () => {
  assert.equal(validateQuestion(null, NORMALIZED), false);
  assert.equal(validateQuestion('hello', NORMALIZED), false);
  assert.equal(validateQuestion(42, NORMALIZED), false);
});

test('validateQuestion rejects non-integer correctIndex', () => {
  assert.equal(validateQuestion({ ...goodQuestion, correctIndex: 1.5 }, NORMALIZED), false);
  assert.equal(validateQuestion({ ...goodQuestion, correctIndex: '0' }, NORMALIZED), false);
});

test('validateQuestion rejects option containing only whitespace', () => {
  assert.equal(
    validateQuestion({ ...goodQuestion, options: ['Good', '   ', 'Also good', 'Fourth'] }, NORMALIZED),
    false
  );
});
