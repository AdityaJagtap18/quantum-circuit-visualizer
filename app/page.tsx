import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Quantum Circuit <span className="text-[var(--accent)]">Visualizer</span>
        </h1>
        <p className="mb-8 max-w-xl text-[var(--text-secondary)]">
          Build quantum circuits visually, export to Qiskit or OpenQASM, import
          Qiskit code back, and run a real local statevector simulator — shot
          histograms and amplitude tables included.
        </p>
        <Link
          href="/editor"
          className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]"
        >
          Open the Circuit Editor
        </Link>

        <div className="mt-12 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Feature title="Visual editor" desc="Place gates on qubit wires with a toolbar — no code required." />
          <Feature title="Qiskit ⇄ OpenQASM" desc="Bidirectional, text-only conversion. Nothing is ever executed as code." />
          <Feature title="Real simulation" desc="A from-scratch complex statevector engine: shots, probabilities, and amplitudes." />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] p-4">
      <p className="mb-1 text-sm font-semibold text-[var(--text)]">{title}</p>
      <p className="text-xs text-[var(--text-muted)]">{desc}</p>
    </div>
  );
}
