"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import EditScheduleModal from "./EditScheduleModal";

export default function PlanningBar({ bar }: any) {
  const [open, setOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({ id: bar.dossier_id });

  const style = {
    transform:
      transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
  } as React.CSSProperties;

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white p-3 rounded-xl shadow cursor-grab active:scale-95 transition mb-2"
        style={style}
      >
        <p className="font-semibold">{bar.dossier?.problem || "Dossier"}</p>
      </div>

      {open && <EditScheduleModal bar={bar} onClose={() => setOpen(false)} />}
    </>
  );
}
