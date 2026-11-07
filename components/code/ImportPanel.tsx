"use client";

import { useState } from "react";
import { parseQiskitCode } from "@/lib/qiskit-parser";
import { useCircuitStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

const PLACEHOLDER = `from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure(0, 0)
qc.measure(1, 1)
`;

export function ImportPanel() {
  const [source, setSource] = useState(PLACEHOLDER);
  const [errors, setErrors] = useState<string[]>([]);
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);

  function handleImport() {
    const { circuit, errors: parseErrors } = parseQiskitCode(source);
    setErrors(parseErrors);
    if (circuit) {
      loadCircuit(circuit);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={source}
        onChange={(e) => setSource(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs text-[var(--text)]"
      />
      <p className="text-xs text-[var(--text-muted)]">
        Parsed as plain text only — this never imports or executes the pasted Python.
      </p>
      {errors.length > 0 && (
        <ul className="rounded-[var(--radius-md)] border border-[var(--error)]/30 bg-[var(--error-bg)] p-2 text-xs text-[var(--error)]">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
      <Button onClick={handleImport} className="self-start">
        Import into editor
      </Button>
    </div>
  );
}
