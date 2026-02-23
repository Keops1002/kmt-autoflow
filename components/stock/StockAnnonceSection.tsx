"use client";

import { FileText } from "lucide-react";
import SectionAccordion from "./SectionAccordion";
import { StockVehicule } from "./stock.types";

interface Props {
  v: StockVehicule;
  editing: boolean;
  form: Partial<StockVehicule>;
  setForm: (fn: (p: Partial<StockVehicule>) => Partial<StockVehicule>) => void;
}

export default function StockAnnonceSection({ v, editing, form, setForm }: Props) {
  const equipList: string[] = v.equipements?.liste || [];

  return (
    <SectionAccordion icon={FileText} title="Contenu annonce">
      {editing ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>Points forts (un par ligne)</label>
            <textarea
              value={(form.points_forts as string[] || []).join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, points_forts: e.target.value.split("\n") }))}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>Équipements (un par ligne)</label>
            <textarea
              value={(form.equipements?.liste || []).join("\n")}
              onChange={(e) => setForm((p) => ({ ...p, equipements: { liste: e.target.value.split("\n") } }))}
              rows={5}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>Description</label>
            <textarea
              value={String(form.description ?? "")}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {v.points_forts && v.points_forts.filter(Boolean).length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}>Points forts</p>
              <div className="flex flex-wrap gap-1.5">
                {v.points_forts.filter(Boolean).map((p, i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {equipList.filter(Boolean).length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-2"
                style={{ color: "var(--text-muted)" }}>Équipements</p>
              <div className="space-y-1">
                {equipList.filter(Boolean).map((e, i) => (
                  <p key={i} className="text-xs" style={{ color: "var(--text-secondary)" }}>• {e}</p>
                ))}
              </div>
            </div>
          )}
          {v.description && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}>Description</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v.description}</p>
            </div>
          )}
          {!v.points_forts?.filter(Boolean).length && !equipList.filter(Boolean).length && !v.description && (
            <p className="text-xs italic text-center py-2" style={{ color: "var(--text-muted)" }}>
              Aucun contenu — cliquez sur ✏️ pour ajouter
            </p>
          )}
        </div>
      )}
    </SectionAccordion>
  );
}