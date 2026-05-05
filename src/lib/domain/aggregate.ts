import type { Activity, ActivityType } from "@/types";

export interface MonthlyRow {
  yearMonth: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface SourceSummary {
  activityType: ActivityType;
  tCO2e: number;
}

export function aggregateByMonth(activities: Activity[]): MonthlyRow[] {
  const map = new Map<string, MonthlyRow>();

  for (const a of activities) {
    if (!map.has(a.yearMonth)) {
      map.set(a.yearMonth, { yearMonth: a.yearMonth, scope1: 0, scope2: 0, scope3: 0, total: 0 });
    }
    const row = map.get(a.yearMonth)!;
    row[a.scope] += a.tCO2e;
    row.total += a.tCO2e;
  }

  return Array.from(map.values()).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

export function aggregateBySource(activities: Activity[]): SourceSummary[] {
  const map = new Map<ActivityType, number>();

  for (const a of activities) {
    map.set(a.activityType, (map.get(a.activityType) ?? 0) + a.tCO2e);
  }

  return Array.from(map.entries())
    .map(([activityType, tCO2e]) => ({ activityType, tCO2e }))
    .sort((a, b) => b.tCO2e - a.tCO2e);
}
