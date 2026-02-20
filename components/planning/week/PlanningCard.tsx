"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { X, CalendarRange, ChevronDown, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import type { PlanningBar } from "@/lib/api/planning";
import { daysBetween } from "@/lib/api/planning";
import { statusStyle } from "./weekHelpers";
import { supabase } from "@/lib/supabase";

interface Props {
  bar: PlanningBar;
  onEdit: (b: PlanningBar) => void;
  onRemove: (id: string) => void;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  is_done: boolean;
}

function TaskSection({ dossierId }: { dossierId: string }) {
  const [tasks, setTasks]         = useState<Task[] | null>(null);
  const [loaded, setLoaded]       = useState(false);
  const [newTitle, setNewTitle]   = useState("");
  const [adding, setAdding]       = useState(false);
  const [showInput, setShowInput] = useState(false);

  async function loadTasks() {
    if (loaded) return;
    const { data } = await supabase
      .from("tasks")
      .select("id, title, priority, is_done")
      .eq("dossier_id", dossierId)
      .order("created_at");
    setTasks((data as Task[]) || []);
    setLoaded(true);
  }

  if (!loaded) {
    loadTasks();
    return (
      <div className="flex justify-center py-2">
        <Loader2 size={12} className="animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  async function handleToggle(task: Task) {
    const updated = !task.is_done;
    setTasks((p) => p!.map((t) => t.id === task.id ? { ...t, is_done: updated } : t));
    await supabase.from("tasks").update({ is_done: updated }).eq("id", task.id);
  }

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ dossier_id: dossierId, title: newTitle.trim(), priority: "medium", is_done: false })
      .select().single();
    if (!error && data) setTasks((p) => [...(p || []), data as Task]);
    setNewTitle(""); setShowInput(false); setAdding(false);
  }

  async function handleDelete(id: string) {
    setTasks((p) => p!.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  const done  = (tasks || []).filter((t) => t.is_done).length;
  const total = (tasks || []).length;

  return (
    <div className="space-y-2 mt-1" onClick={(e) => e.stopPropagation()}>
      <div className="h-px" style={{ background: "var(--card-border)" }} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>Tâches</p>
          {total > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
              {done}/{total}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowInput((p) => !p)}
          className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
          +
        </button>
      </div>

      {total > 0 && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      )}

      {showInput && (
        <div className="flex gap-1.5">
          <input
            autoFocus value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nouvelle tâche..."
            className="flex-1 px-2 py-1.5 rounded-lg border text-xs focus:outline-none"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
          <button onClick={handleAdd} disabled={adding || !newTitle.trim()}
            className="px-2 py-1.5 rounded-lg text-white font-bold text-[10px] disabled:opacity-40"
            style={{ background: "var(--accent)" }}>
            {adding ? <Loader2 size={10} className="animate-spin" /> : "OK"}
          </button>
        </div>
      )}

      {tasks?.length === 0 && !showInput && (
        <p className="text-[10px] italic" style={{ color: "var(--text-muted)" }}>Aucune tâche</p>
      )}

      {tasks?.map((task) => (
        <div key={task.id} className="flex items-center gap-2 group/task">
          <button onClick={() => handleToggle(task)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              task.is_done ? "bg-emerald-500 border-emerald-500" : ""
            }`}
            style={!task.is_done ? { borderColor: "var(--text-muted)" } : {}}>
            {task.is_done && <CheckCircle size={9} className="text-white" />}
          </button>
          <p className={`flex-1 text-xs transition-all ${task.is_done ? "line-through" : ""}`}
            style={{ color: task.is_done ? "var(--text-muted)" : "var(--text-secondary)" }}>
            {task.title}
          </p>
          <button onClick={() => handleDelete(task.id)}
            className="opacity-0 group-hover/task:opacity-100 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all">
            <X size={8} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function PlanningCard({ bar, onEdit, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `planned-${bar.dossier_id}`,
    data: { type: "planned", bar },
  });

  const st       = statusStyle(bar.dossiers?.status || "pending");
  const duration = daysBetween(bar.start_date, bar.end_date) + 1;
  const vehicle  = bar.dossiers?.vehicles;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
      className={`relative rounded-2xl border backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-200 active:scale-[0.99] ${
        isDragging ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Barre gauche dégradé */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />

      {/* Header draggable */}
      <div
        className="pl-4 pr-3 pt-3 pb-2.5 cursor-grab active:cursor-grabbing"
        {...listeners} {...attributes}
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[12px] font-black leading-tight"
                style={{ color: "var(--text-primary)" }}>
                {bar.dossiers?.problem || "Entretien"}
              </p>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${st.badge}`}>
                {st.label}
              </span>
            </div>
            {vehicle && (
              <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {vehicle.brand} {vehicle.model}
              </p>
            )}
            {vehicle?.clients?.name && (
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                {vehicle.clients.name}
              </p>
            )}
            {duration > 1 && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ color: "var(--accent)", background: "var(--accent-light)" }}>
                <CalendarRange size={9} />{duration}j
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEdit(bar)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
              style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
              <CalendarRange size={11} />
            </button>
            <button onClick={() => onRemove(bar.dossier_id)}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-red-50 text-red-400">
              <X size={11} />
            </button>
            <ChevronDown size={12} className={`transition-transform duration-200 mt-1 ${expanded ? "rotate-180" : ""}`}
              style={{ color: "var(--text-muted)" }} />
          </div>
        </div>
      </div>

      {/* Tâches expandable */}
      <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
        expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 pb-3">
          <TaskSection dossierId={String(bar.dossiers?.id || bar.dossier_id)} />
        </div>
      </div>
    </div>
  );
}