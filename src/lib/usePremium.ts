import { usePremiumStore } from './premium';
import { useNow, useStore } from './store';

// Premium is active when the store says so (paid or in trial), or during the free month earned at 30 smoke-free days.
export function usePremium() {
  const store = usePremiumStore();
  const { state } = useStore();
  const now = useNow(60_000);
  const earned = state.earnedPremiumUntil > now;
  return { ...store, active: store.storeActive || earned, earned };
}
