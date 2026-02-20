"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, BarChart2, ChevronRight } from "lucide-react";

function getWeekRange(offsetWeeks: number): [string, string] {
  const now  = new Date();
  const day  = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const mon  = new Date(now);
  mon.setDate(now.getDate() - day + offsetWeeks * 7);
  const sun  = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt  = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return [fmt(mon), fmt(sun)];
}

export default function StatsWidget() {
  const router = useRouter();
  const [thisWeek, setThisWeek]   = useState(0);
  const [lastWeek, setLastWeek]   = useState(0);
  const [totalOpen, setTotalOpen] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const [tw0, tw1] = getWeekRange(0);
      const [lw0, lw1] = getWeekRange(-1);

      const [r1, r2, r3] = await Promise.all([
        supabase.from("dossiers").select("paid_amount")
          .eq("status", "done").gte("paid_at", tw0).lte("paid_at", tw1 + "T23:59:59"),
        supabase.from("dossiers").select("paid_amount")
          .eq("status", "done").gte("paid_at", lw0).lte("paid_at", lw1 + "T23:59:59"),
        supabase.from("dossiers").select("id", { count: "exact" })
          .in("status", ["pending", "in_progress"]),
      ]);

      setThisWeek((r1.data || []).reduce((s, d) => s + (d.paid_amount || 0), 0));
      setLastWeek((r2.data || []).reduce((s, d) => s + (d.paid_amount || 0), 0));
      setTotalOpen(r3.count || 0);
      setLoading(false);
    }
    load();
  }, []);

  const pct  = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;
  const up   = pct !== null && pct >= 0;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center gap-2">
          <BarChart2 size={14} style={{ color: "var(--accent)" }} />
          <p className="text-xs font-black uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}>Stats semaine</p>
        </div>
        <button onClick={() => router.push("/stats")}
          className="flex items-center gap-1 text-[10px] font-black active:opacity-70"
          style={{ color: "var(--accent)" }}>
          Voir tout <ChevronRight size={11} />
        </button>
      </div>

      {loading ? (
        <div className="h-20 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--accent)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-3">
          {/* CA semaine */}
          <div className="relative rounded-xl p-3 overflow-hidden"
            style={{ background: "var(--card-bg-active)" }}>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
            <p className="text-[10px] font-black uppercase tracking-wider pl-1"
              style={{ color: "var(--text-muted)" }}>CA semaine</p>
            <p className="text-lg font-black mt-0.5 pl-1" style={{ color: "var(--accent)" }}>
              {thisWeek.toFixed(0)} €
            </p>
            {pct !== null && (
              <div className="flex items-center gap-1 mt-1 pl-1">
                <span className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                }`}>
                  {up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  {up ? "+" : ""}{pct}%
                </span>
                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>vs S-1</span>
              </div>
            )}
          </div>

          {/* Dossiers ouverts */}
          <div className="relative rounded-xl p-3 overflow-hidden"
            style={{ background: "var(--card-bg-active)" }}>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />
            <p className="text-[10px] font-black uppercase tracking-wider pl-1"
              style={{ color: "var(--text-muted)" }}>En cours</p>
            <p className="text-lg font-black mt-0.5 pl-1" style={{ color: "#f59e0b" }}>
              {totalOpen}
            </p>
            <p className="text-[9px] mt-1 pl-1" style={{ color: "var(--text-muted)" }}>
              dossier{totalOpen > 1 ? "s" : ""} actif{totalOpen > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}