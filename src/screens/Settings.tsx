import { useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card, Icon, IconButton, icons, type } from '../components/ui';
import { LINKS } from '../config';
import { formatMoney } from '../lib/region';
import { useStore } from '../lib/store';
import { usePremium } from '../lib/usePremium';
import { colors, fonts } from '../theme';
import type { Go } from '../../App';

function num(t: string) {
  const n = parseFloat(t.replace(',', '.'));
  return isNaN(n) || n <= 0 ? null : n;
}

// Savings goal (Premium): name a reward and its price.
export function GoalEditor({ go }: { go: Go }) {
  const { state, update } = useStore();
  const [name, setName] = useState(state.goal?.name ?? '');
  const [price, setPrice] = useState(state.goal ? String(state.goal.price) : '');
  const valid = name.trim().length > 0 && num(price) !== null;

  return (
    <ScrollView contentContainerStyle={s.scroll}>
      <Header title="Savings goal" go={go} />
      <Text style={[type.body, { color: colors.muted }]}>Pick something you really want. The money you are not spending on cigarettes fills toward it every day.</Text>
      <Field label="What are you saving for?" value={name} onChange={setName} placeholder="New trainers" />
      <Field label={`How much does it cost? (${state.currency})`} value={price} onChange={setPrice} placeholder="120" numeric />
      <Button
        label="Save goal"
        disabled={!valid}
        style={!valid && { opacity: 0.5 }}
        onPress={() => {
          update({ goal: { name: name.trim(), price: num(price)! } });
          go('home');
        }}
      />
      {state.goal && <Button label="Remove goal" variant="ghost" onPress={() => { update({ goal: null }); go('home'); }} />}
    </ScrollView>
  );
}

export function Settings({ go }: { go: Go }) {
  const { state, update, reset } = useStore();
  const premium = usePremium();
  const [cigs, setCigs] = useState(String(state.cigsPerDay));
  const [pack, setPack] = useState(String(state.packPrice));

  const confirmReset = () => {
    const doIt = () => reset();
    if (Platform.OS === 'web') {
      if (window.confirm('Start over? This clears your quit date, streak and badges on this device.')) doIt();
    } else {
      Alert.alert('Start over?', 'This clears your quit date, streak and badges on this device.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start over', style: 'destructive', onPress: doIt },
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.scroll}>
      <Header title="Settings" go={go} back="progress" />
      <Card style={{ gap: 12 }}>
        <Field
          label="Cigarettes a day"
          value={cigs}
          onChange={(t) => {
            setCigs(t);
            const n = num(t);
            if (n) update({ cigsPerDay: Math.round(n) });
          }}
          numeric
        />
        <Field
          label={`Pack of 20 price (${formatMoney(state.packPrice, state.currency, true)})`}
          value={pack}
          onChange={(t) => {
            setPack(t);
            const n = num(t);
            if (n) update({ packPrice: n });
          }}
          numeric
        />
      </Card>
      <Card style={{ gap: 6 }}>
        <Text style={type.strong}>Premium</Text>
        <Text style={type.small}>
          {premium.storeActive ? 'Active through your store account.' : premium.earned ? 'Your earned free month is active.' : 'Not active.'}
        </Text>
        {premium.active && <Button label="Savings goal" variant="light" onPress={() => go('goal')} />}
        {!premium.active && <Button label="See Premium" variant="light" onPress={() => go('paywall')} />}
      </Card>
      <Card style={{ gap: 4 }}>
        <Text style={s.link} onPress={() => Linking.openURL(LINKS.privacy)}>Privacy policy</Text>
        <Text style={s.link} onPress={() => Linking.openURL(LINKS.terms)}>Terms of use</Text>
        <Text style={s.link} onPress={() => Linking.openURL(LINKS.support)}>Contact support</Text>
      </Card>
      <Text style={type.small}>
        Your quit data stays on this device. Health facts come from the WHO and NHS. Stub It supports your quit and is not a medical
        treatment; talk to a doctor or pharmacist about nicotine replacement and other help.
      </Text>
      <Button label="Start over" variant="ghost" onPress={confirmReset} />
    </ScrollView>
  );
}

function Header({ title, go, back = 'home' }: { title: string; go: Go; back?: Parameters<Go>[0] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
      <IconButton label="Back" onPress={() => go(back)}>
        <Icon d={icons.back} />
      </IconButton>
      <Text style={type.h2}>{title}</Text>
    </View>
  );
}

function Field(p: { label: string; value: string; onChange: (t: string) => void; placeholder?: string; numeric?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={type.strong}>{p.label}</Text>
      <TextInput
        accessibilityLabel={p.label}
        value={p.value}
        onChangeText={p.onChange}
        placeholder={p.placeholder}
        placeholderTextColor={colors.smoke}
        keyboardType={p.numeric ? 'decimal-pad' : 'default'}
        style={s.input}
      />
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, gap: 14 },
  input: { backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, height: 50, fontFamily: fonts.body, fontSize: 16, color: colors.pine },
  link: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.leaf, paddingVertical: 8 },
});
