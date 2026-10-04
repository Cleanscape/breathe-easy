import { useEffect, useRef, useState } from 'react';

// A looping clock: returns progress 0..1 through a cycle of `periodMs`, updated ~30 times a second.
// Driving SVG from JS keeps the animations identical on iOS, Android and the web.
export function useLoop(periodMs: number, running = true) {
  const [t, setT] = useState(0);
  const start = useRef(Date.now());
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = 0;
    const tick = (ts: number) => {
      if (ts - last > 33) {
        last = ts;
        setT(((Date.now() - start.current) % periodMs) / periodMs);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [periodMs, running]);
  return t;
}

const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;

// Interpolates numeric keyframes, e.g. kf(t, [[0, 0], [0.5, -3], [1, 0]]). `t` and stops are 0..1.
export function kf(t: number, stops: [number, number][], smooth = true) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, v1] = stops[i];
    const [t0, v0] = stops[i - 1];
    if (t <= t1) {
      const x = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (smooth ? ease(x) : x);
    }
  }
  return stops[stops.length - 1][1];
}
