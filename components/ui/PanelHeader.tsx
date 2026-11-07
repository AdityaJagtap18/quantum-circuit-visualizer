export function PanelHeader({ title, onRefresh }: { title: string; onRefresh?: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <button className="flex items-center gap-1 text-sm font-medium text-[var(--text)]">
        {title}
        <span className="text-[10px] text-[var(--text-muted)]">▾</span>
      </button>
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        {onRefresh && (
          <button title="Refresh" onClick={onRefresh} className="hover:text-[var(--text)]">
            ↻
          </button>
        )}
        <button title="Info" className="hover:text-[var(--text)]">
          ⓘ
        </button>
        <button title="More" className="hover:text-[var(--text)]">
          ⋮
        </button>
      </div>
    </div>
  );
}
