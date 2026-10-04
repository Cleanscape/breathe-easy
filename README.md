# Stub It

A simple quit-smoking app for iPhone, Android and the web, built with Expo (SDK 57) from one codebase.

Ash, a cartoon smoker, coughs and stubs out a cigarette when you start, then visibly heals at each health milestone while you stay smoke-free.

## What's in version 1

1. **Onboarding**: the opening scene, then three questions (last cigarette, cigarettes a day, pack price in local currency).
2. **Home screen**: time smoke-free, money saved, cigarettes not smoked, with Ash in the middle.
3. **Healing character and health timeline**: six looks for Ash, seven WHO/NHS milestones (first five free, last two Premium).
4. **Craving SOS**: press and hold to crush the cigarette into the ashtray (with a haptic crunch), then a 3-minute breathing exercise.
5. **Forgiving streak and badges**: each smoke-free week earns a slip shield that absorbs one slip; badges for first craving, 10 cravings, first week, first month.
6. **Savings goal** (Premium): name a reward and watch savings fill toward it.

Premium is one subscription sold yearly (default) or monthly, with a 7-day trial and no lifetime plan. Users who reach a 30-day streak can claim a free month. The App Store and Google Play show each user's regional price automatically; see [STORE_SETUP.md](STORE_SETUP.md).

## Run it

```bash
npm install
npm run web        # opens in the browser
npm start          # scan the QR code; purchases need a development build, everything else works in Expo Go
```

Checks:

```bash
npm run typecheck
npm test           # quit maths: savings, streak, shields, milestones, badges
npm run build:web  # static web build in dist/
```

## Layout

| Path | What it is |
| --- | --- |
| `App.tsx` | Fonts, providers, and the screen switcher |
| `src/screens/` | Onboarding, Home, Sos, Progress, Paywall, Settings (with the savings goal editor) |
| `src/components/Ash.tsx` | Ash's six recovery looks and their cough, bob and jog animations |
| `src/components/OpeningScene.tsx` | The cough-and-stub-it-out intro animation |
| `src/lib/quit.ts` | All quit maths, unit tested in `quit.test.ts` |
| `src/lib/premium.tsx` | RevenueCat purchases (App Store, Google Play, web) |
| `src/lib/region.ts` | Device currency and fallback regional prices |
| `src/lib/store.tsx` | Saved state (on the device only) |
| `public/privacy.html` | Privacy policy, served with the web version |

Design source: the "Stub It app design" canvas (brand colours, Fredoka and DM Sans, Ash's six looks).
