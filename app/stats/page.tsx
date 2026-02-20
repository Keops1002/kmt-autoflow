"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Bot, Send, Loader2, BarChart2, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────
interface RevenueDay {
  day: string;
  amount: number;
}

interface StatsSummary {
  totalWeek: number;
  totalLastWeek: number;
  totalMonth: number;
  totalLastMonth: number;
  byStatus: { name: string; value: number; color: string }[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  chart?: {
    type: "bar" | "pie" | "line";
    data: any[];
    dataKey: string;
    nameKey: string;
    title: string;
    colors?: string[];
  };
}

// ── Helpers ────────────────────────────────────────────────────────────
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getDayLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

function getWeekRange(offsetWeeks: number) {
  const now = new Date();
  const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + offsetWeeks * 7);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(isoDate(d));
  }
  return days;
}

function getMonthRange(offsetMonths: number) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + offsetMonths;
  const first = new Date(y, m, 1);
  const last  = new Date(y, m + 1, 0);
  return { first: isoDate(first), last: isoDate(last) };
}

// ── Variation badge ────────────────────────────────────────────────────
function VariationBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up  = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${
      up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
    }`}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? "+" : ""}{pct}%
    </span>
  );
}

// ── Chart renderer ─────────────────────────────────────────────────────
const CHART_COLORS = ["var(--accent)", "#818cf8", "#34d399", "#f59e0b", "#f87171", "#a78bfa"];

function DynamicChart({ chart }: { chart: NonNullable<ChatMessage["chart"]> }) {
  const colors = chart.colors || CHART_COLORS;

  if (chart.type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey={chart.nameKey} tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
          <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
          <Tooltip
            contentStyle={{ background: "var(--card-bg-active)", border: "1px solid var(--card-border)", borderRadius: 12, fontSize: 11 }}
          />
          <Bar dataKey={chart.dataKey} radius={[6, 6, 0, 0]}>
            {chart.data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={chart.data} dataKey={chart.dataKey} nameKey={chart.nameKey}
            cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
            {chart.data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--card-bg-active)", border: "1px solid var(--card-border)", borderRadius: 12, fontSize: 11 }} />
          <Legend wrapperStyle={{ fontSize: 10, color: "var(--text-muted)" }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey={chart.nameKey} tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
          <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
          <Tooltip contentStyle={{ background: "var(--card-bg-active)", border: "1px solid var(--card-border)", borderRadius: 12, fontSize: 11 }} />
          <Line type="monotone" dataKey={chart.dataKey} stroke="var(--accent)" strokeWidth={2} dot={{ r: 3, fill: "var(--accent)" }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

// ── Page principale ────────────────────────────────────────────────────
export default function StatsPage() {
  const [summary, setSummary]       = useState<StatsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDay[]>([]);
  const [loading, setLoading]       = useState(true);
  const [messages, setMessages]     = useState<ChatMessage[]>([
    { role: "assistant", content: "Bonjour ! Posez-moi une question sur vos données. Ex: *\"Répertorie les marques de véhicules\"* ou *\"Quel jour génère le plus de revenus ?\"*" }
  ]);
  const [input, setInput]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const thisWeek     = getWeekRange(0);
      const lastWeek     = getWeekRange(-1);
      const thisMonth    = getMonthRange(0);
      const lastMonth    = getMonthRange(-1);

      // Revenus cette semaine par jour
      const { data: weekDossiers } = await supabase
        .from("dossiers")
        .select("paid_amount, paid_at")
        .eq("status", "done")
        .gte("paid_at", thisWeek[0])
        .lte("paid_at", thisWeek[6] + "T23:59:59");

      const dayMap: Record<string, number> = {};
      thisWeek.forEach((d) => { dayMap[d] = 0; });
      (weekDossiers || []).forEach((d) => {
        if (d.paid_at) {
          const day = d.paid_at.slice(0, 10);
          if (dayMap[day] !== undefined) dayMap[day] += d.paid_amount || 0;
        }
      });
      setRevenueData(
        Object.entries(dayMap).map(([day, amount]) => ({ day: getDayLabel(day), amount }))
      );

      // Total semaine courante
      const totalWeek = (weekDossiers || []).reduce((s, d) => s + (d.paid_amount || 0), 0);

      // Total semaine précédente
      const { data: lastWeekDossiers } = await supabase
        .from("dossiers").select("paid_amount")
        .eq("status", "done")
        .gte("paid_at", lastWeek[0]).lte("paid_at", lastWeek[6] + "T23:59:59");
      const totalLastWeek = (lastWeekDossiers || []).reduce((s, d) => s + (d.paid_amount || 0), 0);

      // Total mois courant
      const { data: monthDossiers } = await supabase
        .from("dossiers").select("paid_amount")
        .eq("status", "done")
        .gte("paid_at", thisMonth.first).lte("paid_at", thisMonth.last + "T23:59:59");
      const totalMonth = (monthDossiers || []).reduce((s, d) => s + (d.paid_amount || 0), 0);

      // Total mois précédent
      const { data: lastMonthDossiers } = await supabase
        .from("dossiers").select("paid_amount")
        .eq("status", "done")
        .gte("paid_at", lastMonth.first).lte("paid_at", lastMonth.last + "T23:59:59");
      const totalLastMonth = (lastMonthDossiers || []).reduce((s, d) => s + (d.paid_amount || 0), 0);

      // Stats statuts
      const { data: allDossiers } = await supabase
        .from("dossiers").select("status");
      const statusCount: Record<string, number> = { pending: 0, in_progress: 0, done: 0 };
      (allDossiers || []).forEach((d) => { statusCount[d.status] = (statusCount[d.status] || 0) + 1; });

      setSummary({
        totalWeek, totalLastWeek,
        totalMonth, totalLastMonth,
        byStatus: [
          { name: "En attente", value: statusCount.pending,     color: "#f59e0b" },
          { name: "En cours",   value: statusCount.in_progress, color: "#3b82f6" },
          { name: "Terminé",    value: statusCount.done,        color: "#10b981" },
        ],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAskAI() {
    if (!input.trim() || aiLoading) return;
    const question = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: question }]);
    setAiLoading(true);

    try {
      const res = await fetch("https://your-n8n-webhook/stats-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      // N8N renvoie { answer: string, chart?: { type, data, dataKey, nameKey, title } }
      setMessages((p) => [...p, {
        role: "assistant",
        content: data.answer || "Voici les données :",
        chart: data.chart || undefined,
      }]);
    } catch (e) {
      setMessages((p) => [...p, {
        role: "assistant",
        content: "Erreur de connexion au serveur. Vérifiez votre webhook N8N.",
      }]);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-32 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            Statistiques
          </h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ color: "var(--text-muted)", background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            Cette semaine
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent)" }} />
          </div>
        ) : summary && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Cette semaine", value: summary.totalWeek, prev: summary.totalLastWeek, sub: "vs sem. précédente" },
                { label: "Ce mois",       value: summary.totalMonth, prev: summary.totalLastMonth, sub: "vs mois précédent" },
              ].map((kpi) => (
                <div key={kpi.label}
                  className="relative rounded-2xl border p-4 overflow-hidden"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
                  <p className="text-[10px] font-black uppercase tracking-wider pl-1"
                    style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                  <p className="text-xl font-black mt-1 pl-1" style={{ color: "var(--accent)" }}>
                    {kpi.value.toFixed(0)} €
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 pl-1">
                    <VariationBadge current={kpi.value} previous={kpi.prev} />
                    <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{kpi.sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphique revenus semaine */}
            <div className="rounded-2xl border p-4"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-wider"
                  style={{ color: "var(--text-secondary)" }}>Revenus / jour</p>
                <BarChart2 size={14} style={{ color: "var(--text-muted)" }} />
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg-active)",
                      border: "1px solid var(--card-border)",
                      borderRadius: 12, fontSize: 11,
                    }}
                    formatter={(v: any) => [`${v} €`, "Revenus"]}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {revenueData.map((_, i) => (
                      <Cell key={i} fill={`var(--accent)`} opacity={0.7 + i * 0.04} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique statuts */}
            <div className="rounded-2xl border p-4"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <p className="text-xs font-black uppercase tracking-wider mb-3"
                style={{ color: "var(--text-secondary)" }}>Répartition dossiers</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={130}>
                  <PieChart>
                    <Pie data={summary.byStatus} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                      {summary.byStatus.map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card-bg-active)", border: "1px solid var(--card-border)", borderRadius: 12, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {summary.byStatus.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                      </div>
                      <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Chat IA */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

          {/* Header chat */}
          <div className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "var(--card-border)", background: "var(--accent)" }}>
            <Bot size={16} className="text-white" />
            <p className="text-sm font-black text-white">Assistant Stats</p>
          </div>

          {/* Messages */}
          <div className="flex flex-col gap-3 p-3 max-h-80 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className="px-3 py-2.5 rounded-2xl text-xs font-medium leading-relaxed"
                    style={{
                      background: msg.role === "user" ? "var(--accent)" : "var(--card-bg-active)",
                      color: msg.role === "user" ? "#ffffff" : "var(--text-primary)",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.chart && (
                    <div className="rounded-2xl border p-3"
                      style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                      <p className="text-[10px] font-black uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-muted)" }}>{msg.chart.title}</p>
                      <DynamicChart chart={msg.chart} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2.5 rounded-2xl flex items-center gap-2"
                  style={{ background: "var(--card-bg-active)" }}>
                  <Loader2 size={12} className="animate-spin" style={{ color: "var(--accent)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse en cours...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t" style={{ borderColor: "var(--card-border)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
              placeholder="Ex: Marques les plus fréquentes..."
              className="flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onPointerDown={handleAskAI}
              disabled={!input.trim() || aiLoading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all active:scale-90"
              style={{ background: "var(--accent)" }}>
              <Send size={14} />
            </button>
          </div>
        </div>

      </div>
    </AppContainer>
  );
}