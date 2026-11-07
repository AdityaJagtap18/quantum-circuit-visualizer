// Application state: the active circuit plus saved-project management.
// Persisted to localStorage via Zustand's persist middleware.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Circuit, emptyCircuit, makeOperationId, nextFreeColumn, Operation } from "./circuit-schema";
import { GATES } from "./gate-definitions";

export interface SavedProject {
  id: string;
  name: string;
  circuit: Circuit;
  updatedAt: number;
}

interface CircuitStore {
  circuit: Circuit;
  activeProjectId: string | null;
  projects: SavedProject[];

  /** The gate currently selected in the palette, awaiting qubit clicks on the canvas to place it. */
  pendingGate: string | null;
  pendingParams: number[] | undefined;
  pendingQubits: number[];

  setNumQubits: (n: number) => void;
  setNumClbits: (n: number) => void;
  addGate: (gate: string, qubits: number[], params?: number[]) => void;
  addMeasurement: (qubit: number, clbit: number) => void;
  removeOperation: (opId: string) => void;
  clearCircuit: () => void;
  loadCircuit: (circuit: Circuit) => void;

  selectPendingGate: (gate: string, params?: number[]) => void;
  cancelPendingGate: () => void;
  clickQubitForPlacement: (qubit: number) => void;

  saveAsNewProject: (name: string) => void;
  updateActiveProject: () => void;
  loadProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useCircuitStore = create<CircuitStore>()(
  persist(
    (set, get) => ({
      circuit: emptyCircuit(2, 2),
      activeProjectId: null,
      projects: [],
      pendingGate: null,
      pendingParams: undefined,
      pendingQubits: [],

      setNumQubits: (n) =>
        set((state) => ({
          circuit: {
            ...state.circuit,
            numQubits: n,
            operations: state.circuit.operations.filter((op) => op.qubits.every((q) => q < n)),
          },
        })),

      setNumClbits: (n) =>
        set((state) => ({
          circuit: {
            ...state.circuit,
            numClbits: n,
            operations: state.circuit.operations.filter((op) => !op.clbits || op.clbits.every((c) => c < n)),
          },
        })),

      addGate: (gate, qubits, params) =>
        set((state) => {
          const def = GATES[gate];
          if (!def) return state;
          const op: Operation = {
            id: makeOperationId(),
            gate,
            qubits,
            params,
            column: nextFreeColumn(state.circuit, qubits),
          };
          return { circuit: { ...state.circuit, operations: [...state.circuit.operations, op] } };
        }),

      addMeasurement: (qubit, clbit) =>
        set((state) => {
          const op: Operation = {
            id: makeOperationId(),
            gate: "measure",
            qubits: [qubit],
            clbits: [clbit],
            column: nextFreeColumn(state.circuit, [qubit]),
          };
          return { circuit: { ...state.circuit, operations: [...state.circuit.operations, op] } };
        }),

      removeOperation: (opId) =>
        set((state) => ({
          circuit: { ...state.circuit, operations: state.circuit.operations.filter((op) => op.id !== opId) },
        })),

      clearCircuit: () =>
        set((state) => ({ circuit: { ...state.circuit, operations: [] } })),

      loadCircuit: (circuit) => set({ circuit, activeProjectId: null }),

      selectPendingGate: (gate, params) => set({ pendingGate: gate, pendingParams: params, pendingQubits: [] }),

      cancelPendingGate: () => set({ pendingGate: null, pendingParams: undefined, pendingQubits: [] }),

      clickQubitForPlacement: (qubit) =>
        set((state) => {
          const gate = state.pendingGate;
          if (!gate) return state;
          const def = GATES[gate];
          if (!def) return state;

          if (gate === "measure") {
            if (state.circuit.numClbits === 0) return { pendingGate: null, pendingParams: undefined, pendingQubits: [] };
            const clbit = qubit < state.circuit.numClbits ? qubit : 0;
            get().addMeasurement(qubit, clbit);
            return { pendingGate: null, pendingParams: undefined, pendingQubits: [] };
          }

          const nextQubits = [...state.pendingQubits, qubit];
          if (nextQubits.length >= def.numQubits) {
            get().addGate(gate, nextQubits, state.pendingParams);
            return { pendingGate: null, pendingParams: undefined, pendingQubits: [] };
          }
          return { pendingQubits: nextQubits };
        }),

      saveAsNewProject: (name) =>
        set((state) => {
          const project: SavedProject = {
            id: makeOperationId(),
            name,
            circuit: state.circuit,
            updatedAt: Date.now(),
          };
          return { projects: [...state.projects, project], activeProjectId: project.id };
        }),

      updateActiveProject: () =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === state.activeProjectId ? { ...p, circuit: state.circuit, updatedAt: Date.now() } : p
          ),
        })),

      loadProject: (id) =>
        set((state) => {
          const project = state.projects.find((p) => p.id === id);
          if (!project) return state;
          return { circuit: project.circuit, activeProjectId: id };
        }),

      renameProject: (id, name) =>
        set((state) => ({ projects: state.projects.map((p) => (p.id === id ? { ...p, name } : p)) })),

      duplicateProject: (id) =>
        set((state) => {
          const project = state.projects.find((p) => p.id === id);
          if (!project) return state;
          const copy: SavedProject = {
            id: makeOperationId(),
            name: `${project.name} (copy)`,
            circuit: project.circuit,
            updatedAt: Date.now(),
          };
          return { projects: [...state.projects, copy] };
        }),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        })),
    }),
    {
      name: "qcv-storage",
      partialize: (state) => ({ circuit: state.circuit, activeProjectId: state.activeProjectId, projects: state.projects }),
    }
  )
);
