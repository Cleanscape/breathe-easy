import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Icon, IconButton, icons, type } from '../components/ui';
import { badges, durationText, hoursSince, MILESTONES, nextMilestone } from '../lib/quit';
import { useNow, useStore } from '../lib/store';
import { usePremium } from '../lib/usePremium';
import { colors, fonts } from '../theme';
import type { Go } from '../../App';

export function Progress({ go }: { go: Go }) {
  const { state } = useStore();
  const now = useNow(30_000);
  const premium = usePremium();
  const hours = hoursSince(state.quitAt, now);
  const next = nextMilestone(hours);

  return (
    <ScrollView contentContainerStyle={s.scroll}>
      <View style={s.header}>
        <IconButton label="Back to home" onPress={() => go('home')}>
          <Icon d={icons.back} />
        </IconButton>
        <Text style={[type.h2, { flex: 1 }]}>Your progress</Text>
        <IconButton label="Settings" onPress={() => go('settings')}>
          <Icon d={icons.gear} />
        </IconButton>
      </View>

      <Text style={type.label}>Health timeline</Text>
      {MILESTONES.map((m) => {
        const done = hours >= m.hours;
        const locked = !done && m.premium && !premium.active;
        return (
          <View key={m.label} style={[s.row, next === m && { borderWidth: 2, borderColor: colors.leaf }]}>
            <View
              style={[
                s.mark,
                done ? { backgroundColor: colors.leaf } : locked ? { backgroundColor: colors.sunshine } : { borderWidth: 2.5, borderColor: colors.dashed },
              ]}
            >
              {done && <Icon d={icons.check} size={18} color={colors.white} />}
              {locked && <Icon d={icons.lock} size={18} color="#6B4A00" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.small}>{m.label}</Text>
              <Text style={type.strong}>{m.title}</Text>
              <Text style={type.small}>{m.look}</Text>
            </View>
            <Text style={[type.small, { fontFamily: fonts.bodyBold, textAlign: 'right' }]}>
              {done ? 'Reached' : locked ? 'Premium' : `in ${durationText(m.hours - hours)}`}
            </Text>
          </View>
        );
      })}

      <Text style={[type.label, { marginTop: 12 }]}>Badges</Text>
      <View style={s.badges}>
        {badges(state, now).map((b) => (
          <View key={b.id} style={[s.badge, b.got ? { backgroundColor: colors.white } : s.badgeOff]}>
            <View style={[s.badgeDot, { backgroundColor: b.got ? colors.ember : colors.track }]}>
              <Icon d={icons.star} size={18} color={b.got ? colors.pine : colors.muted} />
            </View>
            <Text style={[type.strong, { fontSize: 14, flex: 1, color: b.got ? colors.pine : colors.muted }]}>{b.name}</Text>
          </View>
        ))}
      </View>

      {!premium.active && <Button label="See Premium" variant="light" onPress={() => go('paywall')} style={{ marginTop: 8 }} />}

      <Text style={[type.small, { marginTop: 12 }]}>
        Health facts from the WHO and NHS. Stub It supports your quit and is not a medical treatment.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 18, padding: 12 },
  mark: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { width: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 18, padding: 12 },
  badgeOff: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.dashed },
  badgeDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
