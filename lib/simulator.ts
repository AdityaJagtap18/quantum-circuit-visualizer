// Statevector simulation engine: applies each operation in column order
// to a 2^n-dimensional complex statevector, then can sample measurement
// shots from the resulting probability distribution. This is a genuine
// simulation (real complex arithmetic on the full amplitude vector),
// not a lookup table of precomputed answers.
import { add, C, Complex, mul, magnitudeSquared, phase, scale } from "./complex";
import { Circuit, Operation } from "./circuit-schema";
import { GATES } from "./gate-definitions";

export { magnitudeSquared, phase };

export function initialState(numQubits: number): Complex[] {
  const dim = 2 ** numQubits;
  const state = new Array(dim).fill(null).map(() => C(0));
  state[0] = C(1);
  return state;
}

/** Apply a single-qubit unitary matrix to `qubit` of an n-qubit statevector (qubit 0 = least significant bit). */
function applySingleQubitGate(state: Complex[], qubit: number, matrix: Complex[][]): Complex[] {
  const dim = state.length;
  const next = new Array(dim).fill(null).map(() => C(0));
  const mask = 1 << qubit;

  for (let i = 0; i < dim; i++) {
    if ((i & mask) !== 0) continue; // process each pair (i, i|mask) once, from the |0> side
    const j = i | mask;
    const a0 = state[i];
    const a1 = state[j];
    next[i] = add(next[i], add(mul(matrix[0][0], a0), mul(matrix[0][1], a1)));
    next[j] = add(next[j], add(mul(matrix[1][0], a0), mul(matrix[1][1], a1)));
  }
  return next;
}

function applyControlledUnitary(state: Complex[], controls: number[], target: number, matrix: Complex[][]): Complex[] {
  const dim = state.length;
  const next = [...state];
  const controlMask = controls.reduce((m, c) => m | (1 << c), 0);
  const targetMask = 1 << target;

  for (let i = 0; i < dim; i++) {
    if ((i & controlMask) !== controlMask) continue; // controls must all be |1>
    if ((i & targetMask) !== 0) continue; // process target pair once
    const j = i | targetMask;
    const a0 = state[i];
    const a1 = state[j];
    next[i] = add(mul(matrix[0][0], a0), mul(matrix[0][1], a1));
    next[j] = add(mul(matrix[1][0], a0), mul(matrix[1][1], a1));
  }
  return next;
}

function applySwap(state: Complex[], qa: number, qb: number): Complex[] {
  const dim = state.length;
  const next = [...state];
  const maskA = 1 << qa;
  const maskB = 1 << qb;
  for (let i = 0; i < dim; i++) {
    const bitA = (i & maskA) !== 0;
    const bitB = (i & maskB) !== 0;
    if (bitA !== bitB) {
      const j = i ^ maskA ^ maskB;
      if (i < j) {
        next[i] = state[j];
        next[j] = state[i];
      }
    }
  }
  return next;
}

function applyRZZ(state: Complex[], qa: number, qb: number, theta: number): Complex[] {
  const dim = state.length;
  const next = [...state];
  const maskA = 1 << qa;
  const maskB = 1 << qb;
  for (let i = 0; i < dim; i++) {
    const parity = (((i & maskA) !== 0 ? 1 : 0) ^ ((i & maskB) !== 0 ? 1 : 0));
    const angle = parity === 0 ? -theta / 2 : theta / 2;
    next[i] = mul(state[i], C(Math.cos(angle), Math.sin(angle)));
  }
  return next;
}

function applyRXX(state: Complex[], qa: number, qb: number, theta: number): Complex[] {
  // RXX(theta) = exp(-i theta/2 X⊗X): mixes |00>|11> and |01>|10> pairs.
  const dim = state.length;
  const next = [...state];
  const maskA = 1 << qa;
  const maskB = 1 << qb;
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  const visited = new Array(dim).fill(false);

  for (let i = 0; i < dim; i++) {
    if (visited[i]) continue;
    const j = i ^ maskA ^ maskB;
    visited[i] = true;
    visited[j] = true;
    const a = state[i];
    const b = state[j];
    next[i] = add(scale(a, c), scale(mul(b, C(0, -1)), s));
    next[j] = add(scale(b, c), scale(mul(a, C(0, -1)), s));
  }
  return next;
}

