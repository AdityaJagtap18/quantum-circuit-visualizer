# Quantum Circuit Visualizer

**Created by Aditya Jagtap**

A from-scratch visual quantum circuit editor: build a circuit on qubit
wires, export it as Qiskit Python or OpenQASM 2.0, import Qiskit code
back, and run a real local statevector simulator for measurement
histograms and amplitude tables — all client-side, no backend.

This is an independent reimplementation, built by studying the concept
and feature set of [KUQCI's Quantum Circuit
Visualizer](https://github.com/KUQCI/Quantum-Circuit-Visualizer) (a
project the author owns/leads) and writing the circuit schema,
simulator, and generators fresh rather than reusing its code, scoped
down to the core editor (the original also includes a full gamified
learning platform, mascot, and AI chat, which are out of scope here).

## Features

- **Visual circuit editor** — toolbar-driven gate placement on a
  qubit/classical-bit grid (no drag-and-drop canvas; every gate the
  simulator/generators support is reachable through the toolbar).
- **Qiskit export** — generates real Qiskit Python source text.
- **OpenQASM 2.0 export** — generates valid OpenQASM 2.0 source text.
- **Qiskit import** — parses a practical subset of Qiskit Python
  (text-only, regex-based; never evaluates or executes the pasted code)
  back into the circuit editor.
- **Real statevector simulator** — a from-scratch complex-number engine
  applies each gate's unitary (or control logic, for CX/CZ/SWAP/CCX/
  RXX/RZZ) to the full 2ⁿ amplitude vector.
- **Measurement histogram** — samples shots from the simulated
  probability distribution (Recharts bar chart).
- **Statevector table** — real/imaginary/probability/phase per basis
  state (qubit count ≤ 8, since the table itself would otherwise be
  too large to read).
- **3D Q-sphere** — basis states placed by Hamming weight (latitude)
  and spread by index (longitude), dot size by probability, color by
  phase (Three.js / React Three Fiber, qubit count ≤ 6).
- **Syntax-highlighted code panel** — Monaco editor (read-only) for
  both Qiskit and OpenQASM output, IBM-Composer-style.
- **Project management** — save, rename, duplicate, and delete circuits
  via `localStorage` (Zustand `persist`).

## Supported Gates

**Single-qubit:** I, X, Y, Z, H, S, S†, T, T†, √X, P, RX, RY, RZ, U
**Two-qubit:** CX, CZ, SWAP, RXX, RZZ
**Three-qubit:** CCX, RCCX
**Special:** Measure, Reset, Barrier

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| State | Zustand with `localStorage` persistence |
| Validation | Zod |
| Charts | Recharts |
| Testing | Vitest |

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then go to
"Open the Circuit Editor."

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm test` | Run the Vitest suite |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/
  page.tsx              Landing page
  editor/page.tsx        Circuit editor
components/
  palette/GatePalette.tsx     Gate/qubit/param selection toolbar
  editor/CircuitCanvas.tsx    Qubit-wire visualization
  editor/RegisterControls.tsx Qubit/clbit count steppers
  editor/ProjectPanel.tsx     Save/rename/duplicate/delete projects
  code/CodePanel.tsx          Qiskit/OpenQASM export + copy
  code/ImportPanel.tsx        Qiskit import (text-only parsing)
  viz/MeasurementHistogram.tsx
  viz/StatevectorTable.tsx
lib/
  circuit-schema.ts      The circuit JSON IR (Zod-validated)
  gate-definitions.ts    Gate catalog + unitary matrices
  complex.ts              Complex-number arithmetic
  simulator.ts            Statevector engine + shot sampling
  qiskit-generator.ts      Circuit -> Qiskit Python text
  openqasm-generator.ts    Circuit -> OpenQASM 2.0 text
  qiskit-parser.ts         Qiskit Python text -> Circuit (no exec)
  store.ts                 Zustand app state + persistence
```

## Testing

```bash
npm test
```

**19/19 tests passing**, covering:
- Statevector correctness: identity, H superposition, Bell state, GHZ
  state, normalization under a mixed multi-gate circuit, X flip, SWAP,
  CCX (Toffoli) — both the flipped and not-flipped control cases.
- Shot sampling: deterministic single-outcome circuits, shot-count
  conservation, Bell-state outcomes restricted to `{00, 11}`.
- Code generation: Qiskit and OpenQASM output for a Bell circuit,
  symbolic angle formatting (`pi/2`, etc.).
- Import parsing: Bell-circuit round-trip, pi-expression parsing, a
  full generate→parse→generate idempotence check, and two negative
  tests confirming unsupported/malicious input is rejected with an
  error rather than silently accepted or executed.

## Security note on the Qiskit importer

The importer never calls `eval`/`exec`/dynamic `import()` on pasted
code. It only recognizes a fixed set of `qc.<method>(...)` call
patterns via regex, and the only "arithmetic" it evaluates (for
rotation-angle expressions like `pi/2`) is run through a `Function`
constructor whose input is first validated against a strict
whitelist regex (`[-+*/0-9.() ]+` only, after substituting the literal
word `pi`) — so no identifier, property access, or function call can
ever reach that evaluator. See `lib/qiskit-parser.ts` and the negative
tests in `lib/codegen.test.ts`.

## License

MIT — see [LICENSE](LICENSE).
