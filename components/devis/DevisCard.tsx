"use client";

import { useState, useEffect } from "react";
import { FileText, ChevronDown, ArrowRight, Loader2, Pencil, X, Download, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Devis, DevisLigne } from "./devis.types";
import { getNextNumero } from "./devis.types";
import DevisBottomSheet from "./DevisBottomSheet";
import { generateAndDownloadPDF, generatePDFBlob } from "@/components/facture/useGeneratePDF";

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
  const [sendingDevis,   setSendingDevis]   = useState(false);
  const [sendingFacture, setSendingFacture] = useState(false);
  const [mailSent,       setMailSent]       = useState(false);
  const [mailError,      setMailError]      = useState<string | null>(null);

  const cfg = STATUS_CONFIG[devis.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

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

  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(blob);
    });
  }

  async function handleSendDevisMail(e: React.MouseEvent) {
    e.stopPropagation();
    setSendingDevis(true);
    setMailError(null);
    try {
      const { generateDevisBlob } = await import("@/components/facture/useGeneratePDF");
      const { blob, numero, clientEmail } = await generateDevisBlob(devis.id);

      if (!clientEmail) {
        setMailError("Aucun email client renseigné");
        return;
      }

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_MAIL_WEBHOOK || "";
      if (!webhookUrl) {
        setMailError("Webhook N8N non configuré");
        return;
      }

      const base64 = await blobToBase64(blob);

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        "devis",
          to:          clientEmail,
          subject:     `Votre devis ${numero}`,
          numero,
          pdf_base64:  base64,
          client_name: clientName,
        }),
      });

      setMailSent(true);
      setTimeout(() => setMailSent(false), 3000);
    } catch (err) {
      console.error(err);
      setMailError("Erreur lors de l'envoi");
    } finally {
      setSendingDevis(false);
    }
  }

  async function handleSendFactureMail(e: React.MouseEvent) {
    e.stopPropagation();
    if (!factureId) return;
    setSendingFacture(true);
    setMailError(null);
    try {
      const { blob, data } = await generatePDFBlob(factureId);

      if (!data.client.email) {
        setMailError("Aucun email client renseigné");
        return;
      }

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_MAIL_WEBHOOK || "";
      if (!webhookUrl) {
        setMailError("Webhook N8N non configuré");
        return;
      }

      const base64 = await blobToBase64(blob);

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:        "facture",
          to:          data.client.email,
          subject:     `Votre facture ${data.numero}`,
          numero:      data.numero,
          pdf_base64:  base64,
          client_name: data.client.name,
        }),
      });

      setMailSent(true);
      setTimeout(() => setMailSent(false), 3000);
    } catch (err) {
      console.error(err);
      setMailError("Erreur lors de l'envoi");
    } finally {
      setSendingFacture(false);
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
          expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
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

            {/* Transformer en facture */}
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

            {/* Télécharger PDF facture */}
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

            {/* Envoyer devis par mail */}
            {(devis.status === "signed" || devis.status === "sent") && (
              <button
                onClick={handleSendDevisMail} disabled={sendingDevis}
                className="w-full py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 transition-all"
                style={{ background: "#3b82f6" }}>
                {sendingDevis
                  ? <Loader2 size={13} className="animate-spin" />
                  : mailSent
                    ? "✓ Envoyé !"
                    : <><Mail size={13} /> Envoyer le devis par mail</>
                }
              </button>
            )}

            {/* Envoyer facture par mail */}
            {devis.status === "signed" && factureId && (
              <button
                onClick={handleSendFactureMail} disabled={sendingFacture}
                className="w-full py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 transition-all"
                style={{ background: "#8b5cf6" }}>
                {sendingFacture
                  ? <Loader2 size={13} className="animate-spin" />
                  : mailSent
                    ? "✓ Envoyé !"
                    : <><Mail size={13} /> Envoyer la facture par mail</>
                }
              </button>
            )}

            {/* Erreur mail */}
            {mailError && (
              <p className="text-xs text-red-500 text-center font-medium">{mailError}</p>
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