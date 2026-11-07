"use client";

import { useMemo } from "react";
import { useCircuitStore } from "@/lib/store";
import { bitstring, magnitudeSquared, phase, simulateStatevector } from "@/lib/simulator";

export function StatevectorTable() {
  const circuit = useCircuitStore((s) => s.circuit);

  const rows = useMemo(() => {
    const state = simulateStatevector(circuit);
    return state.map((amp, i) => ({
      basis: `|${bitstring(i, circuit.numQubits)}⟩`,
      re: amp.re,
      im: amp.im,
      prob: magnitudeSquared(amp),
      phase: phase(amp),
    }));
  }, [circuit]);

  const visibleRows = rows.filter((r) => r.prob > 1e-9);

  if (circuit.numQubits > 8) {
    return (
      <p className="text-sm text-[var(--warning)]">
        Statevector table is hidden above 8 qubits (2{"^"}n grows too large to usefully display) —
        measurement histogram still works at any qubit count.
      </p>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead className="text-left text-[var(--text-muted)]">
          <tr>
            <th className="py-1 pr-3">Basis state</th>
            <th className="py-1 pr-3">Real</th>
            <th className="py-1 pr-3">Imag</th>
            <th className="py-1 pr-3">Probability</th>
            <th className="py-1">Phase (rad)</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[var(--text)]">
          {visibleRows.map((r) => (
            <tr key={r.basis} className="border-t border-[var(--border)]">
              <td className="py-1 pr-3">{r.basis}</td>
              <td className="py-1 pr-3">{r.re.toFixed(4)}</td>
              <td className="py-1 pr-3">{r.im.toFixed(4)}</td>
              <td className="py-1 pr-3">{r.prob.toFixed(4)}</td>
              <td className="py-1">{r.phase.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {visibleRows.length === 0 && <p className="text-sm text-[var(--text-muted)]">Empty circuit.</p>}
    </div>
  );
}
