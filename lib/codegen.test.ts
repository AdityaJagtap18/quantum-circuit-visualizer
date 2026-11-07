import { describe, expect, it } from "vitest";
import { Circuit, makeOperationId } from "./circuit-schema";
import { generateQiskitCode } from "./qiskit-generator";
import { generateOpenQasm } from "./openqasm-generator";
import { parseQiskitCode } from "./qiskit-parser";

function op(gate: string, qubits: number[], column: number, extra: Partial<{ clbits: number[]; params: number[] }> = {}) {
  return { id: makeOperationId(), gate, qubits, column, ...extra };
}

const bell: Circuit = {
  numQubits: 2, numClbits: 2,
  operations: [
    op("h", [0], 0),
    op("cx", [0, 1], 1),
    op("measure", [0], 2, { clbits: [0] }),
    op("measure", [1], 2, { clbits: [1] }),
  ],
};

describe("generateQiskitCode", () => {
  it("produces valid-looking Qiskit source for a Bell circuit", () => {
    const code = generateQiskitCode(bell);
    expect(code).toContain("QuantumCircuit(2, 2)");
    expect(code).toContain("qc.h(0)");
    expect(code).toContain("qc.cx(0, 1)");
    expect(code).toContain("qc.measure(0, 0)");
    expect(code).toContain("qc.measure(1, 1)");
  });

  it("formats common angle parameters symbolically", () => {
    const circuit: Circuit = { numQubits: 1, numClbits: 0, operations: [op("rx", [0], 0, { params: [Math.PI / 2] })] };
    const code = generateQiskitCode(circuit);
    expect(code).toContain("qc.rx(pi/2, 0)");
    expect(code).toContain("from math import pi");
  });
});

describe("generateOpenQasm", () => {
  it("produces valid OpenQASM 2.0 header and gates for a Bell circuit", () => {
    const qasm = generateOpenQasm(bell);
    expect(qasm).toContain("OPENQASM 2.0;");
    expect(qasm).toContain("qreg q[2];");
    expect(qasm).toContain("creg c[2];");
    expect(qasm).toContain("h q[0];");
    expect(qasm).toContain("cx q[0],q[1];");
    expect(qasm).toContain("measure q[0] -> c[0];");
  });
});

describe("parseQiskitCode round-trip", () => {
  it("parses a hand-written Bell circuit back into the same structural circuit", () => {
    const source = `
from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure(0, 0)
qc.measure(1, 1)
`;
    const { circuit, errors } = parseQiskitCode(source);
    expect(errors).toEqual([]);
    expect(circuit).not.toBeNull();
    expect(circuit!.numQubits).toBe(2);
    expect(circuit!.numClbits).toBe(2);
    expect(circuit!.operations.map((o) => o.gate)).toEqual(["h", "cx", "measure", "measure"]);
  });

  it("parses rotation gates with pi-based expressions", () => {
    const source = `
qc = QuantumCircuit(1)
qc.rx(pi/2, 0)
qc.ry(-pi/4, 0)
`;
    const { circuit, errors } = parseQiskitCode(source);
    expect(errors).toEqual([]);
    expect(circuit!.operations[0].params![0]).toBeCloseTo(Math.PI / 2);
    expect(circuit!.operations[1].params![0]).toBeCloseTo(-Math.PI / 4);
  });

  it("round-trips generate -> parse -> generate to the same Qiskit code", () => {
    const generated = generateQiskitCode(bell);
    const { circuit: reparsed, errors } = parseQiskitCode(generated);
    expect(errors).toEqual([]);
    const regenerated = generateQiskitCode(reparsed!);
    expect(regenerated).toBe(generated);
  });

  it("reports an error for an unsupported method instead of silently dropping it", () => {
    const source = `
qc = QuantumCircuit(1)
qc.unitary(some_matrix, 0)
`;
    const { errors } = parseQiskitCode(source);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("never executes arbitrary code even if a malicious expression is supplied", () => {
    const source = `
qc = QuantumCircuit(1)
qc.rx(require('fs').readFileSync('/etc/passwd'), 0)
`;
    const { errors } = parseQiskitCode(source);
    expect(errors.length).toBeGreaterThan(0); // rejected as an unsupported expression, not executed
  });
});
