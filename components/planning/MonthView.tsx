"use client";

import { useEffect, useState } from "react";
import {
  DndContext, DragEndEvent,
  MouseSensor, TouchSensor,
  useSensor, useSensors, closestCorners,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { getPlanningMonth, scheduleDossier, clearPlanning, PlanningBar } from "@/lib/api/planning";
import { getDaysInMonth, getFirstDayOffset, isoDate, getBarsForDay, MONTH_NAMES, DAY_HEADERS } from "./month/monthHelpers";
import MonthDayCell  from "./month/MonthDayCell";
import MonthDayModal from "./month/MonthDayModal";
import EditModal     from "./month/EditModal";

export default function MonthView() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [year,  setYear]  = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [bars,  setBars]  = useState<PlanningBar[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay,  setSelectedDay]  = useState<Date | null>(null);
  const [selectedBars, setSelectedBars] = useState<PlanningBar[]>([]);
  const [editingBar,   setEditingBar]   = useState<PlanningBar | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => { loadData(); }, [monthOffset]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getPlanningMonth(monthOffset);
      setYear(res.year);
      setMonth(res.month);
      setBars(res.entries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const dossierId = String(e.active.id).replace(/^(unplanned-|planned-)/, "");
    const newDate   = String(e.over.id);
    setBars((prev) => prev.map((b) =>
      b.dossier_id === dossierId ? { ...b, start_date: newDate, end_date: newDate } : b
    ));
    await scheduleDossier(dossierId, newDate, newDate);
  }

  async function handleRemove(dossierId: string) {
    setBars((prev) => prev.filter((b) => b.dossier_id !== dossierId));
    await clearPlanning(dossierId);
  }

  async function handleEditSave(start: string, end: string) {
    if (!editingBar) return;
    setBars((prev) => prev.map((b) =>
      b.dossier_id === editingBar.dossier_id ? { ...b, start_date: start, end_date: end } : b
    ));
    await scheduleDossier(editingBar.dossier_id, start, end);
  }

  function handleDayPress(date: Date, dayBars: PlanningBar[]) {
    setSelectedDay(date);
    setSelectedBars(dayBars);
  }

  const days   = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4">

        {/* Navigation mois */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((p) => p - 1)}
            className="w-10 h-10 rounded-2xl shadow-sm border flex items-center justify-center active:scale-90 transition-all shrink-0"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setMonthOffset(0)}
            className="flex-1 h-10 rounded-2xl font-bold text-sm transition-all border shadow-sm"
            style={{
              background: monthOffset === 0 ? "var(--accent)" : "var(--card-bg)",
              color: monthOffset === 0 ? "#ffffff" : "var(--text-secondary)",
              borderColor: "var(--card-border)",
            }}
          >
            {MONTH_NAMES[month]} {year}
          </button>
          <button
            onClick={() => setMonthOffset((p) => p + 1)}
            className="w-10 h-10 rounded-2xl shadow-sm border flex items-center justify-center active:scale-90 transition-all shrink-0"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Chargement...</p>
          </div>
        ) : (
          <>
            {/* En-têtes jours */}
            <div className="grid grid-cols-7 gap-1">
              {DAY_HEADERS.map((d, i) => (
                <p key={i} className="text-center text-[10px] font-black uppercase tracking-wider py-1"
                  style={{ color: "var(--text-muted)" }}>
                  {d}
                </p>
              ))}
            </div>

            {/* Grille */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
              {days.map((date) => {
                const dateId  = isoDate(date);
                const dayBars = getBarsForDay(bars, dateId);
                return (
                  <MonthDayCell key={dateId} date={date} bars={dayBars} onDayPress={handleDayPress} />
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-4 pt-1 pb-2">
              {[
                { dot: "bg-amber-400",   label: "En attente" },
                { dot: "bg-blue-500",    label: "En cours" },
                { dot: "bg-emerald-500", label: "Terminé" },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedDay && (
        <MonthDayModal
          date={selectedDay}
          bars={selectedBars}
          onClose={() => setSelectedDay(null)}
          onEdit={(bar) => { setEditingBar(bar); setSelectedDay(null); }}
          onRemove={(id) => { handleRemove(id); setSelectedDay(null); }}
        />
      )}

      {editingBar && (
        <EditModal bar={editingBar} onSave={handleEditSave} onClose={() => setEditingBar(null)} />
      )}
    </DndContext>
  );
}