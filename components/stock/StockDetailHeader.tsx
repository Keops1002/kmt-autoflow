"use client";

import { ChevronLeft, Pencil, X, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { StockVehicule, STATUT_STYLE } from "./stock.types";
import { supabase } from "@/lib/supabase";

interface Props {
  v: StockVehicule;
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onStatutChange: (statut: string) => void;
}

export default function StockDetailHeader({
  v, editing, saving, onEdit, onCancel, onSave, onStatutChange
}: Props) {
  const router = useRouter();
  const st = STATUT_STYLE[v.statut] || STATUT_STYLE.disponible;

  return (
    <>
      {/* Titre */}
      <div className="flex items-center gap-3 px-1 pt-2">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-2xl border flex items-center justify-center active:scale-90 transition-all"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <ChevronLeft size={18} style={{ color: "var(--text-muted)" }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black truncate" style={{ color: "var(--text-primary)" }}>
            {v.marque} {v.modele}
          </h1>
          {v.version && (
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{v.version}</p>
          )}
        </div>
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${st.badge}`}>
          {st.label}
        </span>
      </div>

      {/* Prix + actions */}
      <div className="rounded-2xl border px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
        <div>
          {v.prix
            ? <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>{v.prix.toLocaleString()} €</p>
            : <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>Prix non défini</p>
          }
          {v.tva_recuperable && (
            <p className="text-[10px] font-bold text-emerald-600">TVA récupérable</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <select value={v.statut}
            onChange={(e) => onStatutChange(e.target.value)}
            className="text-xs font-black px-2.5 py-1.5 rounded-xl border outline-none"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
            <option value="disponible">Disponible</option>
            <option value="reserve">Réservé</option>
            <option value="vendu">Vendu</option>
          </select>

          {editing ? (
            <div className="flex gap-1.5">
              <button onClick={onCancel}
                className="w-8 h-8 rounded-xl border flex items-center justify-center"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
              <button onClick={onSave} disabled={saving}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent)" }}>
                {saving
                  ? <Loader2 size={13} className="text-white animate-spin" />
                  : <Save size={13} className="text-white" />
                }
              </button>
            </div>
          ) : (
            <button onClick={onEdit}
              className="w-8 h-8 rounded-xl border flex items-center justify-center"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <Pencil size={13} style={{ color: "var(--accent)" }} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}