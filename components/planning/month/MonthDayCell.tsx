"use client";

import { useDroppable } from "@dnd-kit/core";
import type { PlanningBar } from "@/lib/api/planning";
import { isoDate, todayIso, statusDot } from "./monthHelpers";

interface Props {
  date: Date;
  bars: PlanningBar[];
  onDayPress: (date: Date, bars: PlanningBar[]) => void;
}

export default function MonthDayCell({ date, bars, onDayPress }: Props) {
  const dateId = isoDate(date);
  const { isOver, setNodeRef } = useDroppable({ id: dateId });
  const isToday = dateId === todayIso();

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDayPress(date, bars)}
      className="relative flex flex-col items-center py-2 rounded-xl cursor-pointer transition-all duration-150 min-h-[52px]"
      style={{
        background: isOver
          ? "var(--accent-light)"
          : isToday
          ? "var(--accent-light)"
          : "transparent",
        boxShadow: isOver ? `0 0 0 2px var(--accent)` : "none",
        transform: isOver ? "scale(1.05)" : "scale(1)",
      }}
    >
      <span
        className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-black"
        style={{
          background: isToday ? "var(--accent)" : "transparent",
          color: isToday ? "#ffffff" : "var(--text-primary)",
        }}
      >
        {date.getDate()}
      </span>

      {bars.length > 0 && (
        <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[28px]">
          {bars.slice(0, 3).map((b) => (
            <span
              key={b.dossier_id}
              className={`w-1.5 h-1.5 rounded-full ${statusDot(b.dossiers?.status)}`}
            />
          ))}
          {bars.length > 3 && (
            <span className="text-[8px] font-black" style={{ color: "var(--text-muted)" }}>
              +{bars.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}