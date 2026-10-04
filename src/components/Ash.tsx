import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { kf, useLoop } from '../lib/anim';

// Ash's six recovery looks, from the design canvas: grey and coughing, sitting up, cough gone,
// colour back, jogging, glowing at one year.
type Look = {
  skin: string;
  shirt: string;
  tired: number;
  bags: number;
  frown: number;
  flat: number;
  smile: number;
  blush: number;
  band: number;
  glow: number;
  cough: boolean;
  pose: string;
  motion: 'cough' | 'bob' | 'jog';
  alt: string;
};

export const LOOKS: Look[] = [
  { skin: '#B8BEA6', shirt: '#868B83', tired: 1, bags: 1, frown: 1, flat: 0, smile: 0, blush: 0, band: 0, glow: 0, cough: true, pose: 'translate(0 10) rotate(-7 115 150)', motion: 'cough', alt: 'Ash, grey and slumped, coughing' },
  { skin: '#C3C3AA', shirt: '#868B83', tired: 1, bags: 1, frown: 0, flat: 1, smile: 0, blush: 0, band: 0, glow: 0, cough: true, pose: 'translate(0 7) rotate(-5 115 150)', motion: 'cough', alt: 'Ash sitting up a little, still coughing' },
  { skin: '#D2C6AC', shirt: '#7C9A8E', tired: 0, bags: 1, frown: 0, flat: 1, smile: 0, blush: 0, band: 0, glow: 0, cough: false, pose: 'translate(0 4) rotate(-2 115 150)', motion: 'bob', alt: 'Ash, eyes open, cough gone' },
  { skin: '#EBC29E', shirt: '#2F9C83', tired: 0, bags: 0, frown: 0, flat: 0, smile: 1, blush: 0.6, band: 0, glow: 0, cough: false, pose: 'translate(0 0)', motion: 'bob', alt: 'Ash with colour back, smiling' },
  { skin: '#EFC39C', shirt: '#2F9C83', tired: 0, bags: 0, frown: 0, flat: 0, smile: 1, blush: 0.8, band: 1, glow: 0, cough: false, pose: 'translate(0 -3)', motion: 'jog', alt: 'Ash jogging in a sweatband' },
  { skin: '#F0C49B', shirt: '#1F7A63', tired: 0, bags: 0, frown: 0, flat: 0, smile: 1, blush: 0.8, band: 1, glow: 1, cough: false, pose: 'translate(0 -4)', motion: 'bob', alt: 'Ash glowing and healthy' },
];

function coughTransform(t: number) {
  const x = kf(t, [[0, 0], [0.1, -3], [0.2, 2], [0.3, -4], [0.42, 0], [1, 0]]);
  const y = kf(t, [[0, 0], [0.1, 3], [0.2, 0], [0.3, 4], [0.42, 0], [1, 0]]);
  const r = kf(t, [[0, 0], [0.1, -3], [0.2, 0], [0.3, -4], [0.42, 0], [1, 0]]);
  return `translate(${x} ${y}) rotate(${r} 115 150)`;
}

export function Ash({ stage, coughing = false, size = 196 }: { stage: number; coughing?: boolean; size?: number }) {
  const c = LOOKS[Math.max(0, Math.min(5, stage))];
  const motion = coughing ? 'cough' : c.motion;
  const cough = coughing || c.cough;
  const period = motion === 'cough' ? 1600 : motion === 'jog' ? 550 : 3200;
  const t = useLoop(period);

  const head =
    motion === 'cough' ? coughTransform(t) : motion === 'bob' ? `translate(0 ${kf(t, [[0, 0], [0.5, -3], [1, 0]])})` : '';
  const body = motion === 'jog' ? `translate(0 ${kf(t, [[0, 0], [0.5, -7], [1, 0]])})` : '';
  // Cough puffs drift away from the mouth.
  const puffOpacity = kf(t, [[0, 0], [0.12, 1], [0.55, 0], [1, 0]], false);
  const puffX = kf(t, [[0, 0], [0.55, -12], [1, -12]], false);

  return (
    <Svg viewBox="0 0 230 250" width={size} height={(size * 250) / 230} accessibilityLabel={c.alt} role="img">
      <Circle cx={115} cy={110} r={96} fill="#FFE7A8" opacity={c.glow} />
      <G transform={body}>
        <Path d="M40 252 C40 196 70 176 115 176 C160 176 190 196 190 252 Z" fill={c.shirt} />
        <G transform={c.pose}>
          <G transform={head}>
            <Rect x={101} y={138} width={28} height={44} rx={10} fill={c.skin} />
            <Circle cx={66} cy={104} r={10} fill={c.skin} />
            <Circle cx={164} cy={104} r={10} fill={c.skin} />
            <Circle cx={115} cy={100} r={50} fill={c.skin} />
            <Path d="M66 92 C66 54 94 40 118 42 C146 44 168 62 165 92 C154 74 138 66 116 68 C96 70 80 78 66 92 Z" fill="#4A3B30" />
            <Path d="M67 82 Q115 62 164 82 L164 92 Q115 72 67 92 Z" fill="#FF6B3D" opacity={c.band} />
            <Circle cx={96} cy={100} r={6} fill="#12312A" />
            <Circle cx={134} cy={100} r={6} fill="#12312A" />
            <Circle cx={98} cy={98} r={2} fill="#FFFFFF" />
            <Circle cx={136} cy={98} r={2} fill="#FFFFFF" />
            <G opacity={c.tired}>
              <Path d="M88 101 Q96 86 104 101 Z" fill={c.skin} />
              <Path d="M126 101 Q134 86 142 101 Z" fill={c.skin} />
              <Path d="M88 101 L104 101 M126 101 L142 101" stroke="#12312A" strokeWidth={2.5} strokeLinecap="round" fill="none" />
            </G>
            <Path d="M89 112 Q96 116 103 112 M127 112 Q134 116 141 112" stroke="#6E7262" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={c.bags} />
            <Circle cx={84} cy={118} r={7} fill="#F08A6B" opacity={c.blush} />
            <Circle cx={146} cy={118} r={7} fill="#F08A6B" opacity={c.blush} />
            <Path d="M102 131 Q115 122 128 131" stroke="#12312A" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={coughing ? 1 : c.frown} />
            <Path d="M104 128 L126 128" stroke="#12312A" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={coughing ? 0 : c.flat} />
            <Path d="M101 124 Q115 140 129 124" stroke="#12312A" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={coughing ? 0 : c.smile} />
          </G>
        </G>
        {cough && (
          <G opacity={puffOpacity} transform={`translate(${puffX} ${puffX / 3})`}>
            <Path d="M58 126 Q48 120 42 126 M56 139 Q46 139 40 145" stroke="#8C948E" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          </G>
        )}
      </G>
    </Svg>
  );
}
