"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Scope } from "@/types";
import type { MonthlyRow } from "@/lib/domain/aggregate";

type ScopeConfig = { key: Scope; label: string; color: string; radius: [number, number, number, number] };

const SCOPES: ScopeConfig[] = [
  { key: "scope1", label: "Scope 1", color: "var(--scope-1)", radius: [0, 0, 0, 0] },
  { key: "scope2", label: "Scope 2", color: "var(--scope-2)", radius: [0, 0, 0, 0] },
  { key: "scope3", label: "Scope 3", color: "var(--scope-3)", radius: [3, 3, 0, 0] },
];

function getScopeLabel(key: string | number | undefined): string {
  return SCOPES.find((s) => s.key === key)?.label ?? String(key ?? "");
}

interface EmissionsStackedBarProps {
  data: MonthlyRow[];
}

export default function EmissionsStackedBar({ data }: EmissionsStackedBarProps): React.ReactElement {
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
            getScopeLabel(key),
          ]}
        />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(key: string) => (
            <span style={{ fontSize: 11, color: "var(--fg-3)" }}>
              {getScopeLabel(key)}
            </span>
          )}
        />
        {SCOPES.map(({ key, color, radius }) => (
          <Bar key={key} dataKey={key} stackId="a" fill={color} radius={radius} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
