"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useFilterStore } from "@/stores/filter";
import { aggregateByMonth, aggregateForSankey } from "@/lib/domain/aggregate";
import FilterBar from "@/components/dashboard/FilterBar";
import KpiSection from "@/components/dashboard/KpiSection";
import EmissionsStackedBar from "@/components/charts/EmissionsStackedBar";
import EmissionsSankey from "@/components/charts/EmissionsSankey";
import type { Activity } from "@/types";

type ChartTab = "sankey" | "bar";

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

const TAB_STYLE_BASE: React.CSSProperties = {
  fontSize: "var(--t-xs)",
  fontWeight: 500,
  padding: "4px 12px",
  borderRadius: "var(--r-2)",
  border: "none",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
};

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...TAB_STYLE_BASE,
        background: active ? "var(--fg)" : "transparent",
        color: active ? "var(--bg)" : "var(--fg-3)",
      }}
    >
      {children}
    </button>
  );
}

export default function OverviewPage() {
  const { filter } = useFilterStore();
  const [chartTab, setChartTab] = useState<ChartTab>("sankey");

  const {
    data: activities,
    isLoading,
    error,
  } = useQuery<Activity[]>({
    queryKey: ["activities", filter.from, filter.to],
    queryFn: () => fetcher<Activity[]>(`/api/activities?from=${filter.from}&to=${filter.to}`),
  });

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
              <div className="row" style={{ gap: 4 }}>
                <TabButton active={chartTab === "sankey"} onClick={() => setChartTab("sankey")}>
                  PCF Sankey
                </TabButton>
                <TabButton active={chartTab === "bar"} onClick={() => setChartTab("bar")}>
                  월별 배출량
                </TabButton>
              </div>
              <span className="muted" style={{ fontSize: "var(--t-xs)" }}>
                단위: tCO₂e
              </span>
            </div>
            <div className="card-b">
              {chartTab === "sankey" ? (
                <EmissionsSankey data={aggregateForSankey(activities ?? [])} />
              ) : (
                <EmissionsStackedBar data={aggregateByMonth(activities ?? [])} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
