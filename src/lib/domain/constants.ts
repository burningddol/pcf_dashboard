import type { ActivityType } from "@/types";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  electricity: "전기",
  plastic1: "원소재 1",
  plastic2: "원소재 2",
  transport: "운송",
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  electricity: "#3b82f6",
  plastic1: "#f59e0b",
  plastic2: "#f97316",
  transport: "#10b981",
};
