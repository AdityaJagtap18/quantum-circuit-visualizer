"use client";

import { useCircuitStore } from "@/lib/store";
import { GATE_TILE_COLOR, GATE_TILE_SYMBOL } from "@/components/gates/gate-colors";
import { circuitDepth } from "@/lib/circuit-schema";

const COLUMN_WIDTH = 56;
const ROW_HEIGHT = 44;
const MAX_REGISTER_SLOTS = 8;

export function CircuitCanvas() {
  const circuit = useCircuitStore((s) => s.circuit);
  const removeOperation = useCircuitStore((s) => s.removeOperation);
  const pendingGate = useCircuitStore((s) => s.pendingGate);
  const pendingQubits = useCircuitStore((s) => s.pendingQubits);
  const clickQubitForPlacement = useCircuitStore((s) => s.clickQubitForPlacement);
  const setNumQubits = useCircuitStore((s) => s.setNumQubits);

  const depth = Math.max(circuitDepth(circuit), 4);
  const canvasWidth = depth * COLUMN_WIDTH;
  const canvasHeight = circuit.numQubits * ROW_HEIGHT + (circuit.numClbits > 0 ? ROW_HEIGHT : 0);

  const measurementOps = circuit.operations.filter((op) => op.gate === "measure");

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-4">
      {pendingGate && (
        <p className="mb-2 text-xs font-medium text-[var(--warning)]">
          Click a qubit wire below to place the selected gate.
        </p>
      )}
      <div className="relative" style={{ width: canvasWidth + 48 + 32, height: canvasHeight }}>
        {/* Qubit wires */}
        {Array.from({ length: circuit.numQubits }, (_, qubit) => {
          const isTargeted = pendingGate && pendingQubits.includes(qubit);
          return (
            <div
              key={qubit}
              className="absolute left-0 flex items-center"
              style={{ top: qubit * ROW_HEIGHT, width: "100%", height: ROW_HEIGHT }}
            >
              <span className="w-12 shrink-0 font-mono text-xs text-[var(--text-muted)]">q[{qubit}]</span>
              <button
                onClick={() => pendingGate && clickQubitForPlacement(qubit)}
                className={`relative h-9 flex-1 ${pendingGate ? "cursor-crosshair" : "cursor-default"}`}
                style={{ width: canvasWidth }}
              >
                <div
                  className={`absolute inset-y-1/2 left-0 right-0 h-px ${isTargeted ? "bg-[var(--warning)]" : "bg-[var(--border)]"}`}
                />
              </button>
            </div>
          );
        })}

        {/* Classical register line */}
        {circuit.numClbits > 0 && (
          <div
            className="absolute left-0 flex items-center"
            style={{ top: circuit.numQubits * ROW_HEIGHT, width: "100%", height: ROW_HEIGHT }}
          >
            <span className="w-12 shrink-0 font-mono text-xs text-[var(--text-muted)]">c: {circuit.numClbits}/</span>
            <div className="relative h-9 flex-1" style={{ width: canvasWidth }}>
              <div className="absolute inset-y-1/2 left-0 right-0 border-t-2 border-double border-[var(--border)]" />
            </div>
          </div>
        )}

        {/* Dashed connector lines from each measurement down to the classical register */}
        {circuit.numClbits > 0 &&
          measurementOps.map((op) => {
            const x = 48 + op.column * COLUMN_WIDTH + 18;
            const topY = op.qubits[0] * ROW_HEIGHT + ROW_HEIGHT / 2;
            const bottomY = circuit.numQubits * ROW_HEIGHT + ROW_HEIGHT / 2;
            return (
              <svg
                key={`connector-${op.id}`}
                className="pointer-events-none absolute left-0 top-0"
                width={canvasWidth + 48}
                height={canvasHeight}
              >
                <line
                  x1={x} y1={topY} x2={x} y2={bottomY}
                  stroke="#475569" strokeWidth={1.5} strokeDasharray="3,3"
                />
                <text x={x + 4} y={bottomY - 4} fontSize={9} fill="#64748b" fontFamily="monospace">
                  {op.clbits?.[0] ?? ""}
                </text>
              </svg>
            );
          })}

        {/* Gates (rendered above the clickable wire buttons, pointer-events none so clicks pass through to the wire except for removal) */}
        {Array.from({ length: circuit.numQubits }, (_, qubit) => (
          <div key={`gates-${qubit}`} className="absolute left-12" style={{ top: qubit * ROW_HEIGHT }}>
            {circuit.operations
              .filter((op) => op.qubits.includes(qubit))
              .map((op) => {
                const role =
                  op.qubits.length > 1 ? (op.qubits[0] === qubit ? "control" : "target") : "single";
                const isMeasure = op.gate === "measure";
                return (
                  <button
                    key={op.id}
                    title="Click to remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOperation(op.id);
                    }}
                    style={{ left: op.column * COLUMN_WIDTH, top: (ROW_HEIGHT - 36) / 2 }}
                    className="absolute z-10 flex h-9 w-9 items-center justify-center hover:scale-105"
                  >
                    {role === "control" ? (
                      <span className="h-3.5 w-3.5 rounded-full bg-[var(--accent)]" />
                    ) : isMeasure ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--warning)] text-[11px] font-mono font-bold text-white shadow-sm">
                        ⌁
                      </span>
                    ) : (
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-md text-[11px] font-mono font-bold shadow-sm ${GATE_TILE_COLOR[op.gate as keyof typeof GATE_TILE_COLOR]}`}
                      >
                        {GATE_TILE_SYMBOL[op.gate as keyof typeof GATE_TILE_SYMBOL] ?? op.gate}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        ))}

        {/* Vertical link lines between control and target qubits for multi-qubit gates */}
        {circuit.operations
          .filter((op) => op.qubits.length > 1)
          .map((op) => {
            const x = 48 + op.column * COLUMN_WIDTH + 18;
            const rows = op.qubits.map((q) => q * ROW_HEIGHT + ROW_HEIGHT / 2);
            const y1 = Math.min(...rows);
            const y2 = Math.max(...rows);
            return (
              <svg
                key={`link-${op.id}`}
                className="pointer-events-none absolute left-0 top-0"
                width={canvasWidth + 48}
                height={canvasHeight}
              >
                <line x1={x} y1={y1} x2={x} y2={y2} stroke="#818cf8" strokeWidth={2} />
              </svg>
            );
          })}

        {/* Per-slot register toggle circles, far right */}
        {Array.from({ length: MAX_REGISTER_SLOTS }, (_, slot) => {
          const active = slot < circuit.numQubits;
          return (
            <button
              key={`toggle-${slot}`}
              onClick={() => setNumQubits(active ? Math.max(1, slot) : slot + 1)}
              title={active ? `Remove qubit ${slot}` : `Enable qubit ${slot}`}
              className={`absolute right-0 h-4 w-4 rounded-full border-2 ${
                active ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)] bg-transparent"
              }`}
              style={{ top: slot * ROW_HEIGHT + ROW_HEIGHT / 2 - 8 }}
            />
          );
        })}
      </div>

      {circuit.operations.length === 0 && (
        <p className="py-4 text-center text-sm text-[var(--text-muted)]">
          No gates yet — select one from the palette, then click a qubit wire above.
        </p>
      )}
    </div>
  );
}
