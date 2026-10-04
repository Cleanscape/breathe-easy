import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { kf, useLoop } from '../lib/anim';
import { fonts } from '../theme';

// The opening scene: Ash coughs, stubs the cigarette out in the ashtray, and smiles. 7-second loop.
const SKIN = '#B8BEA6';
const line = { strokeLinecap: 'round' as const, fill: 'none' };

export function OpeningScene({ size = 300 }: { size?: number }) {
  const t = useLoop(7000);

  const poseY = kf(t, [[0, 10], [0.7, 10], [0.82, 0], [1, 0]]);
  const poseR = kf(t, [[0, -7], [0.7, -7], [0.82, 0], [1, 0]]);

  const cx = kf(t, [[0, 0], [0.06, 0], [0.1, -3], [0.14, 2], [0.18, -4], [0.22, 1], [0.26, -3], [0.32, 0], [1, 0]], false);
  const cy = kf(t, [[0, 0], [0.06, 0], [0.1, 3], [0.14, 0], [0.18, 4], [0.22, 0], [0.26, 3], [0.32, 0], [1, 0]], false);
  const cr = kf(t, [[0, 0], [0.06, 0], [0.1, -3], [0.14, 0], [0.18, -4], [0.22, 0], [0.26, -3], [0.32, 0], [1, 0]], false);

  const coughMark = kf(t, [[0, 0], [0.06, 0], [0.09, 1], [0.3, 1], [0.36, 0], [1, 0]], false);

  const hx = kf(t, [[0, 0], [0.44, 0], [0.58, 52], [0.64, 52], [0.7, 52], [1, 52]]);
  const hy = kf(t, [[0, 0], [0.44, 0], [0.58, 100], [0.64, 104], [0.7, 106], [1, 106]]);
  const hr = kf(t, [[0, 0], [0.44, 0], [0.58, 55], [0.64, 62], [0.7, 72], [1, 72]]);
  const ember = kf(t, [[0, 1], [0.63, 1], [0.67, 0], [1, 0]], false);
  const handFade = kf(t, [[0, 1], [0.76, 1], [0.86, 0], [1, 0]], false);

  const smokeOp = kf(t, [[0, 0], [0.08, 0.9], [0.42, 0.6], [0.5, 0], [1, 0]], false);
  const smokeY = kf(t, [[0, 0], [0.42, -26], [0.5, -34], [1, -34]], false);

  const poofOp = kf(t, [[0, 0], [0.63, 0], [0.69, 0.95], [0.86, 0], [1, 0]], false);
  const poofS = kf(t, [[0, 0.4], [0.63, 0.4], [0.86, 1.7], [1, 1.7]], false);

  const frown = kf(t, [[0, 1], [0.7, 1], [0.76, 0], [1, 0]], false);
  const smile = kf(t, [[0, 0], [0.72, 0], [0.8, 1], [1, 1]], false);
  const lids = kf(t, [[0, 1], [0.72, 1], [0.8, 0], [1, 0]], false);

  return (
    <Svg viewBox="0 0 260 260" width={size} height={size} accessibilityLabel="Ash coughs, then stubs their cigarette out in an ashtray and smiles" role="img">
      <Path d="M40 262 C40 196 70 176 115 176 C160 176 190 196 190 262 Z" fill="#868B83" />
      <G transform={`translate(0 ${poseY}) rotate(${poseR} 115 150)`}>
        <G transform={`translate(${cx} ${cy}) rotate(${cr} 115 150)`}>
          <Rect x={101} y={138} width={28} height={44} rx={10} fill={SKIN} />
          <Circle cx={66} cy={104} r={10} fill={SKIN} />
          <Circle cx={164} cy={104} r={10} fill={SKIN} />
          <Circle cx={115} cy={100} r={50} fill={SKIN} />
          <Path d="M66 92 C66 54 94 40 118 42 C146 44 168 62 165 92 C154 74 138 66 116 68 C96 70 80 78 66 92 Z" fill="#4A3B30" />
          <Circle cx={96} cy={100} r={6} fill="#12312A" />
          <Circle cx={134} cy={100} r={6} fill="#12312A" />
          <Circle cx={98} cy={98} r={2} fill="#FFFFFF" />
          <Circle cx={136} cy={98} r={2} fill="#FFFFFF" />
          <G opacity={lids}>
            <Path d="M88 101 Q96 86 104 101 Z" fill={SKIN} />
            <Path d="M126 101 Q134 86 142 101 Z" fill={SKIN} />
            <Path d="M88 101 L104 101 M126 101 L142 101" stroke="#12312A" strokeWidth={2.5} {...line} />
          </G>
          <Path d="M89 112 Q96 116 103 112 M127 112 Q134 116 141 112" stroke="#6E7262" strokeWidth={2.5} {...line} />
          <Path d="M102 131 Q115 122 128 131" stroke="#12312A" strokeWidth={3.5} opacity={frown} {...line} />
          <Path d="M101 124 Q115 140 129 124" stroke="#12312A" strokeWidth={3.5} opacity={smile} {...line} />
        </G>
      </G>
      <G opacity={coughMark}>
        <Path d="M58 126 Q48 120 42 126 M56 139 Q46 139 40 145 M60 113 Q52 105 44 107" stroke="#8C948E" strokeWidth={3.5} {...line} />
        <SvgText x={6} y={82} fill="#12312A" fontSize={19} fontFamily={fonts.display}>
          cough!
        </SvgText>
      </G>
      <Ellipse cx={222} cy={240} rx={32} ry={10} fill="#7D8A84" />
      <Ellipse cx={222} cy={236} rx={27} ry={6} fill="#4F5C56" />
      <G opacity={poofOp} transform={`translate(222 221) scale(${poofS}) translate(-222 -221)`}>
        <Circle cx={210} cy={224} r={6} fill="#D5DAD4" />
        <Circle cx={222} cy={217} r={8} fill="#D5DAD4" />
        <Circle cx={235} cy={224} r={6} fill="#D5DAD4" />
      </G>
      <G opacity={smokeOp} transform={`translate(0 ${smokeY})`}>
        <Path d="M170 122 C164 113 176 106 170 97 C164 88 174 81 170 72" stroke="#B7BDB5" strokeWidth={2.5} {...line} />
        <Path d="M178 118 C174 111 182 105 178 98" stroke="#B7BDB5" strokeWidth={2.5} {...line} />
      </G>
      <G transform={`translate(${hx} ${hy}) rotate(${hr} 170 128)`}>
        <Rect x={126} y={125} width={9} height={6} rx={1.5} fill="#E39B4A" />
        <Rect x={135} y={125} width={30} height={6} fill="#FFFFFF" />
        <Rect x={165} y={125} width={5} height={6} rx={1.5} fill="#8C948E" />
        <Rect x={165} y={125} width={5} height={6} rx={1.5} fill="#FF6B3D" opacity={ember} />
        <Circle cx={142} cy={135} r={9} fill={SKIN} opacity={handFade} />
      </G>
    </Svg>
  );
}
