"use client";

import { useState } from "react";
import { GATES } from "@/lib/gate-definitions";
import { GATE_TILE_COLOR, GATE_TILE_SYMBOL } from "@/components/gates/gate-colors";
import { useCircuitStore } from "@/lib/store";

const CATEGORY_LABEL: Record<string, string> = {
  single: "Single-qubit",
  two: "Two-qubit",
  three: "Three-qubit",
  special: "Special",
};

export function GatePalette() {
  const pendingGate = useCircuitStore((s) => s.pendingGate);
  const pendingQubits = useCircuitStore((s) => s.pendingQubits);
  const selectPendingGate = useCircuitStore((s) => s.selectPendingGate);
  const cancelPendingGate = useCircuitStore((s) => s.cancelPendingGate);

  const [angle, setAngle] = useState(Math.PI / 2);
  const [angles, setAngles] = useState<[number, number, number]>([Math.PI / 2, 0, 0]);

  const def = pendingGate ? GATES[pendingGate] : null;

  function handleSelect(gateId: string) {
    const g = GATES[gateId];
    if (g.numParams === 1) {
      selectPendingGate(gateId, [angle]);
    } else if (g.numParams === 3) {
      selectPendingGate(gateId, angles);
    } else {
      selectPendingGate(gateId);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5" style={{ width: 92 }}>
        {Object.entries(CATEGORY_LABEL).map(([cat]) =>
          Object.values(GATES)
            .filter((g) => g.category === cat)
            .map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelect(g.id)}
                title={g.label}
                className={`flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold shadow-sm transition-transform hover:scale-105 ${GATE_TILE_COLOR[g.id]} ${
                  pendingGate === g.id ? "ring-2 ring-offset-2 ring-offset-[var(--bg)] ring-[var(--warning)]" : ""
                }`}
              >
                {GATE_TILE_SYMBOL[g.id]}
              </button>
            ))
        )}
      </div>

      {pendingGate && def && (
        <div className="mt-3 w-full max-w-[220px] rounded-[var(--radius-md)] border border-[var(--warning)]/30 bg-[var(--warning-bg)] p-2.5 text-xs">
          <p className="mb-1.5 font-medium text-[var(--warning)]">
            Placing <span className="font-mono">{def.label}</span> — click{" "}
            {def.numQubits > 1
              ? `qubit ${pendingQubits.length + 1} of ${def.numQubits}`
              : def.id === "measure"
                ? "a qubit"
                : "a qubit"}{" "}
            on the circuit
          </p>
          {def.numParams === 1 && (
            <div className="mb-1.5 flex items-center gap-1.5">
              <label className="text-[var(--text-secondary)]">θ</label>
              <input
                type="number"
                step="0.01"
                value={angle}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAngle(v);
                  selectPendingGate(pendingGate, [v]);
                }}
                className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5"
              />
            </div>
          )}
          {def.numParams === 3 && (
            <div className="mb-1.5 flex gap-1">
              {angles.map((a, i) => (
                <input
                  key={i}
                  type="number"
                  step="0.01"
                  value={a}
                  onChange={(e) => {
                    const next = [...angles] as [number, number, number];
                    next[i] = Number(e.target.value);
                    setAngles(next);
                    selectPendingGate(pendingGate, next);
                  }}
                  className="w-12 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5"
                />
              ))}
            </div>
          )}
          <button onClick={cancelPendingGate} className="text-[var(--text-secondary)] hover:text-[var(--text)]">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
