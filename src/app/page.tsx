"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useFilterStore } from "@/stores/filter";
import { aggregateByMonth } from "@/lib/domain/aggregate";
import FilterBar from "@/components/dashboard/FilterBar";
import KpiSection from "@/components/dashboard/KpiSection";
import EmissionsStackedBar from "@/components/charts/EmissionsStackedBar";
import type { Activity } from "@/types";

export default function OverviewPage() {
  const { filter } = useFilterStore();
  const { data: activities, isLoading, error } = useSWR<Activity[]>(
    `/api/activities?from=${filter.from}&to=${filter.to}`,
    fetcher,
  );

  const monthlyData = aggregateByMonth(activities ?? []);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Overview</h1>
        <FilterBar />
      </div>

      {error && <p className="text-sm text-red-500">데이터를 불러오지 못했습니다.</p>}

      {isLoading ? (
        <div className="text-sm text-zinc-400">불러오는 중...</div>
      ) : (
        <>
          <KpiSection activities={activities ?? []} />
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="mb-4 text-sm font-medium text-zinc-700">월별 배출량 (tCO₂e)</p>
            <EmissionsStackedBar data={monthlyData} />
          </div>
        </>
      )}
    </div>
  );
}
