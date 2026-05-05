import type { Activity, ActivityType, Scope } from "@/types";
import { SCOPE_LABEL } from "./constants";
import { mapToScope } from "./scope";

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
  kind: "activity" | "category" | "scope" | "total";
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

  const descriptionTotals = new Map<string, number>();
  const activityTypeTotals = new Map<string, number>();
  const scopeTotals = new Map<string, number>();
  const descriptionToType = new Map<string, string>();

  for (const a of activities) {
    descriptionTotals.set(a.description, (descriptionTotals.get(a.description) ?? 0) + a.tCO2e);
    activityTypeTotals.set(a.activityType, (activityTypeTotals.get(a.activityType) ?? 0) + a.tCO2e);
    scopeTotals.set(a.scope, (scopeTotals.get(a.scope) ?? 0) + a.tCO2e);
    descriptionToType.set(a.description, a.activityType);
  }

  const total = Array.from(scopeTotals.values()).reduce((s, v) => s + v, 0);

  const nodes: SankeyNodeDatum[] = [
    ...Array.from(descriptionTotals.keys())
      .sort()
      .map((desc) => ({
        id: desc,
        label: desc,
        kind: "activity" as const,
      })),
    ...Array.from(activityTypeTotals.keys()).map((type) => ({
      id: type,
      label: type,
      kind: "category" as const,
    })),
    ...Array.from(scopeTotals.keys()).map((scope) => ({
      id: scope,
      label: SCOPE_LABEL[scope as Scope],
      kind: "scope" as const,
    })),
    { id: "total", label: "Total PCF", kind: "total" as const },
  ];

  const links: SankeyLinkDatum[] = [
    ...Array.from(descriptionTotals.entries()).map(([desc, value]) => ({
      source: desc,
      target: descriptionToType.get(desc)!,
      value,
    })),
    ...Array.from(activityTypeTotals.entries()).map(([type, value]) => ({
      source: type,
      target: mapToScope(type as ActivityType),
      value,
    })),
    ...Array.from(scopeTotals.entries()).map(([scope, value]) => ({
      source: scope,
      target: "total",
      value,
    })),
  ];

  return { nodes, links, total };
}
