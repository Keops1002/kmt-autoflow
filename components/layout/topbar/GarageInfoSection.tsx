"use client";

import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GarageInfoSection({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    name:"", legal_form:"", address:"", city:"",
    phone:"", email:"", siret:"", tva_number:"", capital:"",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    supabase.from("garage_info").select("*").single().then(({ data }) => {
      if (data) setForm(data);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await supabase.from("garage_info").upsert({ id: 1, ...form });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = [
    { key: "name",       label: "Nom du garage",             placeholder: "KMT Auto" },
    { key: "legal_form", label: "Forme juridique",           placeholder: "SARL, SAS..." },
    { key: "address",    label: "Adresse",                   placeholder: "12 rue des Acacias" },
    { key: "city",       label: "Ville / Code postal",       placeholder: "75001 Paris" },
    { key: "phone",      label: "Téléphone",                 placeholder: "06 00 00 00 00" },
    { key: "email",      label: "Email",                     placeholder: "contact@kmt.fr" },
    { key: "siret",      label: "SIRET",                     placeholder: "XXX XXX XXX XXXXX" },
    { key: "tva_number", label: "N° TVA intracommunautaire", placeholder: "FR XX XXXXXXXXX" },
    { key: "capital",    label: "Capital social",            placeholder: "10 000 €" },
  ];

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-slate-400">← Retour</button>
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{f.label}</label>
          <input type="text"
            value={form[f.key as keyof typeof form]}
            onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            className="rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 bg-white/70 outline-none text-slate-700"
          />
        </div>
      ))}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl font-black text-xs text-white flex items-center justify-center gap-2 active:scale-[0.98]"
        style={{ background: "var(--accent)" }}>
        {saved ? <><Check size={13} /> Sauvegardé !</> : saving ? "Sauvegarde..." : <><Save size={13} /> Sauvegarder</>}
      </button>
    </div>
  );
}