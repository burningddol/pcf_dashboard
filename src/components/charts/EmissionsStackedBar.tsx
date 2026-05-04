"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ACTIVITY_LABELS, ACTIVITY_COLORS } from "@/lib/domain/constants";
import type { ActivityType } from "@/types";
import type { MonthlyRow } from "@/lib/domain/aggregate";

const ACTIVITY_TYPES: ActivityType[] = ["electricity", "plastic1", "plastic2", "transport"];

interface EmissionsStackedBarProps {
  data: MonthlyRow[];
}

export default function EmissionsStackedBar({ data }: EmissionsStackedBarProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey="yearMonth" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit=" t" />
        <Tooltip formatter={(v) => (typeof v === "number" ? `${v.toFixed(2)} tCO₂e` : v)} />
        <Legend formatter={(key: string) => ACTIVITY_LABELS[key as ActivityType] ?? key} />
        {ACTIVITY_TYPES.map((type) => (
          <Bar key={type} dataKey={type} stackId="a" fill={ACTIVITY_COLORS[type]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
