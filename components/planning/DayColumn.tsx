"use client";
import { useDroppable } from "@dnd-kit/core";

export default function DayColumn({ id, date, children }: { id: string, date: Date, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  const isToday = new Date().toISOString().slice(0, 10) === id;
  const dayName = date.toLocaleDateString("fr-FR", { weekday: "short" });
  const dayNum = date.getDate();

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col min-w-[200px] min-h-[60vh] rounded-[2rem] transition-all p-3
        ${isOver ? "bg-blue-100/50 ring-2 ring-blue-400/20" : "bg-white/40"}
      `}
    >
      <div className="flex flex-col items-center py-4">
        <span className={`text-[10px] font-bold uppercase tracking-tighter ${isToday ? "text-blue-600" : "text-slate-400"}`}>
          {dayName}
        </span>
        <span className={`text-2xl font-black ${isToday ? "text-blue-600" : "text-slate-800"}`}>
          {dayNum}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}