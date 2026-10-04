import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OpeningScene } from '../components/OpeningScene';
import { Brand, Button, Icon, IconButton, icons, type } from '../components/ui';
import { DAY } from '../lib/quit';
import { defaultPackPrice, deviceCurrency, formatMoney } from '../lib/region';
import { useStore } from '../lib/store';
import { colors, fonts } from '../theme';

const QUIT_OPTS = [
  { label: 'Today', ago: 0 },
  { label: 'Yesterday', ago: DAY },
  { label: 'A week ago', ago: 7 * DAY },
];

export function Onboarding() {
  const [step, setStep] = useState<'welcome' | 0 | 1 | 2>('welcome');
  const [quitPick, setQuitPick] = useState(0);
  const [cigs, setCigs] = useState(15);
  const [pack, setPack] = useState(defaultPackPrice());
  const currency = deviceCurrency();
  const { startQuit } = useStore();

  if (step === 'welcome') {
    return (
      <View style={s.screen}>
        <Brand size={32} />
        <View style={s.center}>
          <OpeningScene size={300} />
        </View>
        <Text style={[type.h1, { marginBottom: 12 }]}>Stub it out.{'\n'}Watch yourself heal.</Text>
        <Text style={[type.body, { color: colors.muted, marginBottom: 28 }]}>
          This is Ash. They have smoked for years, and today they are done. Ash gets healthier every day you stay smoke-free.
        </Text>
        <Button label="I'm done too" onPress={() => setStep(0)} />
      </View>
    );
  }

  const q = step;
  const next = () => {
    if (q < 2) return setStep((q + 1) as 1 | 2);
    startQuit({ quitAt: Date.now() - QUIT_OPTS[quitPick].ago, cigsPerDay: cigs, packPrice: pack, currency });
  };

  return (
    <View style={s.screen}>
      <View style={s.topRow}>
        <IconButton label="Back" onPress={() => setStep(q === 0 ? 'welcome' : ((q - 1) as 0 | 1))}>
          <Icon d={icons.back} />
        </IconButton>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[s.dot, { backgroundColor: i <= q ? colors.leaf : colors.line }]} />
          ))}
        </View>
        <View style={{ width: 44 }} />
      </View>
      <Text style={[type.small, { marginTop: 28 }]}>Question {q + 1} of 3</Text>

      {q === 0 && (
        <>
          <Text style={[type.h2, s.question]}>When did you smoke your last cigarette?</Text>
          <View style={{ gap: 12 }}>
            {QUIT_OPTS.map((o, i) => (
              <Pressable
                key={o.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: i === quitPick }}
                onPress={() => setQuitPick(i)}
                style={[s.option, i === quitPick ? s.optionOn : s.optionOff]}
              >
                <Text style={[type.strong, { fontSize: 18, color: i === quitPick ? colors.white : colors.pine }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {q === 1 && (
        <>
          <Text style={[type.h2, s.question]}>How many cigarettes did you smoke a day?</Text>
          <Stepper
            value={String(cigs)}
            unit="a day"
            onMinus={() => setCigs((c) => Math.max(1, c - 1))}
            onPlus={() => setCigs((c) => Math.min(80, c + 1))}
            minusLabel="Fewer"
            plusLabel="More"
          />
        </>
      )}

      {q === 2 && (
        <>
          <Text style={[type.h2, s.question]}>What does a pack of 20 cost you?</Text>
          <Stepper
            value={formatMoney(pack, currency, true)}
            unit="per pack"
            onMinus={() => setPack((p) => Math.max(0.5, +(p - 0.5).toFixed(2)))}
            onPlus={() => setPack((p) => +(p + 0.5).toFixed(2))}
            minusLabel="Cheaper"
            plusLabel="Dearer"
          />
          <View style={s.exact}>
            <Text style={type.small}>Or type it exactly:</Text>
            <TextInput
              accessibilityLabel="Pack price"
              keyboardType="decimal-pad"
              defaultValue={String(pack)}
              onChangeText={(t) => {
                const n = parseFloat(t.replace(',', '.'));
                if (!isNaN(n) && n > 0) setPack(n);
              }}
              style={s.input}
            />
          </View>
          <Text style={[type.small, { textAlign: 'center', marginTop: 12 }]}>
            Shown in your local currency, so your savings add up in real money.
          </Text>
        </>
      )}

      <View style={{ flex: 1 }} />
      <Button label={q < 2 ? 'Next' : 'Start my quit'} onPress={next} />
    </View>
  );
}

function Stepper(p: { value: string; unit: string; onMinus: () => void; onPlus: () => void; minusLabel: string; plusLabel: string }) {
  return (
    <View style={s.stepper}>
      <Pressable accessibilityRole="button" accessibilityLabel={p.minusLabel} onPress={p.onMinus} style={s.stepBtn}>
        <Icon d={icons.minus} size={24} />
      </Pressable>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 48, color: colors.pine }}>{p.value}</Text>
        <Text style={type.small}>{p.unit}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={p.plusLabel} onPress={p.onPlus} style={s.stepBtn}>
        <Icon d={icons.plus} size={24} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, padding: 24, backgroundColor: colors.freshAir },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 28, height: 6, borderRadius: 3 },
  question: { marginTop: 8, marginBottom: 32 },
  option: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  optionOn: { backgroundColor: colors.pine, borderColor: colors.pine },
  optionOff: { backgroundColor: colors.white, borderColor: colors.line },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: 28, padding: 20 },
  stepBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.freshAir, alignItems: 'center', justifyContent: 'center' },
  exact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  input: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, height: 44, width: 100, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.pine },
});
