import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashCode, isReviewCode } from './reviewCode.ts';

test('review code hash ignores case and surrounding spaces', () => {
  assert.equal(hashCode(' abc '), hashCode('ABC'));
  assert.notEqual(hashCode('ABC'), hashCode('ABD'));
});

test('empty and wrong review codes are rejected', () => {
  assert.equal(isReviewCode(''), false);
  assert.equal(isReviewCode('   '), false);
  assert.equal(isReviewCode('ASH-WRONG123'), false);
});
