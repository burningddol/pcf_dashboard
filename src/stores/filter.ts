"use client";

import { create } from "zustand";
import type { FilterState } from "@/types";

interface FilterStore {
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filter: { from: "2025-01", to: "2025-08" },
  setFilter: (filter) => set({ filter }),
}));
