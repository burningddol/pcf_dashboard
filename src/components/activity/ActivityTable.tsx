import { memo, useMemo } from "react";
import type { Activity, Scope } from "@/types";
import { SCOPE_COLOR, SCOPE_LABEL, SCOPE_BADGE_BG } from "@/lib/domain/constants";

const HEADERS = ["기간", "활동 유형", "설명", "활동량", "tCO₂e", "Scope"];

interface ActivityTableProps {
  activities: Activity[];
  isLoading: boolean;
}

function ScopeBadge({ scope }: { scope: Scope }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-[var(--r-2)] text-[11px] font-medium"
      style={{ color: SCOPE_COLOR[scope], background: SCOPE_BADGE_BG[scope] }}
    >
      {SCOPE_LABEL[scope]}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: HEADERS.length }).map((_, j) => (
            <td key={j} className="px-3 py-2.5">
              <span className="skel block h-3 w-4/5" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function TableBody({ activities, isLoading }: ActivityTableProps) {
  const sorted = useMemo(
    () => [...activities].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
    [activities]
  );

  if (isLoading) return <SkeletonRows />;

  if (sorted.length === 0) {
    return (
      <tr>
        <td
          colSpan={HEADERS.length}
          className="px-3 py-8 text-center text-[12px] text-[color:var(--fg-4)]"
        >
          데이터 없음
        </td>
      </tr>
    );
  }

  return sorted.map((a) => (
    <tr key={a.id} className="border-b border-[color:var(--line)]">
      <td className={cellClass + " num"}>{a.yearMonth}</td>
      <td className={cellClass}>{a.activityType}</td>
      <td className={cellClass}>{a.description}</td>
      <td className={cellClass + " font-mono"}>
        {a.amount.toLocaleString()} {a.unit}
      </td>
      <td className={cellClass + " font-mono font-semibold"}>{a.tCO2e.toFixed(2)}</td>
      <td className={cellClass}>
        <ScopeBadge scope={a.scope} />
      </td>
    </tr>
  ));
}

export default memo(function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="card-h">
        <p className="text-[12px] font-semibold text-[color:var(--fg)]">활동 목록</p>
        <span className="muted text-[11px]">{activities.length}건</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[color:var(--line)]">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-[11px] font-medium text-[color:var(--fg-3)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableBody activities={activities} isLoading={isLoading} />
          </tbody>
        </table>
      </div>
    </div>
  );
});

const cellClass = "px-3 py-2.5 text-[12px] text-[color:var(--fg)]";
