import type { ActivityType } from "@/types";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  electricity: "전기",
  plastic1: "원소재 1",
  plastic2: "원소재 2",
  transport: "운송",
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  electricity: "#2a9d8f",
  transport: "#4a90a4",
  plastic1: "#a7c957",
  plastic2: "#7a9e3a",
};

export type LifecycleStage = "원료" | "제조" | "유통";

export const LIFECYCLE_STAGE: Record<ActivityType, LifecycleStage> = {
  plastic1: "원료",
  plastic2: "원료",
  electricity: "제조",
  transport: "유통",
};

export const LIFECYCLE_STAGE_LABEL: Record<LifecycleStage, string> = {
  원료: "원료 (Raw Material)",
  제조: "제조 (Manufacturing)",
  유통: "유통 (Distribution)",
};

export const LIFECYCLE_COLORS: Record<LifecycleStage, string> = {
  원료: "var(--scope-3)",
  제조: "var(--scope-2)",
  유통: "var(--scope-1)",
};
