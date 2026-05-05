import type { ActivityType, Scope } from "@/types";

const SCOPE_MAP: Record<ActivityType, Scope> = {
  전기: "scope2",
  원소재: "scope3",
  운송: "scope3",
};

export function mapToScope(activityType: ActivityType): Scope {
  return SCOPE_MAP[activityType];
}
