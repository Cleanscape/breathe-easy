// Pure quit maths: milestones, streak, slip shields, savings and badges.
// Everything is derived from the saved state and "now", so it is easy to test.

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const CIGS_PER_PACK = 20;

export type Milestone = {
  hours: number;
  label: string;
  title: string;
  look: string;
  premium?: boolean;
};

// Health facts: WHO "Tobacco: health benefits of smoking cessation" and NHS "Quit smoking" timelines.
export const MILESTONES: Milestone[] = [
  { hours: 1 / 3, label: '20 minutes', title: 'Heart rate drops', look: 'Ash sits up a little' },
  { hours: 72, label: '3 days', title: 'Breathing gets easier', look: 'The cough fades' },
  { hours: 336, label: '2 weeks', title: 'Circulation improves', look: 'Colour comes back' },
  { hours: 2160, label: '3 months', title: 'Coughing and wheezing ease', look: 'Ash starts jogging' },
  { hours: 8760, label: '1 year', title: 'Heart disease risk halved', look: 'Ash is glowing' },
  { hours: 87600, label: '10 years', title: 'Lung cancer risk about halved', look: 'A new outfit for Ash', premium: true },
  { hours: 131400, label: '15 years', title: 'Heart disease risk like a non-smoker', look: 'Ash, fully recovered', premium: true },
];

export type QuitState = {
  quitAt: number;
  cigsPerDay: number;
  packPrice: number;
  streakStart: number;
  shieldsUsed: number;
  slips: number[];
  cravings: number[];
};

export function hoursSince(quitAt: number, now: number) {
  return Math.max(0, (now - quitAt) / HOUR);
}

export function reachedCount(hours: number) {
  return MILESTONES.filter((m) => hours >= m.hours).length;
}

// Ash has six looks; stage 5 (glowing) is the most a free user sees on the home screen.
export function ashStage(hours: number) {
  return Math.min(reachedCount(hours), 5);
}

export function nextMilestone(hours: number) {
  return MILESTONES.find((m) => m.hours > hours) ?? null;
}

export function lastMilestone(hours: number) {
  const n = reachedCount(hours);
  return n > 0 ? MILESTONES[n - 1] : null;
}

export function cigarettesAvoided(s: QuitState, now: number) {
  const days = (now - s.quitAt) / DAY;
  return Math.max(0, Math.floor(s.cigsPerDay * days) - s.slips.length);
}

export function moneySaved(s: QuitState, now: number) {
  return (cigarettesAvoided(s, now) * s.packPrice) / CIGS_PER_PACK;
}

export function streakDays(s: QuitState, now: number) {
  return Math.max(0, Math.floor((now - s.streakStart) / DAY));
}

// Each full smoke-free week since the quit date earns one slip shield.
export function shieldsAvailable(s: QuitState, now: number) {
  const earned = Math.floor(Math.max(0, now - s.quitAt) / WEEK);
  return Math.max(0, earned - s.shieldsUsed);
}

export type SlipResult = { next: QuitState; shielded: boolean };

// A slip never resets health progress or savings. A shield keeps the streak; without one the streak restarts.
export function logSlip(s: QuitState, now: number): SlipResult {
  const shielded = shieldsAvailable(s, now) > 0;
  return {
    shielded,
    next: {
      ...s,
      slips: [...s.slips, now],
      shieldsUsed: shielded ? s.shieldsUsed + 1 : s.shieldsUsed,
      streakStart: shielded ? s.streakStart : now,
    },
  };
}

export type Badge = { id: string; name: string; got: boolean };

export function badges(s: QuitState, now: number): Badge[] {
  const hours = hoursSince(s.quitAt, now);
  return [
    { id: 'craving1', name: 'First craving beaten', got: s.cravings.length >= 1 },
    { id: 'craving10', name: '10 cravings beaten', got: s.cravings.length >= 10 },
    { id: 'week1', name: 'First week', got: hours >= 168 },
    { id: 'month1', name: 'First month', got: hours >= 720 },
  ];
}

export const EARN_PREMIUM_DAYS = 30;

export function durationParts(hours: number): [string, string] {
  if (hours < 1) return [String(Math.max(0, Math.floor(hours * 60))), 'min'];
  if (hours < 48) {
    const h = Math.floor(hours);
    return [String(h), h === 1 ? 'hour' : 'hours'];
  }
  const d = Math.floor(hours / 24);
  if (d >= 730) return [String(Math.floor(d / 365)), 'years'];
  return [d.toLocaleString(), d === 1 ? 'day' : 'days'];
}

export function durationText(hours: number) {
  const [n, unit] = durationParts(hours);
  return `${n} ${unit}`;
}
