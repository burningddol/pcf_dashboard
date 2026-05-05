import { memo, useMemo } from "react";
import type { Activity, Scope } from "@/types";
import { SCOPE_COLOR, SCOPE_LABEL, SCOPE_BADGE_BG } from "@/lib/domain/constants";

interface ActivityTableProps {
  activities: Activity[];
  isLoading: boolean;
}

function ScopeBadge({ scope }: { scope: Scope }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "var(--r-2)",
        fontSize: "var(--t-xs)",
        fontWeight: 500,
        color: SCOPE_COLOR[scope],
        background: SCOPE_BADGE_BG[scope],
      }}
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
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j} style={{ padding: "10px 12px" }}>
              <span className="skel" style={{ display: "block", height: 12, width: "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default memo(function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  const sorted = useMemo(
    () => [...activities].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth)),
    [activities]
  );

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="card-h">
        <p style={{ fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--fg)" }}>활동 목록</p>
        <span className="muted" style={{ fontSize: "var(--t-xs)" }}>
          {activities.length}건
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--line)" }}>
              {["기간", "활동 유형", "설명", "활동량", "tCO₂e", "Scope"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontSize: "var(--t-xs)",
                    fontWeight: 500,
                    color: "var(--fg-3)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "32px 12px",
                    textAlign: "center",
                    fontSize: "var(--t-sm)",
                    color: "var(--fg-4)",
                  }}
                >
                  데이터 없음
                </td>
              </tr>
            ) : (
              sorted.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={cellStyle} className="num">
                    {a.yearMonth}
                  </td>
                  <td style={cellStyle}>{a.activityType}</td>
                  <td style={cellStyle}>{a.description}</td>
                  <td style={{ ...cellStyle, fontFamily: "var(--font-mono)" }}>
                    {a.amount.toLocaleString()} {a.unit}
                  </td>
                  <td style={{ ...cellStyle, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    {a.tCO2e.toFixed(2)}
                  </td>
                  <td style={cellStyle}>
                    <ScopeBadge scope={a.scope} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const cellStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: "var(--t-sm)",
  color: "var(--fg)",
};
