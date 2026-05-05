import type { ActivityType } from "@/types";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  electricity: "전기",
  plastic1: "원소재 1",
  plastic2: "원소재 2",
  transport: "운송",
};

// Scope 팔레트 기반: electricity(scope-2 teal), 나머지(scope-3 lime 계열)
export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  electricity: "#2a9d8f",
  transport: "#4a90a4",
  plastic1: "#a7c957",
  plastic2: "#7a9e3a",
};
