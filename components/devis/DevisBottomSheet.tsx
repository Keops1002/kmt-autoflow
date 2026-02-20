"use client";

import { useState } from "react";
import { X, Plus, BookOpen, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { DevisLigne } from "./devis.types";
import { calcTotaux, getNextNumero } from "./devis.types";
import LigneDevisRow  from "./LigneDevisRow";
import CatalogueSheet from "./CatalogueSheet";
import SignatureModal  from "./SignatureModal";

interface Props {
  dossierId: string;
  clientName: string;
  onClose: () => void;
  onCreated: () => void;
  existingDevis?: {
    id: string;
    lignes: DevisLigne[];
    tva_enabled: boolean;
  };
}

export default function DevisBottomSheet({ dossierId, clientName, onClose, onCreated, existingDevis }: Props) {
  const [lignes, setLignes]               = useState<DevisLigne[]>(existingDevis?.lignes || []);
  const [tvaEnabled, setTvaEnabled]       = useState(existingDevis?.tva_enabled ?? true);
  const [devisId]                         = useState<string | null>(existingDevis?.id || null);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [saving, setSaving]               = useState(false);

  const { total_ht, total_tva, total_ttc } = calcTotaux(lignes, tvaEnabled);

  function addLigneLibre() {
    setLignes((p) => [...p, { label: "", quantity: 1, unit_price: 0, tva: tvaEnabled ? 20 : 0 }]);
  }

  function updateLigne(index: number, updated: DevisLigne) {
    setLignes((p) => p.map((l, i) => i === index ? updated : l));
  }

  function deleteLigne(index: number) {
    setLignes((p) => p.filter((_, i) => i !== index));
  }

  async function handleSign(signatureBase64: string) {
    setSaving(true);
    try {
      const { total_ht, total_tva, total_ttc } = calcTotaux(lignes, tvaEnabled);

      if (devisId) {
        // Mise à jour du brouillon existant
        const { error } = await supabase
          .from("devis")
          .update({
            status: "signed", tva_enabled: tvaEnabled,
            signature_data: signatureBase64,
            signed_at: new Date().toISOString(),
            total_ht, total_tva, total_ttc,
          })
          .eq("id", devisId);
        if (error) throw error;

        // Supprimer anciennes lignes et réinsérer
        await supabase.from("devis_lignes").delete().eq("devis_id", devisId);
        await supabase.from("devis_lignes").insert(
          lignes.map((l) => ({ ...l, devis_id: devisId }))
        );
      } else {
        // Nouveau devis
        const numero = await getNextNumero("D", supabase);
        const { data: devis, error } = await supabase
          .from("devis")
          .insert({
            numero, dossier_id: dossierId,
            status: "signed", tva_enabled: tvaEnabled,
            signature_data: signatureBase64,
            signed_at: new Date().toISOString(),
            total_ht, total_tva, total_ttc,
          })
          .select().single();
        if (error) throw error;
        await supabase.from("devis_lignes").insert(
          lignes.map((l) => ({ ...l, devis_id: devis.id }))
        );
      }

      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function saveDraft() {
    setSaving(true);
    try {
      const { total_ht, total_tva, total_ttc } = calcTotaux(lignes, tvaEnabled);

      if (devisId) {
        // Mise à jour brouillon existant
        const { error } = await supabase
          .from("devis")
          .update({ tva_enabled: tvaEnabled, total_ht, total_tva, total_ttc })
          .eq("id", devisId);
        if (error) throw error;

        await supabase.from("devis_lignes").delete().eq("devis_id", devisId);
        if (lignes.length > 0) {
          await supabase.from("devis_lignes").insert(
            lignes.map((l) => ({ ...l, devis_id: devisId }))
          );
        }
      } else {
        // Nouveau brouillon
        const numero = await getNextNumero("D", supabase);
        const { data: devis, error } = await supabase
          .from("devis")
          .insert({
            numero, dossier_id: dossierId,
            status: "draft", tva_enabled: tvaEnabled,
            total_ht, total_tva, total_ttc,
          })
          .select().single();
        if (error) throw error;
        if (lignes.length > 0) {
          await supabase.from("devis_lignes").insert(
            lignes.map((l) => ({ ...l, devis_id: devis.id }))
          );
        }
      }

      onCreated();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const canSign = lignes.length > 0 && lignes.every((l) => l.label.trim() && l.unit_price > 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed left-0 right-0 z-50 flex justify-center"
        style={{ bottom: "60px", pointerEvents: "none" }}
      >
        <div
          className="w-full max-w-md rounded-3xl flex flex-col mx-4"
          style={{
            background: "var(--card-bg-active)",
            height: "auto",
            maxHeight: "calc(100dvh - 120px)",
            overflow: "hidden",
            pointerEvents: "auto",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-4 border-b shrink-0"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div>
              <p className="font-black text-base" style={{ color: "var(--text-primary)" }}>
                {devisId ? "Modifier le brouillon" : "Nouveau devis"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{clientName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTvaEnabled((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all"
                style={{
                  background: tvaEnabled ? "var(--accent-light)" : "var(--card-bg)",
                  borderColor: tvaEnabled ? "var(--accent)" : "var(--card-border)",
                  color: tvaEnabled ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                TVA {tvaEnabled ? "ON" : "OFF"}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Zone scrollable */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
            style={{ minHeight: 0, overscrollBehavior: "contain" }}
          >
            {lignes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <FileText size={28} style={{ color: "var(--text-muted)" }} />
                <p className="text-xs italic text-center" style={{ color: "var(--text-muted)" }}>
                  Ajoutez des prestations ci-dessous
                </p>
              </div>
            ) : (
              lignes.map((ligne, i) => (
                <LigneDevisRow
                  key={i} ligne={ligne} index={i}
                  onChange={updateLigne} onDelete={deleteLigne}
                />
              ))
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowCatalogue(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border font-black text-xs transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--accent)" }}
              >
                <BookOpen size={13} /> Catalogue
              </button>
              <button
                onClick={addLigneLibre}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border font-black text-xs transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
              >
                <Plus size={13} /> Article libre
              </button>
            </div>
          </div>

          {/* Footer */}
          <div
            className="shrink-0 px-4 pb-6 pt-3 border-t space-y-3"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="rounded-2xl p-3 space-y-1" style={{ background: "var(--card-bg)" }}>
              {tvaEnabled && (
                <>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total HT</span>
                    <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                      {total_ht.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>TVA</span>
                    <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                      {total_tva.toFixed(2)} €
                    </span>
                  </div>
                  <div className="h-px" style={{ background: "var(--card-border)" }} />
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                  Total TTC
                </span>
                <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>
                  {total_ttc.toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveDraft} disabled={saving || lignes.length === 0}
                className="flex-1 py-3 rounded-2xl font-black text-xs border disabled:opacity-40 active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
              >
                {saving ? <Loader2 size={13} className="animate-spin mx-auto" /> : "Brouillon"}
              </button>
              <button
                onClick={() => setShowSignature(true)} disabled={!canSign || saving}
                className="flex-[2] py-3 rounded-2xl font-black text-xs text-white disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: "var(--accent)" }}
              >
                ✍️ Faire signer
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCatalogue && (
        <CatalogueSheet
          onSelect={(ligne) => setLignes((p) => [...p, ligne])}
          onClose={() => setShowCatalogue(false)}
        />
      )}

      {showSignature && (
        <SignatureModal
          clientName={clientName}
          totalTtc={total_ttc}
          onConfirm={handleSign}
          onClose={() => setShowSignature(false)}
        />
      )}
    </>
  );
}