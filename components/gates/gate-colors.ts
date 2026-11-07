// Visual color coding for gate tiles, grouped the way IBM Quantum
// Composer groups them (Hadamard its own accent color, Pauli/Clifford
// gates one family, rotation/phase gates another, special ops neutral).
import { GateId } from "@/lib/gate-definitions";

export const GATE_TILE_COLOR: Record<GateId, string> = {
  h: "bg-rose-500/90 text-white",
  x: "bg-blue-500/90 text-white",
  y: "bg-blue-500/90 text-white",
  z: "bg-blue-500/90 text-white",
  i: "bg-blue-400/80 text-white",
  sx: "bg-blue-400/80 text-white",
  s: "bg-sky-400/80 text-white",
  sdg: "bg-sky-400/80 text-white",
  t: "bg-sky-300/80 text-slate-900",
  tdg: "bg-sky-300/80 text-slate-900",
  p: "bg-sky-500/80 text-white",
  rx: "bg-violet-500/80 text-white",
  ry: "bg-violet-500/80 text-white",
  rz: "bg-violet-500/80 text-white",
  u: "bg-violet-600/80 text-white",
  cx: "bg-blue-500/90 text-white",
  cz: "bg-blue-500/90 text-white",
  swap: "bg-indigo-500/90 text-white",
  rxx: "bg-violet-600/80 text-white",
  rzz: "bg-violet-600/80 text-white",
  ccx: "bg-blue-600/90 text-white",
  rccx: "bg-blue-600/90 text-white",
  measure: "bg-slate-600 text-white",
  reset: "bg-slate-600 text-white",
  barrier: "bg-slate-700 text-white",
};

export const GATE_TILE_SYMBOL: Record<GateId, string> = {
  h: "H", x: "X", y: "Y", z: "Z", i: "I", sx: "√X",
  s: "S", sdg: "S†", t: "T", tdg: "T†", p: "P",
  rx: "RX", ry: "RY", rz: "RZ", u: "U",
  cx: "⊕", cz: "CZ", swap: "⤭", rxx: "RXX", rzz: "RZZ",
  ccx: "⊕²", rccx: "⊕²r",
  measure: "⌁", reset: "|0⟩", barrier: "┊",
};
