// Run with: npm test  (Node's built-in test runner, no extra dependencies)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ashStage,
  badges,
  cigarettesAvoided,
  DAY,
  HOUR,
  logSlip,
  moneySaved,
  nextMilestone,

  shieldsAvailable,
  streakDays,
} from './quit.ts';
import type { QuitState } from './quit.ts';

const T0 = Date.UTC(2026, 0, 1);
const base: QuitState = { quitAt: T0, cigsPerDay: 20, packPrice: 10, streakStart: T0, shieldsUsed: 0, slips: [], cravings: [] };

test('savings: a pack a day at 10 saves 10 a day', () => {
  assert.equal(cigarettesAvoided(base, T0 + 3 * DAY), 60);
  assert.equal(moneySaved(base, T0 + 3 * DAY), 30);
});

test('slips are subtracted from cigarettes avoided', () => {
  assert.equal(cigarettesAvoided({ ...base, slips: [T0 + DAY] }, T0 + 2 * DAY), 39);
});

test('Ash stages follow milestones and cap at glowing', () => {
  assert.equal(ashStage(0), 0);
  assert.equal(ashStage(0.5), 1); // past 20 minutes
  assert.equal(ashStage(72), 2);
  assert.equal(ashStage(9000), 5);
  assert.equal(ashStage(200000), 5);
  assert.equal(nextMilestone(1)?.label, '3 days');
});

test('no shield in week one: a slip restarts the streak', () => {
  const now = T0 + 3 * DAY;
  assert.equal(shieldsAvailable(base, now), 0);
  const { next, shielded } = logSlip(base, now);
  assert.equal(shielded, false);
  assert.equal(streakDays(next, now + DAY), 1);
});

test('a week smoke-free earns a shield that keeps the streak', () => {
  const now = T0 + 10 * DAY;
  assert.equal(shieldsAvailable(base, now), 1);
  const { next, shielded } = logSlip(base, now);
  assert.equal(shielded, true);
  assert.equal(streakDays(next, now), 10);
  assert.equal(shieldsAvailable(next, now), 0);
  // A second slip the same week is not covered.
  assert.equal(logSlip(next, now + HOUR).shielded, false);
});

test('badges', () => {
  const got = (s: QuitState, now: number) => badges(s, now).filter((b) => b.got).map((b) => b.id);
  assert.deepEqual(got(base, T0), []);
  assert.deepEqual(got({ ...base, cravings: Array(10).fill(T0) }, T0 + 8 * DAY), ['craving1', 'craving10', 'week1']);
});