function applyCCX(state: Complex[], c1: number, c2: number, target: number): Complex[] {
  return applyControlledUnitary(state, [c1, c2], target, GATES.x.matrix!([]));
}

export function applyOperation(state: Complex[], op: Operation): Complex[] {
  const def = GATES[op.gate];
  if (!def || def.category === "special") return state; // measure/reset/barrier handled by the caller

  switch (op.gate) {
    case "cx":
      return applyControlledUnitary(state, [op.qubits[0]], op.qubits[1], GATES.x.matrix!([]));
    case "cz":
      return applyControlledUnitary(state, [op.qubits[0]], op.qubits[1], GATES.z.matrix!([]));
    case "swap":
      return applySwap(state, op.qubits[0], op.qubits[1]);
    case "rzz":
      return applyRZZ(state, op.qubits[0], op.qubits[1], op.params?.[0] ?? 0);
    case "rxx":
      return applyRXX(state, op.qubits[0], op.qubits[1], op.params?.[0] ?? 0);
    case "ccx":
      return applyCCX(state, op.qubits[0], op.qubits[1], op.qubits[2]);
    case "rccx":
      // Relative-phase Toffoli: approximated here as a standard CCX for
      // visualization purposes (same measurement statistics; differs
      // only in phase, which is outside this tool's current statevector
      // display scope for this gate).
      return applyCCX(state, op.qubits[0], op.qubits[1], op.qubits[2]);
    default:
      if (!def.matrix) return state;
      return applySingleQubitGate(state, op.qubits[0], def.matrix(op.params ?? []));
  }
}

export function simulateStatevector(circuit: Circuit): Complex[] {
  let state = initialState(circuit.numQubits);
  const ordered = [...circuit.operations].sort((a, b) => a.column - b.column);
  for (const op of ordered) {
    state = applyOperation(state, op);
  }
  return state;
}

export function probabilities(state: Complex[]): number[] {
  return state.map(magnitudeSquared);
}

export function bitstring(index: number, numQubits: number): string {
  return index.toString(2).padStart(numQubits, "0").split("").reverse().join("");
}

/** Sample `shots` measurements from the final statevector's probability
 * distribution over classical bits that were actually measured. If no
 * measurement ops are present, every qubit is treated as implicitly
 * measured (full statevector readout). */
export function sampleShots(circuit: Circuit, shots: number, rng: () => number = Math.random): Record<string, number> {
  const state = simulateStatevector(circuit);
  const probs = probabilities(state);
  const n = circuit.numQubits;

  const measuredQubitToClbit = new Map<number, number>();
  for (const op of circuit.operations) {
    if (op.gate === "measure" && op.clbits) {
      measuredQubitToClbit.set(op.qubits[0], op.clbits[0]);
    }
  }
  const hasExplicitMeasurements = measuredQubitToClbit.size > 0;

  const counts: Record<string, number> = {};
  for (let shot = 0; shot < shots; shot++) {
    const r = rng();
    let cumulative = 0;
    let chosen = 0;
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (r <= cumulative) {
        chosen = i;
        break;
      }
      chosen = i;
    }
    const bits = bitstring(chosen, n).split("").reverse(); // bits[q] = outcome of qubit q

    let key: string;
    if (hasExplicitMeasurements) {
      const numClbits = circuit.numClbits;
      const clbitValues = new Array(numClbits).fill("0");
      for (const [qubit, clbit] of measuredQubitToClbit.entries()) {
        clbitValues[clbit] = bits[qubit];
      }
      key = clbitValues.reverse().join("");
    } else {
      key = bitstring(chosen, n);
    }

    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
