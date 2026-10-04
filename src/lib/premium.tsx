import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { regionPrices } from './region';

// Purchases run through RevenueCat, which talks to the App Store, Google Play and (on the web) Stripe.
// The stores pick the right regional price automatically; the keys below come from the RevenueCat dashboard.
// See STORE_SETUP.md for the products to create (breatheeasy_premium_yearly, breatheeasy_premium_monthly, 7-day trial).
export const ENTITLEMENT = 'premium';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
  android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
  web: process.env.EXPO_PUBLIC_RC_WEB_KEY,
});

export type PlanOption = { id: 'yearly' | 'monthly'; price: string; perMonth?: string; pkg?: PurchasesPackage };

type Premium = {
  storeActive: boolean; // paid or trialling through a store
  storeReady: boolean; // RevenueCat configured with a key
  plans: Plans;
  buy: (plan: PlanOption) => Promise<'bought' | 'cancelled' | 'unavailable'>;
  restore: () => Promise<boolean>;
};

const Ctx = createContext<Premium | null>(null);

const active = (info: CustomerInfo) => Boolean(info.entitlements.active[ENTITLEMENT]);

type Plans = { yearly: PlanOption; monthly: PlanOption };

function fallbackPlans(): Plans {
  const p = regionPrices();
  return {
    yearly: { id: 'yearly', price: p.yearly, perMonth: p.perMonth },
    monthly: { id: 'monthly', price: p.monthly },
  };
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [storeActive, setStoreActive] = useState(false);
  const [storeReady, setStoreReady] = useState(false);
  const [plans, setPlans] = useState<Plans>(fallbackPlans);

  useEffect(() => {
    if (!API_KEY) return;
    const apiKey = API_KEY;
    let cancelled = false;
    (async () => {
      try {
        Purchases.configure({ apiKey });
        Purchases.addCustomerInfoUpdateListener((info) => setStoreActive(active(info)));
        const [info, offerings] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()]);
        if (cancelled) return;
        setStoreReady(true);
        setStoreActive(active(info));
        const cur = offerings.current;
        if (cur?.annual && cur?.monthly) {
          const year = cur.annual.product;
          setPlans({
            yearly: {
              id: 'yearly',
              price: year.priceString,
              perMonth: year.pricePerMonthString ?? undefined,
              pkg: cur.annual,
            },
            monthly: { id: 'monthly', price: cur.monthly.product.priceString, pkg: cur.monthly },
          });
        }
      } catch (e) {
        console.warn('Purchases unavailable', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buy = useCallback(async (plan: PlanOption) => {
    if (!plan.pkg) return 'unavailable' as const;
    try {
      const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
      setStoreActive(active(customerInfo));
      return 'bought' as const;
    } catch (e: any) {
      if (e?.userCancelled) return 'cancelled' as const;
      throw e;
    }
  }, []);

  const restore = useCallback(async () => {
    if (!storeReady) return false;
    const info = await Purchases.restorePurchases();
    setStoreActive(active(info));
    return active(info);
  }, [storeReady]);

  const value = useMemo(() => ({ storeActive, storeReady, plans, buy, restore }), [storeActive, storeReady, plans, buy, restore]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremiumStore() {
  const p = useContext(Ctx);
  if (!p) throw new Error('usePremiumStore outside PremiumProvider');
  return p;
}
