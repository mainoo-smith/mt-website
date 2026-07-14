export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Continuous easing that keeps data packets flowing without mechanical stops. */
export function flowEase(t: number) {
  return t - (Math.sin(t * Math.PI * 2) / (Math.PI * 2)) * 0.18;
}
