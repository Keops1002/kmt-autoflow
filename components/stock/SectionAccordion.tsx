"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  icon: any;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SectionAccordion({ icon: Icon, title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5"
        style={{ borderBottom: open ? "1px solid var(--card-border)" : "none" }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center"
          style={{ background: "var(--accent-light)" }}>
          <Icon size={13} style={{ color: "var(--accent)" }} />
        </div>
        <p className="flex-1 text-left text-sm font-black" style={{ color: "var(--text-primary)" }}>
          {title}
        </p>
        <ChevronDown size={14} style={{
          color: "var(--text-muted)",
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.2s",
        }} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${
        open ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
}