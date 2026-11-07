"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, HelpCircle, FolderOpen, Undo2, Redo2, Moon, Sun } from "lucide-react";
import { SAMPLE_CIRCUITS } from "@/lib/sample-circuits";
import { useCircuitStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

export function ComposerToolbar() {
  const loadCircuit = useCircuitStore((s) => s.loadCircuit);
  const { theme, toggleTheme } = useTheme();
  const [circuitName, setCircuitName] = useState("My first circuit");
  const [showSamples, setShowSamples] = useState(false);

  return (
    <div className="flex flex-col border-b border-[var(--border)] bg-[var(--surface)]">
      {/* Row 1: brand bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-5 w-5 grid-cols-2 gap-0.5 rounded-sm">
            <span className="rounded-[1px] bg-[var(--accent)]" />
            <span className="rounded-[1px] bg-[var(--accent)]/60" />
            <span className="rounded-[1px] bg-[var(--accent)]/60" />
            <span className="rounded-[1px] bg-[var(--accent)]" />
          </span>
          <span className="text-sm font-semibold text-[var(--text)]">Quantum Circuit Visualizer</span>
        </Link>
        <div className="flex items-center gap-3 text-[var(--text-muted)]">
          <IconButton label="Search"><Search size={14} /></IconButton>
          <IconButton label="Help"><HelpCircle size={14} /></IconButton>
          <IconButton label="Toggle theme" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </IconButton>
          <span className="text-xs text-[var(--text-secondary)]">Aditya Jagtap</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[10px] font-semibold text-[var(--text)]">
            AJ
          </span>
        </div>
      </div>

      {/* Row 2: circuit title + menu + run */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-[var(--text-muted)]" />
          <input
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            className="rounded bg-transparent px-1 text-sm text-[var(--text)] hover:bg-[var(--surface-secondary)] focus:bg-[var(--surface-secondary)] focus:outline-none"
          />
          <span className="text-xs text-[var(--text-muted)]">Autosaved</span>
          <span className="mx-2 h-4 w-px bg-[var(--border)]" />
          <nav className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <MenuItem label="File" />
            <MenuItem label="Edit" />
            <div className="relative">
              <MenuItem label="View" onClick={() => setShowSamples((v) => !v)} />
              {showSamples && (
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-sm">
                  <p className="px-3 py-1 text-[10px] uppercase text-[var(--text-muted)]">Load sample</p>
                  {Object.entries(SAMPLE_CIRCUITS).map(([name, circuit]) => (
                    <button
                      key={name}
                      onClick={() => {
                        loadCircuit(circuit);
                        setShowSamples(false);
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
        <button className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]">
          Run circuit
        </button>
      </div>

      {/* Row 3: secondary toolbar icons */}
      <div className="flex items-center gap-3 border-t border-[var(--border)] px-4 py-1.5 text-[var(--text-muted)]">
        <IconButton label="Undo"><Undo2 size={14} /></IconButton>
        <IconButton label="Redo"><Redo2 size={14} /></IconButton>
        <span className="h-4 w-px bg-[var(--border)]" />
        <span className="text-xs">Column alignment</span>
      </div>
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded px-1.5 py-0.5 hover:bg-[var(--surface-secondary)] hover:text-[var(--text)]">
      {label}
    </button>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button title={label} onClick={onClick} className="flex h-6 w-6 items-center justify-center hover:text-[var(--text)]">
      {children}
    </button>
  );
}
