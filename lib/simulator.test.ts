import { describe, expect, it } from "vitest";
import { Circuit, emptyCircuit, makeOperationId } from "./circuit-schema";
import { probabilities, sampleShots, simulateStatevector } from "./simulator";

function op(gate: string, qubits: number[], column: number, extra: Partial<{ clbits: number[]; params: number[] }> = {}) {
  return { id: makeOperationId(), gate, qubits, column, ...extra };
}

describe("simulateStatevector", () => {
  it("leaves |00> unchanged under identity", () => {
    const circuit: Circuit = { numQubits: 2, numClbits: 0, operations: [op("i", [0], 0)] };
    const state = simulateStatevector(circuit);
    expect(probabilities(state)[0]).toBeCloseTo(1);
  });

  it("produces an equal superposition for H on one qubit", () => {
    const circuit: Circuit = { numQubits: 1, numClbits: 0, operations: [op("h", [0], 0)] };
    const probs = probabilities(simulateStatevector(circuit));
    expect(probs[0]).toBeCloseTo(0.5);
    expect(probs[1]).toBeCloseTo(0.5);
  });

  it("produces the Bell state |00>+|11> for H + CX", () => {
    const circuit: Circuit = {
      numQubits: 2, numClbits: 0,
      operations: [op("h", [0], 0), op("cx", [0, 1], 1)],
    };
    const probs = probabilities(simulateStatevector(circuit));
    // basis order: index bit0 = qubit0 (LSB). |00>=0, |11>=3
    expect(probs[0]).toBeCloseTo(0.5);
    expect(probs[3]).toBeCloseTo(0.5);
    expect(probs[1]).toBeCloseTo(0);
    expect(probs[2]).toBeCloseTo(0);
  });

  it("produces the GHZ state for a 3-qubit chain", () => {
    const circuit: Circuit = {
      numQubits: 3, numClbits: 0,
      operations: [op("h", [0], 0), op("cx", [0, 1], 1), op("cx", [1, 2], 2)],
    };
    const probs = probabilities(simulateStatevector(circuit));
    expect(probs[0]).toBeCloseTo(0.5); // |000>
    expect(probs[7]).toBeCloseTo(0.5); // |111>
    const mid = probs.slice(1, 7).reduce((a, b) => a + b, 0);
    expect(mid).toBeCloseTo(0);
  });

  it("preserves total probability (normalization) for an arbitrary circuit", () => {
    const circuit: Circuit = {
      numQubits: 3, numClbits: 0,
      operations: [
        op("h", [0], 0), op("ry", [1], 0, { params: [1.23] }),
        op("cx", [0, 2], 1), op("rzz", [1, 2], 2, { params: [0.7] }),
        op("swap", [0, 1], 3),
      ],
    };
    const probs = probabilities(simulateStatevector(circuit));
    const total = probs.reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 9);
  });

  it("X gate flips |0> to |1>", () => {
    const circuit: Circuit = { numQubits: 1, numClbits: 0, operations: [op("x", [0], 0)] };
    const probs = probabilities(simulateStatevector(circuit));
    expect(probs[1]).toBeCloseTo(1);
  });

  it("SWAP exchanges the states of two qubits", () => {
    const circuit: Circuit = {
      numQubits: 2, numClbits: 0,
      operations: [op("x", [0], 0), op("swap", [0, 1], 1)],
    };
    const probs = probabilities(simulateStatevector(circuit));
    // qubit0 should now be |0>, qubit1 should be |1> -> basis state "10" => index 2 (bit1=1,bit0=0)
    expect(probs[2]).toBeCloseTo(1);
  });

  it("CCX (Toffoli) only flips the target when both controls are 1", () => {
    const flipped: Circuit = {
      numQubits: 3, numClbits: 0,
      operations: [op("x", [0], 0), op("x", [1], 0), op("ccx", [0, 1, 2], 1)],
    };
    expect(probabilities(simulateStatevector(flipped))[7]).toBeCloseTo(1); // |111>

    const notFlipped: Circuit = {
      numQubits: 3, numClbits: 0,
      operations: [op("x", [0], 0), op("ccx", [0, 1, 2], 1)],
    };
    expect(probabilities(simulateStatevector(notFlipped))[1]).toBeCloseTo(1); // |001>, target untouched
  });
});

describe("sampleShots", () => {
  it("deterministic Bernstein-Vazirani-style circuit yields one outcome with rng=0.5", () => {
    const circuit: Circuit = {
      numQubits: 1, numClbits: 1,
      operations: [op("x", [0], 0), op("measure", [0], 1, { clbits: [0] })],
    };
    const counts = sampleShots(circuit, 100, () => 0.5);
    expect(counts["1"]).toBe(100);
  });

  it("shot counts always sum to the requested shot count", () => {
    const circuit: Circuit = {
      numQubits: 2, numClbits: 2,
      operations: [
        op("h", [0], 0), op("cx", [0, 1], 1),
        op("measure", [0], 2, { clbits: [0] }), op("measure", [1], 2, { clbits: [1] }),
      ],
    };
    const counts = sampleShots(circuit, 537);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(537);
  });

  it("Bell state sampling only ever produces 00 or 11", () => {
    const circuit: Circuit = {
      numQubits: 2, numClbits: 2,
      operations: [
        op("h", [0], 0), op("cx", [0, 1], 1),
        op("measure", [0], 2, { clbits: [0] }), op("measure", [1], 2, { clbits: [1] }),
      ],
    };
    const counts = sampleShots(circuit, 2000);
    for (const key of Object.keys(counts)) {
      expect(["00", "11"]).toContain(key);
    }
  });
});
