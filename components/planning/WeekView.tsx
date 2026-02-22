"use client";

import { useEffect, useState } from "react";
import {
  DndContext, DragEndEvent, DragOverlay,
  MouseSensor, TouchSensor,
  useSensor, useSensors, closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

import {
  getPlanningData, moveDossierToDate, scheduleDossier,
  clearPlanning, addDays, daysBetween,
  PlanningBar, UnplannedDossier,
} from "@/lib/api/planning";

import { isoDate, todayIso, getInitialDayIndex, DAY_LETTERS } from "./week/weekHelpers";
import DroppableDay    from "./week/DroppableDay";
import PlanningCard    from "./week/PlanningCard";
import WeekEditModal   from "./week/WeekEditModal";
import UnplannedDrawer from "./week/UnplannedDrawer";

// Type pour les collaborateurs
interface Collaborateur {
  id: string;
  prenom: string;
}

export default function WeekView() {
  const [loading,    setLoading]    = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays,   setWeekDays]   = useState<Date[]>([]);
  const [bars,       setBars]       = useState<PlanningBar[]>([]);
  const [unplanned,  setUnplanned]  = useState<UnplannedDossier[]>([]);
  const [activeId,   setActiveId]   = useState<string | null>(null);
  const [editingBar, setEditingBar] = useState<PlanningBar | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dayIndex,   setDayIndex]   = useState(getInitialDayIndex());
  
  // State pour les collaborateurs
  const [collaborateurs, setCollaborateurs] = useState<Collaborateur[]>([]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 500, tolerance: 10 },
    })
  );

  useEffect(() => { loadData(); }, [weekOffset]);

  async function loadData() {
    setLoading(true);
    try {
      // Chargement simultané du planning et des collaborateurs
      const [res, collabsRes] = await Promise.all([
        getPlanningData(weekOffset),
        supabase.from("collaborateurs").select("id, prenom")
      ]);

      setWeekDays(res.weekDays);
      setBars(res.bars);
      setUnplanned(res.unplanned);
      if (collabsRes.data) setCollaborateurs(collabsRes.data);
    } catch (e) {
      console.error("Erreur chargement planning:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!e.over) return;
    const rawId     = String(e.active.id);
    const newDate   = String(e.over.id);
    const type      = rawId.startsWith("unplanned-") ? "unplanned" : "planned";
    const dossierId = rawId.replace(/^(unplanned-|planned-)/, "");

    if (type === "unplanned") {
      const dossier = unplanned.find((d) => d.id === dossierId);
      if (!dossier) return;
      const newBar: PlanningBar = {
        dossier_id: dossierId, start_date: newDate, end_date: newDate,
        dossiers: {
          id: dossier.id, problem: dossier.problem,
          status: dossier.status, estimated_price: dossier.estimated_price,
          vehicles: (dossier as any).vehicles ?? null,
        },
      };
      setBars((p) => [...p, newBar]);
      setUnplanned((p) => p.filter((d) => d.id !== dossierId));
      await scheduleDossier(dossierId, newDate, newDate);
    } else {
      const existing = bars.find((b) => b.dossier_id === dossierId);
      if (!existing) return;
      const duration = daysBetween(existing.start_date, existing.end_date);
      const newEnd   = addDays(newDate, duration);
      setBars((p) => p.map((b) =>
        b.dossier_id === dossierId ? { ...b, start_date: newDate, end_date: newEnd } : b
      ));
      await moveDossierToDate(dossierId, newDate);
    }
  }

  async function handleRemove(dossierId: string) {
    const bar = bars.find((b) => b.dossier_id === dossierId);
    if (!bar) return;
    setBars((p) => p.filter((b) => b.dossier_id !== dossierId));
    setUnplanned((p) => [...p, {
      id: bar.dossier_id, problem: bar.dossiers.problem,
      status: bar.dossiers.status, estimated_price: bar.dossiers.estimated_price,
      vehicles: bar.dossiers.vehicles,
    }]);
    await clearPlanning(dossierId);
  }

  async function handleEditSave(start: string, end: string) {
    if (!editingBar) return;
    setBars((p) => p.map((b) =>
      b.dossier_id === editingBar.dossier_id ? { ...b, start_date: start, end_date: end } : b
    ));
    await scheduleDossier(editingBar.dossier_id, start, end);
    setEditingBar(null);
  }

  function weekLabel() {
    if (!weekDays.length) return "";
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return `${weekDays[0].toLocaleDateString("fr-FR", opts)} – ${weekDays[6].toLocaleDateString("fr-FR", opts)}`;
  }

  const firstDayOfWeek = weekDays[0] ? isoDate(weekDays[0]) : "";
  const currentDate    = weekDays[dayIndex];
  const currentDateId  = currentDate ? isoDate(currentDate) : "";
  const dayBars        = bars.filter((b) => {
    const eff = b.start_date < firstDayOfWeek ? firstDayOfWeek : b.start_date;
    return eff === currentDateId;
  });

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3">
          {/* Navigation semaine */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((p) => p - 1)}
              className="w-10 h-10 rounded-2xl shadow-sm border flex items-center justify-center active:scale-90 transition-all shrink-0"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => { setWeekOffset(0); setDayIndex(getInitialDayIndex()); }}
              className="flex-1 h-10 rounded-2xl font-bold text-sm transition-all border shadow-sm"
              style={{
                background: weekOffset === 0 ? "var(--accent)" : "var(--card-bg)",
                color: weekOffset === 0 ? "#ffffff" : "var(--text-secondary)",
                borderColor: "var(--card-border)",
              }}
            >
              {weekOffset === 0 ? "Cette semaine" : weekLabel()}
            </button>
            <button
              onClick={() => setWeekOffset((p) => p + 1)}
              className="w-10 h-10 rounded-2xl shadow-sm border flex items-center justify-center active:scale-90 transition-all shrink-0"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Sélecteur de jours */}
          {!loading && weekDays.length > 0 && (
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((date, idx) => {
                const isSelected = idx === dayIndex;
                const isToday    = isoDate(date) === todayIso();
                const hasBars    = bars.some((b) => {
                  const eff = b.start_date < firstDayOfWeek ? firstDayOfWeek : b.start_date;
                  return eff === isoDate(date);
                });
                return (
                  <button
                    key={isoDate(date)}
                    onClick={() => setDayIndex(idx)}
                    className="flex flex-col items-center py-2 rounded-2xl transition-all"
                    style={{
                      background: isSelected
                        ? "var(--accent)"
                        : isToday
                        ? "var(--accent-light)"
                        : "var(--card-bg)",
                    }}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider"
                      style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
                      {DAY_LETTERS[date.getDay()]}
                    </span>
                    <span className="text-base font-black leading-tight"
                      style={{
                        color: isSelected ? "#ffffff" : isToday ? "var(--accent)" : "var(--text-primary)",
                      }}>
                      {date.getDate()}
                    </span>
                    <span className="w-1 h-1 rounded-full mt-0.5"
                      style={{
                        background: hasBars
                          ? isSelected ? "#ffffff" : "var(--accent)"
                          : "transparent",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Vue du jour */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Chargement...</p>
            </div>
          ) : currentDate ? (
            <DroppableDay dateId={currentDateId} date={currentDate}>
              {dayBars.length > 0 ? (
                dayBars.map((bar) => (
                  <PlanningCard 
                    key={bar.dossier_id} 
                    bar={bar} 
                    onEdit={setEditingBar} 
                    onRemove={handleRemove}
                    collaborateurs={collaborateurs} // ON PASSE LES COLLABS
                  />
                ))
              ) : (
                <p className="text-center text-sm py-8 italic" style={{ color: "var(--text-muted)" }}>
                  Aucun dossier ce jour
                </p>
              )}
            </DroppableDay>
          ) : null}
        </div>

        {/* Unplanned Drawer */}
        <UnplannedDrawer
          unplanned={unplanned}
          open={drawerOpen}
          onToggle={() => setDrawerOpen((p) => !p)}
        />

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.3" } } }) }}>
          {activeId ? (
            <div className="rotate-2 scale-105 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl"
              style={{ background: "var(--accent)" }}>
              Déplacement…
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Modal */}
      {editingBar && (
        <WeekEditModal 
          bar={editingBar} 
          onSave={handleEditSave} 
          onClose={() => setEditingBar(null)} 
        />
      )}
    </>
  );
}