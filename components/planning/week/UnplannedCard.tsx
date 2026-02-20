"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { UnplannedDossier } from "@/lib/api/planning";
import { statusStyle } from "./weekHelpers";

export default function UnplannedCard({ dossier }: { dossier: UnplannedDossier }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `unplanned-${dossier.id}`,
    data: { type: "unplanned", dossier },
  });

  const st = statusStyle(dossier.status);
  const v  = dossier.vehicles;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl cursor-grab active:cursor-grabbing
        border transition-all select-none
        ${isDragging ? "opacity-30 scale-95" : "active:scale-[0.98]"}`}
    >
      <GripVertical size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold leading-tight truncate"
          style={{ color: "var(--text-primary)" }}>
          {dossier.problem || "Entretien"}
        </p>
        {v && (
          <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
            {v.brand} {v.model}{v.plate ? ` · ${v.plate}` : ""}
          </p>
        )}
        {v?.clients?.name && (
          <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
            {v.clients.name}
          </p>
        )}
      </div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-full shrink-0 ${st.badge}`}>
        {st.label}
      </span>
    </div>
  );
}