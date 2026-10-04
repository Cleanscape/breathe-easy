import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Icon, IconButton, icons, Logo, type } from '../components/ui';
import { LINKS } from '../config';
import { PlanOption } from '../lib/premium';
import { usePremium } from '../lib/usePremium';
import { colors, fonts } from '../theme';
import type { Go } from '../../App';

export function Paywall({ go }: { go: Go }) {
  const premium = usePremium();
  const [pick, setPick] = useState<'yearly' | 'monthly'>('yearly');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const { yearly, monthly } = premium.plans;
  const chosen: PlanOption = pick === 'yearly' ? yearly : monthly;

  const start = async () => {
    setBusy(true);
    setNote('');
    try {
      const r = await premium.buy(chosen);
      if (r === 'bought') go('home');
      if (r === 'unavailable') setNote('Purchases open once Stub It is live in the App Store and Google Play.');
    } catch {
      setNote('That did not go through. Nothing was charged; please try again.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const ok = await premium.restore();
      setNote(ok ? 'Premium restored.' : 'No previous purchase found for this account.');
      if (ok) go('home');
    } catch {
      setNote('Could not reach the store. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.scroll}>
      <View style={{ alignItems: 'flex-end' }}>
        <IconButton label="Close" onPress={() => go('home')}>
          <Icon d={icons.close} />
        </IconButton>
      </View>
      <View style={s.mark}>
        <Logo size={60} dark />
      </View>
      <Text style={[type.h2, { textAlign: 'center' }]}>Stub It Premium</Text>
      <Text style={[type.body, { textAlign: 'center', color: colors.muted }]}>Everything you need to quit stays free. Premium adds:</Text>
      <View style={{ gap: 10, marginVertical: 6 }}>
        <Perk text="Every health milestone, plus outfits for Ash" />
        <Perk text="A savings goal for something you really want" />
      </View>

      <Plan
        on={pick === 'yearly'}
        onPress={() => setPick('yearly')}
        title="Yearly"
        sub={yearly.perMonth ? `About ${yearly.perMonth} a month` : undefined}
        price={yearly.price}
        tag="Save about half"
      />
      <Plan on={pick === 'monthly'} onPress={() => setPick('monthly')} title="Monthly" price={monthly.price} />

      {busy ? <ActivityIndicator color={colors.leaf} style={{ height: 58 }} /> : <Button label="Start 7-day free trial" onPress={start} />}
      <Text style={[type.small, { textAlign: 'center' }]}>
        Free for 7 days, then {chosen.price} {pick === 'yearly' ? 'a year' : 'a month'}. Renews automatically until you cancel in your
        App Store or Google Play settings.
      </Text>
      {!!note && <Text style={[type.strong, { textAlign: 'center', fontSize: 14 }]}>{note}</Text>}
      <Button label="Restore purchase" variant="ghost" onPress={restore} />
      <View style={s.links}>
        <Text style={s.link} onPress={() => Linking.openURL(LINKS.terms)}>
          Terms of use
        </Text>
        <Text style={s.link} onPress={() => Linking.openURL(LINKS.privacy)}>
          Privacy policy
        </Text>
      </View>
    </ScrollView>
  );
}

function Perk({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <Icon d={icons.check} color={colors.leaf} />
      <Text style={[type.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

function Plan(p: { on: boolean; onPress: () => void; title: string; sub?: string; price: string; tag?: string }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: p.on }}
      onPress={p.onPress}
      style={[s.plan, { borderColor: p.on ? colors.leaf : 'transparent' }]}
    >
      <View>
        <Text style={type.strong}>{p.title}</Text>
        {p.sub && <Text style={type.small}>{p.sub}</Text>}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.pine }}>{p.price}</Text>
        {p.tag && <Text style={s.tag}>{p.tag}</Text>}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, gap: 12 },
  mark: { width: 84, height: 84, borderRadius: 24, backgroundColor: colors.pine, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: 20, padding: 18, borderWidth: 3 },
  tag: { marginTop: 4, backgroundColor: colors.sunshine, color: '#6B4A00', fontFamily: fonts.bodyBold, fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  link: { fontFamily: fonts.body, fontSize: 13, color: colors.leaf, textDecorationLine: 'underline' },
});
