"use client";

import { useEffect, useState } from "react";
import { 
  DndContext, 
  closestCorners, 
  DragEndEvent, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects,
  TouchSensor,
  MouseSensor
} from "@dnd-kit/core";
import { getPlanningData, moveDossierToDate } from "@/lib/api/planning";
import DayColumn from "./DayColumn";
import PlanningBar from "./PlanningBar";
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, GripHorizontal } from "lucide-react";

export default function WeekView() {
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [bars, setBars] = useState<any[]>([]);
  const [unplanned, setUnplanned] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // FIX: Définition stable des sensors pour éviter l'erreur "Order of Hooks"
  const sensors = useSensors(
    useSensor(MouseSensor, { 
      activationConstraint: { distance: 10 } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { delay: 250, tolerance: 5 } 
    })
  );

  useEffect(() => { 
    loadData(); 
  }, [weekOffset]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getPlanningData(weekOffset);
      setWeekDays(res.weekDays);
      setBars(res.bars || []);
      setUnplanned(res.unplanned || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;

    const dossierId = String(e.active.id);
    const newDate = String(e.over.id);

    // Optimistic Update
    const movedDossier = unplanned.find(d => d.id === dossierId) || 
                         bars.find(b => b.dossier_id === dossierId)?.dossiers;

    // Mise à jour de l'état local pour fluidité immédiate
    setBars(prev => {
      const clean = prev.filter(b => b.dossier_id !== dossierId);
      return [...clean, { dossier_id: dossierId, start_date: newDate, dossiers: movedDossier }];
    });
    
    setUnplanned(prev => prev.filter(d => d.id !== dossierId));

    // Appel API
    await moveDossierToDate(dossierId, newDate);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={(e) => setActiveId(String(e.active.id))} 
      onDragEnd={handleDragEnd}
    >
      
      {/* CONTAINER GLOBAL */}
      <div className="flex flex-col gap-4 pb-48 min-h-screen relative">
        
        {/* --- HEADER NAVIGATION --- */}
        <div className="sticky top-2 z-30 mx-2">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex gap-1">
              <button onClick={() => setWeekOffset(prev => prev - 1)} className="p-2 bg-white rounded-xl shadow-sm active:scale-95 transition-all text-slate-600">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setWeekOffset(0)} className="px-4 py-2 bg-slate-800 text-white rounded-xl shadow-md font-bold text-xs uppercase tracking-wider active:scale-95 transition-all">
                Aujourd'hui
              </button>
              <button onClick={() => setWeekOffset(prev => prev + 1)} className="p-2 bg-white rounded-xl shadow-sm active:scale-95 transition-all text-slate-600">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="hidden xs:flex items-center gap-2 px-3 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
              <CalendarDays size={14} />
              {weekDays[0]?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* --- GRILLE SEMAINE --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-3 px-2 pb-8 pt-2 no-scrollbar snap-x scroll-pl-2">
            {weekDays.map((date) => {
              const dateId = date.toISOString().slice(0, 10);
              return (
                <div key={dateId} className="snap-start pt-2">
                  <DayColumn id={dateId} date={date}>
                    {bars.filter(b => b.start_date === dateId).map(bar => (
                      <PlanningBar key={bar.dossier_id} bar={bar} />
                    ))}
                  </DayColumn>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- DOCK FLOTTANT (FIXE EN BAS) --- */}
      <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
        
        <div className="pointer-events-auto w-full max-w-[400px] bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] p-4 shadow-2xl border border-white/10 ring-1 ring-black/40 transition-transform duration-300 ease-out hover:scale-[1.02]">
          
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-white font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
              À Planifier <span className="opacity-50">({unplanned.length})</span>
            </h3>
            <GripHorizontal className="text-slate-600" size={16} />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
            {unplanned.length > 0 ? (
              unplanned.map((d) => (
                <div key={d.id} className="min-w-[160px] max-w-[160px] snap-center transform transition-all active:scale-95">
                  <PlanningBar bar={{ dossier_id: d.id, dossiers: d, isUnplanned: true }} />
                </div>
              ))
            ) : (
              <div className="w-full py-4 text-center">
                <span className="text-slate-500 text-[10px] font-medium italic">Aucun dossier en attente ✨</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- OVERLAY DU DRAG --- */}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? (
          <div className="rotate-3 scale-105 cursor-grabbing">
             <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-2xl border border-white/20 flex items-center gap-2">
               <GripHorizontal size={14} /> Déplacement...
             </div>
          </div>
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}