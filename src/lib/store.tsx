import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DAY, EARN_PREMIUM_DAYS, logSlip, QuitState, streakDays } from './quit';

const KEY = 'stubit.state.v1';

export type Goal = { name: string; price: number };

export type AppState = QuitState & {
  onboarded: boolean;
  currency: string;
  goal: Goal | null;
  earnedPremiumUntil: number; // free month for 30 smoke-free days
  earnedClaimed: boolean;
};

export const initialState: AppState = {
  onboarded: false,
  quitAt: 0,
  cigsPerDay: 15,
  packPrice: 10,
  currency: 'USD',
  streakStart: 0,
  shieldsUsed: 0,
  slips: [],
  cravings: [],
  goal: null,
  earnedPremiumUntil: 0,
  earnedClaimed: false,
};

type Store = {
  state: AppState;
  loaded: boolean;
  update: (patch: Partial<AppState>) => void;
  startQuit: (args: { quitAt: number; cigsPerDay: number; packPrice: number; currency: string }) => void;
  beatCraving: () => number;
  slip: () => boolean;
  claimEarnedPremium: () => void;
  canClaimEarnedPremium: (now: number) => boolean;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const update = useCallback((patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch })), []);

  const store = useMemo<Store>(
    () => ({
      state,
      loaded,
      update,
      startQuit: ({ quitAt, cigsPerDay, packPrice, currency }) =>
        setState((s) => ({
          ...s,
          onboarded: true,
          quitAt,
          streakStart: quitAt,
          cigsPerDay,
          packPrice,
          currency,
          shieldsUsed: 0,
          slips: [],
        })),
      beatCraving: () => {
        const n = state.cravings.length + 1;
        setState((s) => ({ ...s, cravings: [...s.cravings, Date.now()] }));
        return n;
      },
      slip: () => {
        const { next, shielded } = logSlip(state, Date.now());
        setState((s) => ({ ...s, ...next }));
        return shielded;
      },
      canClaimEarnedPremium: (now) => !state.earnedClaimed && streakDays(state, now) >= EARN_PREMIUM_DAYS,
      claimEarnedPremium: () =>
        setState((s) => ({ ...s, earnedClaimed: true, earnedPremiumUntil: Date.now() + 30 * DAY })),
      reset: () => setState(initialState),
    }),
    [state, loaded, update],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

// Re-renders every `ms` so counters tick.
export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
