export function PhaseWheel() {
  const stops = Array.from({ length: 24 }, (_, i) => {
    const hue = (i / 24) * 360;
    return `hsl(${hue},85%,60%) ${(i / 24) * 100}%`;
  }).join(", ");

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-16 w-16 shrink-0">
        <div
          className="h-full w-full rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        />
        <div className="absolute inset-[22%] rounded-full bg-[var(--bg)]" />
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 text-[9px] text-[var(--text-muted)]">π/2</span>
        <span className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 text-[9px] text-[var(--text-muted)]">π</span>
        <span className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1 text-[9px] text-[var(--text-muted)]">3π/2</span>
        <span className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-[9px] text-[var(--text-muted)]">0</span>
      </div>
      <div className="flex flex-col gap-1 text-[11px] text-[var(--text-secondary)]">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" defaultChecked className="accent-[var(--accent)]" />
          State
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" className="accent-[var(--accent)]" />
          Phase angle
        </label>
      </div>
    </div>
  );
}
