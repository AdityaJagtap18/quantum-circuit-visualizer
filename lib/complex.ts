// Minimal complex-number arithmetic for statevector simulation.
// No external math library — this is small enough to own directly and
// keeps the simulator's numerical behavior fully inspectable.

export interface Complex {
  re: number;
  im: number;
}

export const C = (re: number, im = 0): Complex => ({ re, im });

export const add = (a: Complex, b: Complex): Complex => C(a.re + b.re, a.im + b.im);

export const mul = (a: Complex, b: Complex): Complex =>
  C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);

export const scale = (a: Complex, k: number): Complex => C(a.re * k, a.im * k);

export const magnitudeSquared = (a: Complex): number => a.re * a.re + a.im * a.im;

export const phase = (a: Complex): number => Math.atan2(a.im, a.re);

export const expI = (theta: number): Complex => C(Math.cos(theta), Math.sin(theta));
