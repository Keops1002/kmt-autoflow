"use client";

import { useState } from "react";
import { Loader2, CheckCircle, X } from "lucide-react";

interface Props {
  estimatedPrice: number | null;
  onConfirm: (amount: number) => Promise<void>;
  onClose: () => void;
}

export default function PaymentModal({ estimatedPrice, onConfirm, onClose }: Props) {
  const [amount, setAmount] = useState(String(estimatedPrice ?? ""));
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!amount || isNaN(Number(amount))) return;
    setSaving(true);
    await onConfirm(Number(amount));
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet au-dessus de la BottomNav */}
      <div
        className="relative w-full rounded-t-3xl shadow-2xl overflow-hidden"
        style={{
          background:    "var(--card-bg-active)",
          paddingBottom: "80px", // au-dessus de la BottomNav (64px + marge)
        }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
        </div>

        {/* Header vert */}
        <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Clôturer</p>
            <h3 className="text-white font-black text-lg mt-1">Confirmer le paiement</h3>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>
              Montant encaissé (€)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-lg font-bold focus:outline-none"
              style={{
                background:  "var(--card-bg)",
                borderColor: "var(--card-border)",
                color:       "var(--text-primary)",
              }}
            />
            {estimatedPrice && Number(amount) !== estimatedPrice && (
              <p className="text-xs text-amber-500 font-medium px-1">
                Estimation : {estimatedPrice} €
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.97]"
              style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!amount || saving}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.97]">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? "..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}