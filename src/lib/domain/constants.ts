import type { ActivityType } from "@/types";

export type LifecycleStage = "원료" | "제조" | "유통";

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

export const CATEGORY_COLOR: Record<ActivityType, string> = {
  원소재: "var(--scope-3)",
  전기: "var(--scope-2)",
  운송: "var(--scope-1)",
};
