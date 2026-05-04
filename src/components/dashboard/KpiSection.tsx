"use client";

import KpiCard from "@/components/ui/KpiCard";
import { aggregateBySource } from "@/lib/domain/aggregate";
import { ACTIVITY_LABELS } from "@/lib/domain/constants";
import type { Activity } from "@/types";

interface KpiSectionProps {
  activities: Activity[];
}

interface ScopeTotals {
  total: number;
  scope2: number;
  scope3: number;
}

function computeScopeTotals(activities: Activity[]): ScopeTotals {
  return activities.reduce(
    (acc, a) => {
      acc.total += a.tCO2e;
      if (a.scope === "scope2") acc.scope2 += a.tCO2e;
      else acc.scope3 += a.tCO2e;
      return acc;
    },
    { total: 0, scope2: 0, scope3: 0 },
  );
}

export default function KpiSection({ activities }: KpiSectionProps) {
  const { total, scope2, scope3 } = computeScopeTotals(activities);
  const topSource = aggregateBySource(activities)[0];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard label="총 배출량" value={`${total.toFixed(2)} tCO₂e`} />
      <KpiCard label="Scope 2 (전기)" value={`${scope2.toFixed(2)} tCO₂e`} />
      <KpiCard label="Scope 3 (간접)" value={`${scope3.toFixed(2)} tCO₂e`} />
      <KpiCard
        label="최대 배출원"
        value={topSource ? ACTIVITY_LABELS[topSource.activityType] : "-"}
        sub={topSource ? `${topSource.tCO2e.toFixed(2)} tCO₂e` : undefined}
      />
    </div>
  );
}
