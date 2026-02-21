"use client";

import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Periode = "mois" | "trimestre" | "annee";
type TVAMode = "avec" | "sans";

export default function ComptabiliteSection({ onBack }: { onBack: () => void }) {
  const [periode, setPeriode]   = useState<Periode>("mois");
  const [mois, setMois]         = useState(new Date().getMonth() + 1);
  const [annee, setAnnee]       = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState(1);
  const [tvaMode, setTvaMode]   = useState<TVAMode>("avec");
  const [loading, setLoading]   = useState(false);

  const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin",
                "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  async function fetchFactures() {
    let from: string, to: string;
    if (periode === "mois") {
      from = `${annee}-${String(mois).padStart(2,"0")}-01`;
      to   = `${annee}-${String(mois).padStart(2,"0")}-31`;
    } else if (periode === "trimestre") {
      const startMonth = (trimestre - 1) * 3 + 1;
      from = `${annee}-${String(startMonth).padStart(2,"0")}-01`;
      to   = `${annee}-${String(startMonth + 2).padStart(2,"0")}-31`;
    } else {
      from = `${annee}-01-01`;
      to   = `${annee}-12-31`;
    }

    const { data } = await supabase
      .from("factures")
      .select("*, dossiers(*, vehicles(*, clients(*)))")
      .gte("created_at", from)
      .lte("created_at", to)
      .eq("status", "paid");

    return data || [];
  }

  async function exportCSV() {
    setLoading(true);
    const factures = await fetchFactures();

    const rows = [
      ["Numéro", "Client", "Véhicule", "Date", "HT", "TVA", "TTC", "Paiement"],
      ...factures.map((f: any) => [
        f.numero,
        f.dossiers?.vehicles?.clients?.name || "",
        `${f.dossiers?.vehicles?.brand} ${f.dossiers?.vehicles?.model}`,
        new Date(f.created_at).toLocaleDateString("fr-FR"),
        tvaMode === "avec" ? f.total_ht : "",
        tvaMode === "avec" ? f.total_tva : "",
        tvaMode === "avec" ? f.total_ttc : f.total_ht,
        f.payment_method || "",
      ]),
    ];

    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `factures_${periode}_${annee}.csv`;
    a.click();
    setLoading(false);
  }

  async function exportPDF() {
    setLoading(true);
    const factures = await fetchFactures();
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Export Factures — ${periode} ${annee}`, 14, 20);
    doc.setFontSize(10);

    let y = 35;
    factures.forEach((f: any) => {
      const client = f.dossiers?.vehicles?.clients?.name || "—";
      const total  = tvaMode === "avec" ? `${f.total_ttc} € TTC` : `${f.total_ht} € HT`;
      doc.text(`${f.numero} | ${client} | ${total} | ${new Date(f.created_at).toLocaleDateString("fr-FR")}`, 14, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save(`factures_${periode}_${annee}.pdf`);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
        ← Retour
      </button>

      {/* Période */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Période
        </p>
        <div className="flex gap-2">
          {(["mois","trimestre","annee"] as Periode[]).map((p) => (
            <button key={p} onClick={() => setPeriode(p)}
              className="flex-1 py-2 rounded-xl text-xs font-black border transition-all"
              style={{
                background: periode === p ? "var(--accent)" : "var(--card-bg)",
                borderColor: periode === p ? "var(--accent)" : "var(--card-border)",
                color: periode === p ? "#fff" : "var(--text-muted)",
              }}>
              {p === "mois" ? "Mois" : p === "trimestre" ? "Trimestre" : "Année"}
            </button>
          ))}
        </div>

        {/* Sélecteurs dynamiques */}
        <div className="flex gap-2">
          {periode === "mois" && (
            <select value={mois} onChange={(e) => setMois(+e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border outline-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
              {MOIS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          )}
          {periode === "trimestre" && (
            <select value={trimestre} onChange={(e) => setTrimestre(+e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border outline-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
              {[1,2,3,4].map((t) => <option key={t} value={t}>T{t}</option>)}
            </select>
          )}
          <select value={annee} onChange={(e) => setAnnee(+e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border outline-none"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
            {[2024,2025,2026,2027].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* TVA */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Montants
        </p>
        <div className="flex gap-2">
          {(["avec","sans"] as TVAMode[]).map((t) => (
            <button key={t} onClick={() => setTvaMode(t)}
              className="flex-1 py-2 rounded-xl text-xs font-black border transition-all"
              style={{
                background: tvaMode === t ? "var(--accent)" : "var(--card-bg)",
                borderColor: tvaMode === t ? "var(--accent)" : "var(--card-border)",
                color: tvaMode === t ? "#fff" : "var(--text-muted)",
              }}>
              {t === "avec" ? "Avec TVA" : "Sans TVA (HT)"}
            </button>
          ))}
        </div>
      </div>

      {/* Boutons export */}
      <div className="flex gap-2">
        <button onClick={exportCSV} disabled={loading}
          className="flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.97]"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
          <Table size={16} style={{ color: "var(--accent)" }} />
          CSV
        </button>
        <button onClick={exportPDF} disabled={loading}
          className="flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white transition-all active:scale-[0.97]"
          style={{ background: "var(--accent)" }}>
          <FileText size={16} />
          PDF
        </button>
      </div>

      {loading && (
        <p className="text-center text-xs font-bold" style={{ color: "var(--text-muted)" }}>
          Génération en cours...
        </p>
      )}
    </div>
  );
}