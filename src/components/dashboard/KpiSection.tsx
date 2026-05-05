"use client";

import KpiCard from "@/components/ui/KpiCard";
import { aggregateBySource } from "@/lib/domain/aggregate";
import type { Activity } from "@/types";

interface KpiSectionProps {
  activities: Activity[];
}

interface ScopeTotals {
  total: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

function computeScopeTotals(activities: Activity[]): ScopeTotals {
  return activities.reduce(
    (acc, a) => {
      acc.total += a.tCO2e;
      if (a.scope === "scope1") acc.scope1 += a.tCO2e;
      else if (a.scope === "scope2") acc.scope2 += a.tCO2e;
      else acc.scope3 += a.tCO2e;
      return acc;
    },
    { total: 0, scope1: 0, scope2: 0, scope3: 0 }
  );
}

export default function KpiSection({ activities }: KpiSectionProps) {
  const { total, scope1, scope2, scope3 } = computeScopeTotals(activities);
  const topSource = aggregateBySource(activities)[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
      <KpiCard label="총 배출량" value={total.toFixed(2)} unit="tCO₂e" />
      <KpiCard label="Scope 1 직접배출" value={scope1.toFixed(2)} unit="tCO₂e" />
      <KpiCard label="Scope 2 구매전력" value={scope2.toFixed(2)} unit="tCO₂e" />
      <KpiCard label="Scope 3 가치사슬" value={scope3.toFixed(2)} unit="tCO₂e" />
      <KpiCard
        label="최대 배출원"
        value={topSource ? topSource.activityType : "-"}
        unit=""
        sub={topSource ? `${topSource.tCO2e.toFixed(2)} tCO₂e` : undefined}
      />
    </div>
  );
}
