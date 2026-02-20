"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { PRIORITY_CONFIG } from "@/components/alertes/alertes.types";
import type { Alerte } from "@/components/alertes/alertes.types";

export default function AlertesWidget() {
  const router  = useRouter();
  const [alertes, setAlertes]   = useState<Alerte[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.from("alertes").select("*")
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setAlertes((data as Alerte[]) || []);
        setLoading(false);
      });
  }, []);

  const urgentCount = alertes.filter((a) => a.priority === "high").length;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: urgentCount > 0 ? "#ef4444" : "var(--accent)" }} />
          <p className="text-xs font-black uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}>Alertes actives</p>
          {urgentCount > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
              {urgentCount} urgent{urgentCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button onClick={() => router.push("/alertes")}
          className="flex items-center gap-1 text-[10px] font-black active:opacity-70"
          style={{ color: "var(--accent)" }}>
          Voir tout <ChevronRight size={11} />
        </button>
      </div>

      <div className="px-3 py-2 space-y-1.5">
        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent)" }} />
          </div>
        ) : alertes.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
              Aucune alerte active 🎉
            </p>
          </div>
        ) : (
          alertes.map((a) => {
            const cfg  = PRIORITY_CONFIG[a.priority];
            const Icon = cfg.icon;
            return (
              <div key={a.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
                style={{ background: cfg.bg, borderColor: cfg.border }}>
                <Icon size={13} style={{ color: cfg.color }} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>
                    {a.title}
                  </p>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: cfg.color + "20", color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}