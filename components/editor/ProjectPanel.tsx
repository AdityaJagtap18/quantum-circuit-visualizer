"use client";

import { useState } from "react";
import { useCircuitStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";

export function ProjectPanel() {
  const projects = useCircuitStore((s) => s.projects);
  const activeProjectId = useCircuitStore((s) => s.activeProjectId);
  const saveAsNewProject = useCircuitStore((s) => s.saveAsNewProject);
  const updateActiveProject = useCircuitStore((s) => s.updateActiveProject);
  const loadProject = useCircuitStore((s) => s.loadProject);
  const renameProject = useCircuitStore((s) => s.renameProject);
  const duplicateProject = useCircuitStore((s) => s.duplicateProject);
  const deleteProject = useCircuitStore((s) => s.deleteProject);

  const [name, setName] = useState("Untitled circuit");

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm"
          placeholder="Project name"
        />
        <Button onClick={() => saveAsNewProject(name)}>Save as new</Button>
        {activeProjectId && (
          <Button variant="secondary" onClick={updateActiveProject}>
            Update
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No saved projects yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {projects.map((p) => (
            <li
              key={p.id}
              className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-sm ${
                p.id === activeProjectId ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"
              }`}
            >
              <button
                onClick={() => {
                  const newName = prompt("Rename project", p.name);
                  if (newName) renameProject(p.id, newName);
                }}
                className="truncate text-left text-[var(--text-secondary)] hover:underline"
                title="Click to rename"
              >
                {p.name}
              </button>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => loadProject(p.id)} className="text-xs text-[var(--accent)] hover:underline">
                  Load
                </button>
                <button onClick={() => duplicateProject(p.id)} className="text-xs text-[var(--text-secondary)] hover:underline">
                  Duplicate
                </button>
                <button onClick={() => deleteProject(p.id)} className="text-xs text-[var(--error)] hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
