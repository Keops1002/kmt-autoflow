"use client";

interface Props {
  label: string;
  value?: string | number | null;
}

export default function Row({ label, value }: Props) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0"
      style={{ borderColor: "var(--card-border)" }}>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}