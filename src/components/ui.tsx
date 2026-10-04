import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

export function Logo({ size = 28, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {!dark && <Path d="M8 34 L24 34 L32 22" stroke={colors.pine} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
      <Path d={dark ? 'M8 34 L24 34 L32 22' : 'M16 34 L24 34 L32 22'} stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M8 34 L15 34" stroke={colors.filter} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M32 22 L34 19" stroke={colors.ash} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Circle cx={39} cy={11} r={4} fill={dark ? '#8FA69C' : colors.smoke} />
    </Svg>
  );
}

export function Brand({ size = 28 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Logo size={size} />
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.8, color: colors.pine }}>Breathe Easy</Text>
    </View>
  );
}

type BtnProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: 'primary' | 'ember' | 'ghost' | 'light';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({ label, variant = 'primary', style, textStyle, ...rest }: BtnProps) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.btn, v.box, pressed && { opacity: 0.85 }, style]}
      {...rest}
    >
      <Text style={[styles.btnText, v.text, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const variants = {
  primary: { box: { backgroundColor: colors.leaf }, text: { color: colors.white } },
  ember: { box: { backgroundColor: colors.ember, height: 64, borderRadius: 32 }, text: { color: colors.pine, fontFamily: fonts.display, fontSize: 21 } },
  ghost: { box: { backgroundColor: 'transparent', height: 44 }, text: { color: colors.muted, fontSize: 15, textDecorationLine: 'underline' as const } },
  light: { box: { backgroundColor: colors.white }, text: { color: colors.pine } },
};

export function IconButton({ onPress, label, children, dark }: { onPress: () => void; label: string; children: ReactNode; dark?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.icon, { backgroundColor: dark ? colors.pineSoft : colors.white }]}
    >
      {children}
    </Pressable>
  );
}

export function Icon({ d, color = colors.pine, size = 22 }: { d: string; color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export const icons = {
  back: 'M15 5 L8 12 L15 19',
  close: 'M6 6 L18 18 M18 6 L6 18',
  chart: 'M5 19 L5 11 M12 19 L12 5 M19 19 L19 14',
  minus: 'M6 12 L18 12',
  plus: 'M6 12 L18 12 M12 6 L12 18',
  check: 'M5 12.5 L10 17 L19 7',
  shield: 'M12 3 L19 6 L19 11 C19 16 15.5 19.5 12 21 C8.5 19.5 5 16 5 11 L5 6 Z',
  star: 'M12 4 L14.3 9 L19.5 9.4 L15.5 12.9 L16.8 18 L12 15.2 L7.2 18 L8.5 12.9 L4.5 9.4 L9.7 9 Z',
  lock: 'M6 11 L18 11 L18 20 L6 20 Z M8 11 L8 8 C8 5.5 10 4 12 4 C14 4 16 5.5 16 8 L16 11',
  gear: 'M12 9 A3 3 0 1 0 12 15 A3 3 0 1 0 12 9 M12 3 L12 5 M12 19 L12 21 M3 12 L5 12 M19 12 L21 12 M5.6 5.6 L7 7 M17 17 L18.4 18.4 M5.6 18.4 L7 17 M17 7 L18.4 5.6',
};

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressBar({ pct, color = colors.leaf, track = colors.track }: { pct: number; color?: string; track?: string }) {
  return (
    <View style={{ height: 10, borderRadius: 5, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ height: 10, borderRadius: 5, backgroundColor: color, width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </View>
  );
}

export const type = StyleSheet.create({
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 37, color: colors.pine },
  h2: { fontFamily: fonts.display, fontSize: 28, lineHeight: 33, color: colors.pine },
  h3: { fontFamily: fonts.display, fontSize: 22, color: colors.pine },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.pine },
  small: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  label: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  strong: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.pine },
});

const styles = StyleSheet.create({
  btn: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnText: { fontFamily: fonts.bodyBold, fontSize: 18 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20 },
});
