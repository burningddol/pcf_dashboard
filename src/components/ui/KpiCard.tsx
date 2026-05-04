interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  sub?: string;
}

export default function KpiCard({ label, value, unit, sub }: KpiCardProps) {
  return (
    <div
      className="card"
      style={{ padding: "14px 18px 14px", display: "flex", flexDirection: "column", gap: 4 }}
    >
      <p className="micro">{label}</p>
      <p style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 }}>
        <span
          className="num"
          style={{ fontSize: "var(--t-display)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)" }}
        >
          {value}
        </span>
        <span style={{ fontSize: "var(--t-xs)", color: "var(--fg-3)" }}>{unit}</span>
      </p>
      {sub && <p style={{ fontSize: "var(--t-xs)", color: "var(--fg-3)" }}>{sub}</p>}
    </div>
  );
}
