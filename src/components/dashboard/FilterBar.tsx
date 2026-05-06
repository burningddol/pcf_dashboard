"use client";

import { useFilterStore } from "@/stores/filter";

export default function FilterBar() {
  const { filter, setFilter } = useFilterStore();

  return (
    <div className="flex items-center gap-2">
      <span className="muted text-[length:var(--t-xs)]">기간</span>
      <input
        type="month"
        value={filter.from}
        max={filter.to}
        onChange={(e) => setFilter({ ...filter, from: e.target.value })}
        className="input"
      />
      <span className="muted text-[length:var(--t-xs)]">~</span>
      <input
        type="month"
        value={filter.to}
        min={filter.from}
        onChange={(e) => setFilter({ ...filter, to: e.target.value })}
        className="input"
      />
    </div>
  );
}
