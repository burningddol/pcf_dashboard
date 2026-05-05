"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useFilterStore } from "@/stores/filter";
import { aggregateByMonth } from "@/lib/domain/aggregate";
import FilterBar from "@/components/dashboard/FilterBar";
import KpiSection from "@/components/dashboard/KpiSection";
import EmissionsStackedBar from "@/components/charts/EmissionsStackedBar";
import type { Activity } from "@/types";

const KPI_SKELETON_COUNT = 5;
const CHART_BAR_HEIGHTS = [60, 80, 55, 90, 70, 85, 65, 95, 75, 88, 60, 78];

function KpiSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
      {Array.from({ length: KPI_SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="card col" style={{ padding: "14px 18px", gap: 8 }}>
          <span className="skel" style={{ width: 90, height: 10 }} />
          <span className="skel" style={{ width: 130, height: 24 }} />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200, padding: "0 8px" }}>
      {CHART_BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="skel"
          style={{ flex: 1, height: `${h}%`, borderRadius: "var(--r-1)" }}
        />
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const { filter } = useFilterStore();
  const {
    data: activities,
    isLoading,
    error,
  } = useSWR<Activity[]>(`/api/activities?from=${filter.from}&to=${filter.to}`, fetcher);

  return (
    <div className="col" style={{ padding: 32, gap: 24 }}>
      <div className="between">
        <h1 style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--fg)" }}>Overview</h1>
        <FilterBar />
      </div>

      {error && (
        <div
          style={{
            background: "var(--neg-soft)",
            border: "1px solid var(--neg)",
            borderRadius: "var(--r-3)",
            padding: "12px 16px",
          }}
        >
          <p style={{ fontSize: "var(--t-sm)", color: "var(--neg)", fontWeight: 500 }}>
            데이터를 불러오지 못했습니다.
          </p>
        </div>
      )}

      {isLoading ? (
        <>
          <KpiSkeleton />
          <div className="card" style={{ padding: 24 }}>
            <ChartSkeleton />
          </div>
        </>
      ) : (
        <>
          <KpiSection activities={activities ?? []} />
          <div className="card">
            <div className="card-h">
              <p style={{ fontSize: "var(--t-sm)", fontWeight: 500, color: "var(--fg-2)" }}>
                월별 배출량
              </p>
              <span className="muted" style={{ fontSize: "var(--t-xs)" }}>
                단위: tCO₂e
              </span>
            </div>
            <div className="card-b">
              <EmissionsStackedBar data={aggregateByMonth(activities ?? [])} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
