import type { ActivityType, Scope } from "@/types";

export const COMPANY_ID = "ct-045";
export const ACTIVITY_TYPES: ActivityType[] = ["전기", "원소재", "운송"];

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

export const SCOPE_COLOR: Record<Scope, string> = {
  scope1: "var(--scope-1)",
  scope2: "var(--scope-2)",
  scope3: "var(--scope-3)",
};

export const SCOPE_LABEL: Record<Scope, string> = {
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3",
};

export const SCOPE_BADGE_BG: Record<Scope, string> = {
  scope1: "var(--scope-1-soft, #e8f4f1)",
  scope2: "var(--scope-2-soft, #e8f0f8)",
  scope3: "var(--scope-3-soft, #f0f4e8)",
};
