"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Calendar, ChevronRight, Clock } from "lucide-react";

interface DossierToday {
  dossier_id: string;
  problem: string;
  status: string;
  brand: string;
  model: string;
  client_name: string;
}

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function statusColor(status: string) {
  switch (status) {
    case "done":        return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Terminé" };
    case "in_progress": return { bg: "bg-blue-100",    text: "text-blue-700",    label: "En cours" };
    default:            return { bg: "bg-amber-100",   text: "text-amber-700",   label: "En attente" };
  }
}

export default function PlanningWidget() {
  const router = useRouter();
  const [items, setItems]     = useState<DossierToday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = isoToday();

      const { data } = await supabase
        .from("planning_entries")
        .select(`
          dossier_id, start_date, end_date,
          dossiers (
            id, problem, status,
            vehicles:vehicle_id (
              brand, model,
              clients:client_id ( name )
            )
          )
        `)
        .lte("start_date", today)
        .gte("end_date", today)
        .limit(3);

      setItems(
        (data || []).map((e: any) => ({
          dossier_id:  e.dossier_id,
          problem:     e.dossiers?.problem || "Entretien",
          status:      e.dossiers?.status  || "pending",
          brand:       e.dossiers?.vehicles?.brand || "",
          model:       e.dossiers?.vehicles?.model || "",
          client_name: e.dossiers?.vehicles?.clients?.name || "",
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: "var(--accent)" }} />
          <p className="text-xs font-black uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}>Planning aujourd'hui</p>
        </div>
        <button onClick={() => router.push("/planning")}
          className="flex items-center gap-1 text-[10px] font-black active:opacity-70"
          style={{ color: "var(--accent)" }}>
          Voir tout <ChevronRight size={11} />
        </button>
      </div>

      {/* Contenu */}
      <div className="px-3 py-2 space-y-1.5">
        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent)" }} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-4 flex items-center justify-center gap-2">
            <Clock size={14} style={{ color: "var(--text-muted)" }} />
            <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
              Rien de planifié aujourd'hui
            </p>
          </div>
        ) : (
          items.map((item) => {
            const st = statusColor(item.status);
            return (
              <div key={item.dossier_id}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl border overflow-hidden"
                style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
                <div className="flex-1 min-w-0 pl-1">
                  <p className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>
                    {item.problem}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {item.client_name}{item.brand ? ` · ${item.brand} ${item.model}` : ""}
                  </p>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.text}`}>
                  {st.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}