"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ACTIVITY_LABELS, ACTIVITY_COLORS } from "@/lib/domain/constants";
import type { ActivityType } from "@/types";
import type { MonthlyRow } from "@/lib/domain/aggregate";

const ACTIVITY_TYPES: ActivityType[] = ["electricity", "plastic1", "plastic2", "transport"];

const BAR_RADIUS: Record<ActivityType, [number, number, number, number]> = {
  electricity: [0, 0, 0, 0],
  plastic1: [0, 0, 0, 0],
  plastic2: [0, 0, 0, 0],
  transport: [3, 3, 0, 0],
};

interface EmissionsStackedBarProps {
  data: MonthlyRow[];
}

export default function EmissionsStackedBar({ data }: EmissionsStackedBarProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
        <XAxis
          dataKey="yearMonth"
          tick={{ fontSize: 11, fill: "var(--fg-4)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--fg-4)", fontFamily: "var(--font-mono)" }}
          axisLine={false}
          tickLine={false}
          unit=" t"
          width={48}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-2)",
            boxShadow: "var(--sh-2)",
            fontSize: 12,
          }}
          formatter={(v, key) => [
            `${typeof v === "number" ? v.toFixed(2) : v} tCO₂e`,
            ACTIVITY_LABELS[key as ActivityType] ?? key,
          ]}
        />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(key: string) => (
            <span style={{ fontSize: 11, color: "var(--fg-3)" }}>
              {ACTIVITY_LABELS[key as ActivityType] ?? key}
            </span>
          )}
        />
        {ACTIVITY_TYPES.map((type) => (
          <Bar key={type} dataKey={type} stackId="a" fill={ACTIVITY_COLORS[type]} radius={BAR_RADIUS[type]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
