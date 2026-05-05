"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import ActivityTable from "@/components/activity/ActivityTable";
import ActivityForm from "@/components/activity/ActivityForm";
import ExcelImport from "@/components/activity/ExcelImport";
import type { Activity, EmissionFactor } from "@/types";

export default function ActivitiesPage() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: () => fetcher<Activity[]>("/api/activities"),
  });

  const { data: factors } = useQuery<EmissionFactor[]>({
    queryKey: ["factors"],
    queryFn: () => fetcher<EmissionFactor[]>("/api/factors"),
  });

  return (
    <div className="flex flex-col p-8 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--t-h2)] font-semibold text-[color:var(--fg)]">활동 데이터</h1>
        <ExcelImport />
      </div>
      <ActivityForm factors={factors ?? []} />
      <ActivityTable activities={activities ?? []} isLoading={isLoading} />
    </div>
  );
}
