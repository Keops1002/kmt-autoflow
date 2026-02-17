"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { getPlanningWeek, moveDossierToDate } from "@/lib/api/planning";
import DayColumn from "./DayColumn";
import PlanningBar from "./PlanningBar";

export default function WeekView() {
  const [week, setWeek] = useState<Date[]>([]);
  const [bars, setBars] = useState<any[]>([]);
  const [unplanned, setUnplanned] = useState<any[]>([]);

  useEffect(() => {
    getPlanningWeek().then((res) => {
      setWeek(res.weekDays);
      setBars(res.bars || []);
      setUnplanned(res.unplanned || []);
    });
  }, []);

  const handleDragEnd = async (e: DragEndEvent) => {
    if (!e.over) return;

    const dossierId = String(e.active.id);
    const newDate = String(e.over.id);

    await moveDossierToDate(dossierId, newDate);

    setBars(prev => {
      const clean = prev.filter(b => b.dossier_id !== dossierId);
      return [...clean, { dossier_id: dossierId, start: newDate, end: newDate }];
    });

    setUnplanned(prev => prev.filter(d => d.id !== dossierId));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-3 mt-4">

        {week.map((date) => {
          const id = date.toISOString().slice(0, 10);

          return (
            <DayColumn key={id} id={id} date={date}>
              {bars
                .filter((b) => b.start === id)
                .map((bar) => (
                  <PlanningBar key={bar.dossier_id} bar={bar} />
                ))}
            </DayColumn>
          );
        })}

      </div>

      <div className="mt-8">
        <h3 className="font-bold text-slate-700 mb-2">Non planifiés</h3>

        <div className="bg-white/60 p-4 rounded-xl shadow grid gap-3">
          {unplanned.map((d) => (
            <PlanningBar
              key={d.id}
              bar={{
                dossier_id: d.id,
                unplanned: true,
                dossier: d,
              }}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
