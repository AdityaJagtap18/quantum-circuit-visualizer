// The circuit JSON intermediate representation (IR). This is the single
// source of truth the editor, simulator, and code generators all read
// from — independently designed for this project (not copied from any
// other codebase).
import { z } from "zod";

export const OperationSchema = z.object({
  id: z.string(),
  gate: z.string(),
  qubits: z.array(z.number().int().min(0)),
  clbits: z.array(z.number().int().min(0)).optional(),
  params: z.array(z.number()).optional(),
  column: z.number().int().min(0),
});

export type Operation = z.infer<typeof OperationSchema>;

export const CircuitSchema = z.object({
  numQubits: z.number().int().min(1).max(12),
  numClbits: z.number().int().min(0).max(12),
  operations: z.array(OperationSchema),
});

export type Circuit = z.infer<typeof CircuitSchema>;

export function emptyCircuit(numQubits = 2, numClbits = 2): Circuit {
  return { numQubits, numClbits, operations: [] };
}

let opCounter = 0;
export function makeOperationId(): string {
  opCounter += 1;
  return `op_${Date.now()}_${opCounter}`;
}

/** The column index one past the last used column on any of the given qubits — i.e., where a new gate should land to avoid overlapping existing ones. */
export function nextFreeColumn(circuit: Circuit, qubits: number[]): number {
  let max = -1;
  for (const op of circuit.operations) {
    if (op.qubits.some((q) => qubits.includes(q))) {
      max = Math.max(max, op.column);
    }
  }
  return max + 1;
}

export function circuitDepth(circuit: Circuit): number {
  return circuit.operations.length === 0
    ? 0
    : Math.max(...circuit.operations.map((op) => op.column)) + 1;
}

export function gateCount(circuit: Circuit): number {
  return circuit.operations.filter((op) => op.gate !== "barrier").length;
}
