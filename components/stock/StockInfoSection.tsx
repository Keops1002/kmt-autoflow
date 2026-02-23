"use client";

import { Car } from "lucide-react";
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

export default function StockInfoSection({ v, editing, form, setForm }: Props) {
  function f(key: keyof StockVehicule) { return String(form[key] ?? ""); }
  function set(key: keyof StockVehicule) {
    return (val: string) => setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <SectionAccordion icon={Car} title="Informations principales" defaultOpen>
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <EditField label="Marque"  value={f("marque")}  onChange={set("marque")} />
            <EditField label="Modèle"  value={f("modele")}  onChange={set("modele")} />
          </div>
          <EditField label="Version" value={f("version")} onChange={set("version")} />
          <div className="grid grid-cols-2 gap-3">
            <EditField label="Année"   value={f("annee")}              onChange={set("annee")}              type="number" />
            <EditField label="1ère MEC" value={f("mise_en_circulation")} onChange={set("mise_en_circulation")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EditField label="Couleur" value={f("couleur")}       onChange={set("couleur")} />
            <EditField label="Type"    value={f("type_vehicule")} onChange={set("type_vehicule")}
              options={["Berline","Break","SUV","Monospace","Coupé","Cabriolet","Citadine","Utilitaire"]} />
          </div>
        </div>
      ) : (
        <div>
          <Row label="Marque"   value={v.marque} />
          <Row label="Modèle"   value={v.modele} />
          <Row label="Version"  value={v.version} />
          <Row label="Année"    value={v.annee} />
          <Row label="1ère MEC" value={v.mise_en_circulation} />
          <Row label="Couleur"  value={v.couleur} />
          <Row label="Type"     value={v.type_vehicule} />
        </div>
      )}
    </SectionAccordion>
  );
}