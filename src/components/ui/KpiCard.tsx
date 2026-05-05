interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  sub?: string;
}

export default function KpiCard({ label, value, unit, sub }: KpiCardProps) {
  return (
    <div className="card flex flex-col gap-1 px-[18px] py-[14px]">
      <p className="micro">{label}</p>
      <p className="flex items-baseline gap-1 mt-0.5">
        <span className="num text-[length:var(--t-display)] font-semibold tracking-[-0.02em] text-[color:var(--fg)]">
          {value}
        </span>
        <span className="text-[length:var(--t-xs)] text-[color:var(--fg-3)]">{unit}</span>
      </p>
      {sub && <p className="text-[length:var(--t-xs)] text-[color:var(--fg-3)]">{sub}</p>}
    </div>
  );
}
