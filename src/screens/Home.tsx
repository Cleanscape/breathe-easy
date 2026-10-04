import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ash } from '../components/Ash';
import { Brand, Button, Card, Icon, icons, ProgressBar, type } from '../components/ui';
import { usePremium } from '../lib/usePremium';
import {
  ashStage,
  cigarettesAvoided,
  durationParts,
  durationText,
  hoursSince,
  lastMilestone,
  moneySaved,
  nextMilestone,
  shieldsAvailable,
  streakDays,
} from '../lib/quit';
import { formatMoney } from '../lib/region';
import { useNow, useStore } from '../lib/store';
import { colors, fonts } from '../theme';
import type { Go } from '../../App';

export function Home({ go }: { go: Go }) {
  const store = useStore();
  const { state } = store;
  const now = useNow(1000);
  const premium = usePremium();
  const [slip, setSlip] = useState<null | 'shield' | 'reset'>(null);
  const [coughing, setCoughing] = useState(false);

  useEffect(() => {
    if (!coughing) return;
    const id = setTimeout(() => setCoughing(false), 3200);
    return () => clearTimeout(id);
  }, [coughing]);

  const hours = hoursSince(state.quitAt, now);
  const last = lastMilestone(hours);
  const next = nextMilestone(hours);
  const [freeVal, freeUnit] = durationParts(hours);
  const saved = moneySaved(state, now);
  const streak = streakDays(state, now);
  const shields = shieldsAvailable(state, now);
  const money = (n: number) => formatMoney(n, state.currency);
  const canClaim = !premium.active && store.canClaimEarnedPremium(now);

  const onSlip = () => {
    const shielded = store.slip();
    setCoughing(true);
    setSlip(shielded ? 'shield' : 'reset');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Brand />
          <Pressable accessibilityRole="button" onPress={() => go('progress')} style={s.pill}>
            <Icon d={icons.chart} size={20} />
            <Text style={type.strong}>Progress</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <Ash stage={ashStage(hours)} coughing={coughing} />
          <Text style={[type.h3, { textAlign: 'center', marginTop: 4 }]}>
            {last ? `${last.label}: ${last.title.toLowerCase()}` : 'Day one'}
          </Text>
          <Text style={[type.small, { textAlign: 'center', marginTop: 4 }]}>
            {next ? `Next: ${next.title.toLowerCase()} in ${durationText(next.hours - hours)}` : 'Every milestone reached'}
          </Text>
        </View>

        <View style={s.stats}>
          <Stat value={freeVal} unit={freeUnit} label="smoke-free" />
          <Stat value={money(saved)} label="saved" />
          <Stat value={cigarettesAvoided(state, now).toLocaleString()} label="not smoked" />
        </View>

        <Card style={s.row}>
          <Text style={type.body}>
            Streak <Text style={{ fontFamily: fonts.display, fontSize: 20 }}>{streak} {streak === 1 ? 'day' : 'days'}</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon d={icons.shield} size={20} color={colors.leaf} />
            <Text style={type.small}>
              {shields} {shields === 1 ? 'slip shield' : 'slip shields'}
            </Text>
          </View>
        </Card>

        {canClaim && (
          <Card style={[s.row, { backgroundColor: colors.sunshine }]}>
            <Text style={[type.body, { flex: 1, marginRight: 12 }]}>
              <Text style={{ fontFamily: fonts.bodyBold }}>30 days smoke-free.</Text> You have earned a free month of Premium.
            </Text>
            <Button label="Claim" onPress={store.claimEarnedPremium} style={{ height: 44 }} />
          </Card>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => go(premium.active ? 'goal' : 'paywall')}
          style={s.goal}
        >
          {premium.active && state.goal ? (
            <>
              <View style={s.goalTop}>
                <Text style={type.strong}>Saving for: {state.goal.name}</Text>
              </View>
              <ProgressBar pct={(saved / state.goal.price) * 100} />
              <Text style={type.small}>
                {saved >= state.goal.price ? 'Done! ' : ''}
                {money(Math.min(saved, state.goal.price))} of {money(state.goal.price)}
              </Text>
            </>
          ) : (
            <>
              <View style={s.goalTop}>
                <Text style={type.strong}>{premium.active ? 'Set a savings goal' : 'Saving for something?'}</Text>
                {!premium.active && <Text style={s.badge}>Premium</Text>}
              </View>
              <ProgressBar pct={0} />
              <Text style={type.small}>Pick a reward and watch your savings fill toward it.</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <View style={s.footer}>
        <Button label="Craving? Stub it out" variant="ember" onPress={() => go('sos')} />
        <Button label="I slipped" variant="ghost" onPress={onSlip} />
      </View>

      <Modal visible={!!slip} transparent animationType="fade" onRequestClose={() => setSlip(null)}>
        <View style={s.overlay}>
          <Card style={{ width: '100%', maxWidth: 480 }}>
            <Text style={[type.h3, { marginBottom: 8 }]}>{slip === 'shield' ? 'A slip shield caught it' : 'Get back up'}</Text>
            <Text style={[type.body, { color: colors.muted, marginBottom: 20 }]}>
              {slip === 'shield'
                ? `One cigarette does not undo ${durationText(hours)}. Your streak is safe. Ash coughed once, then got back up.`
                : 'Your streak starts again today, but your health progress and money saved stay. Ash is still with you.'}
            </Text>
            <Button label="Back on track" onPress={() => setSlip(null)} />
          </Card>
        </View>
      </Modal>
    </View>
  );
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        {unit ? <Text style={{ fontSize: 14 }}> {unit}</Text> : null}
      </Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: 22, height: 44, paddingHorizontal: 14 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: 18, padding: 12 },
  statVal: { fontFamily: fonts.display, fontSize: 21, color: colors.pine },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goal: { backgroundColor: colors.white, borderRadius: 24, padding: 18, gap: 10 },
  goalTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: colors.sunshine, color: '#6B4A00', fontFamily: fonts.bodyBold, fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  footer: { paddingHorizontal: 20, paddingBottom: 8, paddingTop: 8, gap: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(18, 49, 42, 0.5)', justifyContent: 'flex-end', alignItems: 'center', padding: 16 },
});
