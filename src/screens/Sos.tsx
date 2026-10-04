import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { Button, Icon, IconButton, icons, ProgressBar } from '../components/ui';
import { kf, useLoop } from '../lib/anim';
import { useStore } from '../lib/store';
import { colors, fonts } from '../theme';
import type { Go } from '../../App';

const HOLD_MS = 1200;
const BREATHE_SECONDS = 180;

function buzz(kind: 'tick' | 'crunch') {
  if (Platform.OS === 'web') {
    try {
      (navigator as any).vibrate?.(kind === 'crunch' ? [30, 40, 60] : 10);
    } catch {}
    return;
  }
  if (kind === 'crunch') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function Sos({ go }: { go: Go }) {
  const { beatCraving, state } = useStore();
  const [phase, setPhase] = useState<'hold' | 'breathe'>('hold');
  const [hold, setHold] = useState(0);
  const [left, setLeft] = useState(BREATHE_SECONDS);
  const [toast, setToast] = useState('');
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
  };
  useEffect(() => stopHold, []);

  useEffect(() => {
    if (phase !== 'breathe') return;
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const startHold = () => {
    if (phase !== 'hold' || holdTimer.current) return;
    const started = Date.now();
    buzz('tick');
    holdTimer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - started) / HOLD_MS);
      setHold(p);
      if (p >= 1) {
        stopHold();
        buzz('crunch');
        const n = beatCraving();
        setToast(n === 1 ? 'Badge earned: First craving beaten' : n === 10 ? 'Badge earned: 10 cravings beaten' : '');
        setPhase('breathe');
      }
    }, 30);
  };
  const endHold = () => {
    if (phase === 'hold' && hold < 1) {
      stopHold();
      setHold(0);
    }
  };

  const beaten = state.cravings.length;

  return (
    <View style={s.screen}>
      <View style={s.top}>
        <IconButton label="Back to home" onPress={() => go('home')} dark>
          <Icon d={icons.back} color={colors.white} />
        </IconButton>
        <Text style={s.topLabel}>Craving SOS</Text>
      </View>

      {phase === 'hold' ? (
        <View style={s.body}>
          <Text style={s.h2}>Stub this one out.</Text>
          <Text style={s.sub}>Press and hold the cigarette until it is crushed in the ashtray.</Text>
          <Pressable
            onPressIn={startHold}
            onPressOut={endHold}
            accessibilityRole="button"
            accessibilityLabel="Press and hold to stub out the cigarette"
            style={s.target}
          >
            <Cigarette p={hold} />
          </Pressable>
          <View style={{ width: 200 }}>
            <ProgressBar pct={hold * 100} color={colors.ember} track={colors.pineSoft} />
          </View>
          <Text style={s.hint}>{hold === 0 ? 'Press and hold' : 'Keep holding…'}</Text>
        </View>
      ) : (
        <View style={s.body}>
          <View style={s.beaten}>
            <CrushedButt />
            <View>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.white }}>Craving beaten</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.onDark }}>
                {beaten === 1 ? '1 craving beaten so far' : `${beaten} cravings beaten so far`}
              </Text>
            </View>
          </View>
          {!!toast && (
            <View style={s.toast}>
              <Icon d={icons.star} size={20} color="#6B4A00" />
              <Text style={{ fontFamily: fonts.bodyBold, color: colors.pine }}>{toast}</Text>
            </View>
          )}
          <Breather />
          <Text style={{ fontFamily: fonts.display, fontSize: 40, color: colors.white, textAlign: 'center' }}>
            {left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : 'Done'}
          </Text>
          <Text style={s.sub}>Breathe with the circle. Most cravings pass within a few minutes.</Text>
          <Button label="I'm good now" onPress={() => go('home')} style={{ alignSelf: 'stretch' }} />
        </View>
      )}
    </View>
  );
}

function Cigarette({ p }: { p: number }) {
  const wisp = useLoop(2400);
  const wispOp = kf(wisp, [[0, 0], [0.2, 0.8], [1, 0]], false) * (1 - p);
  return (
    <Svg viewBox="0 0 300 210" width={330} height={231}>
      <Ellipse cx={160} cy={182} rx={100} ry={22} fill="#3B5A51" />
      <Ellipse cx={160} cy={176} rx={86} ry={13} fill={colors.pineDark} />
      <G opacity={wispOp} transform={`translate(0 ${-30 * wisp})`}>
        <Path d="M242 50 C236 40 248 32 242 22 C236 12 246 6 242 -2" stroke="#8FA69C" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </G>
      <G transform={`translate(${-82 * p} ${107 * p}) rotate(${50 * p} 242 63)`}>
        <Rect x={60} y={56} width={40} height={14} rx={3} fill={colors.filter} />
        <Rect x={100} y={56} width={134} height={14} fill="#F7F7F2" />
        <Rect x={232} y={56} width={10} height={14} rx={3} fill={colors.ember} opacity={1 - p * 0.8} />
      </G>
    </Svg>
  );
}

function CrushedButt() {
  return (
    <Svg viewBox="0 0 300 210" width={96} height={67}>
      <Ellipse cx={150} cy={182} rx={100} ry={22} fill="#3B5A51" />
      <Ellipse cx={150} cy={176} rx={86} ry={13} fill={colors.pineDark} />
      <Path d="M104 172 L150 170 L176 140" stroke={colors.pineDark} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M128 172 L150 170 L176 140" stroke="#F7F7F2" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M104 172 L126 172" stroke={colors.filter} strokeWidth={12} strokeLinecap="round" fill="none" />
      <Circle cx={186} cy={160} r={5} fill={colors.ash} />
      <Circle cx={198} cy={168} r={4} fill={colors.ash} />
    </Svg>
  );
}

function Breather() {
  const t = useLoop(8000);
  const scale = kf(t, [[0, 0.62], [0.5, 1], [1, 0.62]]);
  const inhale = t < 0.5;
  return (
    <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: colors.leaf,
          borderWidth: 3,
          borderColor: colors.ember,
          transform: [{ scale }],
        }}
      />
      <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.white }}>{inhale ? 'Breathe in' : 'Breathe out'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.pine, padding: 20 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topLabel: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.onDark },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  h2: { fontFamily: fonts.display, fontSize: 32, color: colors.white, textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.onDark, textAlign: 'center', maxWidth: 320 },
  target: { borderRadius: 24, padding: 6 },
  hint: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.onDark },
  beaten: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', backgroundColor: colors.pineSoft, borderRadius: 20, padding: 12 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.sunshine, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
});
