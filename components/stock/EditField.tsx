"use client";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  options?: string[];
}

export default function EditField({ label, value, onChange, type = "text", options }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}>{label}</label>
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
          <option value="">—</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border text-sm font-medium outline-none"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
      )}
    </div>
  );
}