"use client";

import { useState, useEffect } from "react";
import { Plus, X, Save, Check, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Collaborateur {
  id?: string;
  prenom: string;
  nom: string;
  poste: string;
  contrat: string;
  date_entree: string;
  salaire: string;
}

const CONTRATS = ["CDI", "CDD", "Apprentissage", "Stage", "Intérim", "Freelance"];

const EMPTY: Collaborateur = {
  prenom: "", nom: "", poste: "", contrat: "CDI", date_entree: "", salaire: "",
};

export default function CollaborateursSection({ onBack }: { onBack: () => void }) {
  const [collabs, setCollabs]   = useState<Collaborateur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<Collaborateur>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    supabase.from("collaborateurs").select("*").order("nom").then(({ data }) => {
      setCollabs((data as Collaborateur[]) || []);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    if (form.id) {
      await supabase.from("collaborateurs").update(form).eq("id", form.id);
      setCollabs((p) => p.map((c) => c.id === form.id ? form : c));
    } else {
      const { data } = await supabase.from("collaborateurs").insert(form).select().single();
      if (data) setCollabs((p) => [...p, data as Collaborateur]);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); setForm(EMPTY); }, 1500);
  }

  async function handleDelete(id: string) {
    await supabase.from("collaborateurs").delete().eq("id", id);
    setCollabs((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
        ← Retour
      </button>

      {/* Liste */}
      {collabs.length === 0 && !showForm && (
        <div className="text-center py-8">
          <Users size={32} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Aucun collaborateur</p>
        </div>
      )}

      <div className="space-y-2">
        {collabs.map((c) => (
          <div key={c.id}
            className="flex items-center justify-between px-4 py-3 rounded-2xl border"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div>
              <p className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
                {c.prenom} {c.nom}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {c.poste} — {c.contrat}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Depuis le {new Date(c.date_entree).toLocaleDateString("fr-FR")} · {c.salaire} €/mois
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm(c); setShowForm(true); }}
                className="text-xs font-black px-3 py-1.5 rounded-xl border"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
                Éditer
              </button>
              <button onClick={() => c.id && handleDelete(c.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                <X size={14} style={{ color: "#ef4444" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm ? (
        <div className="space-y-3 rounded-2xl border p-4"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <div className="flex gap-2">
            {["prenom","nom"].map((k) => (
              <input key={k} type="text"
                value={form[k as keyof Collaborateur]}
                onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                placeholder={k === "prenom" ? "Prénom" : "Nom"}
                className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border outline-none"
                style={{ background: "var(--bg-base)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              />
            ))}
          </div>
          <input type="text"
            value={form.poste}
            onChange={(e) => setForm((p) => ({ ...p, poste: e.target.value }))}
            placeholder="Poste (Ex: Mécanicien)"
            className="w-full rounded-xl px-3 py-2 text-sm font-bold border outline-none"
            style={{ background: "var(--bg-base)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
          />
          <div className="flex gap-2">
            <select value={form.contrat}
              onChange={(e) => setForm((p) => ({ ...p, contrat: e.target.value }))}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border outline-none"
              style={{ background: "var(--bg-base)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
              {CONTRATS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number"
              value={form.salaire}
              onChange={(e) => setForm((p) => ({ ...p, salaire: e.target.value }))}
              placeholder="Salaire €"
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border outline-none"
              style={{ background: "var(--bg-base)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>
          <input type="date"
            value={form.date_entree}
            onChange={(e) => setForm((p) => ({ ...p, date_entree: e.target.value }))}
            className="w-full rounded-xl px-3 py-2 text-sm font-bold border outline-none"
            style={{ background: "var(--bg-base)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
          />
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-black border"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-1"
              style={{ background: "var(--accent)" }}>
              {saved ? <><Check size={14} /> Sauvegardé</> : <><Save size={14} /> Sauvegarder</>}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => { setForm(EMPTY); setShowForm(true); }}
          className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.97]"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--accent)" }}>
          <Plus size={16} /> Ajouter un collaborateur
        </button>
      )}
    </div>
  );
}