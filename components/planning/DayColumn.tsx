"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

export default function DayColumn({ id, date, children }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-3 rounded-xl border bg-white/50 shadow-sm 
        ${isOver ? "ring-2 ring-blue-500/40" : ""}`}
    >
      <p className="font-bold text-sm text-slate-600 mb-2">
        {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
      </p>

      {children}
    </div>
  );
}
