"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCircuitStore } from "@/lib/store";
import { sampleShots } from "@/lib/simulator";
import { Button } from "@/components/ui/Button";
import { PanelHeader } from "@/components/ui/PanelHeader";

export function MeasurementHistogram() {
  const circuit = useCircuitStore((s) => s.circuit);
  const [shots, setShots] = useState(1024);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  function run() {
    setCounts(sampleShots(circuit, shots));
  }

  const data = useMemo(
    () =>
      counts
        ? Object.entries(counts)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([bitstring, count]) => ({ bitstring, percent: (count / shots) * 100 }))
        : [],
    [counts, shots]
  );

  return (
    <div>
      <PanelHeader title="Probabilities" onRefresh={run} />
      <div className="mb-3 flex items-end gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">Shots</label>
          <input
            type="number"
            value={shots}
            onChange={(e) => setShots(Number(e.target.value))}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm"
          />
        </div>
        <Button onClick={run}>Run shots</Button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Run the circuit to see a measurement histogram.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="bitstring" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
              domain={[0, 100]}
              label={{ value: `% of ${shots} shots`, angle: -90, position: "insideLeft", fill: "var(--text-muted)", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "Probability"]}
            />
            <Bar dataKey="percent" fill="var(--accent)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
