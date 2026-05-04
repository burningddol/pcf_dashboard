import type { ActivityType, Scope } from "@/types";

const SCOPE_MAP: Record<ActivityType, Scope> = {
  electricity: "scope2",
  plastic1: "scope3",
  plastic2: "scope3",
  transport: "scope3",
};

export function mapToScope(activityType: ActivityType): Scope {
  return SCOPE_MAP[activityType];
}
