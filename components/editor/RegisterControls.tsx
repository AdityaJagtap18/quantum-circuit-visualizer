"use client";

import { useCircuitStore } from "@/lib/store";

export function RegisterControls() {
  const circuit = useCircuitStore((s) => s.circuit);
  const setNumClbits = useCircuitStore((s) => s.setNumClbits);
  const clearCircuit = useCircuitStore((s) => s.clearCircuit);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <p className="text-xs text-[var(--text-muted)]">
        {circuit.numQubits} qubits — toggle the circles on the right edge of the circuit to add/remove
      </p>
      <Stepper label="Classical bits" value={circuit.numClbits} onChange={setNumClbits} min={0} max={12} />
      <button
        onClick={clearCircuit}
        className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
      >
        Clear circuit
      </button>
    </div>
  );
}

function Stepper({
  label, value, onChange, min, max,
}: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">{label}</label>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-7 w-7 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-7 w-7 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
        >
          +
        </button>
      </div>
    </div>
  );
}
