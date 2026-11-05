# Getting Breathe Easy into the stores

The code is ready to build. These steps need the account owner, because they involve sign-ups, payment details and legal agreements.

## 1. Accounts

| Account | Cost | Needed for |
| --- | --- | --- |
| [Apple Developer Program](https://developer.apple.com/programs/enroll/) | $99 a year | App Store (iPhone) |
| [Google Play Console](https://play.google.com/console/signup) | $25 once | Google Play (Android) |
| [Expo](https://expo.dev/signup) | Free tier is enough | Cloud builds, store submission, web hosting |
| [RevenueCat](https://app.revenuecat.com/signup) | Free until $2.5k monthly revenue | Subscriptions on all three platforms |
| [Stripe](https://dashboard.stripe.com/register) | Per-transaction fees | Web subscriptions only (optional at launch) |

Apple and Google both require paid-app agreements, tax forms and bank details before subscriptions can be sold.

## 2. App identity

- Bundle ID / package name: `com.stellaforgestudios.breatheeasy` (in `app.json`). It cannot change after the first upload.
- Expo account: `stellaforgestudios` (the `owner` in `app.json`).
- App name: "Breathe Easy" on the device; list it in the stores as "Breathe Easy: Quit Smoking" (a small iOS app "Quit Smoking - Breatheasy CBT" already exists). Run a trademark search before you submit.

## 3. Subscriptions

Create one subscription group, **Breathe Easy Premium**, with two products in each store:

| Product ID | Length | Free trial |
| --- | --- | --- |
| `breatheeasy_premium_yearly` | 1 year | 7 days |
| `breatheeasy_premium_monthly` | 1 month | 7 days |

Set prices by hand in App Store Connect and Play Console so each region shows a round local price:

| Region | Yearly | Monthly |
| --- | --- | --- |
| United States (base) | $29.99 | $4.99 |
| United Kingdom | £24.99 | £3.99 |
| Eurozone | €27.99 | €4.49 |
| Canada | CA$39.99 | CA$6.99 |
| Australia | A$44.99 | A$7.49 |

Every other country uses the stores' automatic conversion from the US price. Users never pick a region: the store shows the price for their store country.

In RevenueCat: add the iOS and Android apps (and a Web Billing app if selling on the web), attach both products to an entitlement called **`premium`**, and put them in the default offering as the **Annual** and **Monthly** packages. Copy the public SDK keys into EAS environment variables (see `.env.example`):

```bash
npx eas-cli@latest env:create --name EXPO_PUBLIC_RC_IOS_KEY --value appl_... --environment production
npx eas-cli@latest env:create --name EXPO_PUBLIC_RC_ANDROID_KEY --value goog_... --environment production
```

Until the keys are set, the paywall shows the regional prices above and says purchases open once the app is live.

## 4. Build and submit

```bash
npx eas-cli@latest login
npx eas-cli@latest init                                  # links the project to your Expo account
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios                 # uploads to App Store Connect / TestFlight
npx eas-cli@latest submit --platform android             # uploads to the Play internal testing track
```

EAS creates and stores the signing certificates. Google requires the very first Android upload to be done by hand in Play Console; download the `.aab` from the EAS build page for that one.

## 5. Web version

```bash
npm run build:web                    # static site in dist/
npx eas-cli@latest deploy --prod     # free hosting on EAS, or upload dist/ to Netlify, Vercel or similar
```

Point your domain at it so the privacy policy lives at `https://<your domain>/privacy.html`, then update `src/config.ts`.

## 6. Store listing answers

- **Category**: Health & Fitness.
- **Age rating**: the app shows a cigarette only in a quitting context, and has no user content or ads. Answer the questionnaires honestly about "tobacco references"; expect 12+ on Apple and Teen on Google.
- **Privacy labels / Data safety**: quit data stays on the device. RevenueCat processes purchase history linked to an anonymous ID. No tracking, no ads, no analytics.
- **Health claims**: keep the "not a medical treatment" wording; milestone facts cite the WHO and NHS.
- **Privacy policy URL**: required by both stores; fill in the placeholders in `public/privacy.html` first.
- **Subscription disclosure**: the paywall already shows price, length, trial and auto-renewal, plus Terms and Privacy links, which Apple requires.
