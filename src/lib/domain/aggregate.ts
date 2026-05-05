import type { Activity, ActivityType } from "@/types";
import { ACTIVITY_LABELS, LIFECYCLE_STAGE } from "./constants";
import type { LifecycleStage } from "./constants";

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

export interface SankeyNodeDatum {
  id: string;
  label: string;
  kind: "activity" | "stage" | "total";
}

export interface SankeyLinkDatum {
  source: string;
  target: string;
  value: number;
}

export interface SankeyInput {
  nodes: SankeyNodeDatum[];
  links: SankeyLinkDatum[];
  total: number;
}

export function aggregateForSankey(activities: Activity[]): SankeyInput {
  if (activities.length === 0) return { nodes: [], links: [], total: 0 };

  const activityTotals = new Map<ActivityType, number>();
  const stageTotals = new Map<LifecycleStage, number>();

  for (const a of activities) {
    activityTotals.set(a.activityType, (activityTotals.get(a.activityType) ?? 0) + a.tCO2e);
    const stage = LIFECYCLE_STAGE[a.activityType];
    stageTotals.set(stage, (stageTotals.get(stage) ?? 0) + a.tCO2e);
  }

  const total = Array.from(stageTotals.values()).reduce((s, v) => s + v, 0);

  const nodes: SankeyNodeDatum[] = [
    ...Array.from(activityTotals.keys()).map((type) => ({
      id: type,
      label: ACTIVITY_LABELS[type],
      kind: "activity" as const,
    })),
    ...Array.from(stageTotals.keys()).map((stage) => ({
      id: stage,
      label: stage,
      kind: "stage" as const,
    })),
    { id: "total", label: "Total PCF", kind: "total" as const },
  ];

  const links: SankeyLinkDatum[] = [
    ...Array.from(activityTotals.entries()).map(([type, value]) => ({
      source: type,
      target: LIFECYCLE_STAGE[type],
      value,
    })),
    ...Array.from(stageTotals.entries()).map(([stage, value]) => ({
      source: stage,
      target: "total",
      value,
    })),
  ];

  return { nodes, links, total };
}
