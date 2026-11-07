// Gate catalog: each gate's arity, parameter count, and unitary matrix
// generator. Matrices are returned as Complex[][] (2^k x 2^k for a
// k-qubit gate), built fresh per call so parameterized gates (RX/RY/RZ/
// U/RXX/RZZ) can depend on the operation's own params.
import { C, Complex, expI } from "./complex";

export type GateId =
  | "i" | "x" | "y" | "z" | "h" | "s" | "sdg" | "t" | "tdg" | "sx" | "p" | "rx" | "ry" | "rz" | "u"
  | "cx" | "cz" | "swap" | "rxx" | "rzz"
  | "ccx" | "rccx"
  | "measure" | "reset" | "barrier";

export interface GateDef {
  id: GateId;
  label: string;
  numQubits: number; // 0 for measure/reset/barrier (handled specially)
  numParams: number;
  category: "single" | "two" | "three" | "special";
  matrix?: (params: number[]) => Complex[][];
}

const I2: Complex[][] = [
  [C(1), C(0)],
  [C(0), C(1)],
];

export const GATES: Record<string, GateDef> = {
  i: { id: "i", label: "I", numQubits: 1, numParams: 0, category: "single", matrix: () => I2 },
  x: {
    id: "x", label: "X", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(0), C(1)], [C(1), C(0)]],
  },
  y: {
    id: "y", label: "Y", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(0), C(0, -1)], [C(0, 1), C(0)]],
  },
  z: {
    id: "z", label: "Z", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(1), C(0)], [C(0), C(-1)]],
  },
  h: {
    id: "h", label: "H", numQubits: 1, numParams: 0, category: "single",
    matrix: () => {
      const s = 1 / Math.sqrt(2);
      return [[C(s), C(s)], [C(s), C(-s)]];
    },
  },
  s: {
    id: "s", label: "S", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(1), C(0)], [C(0), C(0, 1)]],
  },
  sdg: {
    id: "sdg", label: "S†", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(1), C(0)], [C(0), C(0, -1)]],
  },
  t: {
    id: "t", label: "T", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(1), C(0)], [C(0), expI(Math.PI / 4)]],
  },
  tdg: {
    id: "tdg", label: "T†", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [[C(1), C(0)], [C(0), expI(-Math.PI / 4)]],
  },
  sx: {
    id: "sx", label: "√X", numQubits: 1, numParams: 0, category: "single",
    matrix: () => [
      [C(0.5, 0.5), C(0.5, -0.5)],
      [C(0.5, -0.5), C(0.5, 0.5)],
    ],
  },
  p: {
    id: "p", label: "P", numQubits: 1, numParams: 1, category: "single",
    matrix: ([lam]) => [[C(1), C(0)], [C(0), expI(lam)]],
  },
  rx: {
    id: "rx", label: "RX", numQubits: 1, numParams: 1, category: "single",
    matrix: ([theta]) => {
      const c = Math.cos(theta / 2);
      const s = Math.sin(theta / 2);
      return [
        [C(c), C(0, -s)],
        [C(0, -s), C(c)],
      ];
    },
  },
  ry: {
    id: "ry", label: "RY", numQubits: 1, numParams: 1, category: "single",
    matrix: ([theta]) => {
      const c = Math.cos(theta / 2);
      const s = Math.sin(theta / 2);
      return [
        [C(c), C(-s)],
        [C(s), C(c)],
      ];
    },
  },
  rz: {
    id: "rz", label: "RZ", numQubits: 1, numParams: 1, category: "single",
    matrix: ([theta]) => [
      [expI(-theta / 2), C(0)],
      [C(0), expI(theta / 2)],
    ],
  },
  u: {
    id: "u", label: "U", numQubits: 1, numParams: 3, category: "single",
    matrix: ([theta, phi, lam]) => {
      const c = Math.cos(theta / 2);
      const s = Math.sin(theta / 2);
      return [
        [C(c), scaleC(expI(lam), -s)],
        [scaleC(expI(phi), s), scaleC(expI(phi + lam), c)],
      ];
    },
  },
  cx: { id: "cx", label: "CX", numQubits: 2, numParams: 0, category: "two" },
  cz: { id: "cz", label: "CZ", numQubits: 2, numParams: 0, category: "two" },
  swap: { id: "swap", label: "SWAP", numQubits: 2, numParams: 0, category: "two" },
  rxx: { id: "rxx", label: "RXX", numQubits: 2, numParams: 1, category: "two" },
  rzz: { id: "rzz", label: "RZZ", numQubits: 2, numParams: 1, category: "two" },
  ccx: { id: "ccx", label: "CCX", numQubits: 3, numParams: 0, category: "three" },
  rccx: { id: "rccx", label: "RCCX", numQubits: 3, numParams: 0, category: "three" },
  measure: { id: "measure", label: "Measure", numQubits: 1, numParams: 0, category: "special" },
  reset: { id: "reset", label: "Reset", numQubits: 1, numParams: 0, category: "special" },
  barrier: { id: "barrier", label: "Barrier", numQubits: 1, numParams: 0, category: "special" },
};

function scaleC(a: Complex, k: number): Complex {
  return C(a.re * k, a.im * k);
}

export const SINGLE_QUBIT_GATE_IDS = Object.values(GATES)
  .filter((g) => g.category === "single")
  .map((g) => g.id);
export const TWO_QUBIT_GATE_IDS = Object.values(GATES)
  .filter((g) => g.category === "two")
  .map((g) => g.id);
export const THREE_QUBIT_GATE_IDS = Object.values(GATES)
  .filter((g) => g.category === "three")
  .map((g) => g.id);
