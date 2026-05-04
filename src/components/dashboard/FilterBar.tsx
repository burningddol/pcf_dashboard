"use client";

import { useFilterStore } from "@/stores/filter";

export default function FilterBar() {
  const { filter, setFilter } = useFilterStore();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-zinc-500">기간</label>
      <input
        type="month"
        value={filter.from}
        max={filter.to}
        onChange={(e) => setFilter({ ...filter, from: e.target.value })}
        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
      <span className="text-sm text-zinc-400">~</span>
      <input
        type="month"
        value={filter.to}
        min={filter.from}
        onChange={(e) => setFilter({ ...filter, to: e.target.value })}
        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
      />
    </div>
  );
}
