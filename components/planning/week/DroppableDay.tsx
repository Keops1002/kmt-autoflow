"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  dateId: string;
  date: Date;
  children: React.ReactNode;
}

export default function DroppableDay({ dateId, date, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: dateId });

  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const isToday  = todayStr === dateId;

  const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayNum  = date.getDate();

  return (
    <div
      ref={setNodeRef}
      className="rounded-2xl transition-all duration-200"
      style={{
        background: isOver ? "var(--accent-light)" : "var(--card-bg)",
        boxShadow: isOver ? `0 0 0 2px var(--accent)` : "none",
      }}
    >
      {/* Header jour */}
      <div
        className="px-4 py-3 rounded-t-2xl transition-all"
        style={{
          background: isToday
            ? "var(--accent-light)"
            : isOver
            ? "var(--accent-light)"
            : "var(--card-bg)",
        }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: isToday ? "var(--accent)" : "var(--text-muted)" }}>
          {dayName}
        </p>
        <p className="text-2xl font-black leading-tight"
          style={{ color: isToday ? "var(--accent)" : "var(--text-primary)" }}>
          {dayNum}
        </p>
      </div>

      {/* Cards */}
      <div className="p-3 flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}