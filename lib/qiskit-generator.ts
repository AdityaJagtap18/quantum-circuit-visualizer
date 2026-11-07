// Generates Qiskit Python source text from a Circuit. This only ever
// produces a string — it never imports or executes Python, consistent
// with the "text-only, no execution" design of the import side too.
import { Circuit, Operation } from "./circuit-schema";

const METHOD_NAME: Record<string, string> = {
  i: "id", x: "x", y: "y", z: "z", h: "h", s: "s", sdg: "sdg", t: "t", tdg: "tdg", sx: "sx",
  p: "p", rx: "rx", ry: "ry", rz: "rz", u: "u",
  cx: "cx", cz: "cz", swap: "swap", rxx: "rxx", rzz: "rzz",
  ccx: "ccx", rccx: "rccx",
  reset: "reset", barrier: "barrier",
};

function formatParam(n: number): string {
  // Represent common angles symbolically for readability, falling back to a float.
  const piMultiples: Array<[number, string]> = [
    [Math.PI, "pi"], [Math.PI / 2, "pi/2"], [Math.PI / 4, "pi/4"],
    [-Math.PI, "-pi"], [-Math.PI / 2, "-pi/2"], [-Math.PI / 4, "-pi/4"],
  ];
  for (const [value, label] of piMultiples) {
    if (Math.abs(n - value) < 1e-9) return label;
  }
  return Number.isInteger(n) ? n.toString() : n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
}

function formatLine(op: Operation): string {
  if (op.gate === "measure") {
    const c = op.clbits?.[0] ?? op.qubits[0];
    return `qc.measure(${op.qubits[0]}, ${c})`;
  }
  const method = METHOD_NAME[op.gate];
  if (!method) return `# unsupported gate: ${op.gate}`;

  if (op.gate === "barrier") {
    return `qc.barrier(${op.qubits.join(", ")})`;
  }

  const paramArgs = (op.params ?? []).map(formatParam);
  const qubitArgs = op.qubits.map((q) => q.toString());
  const args = [...paramArgs, ...qubitArgs].join(", ");
  return `qc.${method}(${args})`;
}

export function generateQiskitCode(circuit: Circuit): string {
  const usesPi = circuit.operations.some((op) =>
    (op.params ?? []).some((p) => Math.abs(p % (Math.PI / 4)) < 1e-9 && p !== 0)
  );

  const lines: string[] = [];
  lines.push("from qiskit import QuantumCircuit");
  if (usesPi) lines.push("from math import pi");
  lines.push("");
  lines.push(
    circuit.numClbits > 0
      ? `qc = QuantumCircuit(${circuit.numQubits}, ${circuit.numClbits})`
      : `qc = QuantumCircuit(${circuit.numQubits})`
  );
  lines.push("");

  const ordered = [...circuit.operations].sort((a, b) => a.column - b.column);
  for (const op of ordered) {
    lines.push(formatLine(op));
  }

  return lines.join("\n") + "\n";
}
