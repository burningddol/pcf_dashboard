"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import ActivityTable from "@/components/activity/ActivityTable";
import ActivityForm from "@/components/activity/ActivityForm";
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
    <div className="col" style={{ padding: 32, gap: 24 }}>
      <h1 style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--fg)" }}>활동 데이터</h1>
      <ActivityForm factors={factors ?? []} />
      <ActivityTable activities={activities ?? []} isLoading={isLoading} />
    </div>
  );
}
