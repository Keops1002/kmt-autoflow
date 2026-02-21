"use client";

import { useState } from "react";
import { FileText, Table } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Periode = "mois" | "trimestre" | "annee";
type TVAMode = "avec" | "sans";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin",
              "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function ComptabiliteSection({ onBack }: { onBack: () => void }) {
  const [periode, setPeriode]     = useState<Periode>("mois");
  const [mois, setMois]           = useState(new Date().getMonth() + 1);
  const [annee, setAnnee]         = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState(1);
  const [tvaMode, setTvaMode]     = useState<TVAMode>("avec");
  const [loading, setLoading]     = useState(false);

  async function fetchFactures() {
    let from: string, to: string;

    if (periode === "mois") {
      from = `${annee}-${String(mois).padStart(2,"0")}-01`;
      to   = `${annee}-${String(mois).padStart(2,"0")}-31`;
    } else if (periode === "trimestre") {
      const sm = (trimestre - 1) * 3 + 1;
      from = `${annee}-${String(sm).padStart(2,"0")}-01`;
      to   = `${annee}-${String(sm + 2).padStart(2,"0")}-31`;
    } else {
      from = `${annee}-01-01`;
      to   = `${annee}-12-31`;
    }

    let query = supabase
      .from("factures")
      .select("*, dossiers(*, vehicles(*, clients(*)))")
      .gte("created_at", from)
      .lte("created_at", to);

    if (tvaMode === "avec") {
      query = query.gt("total_tva", 0);
    } else {
      query = query.or("total_tva.is.null,total_tva.eq.0");
    }

    const { data } = await query;
    return data || [];
  }

  async function exportCSV() {
    setLoading(true);
    const factures = await fetchFactures();

    const headers = tvaMode === "avec"
      ? ["Numéro","Client","Véhicule","Date","HT (€)","TVA (€)","TTC (€)","Paiement"]
      : ["Numéro","Client","Véhicule","Date","Montant HT (€)","Paiement"];

    const rows = [
      headers,
      ...factures.map((f: any) => {
        const client  = f.dossiers?.vehicles?.clients?.name || "—";
        const vehicle = `${f.dossiers?.vehicles?.brand || ""} ${f.dossiers?.vehicles?.model || ""}`.trim();
        const date    = new Date(f.created_at).toLocaleDateString("fr-FR");
        if (tvaMode === "avec") {
          return [f.numero, client, vehicle, date, f.total_ht, f.total_tva, f.total_ttc, f.payment_method || ""];
        } else {
          return [f.numero, client, vehicle, date, f.total_ht, f.payment_method || ""];
        }
      }),
    ];

    const csv  = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `factures_${tvaMode === "avec" ? "officielles" : "cash"}_${periode}_${annee}.csv`;
    a.click();
    setLoading(false);
  }

  async function exportPDF() {
    setLoading(true);
    const factures = await fetchFactures();
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const titre = tvaMode === "avec"
      ? `Factures officielles (avec TVA) — ${periode} ${annee}`
      : `Factures cash (sans TVA) — ${periode} ${annee}`;

    doc.setFontSize(14);
    doc.text(titre, 14, 20);
    doc.setFontSize(9);
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

    let y = 38;
    let total = 0;

    factures.forEach((f: any) => {
      const client  = f.dossiers?.vehicles?.clients?.name || "—";
      const vehicle = `${f.dossiers?.vehicles?.brand || ""} ${f.dossiers?.vehicles?.model || ""}`.trim();
      const date    = new Date(f.created_at).toLocaleDateString("fr-FR");
      const montant = tvaMode === "avec" ? f.total_ttc : f.total_ht;
      total += montant || 0;

      const line = tvaMode === "avec"
        ? `${f.numero} | ${client} | ${vehicle} | ${date} | HT: ${f.total_ht}€ | TVA: ${f.total_tva}€ | TTC: ${f.total_ttc}€`
        : `${f.numero} | ${client} | ${vehicle} | ${date} | ${f.total_ht}€`;

      doc.text(line, 14, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    // Total
    doc.setFontSize(11);
    doc.text(`─────────────────────────────────────────`, 14, y + 3);
    doc.text(`TOTAL : ${total.toFixed(2)} €`, 14, y + 12);

    doc.save(`factures_${tvaMode === "avec" ? "officielles" : "cash"}_${periode}_${annee}.pdf`);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-bold text-slate-400">← Retour</button>

      {/* Période */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Période</p>
        <div className="flex gap-1.5">
          {(["mois","trimestre","annee"] as Periode[]).map((p) => (
            <button key={p} onClick={() => setPeriode(p)}
              className="flex-1 py-1.5 rounded-xl text-[10px] font-black border transition-all"
              style={{
                background:   periode === p ? "var(--accent)" : "var(--card-bg)",
                borderColor:  periode === p ? "var(--accent)" : "var(--card-border)",
                color:        periode === p ? "#fff" : "var(--text-muted)",
              }}>
              {p === "mois" ? "Mois" : p === "trimestre" ? "Trim." : "Année"}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {periode === "mois" && (
            <select value={mois} onChange={(e) => setMois(+e.target.value)}
              className="flex-1 rounded-xl px-2 py-1.5 text-xs font-bold border border-slate-200 bg-white/70 outline-none text-slate-700">
              {MOIS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          )}
          {periode === "trimestre" && (
            <select value={trimestre} onChange={(e) => setTrimestre(+e.target.value)}
              className="flex-1 rounded-xl px-2 py-1.5 text-xs font-bold border border-slate-200 bg-white/70 outline-none text-slate-700">
              {[1,2,3,4].map((t) => <option key={t} value={t}>T{t}</option>)}
            </select>
          )}
          <select value={annee} onChange={(e) => setAnnee(+e.target.value)}
            className="flex-1 rounded-xl px-2 py-1.5 text-xs font-bold border border-slate-200 bg-white/70 outline-none text-slate-700">
            {[2024,2025,2026,2027].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Type de factures */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Type de factures</p>
        <div className="flex gap-1.5">
          <button onClick={() => setTvaMode("avec")}
            className="flex-1 py-2 rounded-xl text-[10px] font-black border transition-all"
            style={{
              background:  tvaMode === "avec" ? "var(--accent)" : "var(--card-bg)",
              borderColor: tvaMode === "avec" ? "var(--accent)" : "var(--card-border)",
              color:       tvaMode === "avec" ? "#fff" : "var(--text-muted)",
            }}>
            🧾 Officielles (TVA)
          </button>
          <button onClick={() => setTvaMode("sans")}
            className="flex-1 py-2 rounded-xl text-[10px] font-black border transition-all"
            style={{
              background:  tvaMode === "sans" ? "#16a34a" : "var(--card-bg)",
              borderColor: tvaMode === "sans" ? "#16a34a" : "var(--card-border)",
              color:       tvaMode === "sans" ? "#fff" : "var(--text-muted)",
            }}>
            💵 Cash (sans TVA)
          </button>
        </div>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {tvaMode === "avec"
            ? "Export pour ton expert comptable — factures avec TVA déclarée"
            : "Export interne — factures réglées en cash sans TVA"}
        </p>
      </div>

      {/* Boutons export */}
      <div className="flex gap-2">
        <button onClick={exportCSV} disabled={loading}
          className="flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-[0.97]"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
          <Table size={13} style={{ color: "var(--accent)" }} /> CSV Excel
        </button>
        <button onClick={exportPDF} disabled={loading}
          className="flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 text-white transition-all active:scale-[0.97]"
          style={{ background: "var(--accent)" }}>
          <FileText size={13} /> PDF
        </button>
      </div>

      {loading && (
        <p className="text-center text-[10px] font-bold animate-pulse" style={{ color: "var(--text-muted)" }}>
          Génération en cours...
        </p>
      )}
    </div>
  );
}