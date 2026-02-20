"use client";

import { useState, useEffect } from "react";
import { FileText, ChevronDown, ArrowRight, Loader2, Pencil, X, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Devis, DevisLigne } from "./devis.types";
import { getNextNumero } from "./devis.types";
import DevisBottomSheet from "./DevisBottomSheet";
import { generateAndDownloadPDF } from "@/components/facture/useGeneratePDF";

interface Props {
  devis: Devis;
  dossierId: string;
  clientName: string;
  onUpdate: (updated: Devis) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG = {
  draft:   { label: "Brouillon", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  sent:    { label: "Envoyé",    color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  signed:  { label: "Signé ✓",  color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  refused: { label: "Refusé",   color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

export default function DevisCard({ devis, dossierId, clientName, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded]           = useState(false);
  const [converting, setConverting]       = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showEdit, setShowEdit]           = useState(false);
  const [lignesDraft, setLignesDraft]     = useState<DevisLigne[] | null>(null);
  const [loadingLignes, setLoadingLignes] = useState(false);
  const [factureId, setFactureId]         = useState<string | null>(
    (devis as any).facture_id || null
  );

  const cfg = STATUS_CONFIG[devis.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

  // Si pas de facture_id en prop, vérifie en base
  useEffect(() => {
    if (devis.status === "signed" && !factureId) {
      supabase
        .from("factures")
        .select("id")
        .eq("devis_id", devis.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setFactureId(data.id);
        });
    }
  }, [devis.id, devis.status]);

  async function handleOpenDraft(e: React.MouseEvent) {
    e.stopPropagation();
    setLoadingLignes(true);
    const { data } = await supabase
      .from("devis_lignes")
      .select("*")
      .eq("devis_id", devis.id);
    setLignesDraft((data as DevisLigne[]) || []);
    setLoadingLignes(false);
    setShowEdit(true);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Supprimer ce devis ?")) return;
    setDeleting(true);
    await supabase.from("devis_lignes").delete().eq("devis_id", devis.id);
    await supabase.from("devis").delete().eq("id", devis.id);
    onDelete(devis.id);
    setDeleting(false);
  }

  async function handleConvertFacture(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Transformer ce devis en facture ?")) return;
    setConverting(true);
    try {
      const numero = await getNextNumero("F", supabase);
      const { data: newFacture, error } = await supabase
        .from("factures")
        .insert({
          numero,
          devis_id:   devis.id,
          dossier_id: dossierId,
          total_ht:   devis.total_ht,
          total_tva:  devis.total_tva,
          total_ttc:  devis.total_ttc,
          status:     "emise",
          locked:     true,
        })
        .select("id")
        .single();

      if (!error && newFacture) {
        // Persiste facture_id dans la table devis
        await supabase
          .from("devis")
          .update({ facture_id: newFacture.id })
          .eq("id", devis.id);

        setFactureId(newFacture.id);
        onUpdate({ ...devis, facture_id: newFacture.id } as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConverting(false);
    }
  }

  async function handleDownloadPDF(e: React.MouseEvent) {
    e.stopPropagation();
    if (!factureId) return;
    setGeneratingPDF(true);
    try {
      await generateAndDownloadPDF(factureId);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPDF(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border overflow-hidden transition-all"
        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 cursor-pointer"
          onClick={() => setExpanded((p) => !p)}>

          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: cfg.bg }}>
            <FileText size={14} style={{ color: cfg.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                {devis.numero}
              </p>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
              {factureId && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 bg-emerald-100 text-emerald-700">
                  Facturé ✓
                </span>
              )}
            </div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {new Date(devis.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>

          {/* Actions brouillon */}
          {devis.status === "draft" && (
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleOpenDraft} disabled={loadingLignes}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black border active:scale-95 transition-all"
                style={{ background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--accent)" }}
              >
                {loadingLignes
                  ? <Loader2 size={10} className="animate-spin" />
                  : <><Pencil size={10} /> Reprendre</>
                }
              </button>
              <button
                onClick={handleDelete} disabled={deleting}
                className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 active:scale-90 transition-all"
              >
                {deleting ? <Loader2 size={10} className="animate-spin" /> : <X size={11} />}
              </button>
            </div>
          )}

          <p className="font-black text-sm shrink-0" style={{ color: "var(--accent)" }}>
            {devis.total_ttc.toFixed(0)} €
          </p>

          <ChevronDown size={13}
            className={`transition-transform duration-300 shrink-0 ${expanded ? "rotate-180" : ""}`}
            style={{ color: "var(--text-muted)" }} />
        </div>

        {/* Contenu expandé */}
        <div className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="px-4 pb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="h-px" style={{ background: "var(--card-border)" }} />

            {/* Totaux */}
            <div className="space-y-1">
              {devis.tva_enabled && (
                <>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total HT</span>
                    <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                      {devis.total_ht.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>TVA</span>
                    <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                      {devis.total_tva.toFixed(2)} €
                    </span>
                  </div>
                  <div className="h-px" style={{ background: "var(--card-border)" }} />
                </>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>TTC</span>
                <span className="text-lg font-black" style={{ color: "var(--accent)" }}>
                  {devis.total_ttc.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Signature */}
            {devis.signature_data && (
              <div className="rounded-xl overflow-hidden border"
                style={{ borderColor: "var(--card-border)" }}>
                <p className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5"
                  style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                  Signature client
                </p>
                <img
                  src={devis.signature_data} alt="Signature"
                  className="w-full bg-white"
                  style={{ maxHeight: 80, objectFit: "contain" }}
                />
              </div>
            )}

            {/* Transformer en facture — seulement si pas encore facturé */}
            {devis.status === "signed" && !factureId && (
              <button
                onClick={handleConvertFacture} disabled={converting}
                className="w-full py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 transition-all"
                style={{ background: "#10b981" }}>
                {converting
                  ? <Loader2 size={13} className="animate-spin" />
                  : <><ArrowRight size={13} /> Transformer en facture</>
                }
              </button>
            )}

            {/* Télécharger PDF — seulement si facture existe */}
            {devis.status === "signed" && factureId && (
              <button
                onClick={handleDownloadPDF} disabled={generatingPDF}
                className="w-full py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 transition-all"
                style={{ background: "var(--accent)" }}>
                {generatingPDF
                  ? <Loader2 size={13} className="animate-spin" />
                  : <><Download size={13} /> Télécharger la facture PDF</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {showEdit && lignesDraft !== null && (
        <DevisBottomSheet
          dossierId={dossierId}
          clientName={clientName}
          onClose={() => setShowEdit(false)}
          onCreated={() => { onUpdate({ ...devis }); setShowEdit(false); }}
          existingDevis={{
            id: devis.id,
            lignes: lignesDraft,
            tva_enabled: devis.tva_enabled,
          }}
        />
      )}
    </>
  );
}

export async function generateDevisBlob(devisId: string): Promise<{ blob: Blob; numero: string; clientEmail?: string }> {
  const { data: devis, error } = await supabase
    .from("devis")
    .select(`
      id, numero, created_at, tva_enabled, signature_data, total_ht, total_tva, total_ttc,
      devis_lignes ( label, quantity, unit_price, tva ),
      dossiers:dossier_id (
        vehicles:vehicle_id (
          brand, model, plate, km,
          clients:client_id ( name, phone, email )
        )
      )
    `)
    .eq("id", devisId)
    .single();

  if (error || !devis) throw new Error("Devis introuvable");

  const { data: garage } = await supabase
    .from("garage_info").select("*").limit(1).single();

  const d       = devis as any;
  const vehicle = d.dossiers?.vehicles;
  const client  = vehicle?.clients;

  const data: FacturePDFData = {
    numero:         d.numero,
    created_at:     d.created_at,
    status:         "devis",
    total_ht:       d.total_ht,
    total_tva:      d.total_tva,
    total_ttc:      d.total_ttc,
    tva_enabled:    d.tva_enabled ?? true,
    lignes:         d.devis_lignes || [],
    signature_data: d.signature_data,
    client: {
      name:  client?.name  || "Client inconnu",
      phone: client?.phone,
      email: client?.email,
    },
    vehicle: {
      brand: vehicle?.brand || "",
      model: vehicle?.model || "",
      plate: vehicle?.plate,
      km:    vehicle?.km,
    },
    garage: {
      name:       garage?.name       || "Garage",
      legal_form: garage?.legal_form,
      address:    garage?.address,
      city:       garage?.city,
      phone:      garage?.phone,
      email:      garage?.email,
      siret:      garage?.siret,
      tva_number: garage?.tva_number,
      capital:    garage?.capital,
    },
  };

  const doc  = generatePDFDoc(data);
  const blob = doc.output("blob");
  return { blob, numero: d.numero, clientEmail: client?.email };
}