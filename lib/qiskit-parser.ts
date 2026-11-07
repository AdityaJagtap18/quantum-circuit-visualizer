// Parses a practical subset of Qiskit Python source back into a Circuit.
// This is a plain-text line parser (regex-based) — it never imports or
// executes the supplied Python, by design (same constraint as the
// generator side, stated explicitly since "parse Qiskit code" could
// otherwise tempt an eval-based shortcut).
import { Circuit, Operation, makeOperationId, nextFreeColumn } from "./circuit-schema";

const CONSTRUCTOR_RE = /QuantumCircuit\(\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/;
const CALL_RE = /qc\.(\w+)\(([^)]*)\)/;

function evalSimpleExpr(expr: string): number {
  const trimmed = expr.trim();
  // Supports plain numbers and "pi"-based expressions like "pi", "pi/2", "-pi/4", "2*pi".
  const withPi = trimmed.replace(/pi/g, Math.PI.toString());
  if (!/^[-+*/0-9.() ]+$/.test(withPi)) {
    throw new Error(`Unsupported parameter expression: "${expr}"`);
  }
  // Safe to evaluate arithmetic-only text with the Function constructor
  // restricted to digits/operators (validated above) — no identifiers,
  // no property access, no function calls are possible in this string.
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${withPi});`)();
}

export interface ParseResult {
  circuit: Circuit | null;
  errors: string[];
}

export function parseQiskitCode(source: string): ParseResult {
  const errors: string[] = [];
  const constructorMatch = source.match(CONSTRUCTOR_RE);
  if (!constructorMatch) {
    return { circuit: null, errors: ["Could not find a QuantumCircuit(n) or QuantumCircuit(n, m) constructor."] };
  }
  const numQubits = parseInt(constructorMatch[1], 10);
  const numClbits = constructorMatch[2] ? parseInt(constructorMatch[2], 10) : 0;

  const circuit: Circuit = { numQubits, numClbits, operations: [] };
  const lines = source.split("\n");

  for (const [lineNo, rawLine] of lines.entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || CONSTRUCTOR_RE.test(line)) continue;

    const callMatch = line.match(CALL_RE);
    if (!callMatch) continue;

    const [, method, argsStr] = callMatch;
    const args = argsStr.trim().length === 0 ? [] : splitArgs(argsStr);

    try {
      const op = buildOperation(method, args, circuit);
      if (op) circuit.operations.push(op);
    } catch (e) {
      errors.push(`Line ${lineNo + 1}: ${(e as Error).message}`);
    }
  }

  return { circuit, errors };
}

function splitArgs(argsStr: string): string[] {
  // Simple top-level comma split (no nested call support needed for this gate set).
  return argsStr.split(",").map((s) => s.trim());
}

const SINGLE_QUBIT_NO_PARAM = ["id", "x", "y", "z", "h", "s", "sdg", "t", "tdg", "sx"];
const SINGLE_QUBIT_ONE_PARAM = ["p", "rx", "ry", "rz"];
const TWO_QUBIT_NO_PARAM = ["cx", "cz", "swap"];
const TWO_QUBIT_ONE_PARAM = ["rxx", "rzz"];
const THREE_QUBIT_NO_PARAM = ["ccx", "rccx"];
const GATE_NAME_FIX: Record<string, string> = { id: "i" };

function buildOperation(method: string, args: string[], circuit: Circuit): Operation | null {
  if (method === "measure") {
    if (args.length !== 2) throw new Error("measure() expects (qubit, clbit)");
    const qubit = parseInt(args[0], 10);
    const clbit = parseInt(args[1], 10);
    return {
      id: makeOperationId(), gate: "measure", qubits: [qubit], clbits: [clbit],
      column: nextFreeColumn(circuit, [qubit]),
    };
  }
  if (method === "barrier") {
    const qubits = args.map((a) => parseInt(a, 10));
    return { id: makeOperationId(), gate: "barrier", qubits, column: nextFreeColumn(circuit, qubits) };
  }
  if (method === "reset") {
    const qubit = parseInt(args[0], 10);
    return { id: makeOperationId(), gate: "reset", qubits: [qubit], column: nextFreeColumn(circuit, [qubit]) };
  }

  const gate = GATE_NAME_FIX[method] ?? method;

  if (SINGLE_QUBIT_NO_PARAM.includes(method)) {
    const qubit = parseInt(args[0], 10);
    return { id: makeOperationId(), gate, qubits: [qubit], column: nextFreeColumn(circuit, [qubit]) };
  }
  if (SINGLE_QUBIT_ONE_PARAM.includes(method)) {
    const theta = evalSimpleExpr(args[0]);
    const qubit = parseInt(args[1], 10);
    return { id: makeOperationId(), gate, qubits: [qubit], params: [theta], column: nextFreeColumn(circuit, [qubit]) };
  }
  if (method === "u") {
    const [theta, phi, lam] = args.slice(0, 3).map(evalSimpleExpr);
    const qubit = parseInt(args[3], 10);
    return { id: makeOperationId(), gate, qubits: [qubit], params: [theta, phi, lam], column: nextFreeColumn(circuit, [qubit]) };
  }
  if (TWO_QUBIT_NO_PARAM.includes(method)) {
    const qubits = args.slice(0, 2).map((a) => parseInt(a, 10));
    return { id: makeOperationId(), gate, qubits, column: nextFreeColumn(circuit, qubits) };
  }
  if (TWO_QUBIT_ONE_PARAM.includes(method)) {
    const theta = evalSimpleExpr(args[0]);
    const qubits = args.slice(1, 3).map((a) => parseInt(a, 10));
    return { id: makeOperationId(), gate, qubits, params: [theta], column: nextFreeColumn(circuit, qubits) };
  }
  if (THREE_QUBIT_NO_PARAM.includes(method)) {
    const qubits = args.slice(0, 3).map((a) => parseInt(a, 10));
    return { id: makeOperationId(), gate, qubits, column: nextFreeColumn(circuit, qubits) };
  }

  throw new Error(`Unsupported Qiskit method: qc.${method}(...)`);
}
