"use client";

import { Wrench } from "lucide-react";
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

export default function StockTechSection({ v, editing, form, setForm }: Props) {
  function f(key: keyof StockVehicule) { return String(form[key] ?? ""); }
  function set(key: keyof StockVehicule) {
    return (val: string) => setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <SectionAccordion icon={Wrench} title="Fiche technique">
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <EditField label="Carburant" value={f("carburant")} onChange={set("carburant")}
              options={["Essence","Diesel","Hybride","Hybride rechargeable","Électrique","GPL","GNV"]} />
            <EditField label="Boîte" value={f("boite")} onChange={set("boite")}
              options={["Manuelle","Automatique","Semi-automatique"]} />
          </div>
          <EditField label="Kilométrage" value={f("kilometrage")} onChange={set("kilometrage")} type="number" />
          <div className="grid grid-cols-2 gap-3">
            <EditField label="Puissance DIN (ch)"     value={f("puissance_din")}     onChange={set("puissance_din")}     type="number" />
            <EditField label="Puissance fiscale (cv)" value={f("puissance_fiscale")} onChange={set("puissance_fiscale")} type="number" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <EditField label="Portes"   value={f("nb_portes")} onChange={set("nb_portes")} options={["2","3","4","5"]} />
            <EditField label="Places"   value={f("nb_places")} onChange={set("nb_places")} options={["2","4","5","7","8","9"]} />
            <EditField label="Crit'Air" value={f("crit_air")}  onChange={set("crit_air")}  options={["0","1","2","3","4","5"]} />
          </div>
        </div>
      ) : (
        <div>
          <Row label="Carburant"          value={v.carburant} />
          <Row label="Boîte"              value={v.boite} />
          <Row label="Kilométrage"        value={v.kilometrage ? `${v.kilometrage.toLocaleString()} km` : null} />
          <Row label="Puissance DIN"      value={v.puissance_din ? `${v.puissance_din} ch` : null} />
          <Row label="Puissance fiscale"  value={v.puissance_fiscale ? `${v.puissance_fiscale} cv` : null} />
          <Row label="Nb de portes"       value={v.nb_portes} />
          <Row label="Nb de places"       value={v.nb_places} />
          <Row label="Crit'Air"           value={v.crit_air} />
        </div>
      )}
    </SectionAccordion>
  );
}