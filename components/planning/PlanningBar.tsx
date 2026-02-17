"use client";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function PlanningBar({ bar }: { bar: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(bar.dossier_id),
  });

  const style = { transform: CSS.Translate.toString(transform) };
  const d = bar.dossiers;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-4 rounded-2xl border transition-all cursor-grab active:grabbing
        ${bar.isUnplanned 
          ? "bg-white/10 border-white/10 text-white hover:bg-white/20" 
          : "bg-white border-slate-100 text-slate-800 shadow-sm hover:shadow-md"
        }
        ${isDragging ? "opacity-0" : "opacity-100"}
      `}
    >
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${bar.isUnplanned ? "bg-blue-500/20 text-blue-400" : "bg-slate-100 text-slate-500"}`}>
            {d?.vehicles?.plate || "SANS-IMMAT"}
          </span>
        </div>
        <p className="text-sm font-bold truncate">{d?.problem || "Entretien général"}</p>
        <p className={`text-[11px] opacity-60 font-medium ${bar.isUnplanned ? "text-slate-300" : "text-slate-500"}`}>
          {d?.vehicles?.brand} {d?.vehicles?.model}
        </p>
      </div>
    </div>
  );
}