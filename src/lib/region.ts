import { getLocales } from 'expo-localization';

// Display prices for the paywall when the store has not returned live prices yet
// (web preview, or before products are set up). Real purchases always use the store's own price.
type PriceRow = { yearly: string; monthly: string; perMonth: string; pack: number };

const EURO_REGIONS = new Set([
  'AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
]);

const PRICES: Record<'US' | 'UK' | 'EU' | 'CA' | 'AU', PriceRow> = {
  US: { yearly: '$29.99', monthly: '$4.99', perMonth: '$2.50', pack: 9 },
  UK: { yearly: '£24.99', monthly: '£3.99', perMonth: '£2.08', pack: 16 },
  EU: { yearly: '€27.99', monthly: '€4.49', perMonth: '€2.33', pack: 8 },
  CA: { yearly: 'CA$39.99', monthly: 'CA$6.99', perMonth: 'CA$3.33', pack: 15 },
  AU: { yearly: 'A$44.99', monthly: 'A$7.49', perMonth: 'A$3.75', pack: 40 },
};

// Browsers do not report a currency, so the web falls back to the region's currency.
const REGION_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', IE: 'EUR', IN: 'INR', ZA: 'ZAR', SG: 'SGD',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', JP: 'JPY', BR: 'BRL', MX: 'MXN',
};

function locale() {
  const l = getLocales()[0];
  const region = (l?.regionCode ?? 'US').toUpperCase();
  return {
    tag: l?.languageTag ?? 'en-US',
    region,
    currency: l?.currencyCode ?? REGION_CURRENCY[region] ?? (EURO_REGIONS.has(region) ? 'EUR' : 'USD'),
  };
}

export function priceRegion(): keyof typeof PRICES {
  const { region } = locale();
  if (region === 'GB') return 'UK';
  if (region === 'CA' || region === 'AU' || region === 'US') return region;
  if (EURO_REGIONS.has(region)) return 'EU';
  return 'US';
}

export function regionPrices() {
  return PRICES[priceRegion()];
}

export function deviceCurrency() {
  return locale().currency;
}

// A sensible starting pack price in local money, used to prefill onboarding.
export function defaultPackPrice() {
  const { currency } = locale();
  const byCurrency: Record<string, number> = { USD: 9, GBP: 16, EUR: 8, CAD: 15, AUD: 40, NZD: 38 };
  return byCurrency[currency] ?? 10;
}

// Whole units for running totals (easier to read at a glance); `exact` keeps pennies for prices.
export function formatMoney(amount: number, currency: string, exact = false) {
  const { tag } = locale();
  const digits = exact ? (Number.isInteger(amount) ? 0 : 2) : amount >= 10 ? 0 : 2;
  try {
    return new Intl.NumberFormat(tag, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(digits)}`;
  }
}
