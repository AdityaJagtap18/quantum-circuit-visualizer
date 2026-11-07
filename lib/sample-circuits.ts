import { Circuit, makeOperationId } from "./circuit-schema";

function op(gate: string, qubits: number[], column: number, extra: Partial<{ clbits: number[]; params: number[] }> = {}) {
  return { id: makeOperationId(), gate, qubits, column, ...extra };
}

export const SAMPLE_CIRCUITS: Record<string, Circuit> = {
  "Bell state": {
    numQubits: 2, numClbits: 2,
    operations: [
      op("h", [0], 0),
      op("cx", [0, 1], 1),
      op("measure", [0], 2, { clbits: [0] }),
      op("measure", [1], 2, { clbits: [1] }),
    ],
  },
  "GHZ state (3 qubits)": {
    numQubits: 3, numClbits: 3,
    operations: [
      op("h", [0], 0),
      op("cx", [0, 1], 1),
      op("cx", [1, 2], 2),
      op("measure", [0], 3, { clbits: [0] }),
      op("measure", [1], 3, { clbits: [1] }),
      op("measure", [2], 3, { clbits: [2] }),
    ],
  },
  "Superposition (H on all)": {
    numQubits: 3, numClbits: 3,
    operations: [
      op("h", [0], 0),
      op("h", [1], 0),
      op("h", [2], 0),
      op("measure", [0], 1, { clbits: [0] }),
      op("measure", [1], 1, { clbits: [1] }),
      op("measure", [2], 1, { clbits: [2] }),
    ],
  },
};
