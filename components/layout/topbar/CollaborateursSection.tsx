"use client";

import { useState, useEffect } from "react";
import { Plus, X, Save, Check, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CONTRATS = ["CDI","CDD","Apprentissage","Stage","Intérim","Freelance"];
const EMPTY    = { prenom:"", nom:"", poste:"", contrat:"CDI", date_entree:"", salaire:"" };

export default function CollaborateursSection({ onBack }: { onBack: () => void }) {
  const [collabs, setCollabs]   = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<any>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    supabase.from("collaborateurs").select("*").order("nom").then(({ data }) => {
      setCollabs(data || []);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    if (form.id) {
      await supabase.from("collaborateurs").update(form).eq("id", form.id);
      setCollabs((p) => p.map((c) => c.id === form.id ? form : c));
    } else {
      const { data } = await supabase.from("collaborateurs").insert(form).select().single();
      if (data) setCollabs((p) => [...p, data]);
    }
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setForm(EMPTY); }, 1500);
  }

  async function handleDelete(id: string) {
    await supabase.from("collaborateurs").delete().eq("id", id);
    setCollabs((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-slate-400">← Retour</button>

      {collabs.length === 0 && !showForm && (
        <div className="text-center py-6">
          <Users size={28} className="mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-bold text-slate-400">Aucun collaborateur</p>
        </div>
      )}

      <div className="space-y-2">
        {collabs.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 bg-white/60">
            <div>
              <p className="font-black text-xs text-slate-700">{c.prenom} {c.nom}</p>
              <p className="text-[10px] text-slate-400">{c.poste} — {c.contrat}</p>
              <p className="text-[10px] text-slate-400">
                Depuis {new Date(c.date_entree).toLocaleDateString("fr-FR")} · {c.salaire} €/mois
              </p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { setForm(c); setShowForm(true); }}
                className="text-[10px] font-black px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600">
                Éditer
              </button>
              <button onClick={() => handleDelete(c.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50">
                <X size={12} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white/60 p-3">
          <div className="flex gap-2">
            {["prenom","nom"].map((k) => (
              <input key={k} type="text" value={form[k]}
                onChange={(e) => setForm((p: any) => ({ ...p, [k]: e.target.value }))}
                placeholder={k === "prenom" ? "Prénom" : "Nom"}
                className="flex-1 rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 bg-white outline-none text-slate-700"
              />
            ))}
          </div>
          <input type="text" value={form.poste}
            onChange={(e) => setForm((p: any) => ({ ...p, poste: e.target.value }))}
            placeholder="Poste (Ex: Mécanicien)"
            className="w-full rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 bg-white outline-none text-slate-700"
          />
          <div className="flex gap-2">
            <select value={form.contrat}
              onChange={(e) => setForm((p: any) => ({ ...p, contrat: e.target.value }))}
              className="flex-1 rounded-xl px-2 py-2 text-xs font-bold border border-slate-200 bg-white outline-none text-slate-700">
              {CONTRATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" value={form.salaire}
              onChange={(e) => setForm((p: any) => ({ ...p, salaire: e.target.value }))}
              placeholder="Salaire €"
              className="flex-1 rounded-xl px-2 py-2 text-xs font-bold border border-slate-200 bg-white outline-none text-slate-700"
            />
          </div>
          <input type="date" value={form.date_entree}
            onChange={(e) => setForm((p: any) => ({ ...p, date_entree: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 bg-white outline-none text-slate-700"
          />
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }}
              className="flex-1 py-2 rounded-xl text-xs font-black border border-slate-200 bg-white text-slate-500">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1"
              style={{ background: "var(--accent)" }}>
              {saved ? <><Check size={12} /> OK</> : <><Save size={12} /> Sauvegarder</>}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => { setForm(EMPTY); setShowForm(true); }}
          className="w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 border border-slate-200 bg-white/60 transition-all active:scale-[0.97]"
          style={{ color: "var(--accent)" }}>
          <Plus size={14} /> Ajouter un collaborateur
        </button>
      )}
    </div>
  );
}