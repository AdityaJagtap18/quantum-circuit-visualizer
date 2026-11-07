"use client";

import Editor from "@monaco-editor/react";
import { useMemo, useState } from "react";
import { useCircuitStore } from "@/lib/store";
import { generateQiskitCode } from "@/lib/qiskit-generator";
import { generateOpenQasm } from "@/lib/openqasm-generator";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/theme";

type Lang = "qiskit" | "qasm";

export function CodePanel() {
  const circuit = useCircuitStore((s) => s.circuit);
  const [lang, setLang] = useState<Lang>("qasm");
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const code = useMemo(
    () => (lang === "qiskit" ? generateQiskitCode(circuit) : generateOpenQasm(circuit)),
    [circuit, lang]
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-1">
          <TabButton active={lang === "qasm"} onClick={() => setLang("qasm")}>
            OpenQASM 2.0
          </TabButton>
          <TabButton active={lang === "qiskit"} onClick={() => setLang("qiskit")}>
            Qiskit
          </TabButton>
        </div>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--border)]">
        <Editor
          height="320px"
          language={lang === "qiskit" ? "python" : "cpp"}
          value={code}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        active ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
      }`}
    >
      {children}
    </button>
  );
}
