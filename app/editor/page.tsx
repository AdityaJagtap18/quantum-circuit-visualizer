"use client";

import { useState } from "react";
import { ComposerToolbar } from "@/components/layout/ComposerToolbar";
import { GatePalette } from "@/components/palette/GatePalette";
import { CircuitCanvas } from "@/components/editor/CircuitCanvas";
import { RegisterControls } from "@/components/editor/RegisterControls";
import { ProjectPanel } from "@/components/editor/ProjectPanel";
import { CodePanel } from "@/components/code/CodePanel";
import { ImportPanel } from "@/components/code/ImportPanel";
import { MeasurementHistogram } from "@/components/viz/MeasurementHistogram";
import { StatevectorTable } from "@/components/viz/StatevectorTable";
import { QSphere3D } from "@/components/viz/QSphere3D";
import { Card } from "@/components/ui/Card";

type RightTab = "export" | "import" | "statevector" | "projects";

export default function EditorPage() {
  const [rightTab, setRightTab] = useState<RightTab>("export");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <ComposerToolbar />

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <Card>
            <RegisterControls />
          </Card>

          <Card>
            <div className="flex gap-4">
              <GatePalette />
              <div className="flex-1">
                <h2 className="mb-2 text-sm font-semibold text-[var(--text)]">Circuit</h2>
                <CircuitCanvas />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <MeasurementHistogram />
            </Card>
            <Card>
              <QSphere3D />
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex flex-wrap gap-1">
              {(["export", "import", "statevector", "projects"] as RightTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setRightTab(t)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                    rightTab === t ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {rightTab === "export" && <CodePanel />}
            {rightTab === "import" && <ImportPanel />}
            {rightTab === "statevector" && <StatevectorTable />}
            {rightTab === "projects" && <ProjectPanel />}
          </Card>
        </div>
      </main>
    </div>
  );
}
