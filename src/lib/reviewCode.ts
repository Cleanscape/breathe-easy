// App reviewers (Google Play, App Store) can't pay for or trial a subscription, so the paywall accepts a
// review code that unlocks Premium on that device for 30 days. Only a hash is kept here; the code itself
// is given to the stores in their review notes.
const REVIEW_CODE_HASH = 'b1fcb89c';

export function hashCode(code: string): string {
  let h = 0x811c9dc5;
  for (const ch of code.trim().toUpperCase()) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

export const isReviewCode = (code: string) => code.trim().length > 0 && hashCode(code) === REVIEW_CODE_HASH;
