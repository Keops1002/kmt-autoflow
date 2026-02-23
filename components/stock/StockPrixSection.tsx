"use client";

import { Tag, Check } from "lucide-react";
import SectionAccordion from "./SectionAccordion";
import Row from "./Row";
import EditField from "./EditField";
import { StockVehicule } from "./stock.types";

interface Props {
  v: StockVehicule;
  editing: boolean;
  form: Partial<StockVehicule>;
  setForm: (fn: (p: Partial<StockVehicule>) => Partial<StockVehicule>) => void;
}

export default function StockPrixSection({ v, editing, form, setForm }: Props) {
  function f(key: keyof StockVehicule) { return String(form[key] ?? ""); }

  return (
    <SectionAccordion icon={Tag} title="Prix">
      {editing ? (
        <div className="space-y-3">
          <EditField label="Prix (€)" value={f("prix")} onChange={(val) => setForm((p) => ({ ...p, prix: Number(val) }))} type="number" />
          <button onClick={() => setForm((p) => ({ ...p, tva_recuperable: !p.tva_recuperable }))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
            style={{
              background: form.tva_recuperable ? "var(--accent-light)" : "var(--card-bg)",
              borderColor: form.tva_recuperable ? "var(--accent)" : "var(--card-border)",
            }}>
            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center"
              style={{
                borderColor: form.tva_recuperable ? "var(--accent)" : "var(--card-border)",
                background:  form.tva_recuperable ? "var(--accent)" : "transparent",
              }}>
              {form.tva_recuperable && <Check size={12} className="text-white" />}
            </div>
            <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>TVA récupérable</span>
          </button>
        </div>
      ) : (
        <div>
          <Row label="Prix"            value={v.prix ? `${v.prix.toLocaleString()} €` : null} />
          <Row label="TVA récupérable" value={v.tva_recuperable ? "Oui" : "Non"} />
        </div>
      )}
    </SectionAccordion>
  );
}