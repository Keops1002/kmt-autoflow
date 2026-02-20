"use client";

import { X, Plus, Minus } from "lucide-react";
import type { DevisLigne } from "./devis.types";

interface Props {
  ligne: DevisLigne;
  index: number;
  onChange: (index: number, updated: DevisLigne) => void;
  onDelete: (index: number) => void;
}

export default function LigneDevisRow({ ligne, index, onChange, onDelete }: Props) {
  const total = ligne.quantity * ligne.unit_price;

  return (
    <div className="rounded-2xl border p-3 space-y-2"
      style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>

      {/* Label + supprimer */}
      <div className="flex items-center gap-2">
        <input
          value={ligne.label}
          onChange={(e) => onChange(index, { ...ligne, label: e.target.value })}
          placeholder="Désignation..."
          className="flex-1 px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
            color: "var(--text-primary)",
          }}
        />
        <button onClick={() => onDelete(index)}
          className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 shrink-0 active:scale-90">
          <X size={13} />
        </button>
      </div>

      {/* Quantité + Prix + Total */}
      <div className="flex items-center gap-2">
        {/* Quantité */}
        <div className="flex items-center gap-1 rounded-xl border overflow-hidden shrink-0"
          style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
          <button
            onClick={() => onChange(index, { ...ligne, quantity: Math.max(1, ligne.quantity - 1) })}
            className="w-7 h-8 flex items-center justify-center active:opacity-60"
            style={{ color: "var(--text-muted)" }}>
            <Minus size={11} />
          </button>
          <span className="text-xs font-black w-5 text-center"
            style={{ color: "var(--text-primary)" }}>
            {ligne.quantity}
          </span>
          <button
            onClick={() => onChange(index, { ...ligne, quantity: ligne.quantity + 1 })}
            className="w-7 h-8 flex items-center justify-center active:opacity-60"
            style={{ color: "var(--text-muted)" }}>
            <Plus size={11} />
          </button>
        </div>

        {/* Prix unitaire */}
        <div className="flex-1 relative">
          <input
            type="number"
            value={ligne.unit_price || ""}
            onChange={(e) => onChange(index, { ...ligne, unit_price: Number(e.target.value) })}
            placeholder="Prix €"
            className="w-full px-3 py-2 rounded-xl border text-sm font-medium focus:outline-none"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Total ligne */}
        <div className="shrink-0 text-right min-w-[60px]">
          <p className="text-sm font-black" style={{ color: "var(--accent)" }}>
            {total.toFixed(0)} €
          </p>
          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            TVA {ligne.tva}%
          </p>
        </div>
      </div>
    </div>
  );
}