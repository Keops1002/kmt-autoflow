"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Loader2, X, ChevronDown } from "lucide-react";

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
    setTasks(data as Task[] || []);
    setLoaded(true);
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
    setNewTitle("");
    setShowInput(false);
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setTasks((p) => p!.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  if (!loaded) {
    loadTasks();
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 size={12} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const done  = (tasks || []).filter((t) => t.is_done).length;
  const total = (tasks || []).length;

  return (
    <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
      <div className="h-px bg-slate-100" />

      {/* Header tâches */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Tâches</p>
          {total > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {done}/{total}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowInput((p) => !p)}
          className="w-5 h-5 rounded-full bg-[#17179C]/10 flex items-center justify-center text-[#17179C] font-black text-xs"
        >
          +
        </button>
      </div>

      {/* Barre progression */}
      {total > 0 && (
        <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
            style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Input */}
      {showInput && (
        <div className="flex gap-1.5">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nouvelle tâche..."
            className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#17179C]/20"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTitle.trim()}
            className="px-2 py-1.5 rounded-lg bg-[#17179C] text-white font-bold text-[10px] disabled:opacity-40"
          >
            {adding ? <Loader2 size={10} className="animate-spin" /> : "OK"}
          </button>
        </div>
      )}

      {/* Liste */}
      {tasks?.length === 0 && !showInput && (
        <p className="text-[10px] text-slate-300 italic">Aucune tâche</p>
      )}

      {tasks?.map((task) => (
        <div key={task.id} className="flex items-center gap-2 group">
          <button
            onClick={() => handleToggle(task)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              task.is_done ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white"
            }`}
          >
            {task.is_done && <CheckCircle size={9} className="text-white" />}
          </button>
          <p className={`flex-1 text-xs transition-all ${
            task.is_done ? "line-through text-slate-300" : "text-slate-600"
          }`}>
            {task.title}
          </p>
          <button
            onClick={() => handleDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all"
          >
            <X size={8} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function PlanningBar({ bar }: { bar: any }) {
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(bar.dossier_id),
  });

  const style = { transform: CSS.Translate.toString(transform) };
  const d = bar.dossiers;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all
        ${bar.isUnplanned
          ? "bg-white/10 border-white/10 text-white"
          : "bg-white border-slate-100 text-slate-800 shadow-sm"
        }
        ${isDragging ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* Zone draggable — header uniquement */}
      <div
        {...listeners}
        {...attributes}
        className="p-3 cursor-grab active:cursor-grabbing"
        onClick={() => !bar.isUnplanned && setExpanded((p) => !p)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
              bar.isUnplanned ? "bg-blue-500/20 text-blue-400" : "bg-slate-100 text-slate-500"
            }`}>
              {d?.vehicles?.plate || "SANS-IMMAT"}
            </span>
            {!bar.isUnplanned && (
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            )}
          </div>
          <p className="text-sm font-bold truncate">{d?.problem || "Entretien général"}</p>
          <p className={`text-[11px] opacity-60 font-medium ${bar.isUnplanned ? "text-slate-300" : "text-slate-500"}`}>
            {d?.vehicles?.brand} {d?.vehicles?.model}
          </p>
        </div>
      </div>

      {/* Zone tâches expandable — pas draggable */}
      {!bar.isUnplanned && expanded && (
        <div className="px-3 pb-3">
          <TaskSection dossierId={String(d?.id || bar.dossier_id)} />
        </div>
      )}
    </div>
  );
}