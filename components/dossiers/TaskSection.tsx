import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, X } from "lucide-react";
import type { Task } from "./dossier.types";

interface Props {
  dossierId: string;
  initialTasks: Task[];
  hideHeader?: boolean;
}

export default function TaskSection({ dossierId, initialTasks, hideHeader }: Props) {
  const [tasks, setTasks]         = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle]   = useState("");
  const [adding, setAdding]       = useState(false);
  const [showInput, setShowInput] = useState(false);

  async function handleToggle(task: Task) {
    const updated = !task.is_done;
    setTasks((p) => p.map((t) => t.id === task.id ? { ...t, is_done: updated } : t));
    await supabase.from("tasks").update({ is_done: updated }).eq("id", task.id);
  }

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ dossier_id: dossierId, title: newTitle.trim(), priority: "medium", is_done: false })
      .select().single();
    if (!error && data) setTasks((p) => [...p, data as Task]);
    setNewTitle(""); setShowInput(false); setAdding(false);
  }

  async function handleDelete(id: string) {
    setTasks((p) => p.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  const done  = tasks.filter((t) => t.is_done).length;
  const total = tasks.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!hideHeader && (
            <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Tâches</p>
          )}
          {total > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
              {done}/{total}
            </span>
          )}
        </div>
        <button onClick={() => setShowInput((p) => !p)}
          className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
          +
        </button>
      </div>

      {total > 0 && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }} />
        </div>
      )}

      {showInput && (
        <div className="flex gap-1.5">
          <input autoFocus value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nouvelle tâche..."
            className="flex-1 px-2 py-1.5 rounded-xl border text-xs focus:outline-none"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
          />
          <button onClick={handleAdd} disabled={adding || !newTitle.trim()}
            className="px-2 py-1.5 rounded-xl text-white font-bold text-[10px] disabled:opacity-40"
            style={{ background: "var(--accent)" }}>
            {adding ? <Loader2 size={10} className="animate-spin" /> : "OK"}
          </button>
        </div>
      )}

      {tasks.length === 0 && !showInput && (
        <p className="text-[10px] italic" style={{ color: "var(--text-muted)" }}>Aucune tâche</p>
      )}

      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2 group">
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
            className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all">
            <X size={8} />
          </button>
        </div>
      ))}
    </div>
  );
}