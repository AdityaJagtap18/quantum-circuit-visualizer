// Generates OpenQASM 2.0 source text from a Circuit.
import { Circuit, Operation } from "./circuit-schema";

const QASM_GATE: Record<string, string> = {
  i: "id", x: "x", y: "y", z: "z", h: "h", s: "s", sdg: "sdg", t: "t", tdg: "tdg", sx: "sx",
  p: "u1", rx: "rx", ry: "ry", rz: "rz",
  cx: "cx", cz: "cz", swap: "swap", rxx: "rxx", rzz: "rzz",
  ccx: "ccx",
};

function formatLine(op: Operation): string {
  if (op.gate === "measure") {
    const c = op.clbits?.[0] ?? op.qubits[0];
    return `measure q[${op.qubits[0]}] -> c[${c}];`;
  }
  if (op.gate === "barrier") {
    return `barrier ${op.qubits.map((q) => `q[${q}]`).join(",")};`;
  }
  if (op.gate === "u") {
    const [theta, phi, lam] = op.params ?? [0, 0, 0];
    return `u3(${theta},${phi},${lam}) q[${op.qubits[0]}];`;
  }

  const name = QASM_GATE[op.gate];
  if (!name) return `// unsupported gate: ${op.gate}`;

  const paramStr = op.params && op.params.length > 0 ? `(${op.params.join(",")})` : "";
  const qubitStr = op.qubits.map((q) => `q[${q}]`).join(",");
  return `${name}${paramStr} ${qubitStr};`;
}

export function generateOpenQasm(circuit: Circuit): string {
  const lines: string[] = [];
  lines.push("OPENQASM 2.0;");
  lines.push('include "qelib1.inc";');
  lines.push(`qreg q[${circuit.numQubits}];`);
  if (circuit.numClbits > 0) lines.push(`creg c[${circuit.numClbits}];`);
  lines.push("");

  const ordered = [...circuit.operations].sort((a, b) => a.column - b.column);
  for (const op of ordered) {
    lines.push(formatLine(op));
  }

  return lines.join("\n") + "\n";
}
