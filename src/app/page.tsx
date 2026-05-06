"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
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
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: KPI_SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="card flex flex-col gap-2 px-[18px] py-[14px]">
          <span className="skel w-[90px] h-2.5" />
          <span className="skel w-[130px] h-6" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex items-end gap-2 h-[200px] px-2">
      {CHART_BAR_HEIGHTS.map((h, i) => (
        <span key={i} className="skel flex-1 rounded-[var(--r-1)]" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

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
      className={cn(
        "text-[length:var(--t-xs)] font-medium px-3 py-1 rounded-[var(--r-2)] border-0 cursor-pointer transition-[background,color] duration-150",
        active
          ? "bg-[color:var(--fg)] text-[color:var(--bg)]"
          : "bg-transparent text-[color:var(--fg-3)]"
      )}
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
    <div className="flex flex-col p-8 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[length:var(--t-h2)] font-semibold text-[color:var(--fg)]">Overview</h1>
        <FilterBar />
      </div>

      {error && (
        <div className="bg-[color:var(--neg-soft)] border border-[color:var(--neg)] rounded-[var(--r-3)] px-4 py-3">
          <p className="text-[length:var(--t-sm)] text-[color:var(--neg)] font-medium">
            데이터를 불러오지 못했습니다.
          </p>
        </div>
      )}

      {isLoading ? (
        <>
          <KpiSkeleton />
          <div className="card p-6">
            <ChartSkeleton />
          </div>
        </>
      ) : (
        <>
          <KpiSection activities={activities ?? []} />
          <div className="card">
            <div className="card-h">
              <div className="flex items-center gap-1">
                <TabButton active={chartTab === "sankey"} onClick={() => setChartTab("sankey")}>
                  PCF Sankey
                </TabButton>
                <TabButton active={chartTab === "bar"} onClick={() => setChartTab("bar")}>
                  월별 배출량
                </TabButton>
              </div>
              <span className="muted text-[length:var(--t-xs)]">
                단위: tCO₂e · 단일 제품 회사 가정
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
