"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { useCircuitStore } from "@/lib/store";
import { bitstring, magnitudeSquared, phase as ampPhase, simulateStatevector } from "@/lib/simulator";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { PhaseWheel } from "@/components/viz/PhaseWheel";

function hammingWeight(bits: string): number {
  return bits.split("").filter((b) => b === "1").length;
}

function phaseToColor(phase: number): string {
  // phase in [-pi, pi] -> hue [0, 360)
  const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
  return `hsl(${hue}, 85%, 60%)`;
}

interface SpherePoint {
  basis: string;
  position: [number, number, number];
  probability: number;
  phase: number;
}

function computeSpherePoints(numQubits: number, state: { re: number; im: number }[]): SpherePoint[] {
  const n = numQubits;
  const byWeight = new Map<number, { index: number; bits: string }[]>();

  for (let i = 0; i < state.length; i++) {
    const bits = bitstring(i, n);
    const w = hammingWeight(bits);
    if (!byWeight.has(w)) byWeight.set(w, []);
    byWeight.get(w)!.push({ index: i, bits });
  }

  const points: SpherePoint[] = [];
  for (const [weight, entries] of byWeight.entries()) {
    const theta = n === 0 ? Math.PI / 2 : Math.PI - (weight / n) * Math.PI; // weight 0 -> top (theta=pi), weight n -> bottom
    entries.forEach((entry, i) => {
      const phi = (2 * Math.PI * i) / entries.length;
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.cos(theta);
      const z = Math.sin(theta) * Math.sin(phi);
      const amp = state[entry.index];
      points.push({
        basis: entry.bits,
        position: [x, y, z],
        probability: magnitudeSquared(amp),
        phase: ampPhase(amp),
      });
    });
  }
  return points;
}

export function QSphere3D() {
  const circuit = useCircuitStore((s) => s.circuit);

  const points = useMemo(() => {
    if (circuit.numQubits > 6) return [];
    const state = simulateStatevector(circuit);
    return computeSpherePoints(circuit.numQubits, state);
  }, [circuit]);

  if (circuit.numQubits > 6) {
    return (
      <div>
        <PanelHeader title="Q-sphere" />
        <p className="text-sm text-[var(--warning)]">
          Q-sphere is hidden above 6 qubits (2{"^"}n points become unreadable) — use the Statevector
          table or histogram instead.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PanelHeader title="Q-sphere" />
      <div className="h-60 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)]">
      <Canvas camera={{ position: [2.4, 1.6, 2.4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.6} />
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#8a93a3" wireframe transparent opacity={0.4} />
        </mesh>
        {points
          .filter((p) => p.probability > 1e-6)
          .map((p) => (
            <group key={p.basis}>
              <Line points={[[0, 0, 0], p.position]} color={phaseToColor(p.phase)} lineWidth={1.5} />
              <mesh position={p.position}>
                <sphereGeometry args={[0.04 + 0.08 * Math.sqrt(p.probability), 16, 16]} />
                <meshStandardMaterial color={phaseToColor(p.phase)} />
              </mesh>
              <Html position={p.position} distanceFactor={6} className="pointer-events-none">
                <span className="rounded bg-[var(--surface)]/90 px-1 text-[9px] font-mono text-[var(--text)]">
                  |{p.basis}⟩
                </span>
              </Html>
            </group>
          ))}
        <OrbitControls enablePan={false} />
      </Canvas>
      </div>
      <div className="mt-2">
        <PhaseWheel />
      </div>
    </div>
  );
}
