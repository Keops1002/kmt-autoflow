"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft, ChevronRight, Check, Loader2,
  Car, Wrench, Tag, FileText, Images, ScanLine
} from "lucide-react";
import StockPhotoUploader      from "@/components/stock/StockPhotoUploader";
import CartegriseScannerSheet  from "@/components/stock/CartegriseScannerSheet";

const STEPS = [
  { id: 1, label: "Infos",     icon: Car      },
  { id: 2, label: "Technique", icon: Wrench   },
  { id: 3, label: "Prix",      icon: Tag      },
  { id: 4, label: "Annonce",   icon: FileText },
  { id: 5, label: "Photos",    icon: Images   },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-wider px-1"
        style={{ color: "var(--text-muted)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
      <option value="">Choisir...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {STEPS.map((step, i) => {
        const Icon   = step.icon;
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: done || active ? "var(--accent)" : "var(--card-bg)",
                  border: `1px solid ${done || active ? "var(--accent)" : "var(--card-border)"}`,
                  opacity: done || active ? 1 : 0.5,
                }}>
                {done
                  ? <Check size={13} className="text-white" />
                  : <Icon size={13} style={{ color: active ? "#fff" : "var(--text-muted)" }} />
                }
              </div>
              <span className="text-[8px] font-black uppercase tracking-wide"
                style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-4 h-px mb-4"
                style={{ background: current > step.id ? "var(--accent)" : "var(--card-border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewStockPage() {
  const router  = useRouter();
  const [step, setStep]           = useState(1);
  const [saving, setSaving]       = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Step 1
  const [marque, setMarque]                         = useState("");
  const [modele, setModele]                         = useState("");
  const [version, setVersion]                       = useState("");
  const [annee, setAnnee]                           = useState("");
  const [mise_en_circulation, setMiseEnCirculation] = useState("");
  const [couleur, setCouleur]                       = useState("");
  const [type_vehicule, setTypeVehicule]             = useState("");

  // Step 2
  const [carburant, setCarburant]                 = useState("");
  const [boite, setBoite]                         = useState("");
  const [kilometrage, setKilometrage]             = useState("");
  const [puissance_din, setPuissanceDin]          = useState("");
  const [puissance_fiscale, setPuissanceFiscale]  = useState("");
  const [nb_portes, setNbPortes]                  = useState("5");
  const [nb_places, setNbPlaces]                  = useState("5");
  const [crit_air, setCritAir]                    = useState("");

  // Step 3
  const [prix, setPrix]                       = useState("");
  const [tva_recuperable, setTvaRecuperable]  = useState(false);

  // Step 4
  const [points_forts, setPointsForts] = useState("");
  const [equipements, setEquipements]  = useState("");
  const [description, setDescription]  = useState("");

  const isStep1Valid = marque.trim().length > 0 && modele.trim().length > 0;
  const isStep2Valid = carburant.length > 0 && boite.length > 0 && kilometrage.length > 0;
  const isStep3Valid = prix.trim().length > 0;

  function handleCarteGriseData(data: any) {
    if (data.marque)              setMarque(data.marque);
    if (data.modele)              setModele(data.modele);
    if (data.version)             setVersion(data.version);
    if (data.annee)               setAnnee(String(data.annee));
    if (data.mise_en_circulation) setMiseEnCirculation(data.mise_en_circulation);
    if (data.couleur)             setCouleur(data.couleur);
    if (data.carburant)           setCarburant(data.carburant);
    if (data.puissance_din)       setPuissanceDin(String(data.puissance_din));
    if (data.puissance_fiscale)   setPuissanceFiscale(String(data.puissance_fiscale));
    if (data.nb_places)           setNbPlaces(String(data.nb_places));
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const { data, error } = await supabase.from("stock_vehicules").insert({
        marque,
        modele,
        version:             version || null,
        annee:               annee ? Number(annee) : null,
        mise_en_circulation: mise_en_circulation || null,
        couleur:             couleur || null,
        type_vehicule:       type_vehicule || null,
        carburant:           carburant || null,
        boite:               boite || null,
        kilometrage:         kilometrage ? Number(kilometrage) : null,
        puissance_din:       puissance_din ? Number(puissance_din) : null,
        puissance_fiscale:   puissance_fiscale ? Number(puissance_fiscale) : null,
        nb_portes:           Number(nb_portes),
        nb_places:           Number(nb_places),
        crit_air:            crit_air || null,
        prix:                prix ? Number(prix) : null,
        tva_recuperable,
        points_forts:  points_forts
          ? points_forts.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        equipements: equipements
          ? { liste: equipements.split("\n").map((s) => s.trim()).filter(Boolean) }
          : {},
        description:   description || null,
        statut:        "disponible",
      }).select().single();

      if (error) throw error;
      setCreatedId(data.id);
      setStep(5);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppContainer>
      <div className="px-4 pt-10 pb-32 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="w-9 h-9 rounded-2xl border flex items-center justify-center active:scale-90 transition-all"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <ChevronLeft size={18} style={{ color: "var(--text-muted)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
              Nouveau véhicule
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Stock à vendre</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="rounded-2xl border px-3 py-3"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <StepIndicator current={step} />
        </div>

        {/* ─── STEP 1 — INFOS ─── */}
        {step === 1 && (
          <div className="space-y-3">

            {/* Bouton scanner carte grise */}
            <button onClick={() => setShowScanner(true)}
              className="w-full py-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ borderColor: "var(--accent)", borderStyle: "dashed", background: "var(--accent-light)" }}>
              <ScanLine size={15} style={{ color: "var(--accent)" }} />
              <span className="text-sm font-black" style={{ color: "var(--accent)" }}>
                Scanner la carte grise ✨
              </span>
            </button>

            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marque *"><Input value={marque} onChange={setMarque} placeholder="BMW" /></Field>
                <Field label="Modèle *"><Input value={modele} onChange={setModele} placeholder="Série 2" /></Field>
              </div>
              <Field label="Version / Finition">
                <Input value={version} onChange={setVersion} placeholder="218i Active Tourer M Sport" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Année">
                  <Input value={annee} onChange={setAnnee} placeholder="2024" type="number" />
                </Field>
                <Field label="1ère mise en circulation">
                  <Input value={mise_en_circulation} onChange={setMiseEnCirculation} placeholder="07/2024" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Couleur">
                  <Input value={couleur} onChange={setCouleur} placeholder="Blanc" />
                </Field>
                <Field label="Type véhicule">
                  <Select value={type_vehicule} onChange={setTypeVehicule}
                    options={["Berline","Break","SUV","Monospace","Coupé","Cabriolet","Citadine","Utilitaire"]} />
                </Field>
              </div>
            </div>

            <button disabled={!isStep1Valid} onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 text-white transition-all active:scale-[0.98]"
              style={{ background: "var(--accent)" }}>
              Continuer <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── STEP 2 — TECHNIQUE ─── */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Carburant *">
                  <Select value={carburant} onChange={setCarburant}
                    options={["Essence","Diesel","Hybride","Hybride rechargeable","Électrique","GPL","GNV"]} />
                </Field>
                <Field label="Boîte *">
                  <Select value={boite} onChange={setBoite}
                    options={["Manuelle","Automatique","Semi-automatique"]} />
                </Field>
              </div>
              <Field label="Kilométrage *">
                <Input value={kilometrage} onChange={setKilometrage} placeholder="7500" type="number" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Puissance DIN (ch)">
                  <Input value={puissance_din} onChange={setPuissanceDin} placeholder="136" type="number" />
                </Field>
                <Field label="Puissance fiscale (cv)">
                  <Input value={puissance_fiscale} onChange={setPuissanceFiscale} placeholder="7" type="number" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Nb portes">
                  <Select value={nb_portes} onChange={setNbPortes} options={["2","3","4","5"]} />
                </Field>
                <Field label="Nb places">
                  <Select value={nb_places} onChange={setNbPlaces} options={["2","4","5","7","8","9"]} />
                </Field>
                <Field label="Crit'Air">
                  <Select value={crit_air} onChange={setCritAir} options={["0","1","2","3","4","5"]} />
                </Field>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                <ChevronLeft size={16} /> Retour
              </button>
              <button disabled={!isStep2Valid} onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 text-white transition-all active:scale-[0.98]"
                style={{ background: "var(--accent)" }}>
                Continuer <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3 — PRIX ─── */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-4 space-y-4"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <Field label="Prix de vente (€) *">
                <Input value={prix} onChange={setPrix} placeholder="29990" type="number" />
              </Field>
              <button onClick={() => setTvaRecuperable((p) => !p)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all"
                style={{
                  background: tva_recuperable ? "var(--accent-light)" : "var(--card-bg)",
                  borderColor: tva_recuperable ? "var(--accent)" : "var(--card-border)",
                }}>
                <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center"
                  style={{
                    borderColor: tva_recuperable ? "var(--accent)" : "var(--card-border)",
                    background:  tva_recuperable ? "var(--accent)" : "transparent",
                  }}>
                  {tva_recuperable && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                  TVA récupérable
                </span>
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                <ChevronLeft size={16} /> Retour
              </button>
              <button disabled={!isStep3Valid} onClick={() => setStep(4)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 text-white transition-all active:scale-[0.98]"
                style={{ background: "var(--accent)" }}>
                Continuer <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4 — ANNONCE ─── */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <Field label="Points forts (un par ligne)">
                <textarea value={points_forts} onChange={(e) => setPointsForts(e.target.value)}
                  rows={4} placeholder={"Drive Assist Plus\nPark Assist\nCaméra de recul"}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none resize-none"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
              </Field>
              <Field label="Équipements détaillés (un par ligne)">
                <textarea value={equipements} onChange={(e) => setEquipements(e.target.value)}
                  rows={5} placeholder={"Climatisation automatique bi-zone\nVolant M gainé cuir\n..."}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none resize-none"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
              </Field>
              <Field label="Description personnalisée">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={4} placeholder="Livraison possible dans toute la France..."
                  className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none resize-none"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
              </Field>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                <ChevronLeft size={16} /> Retour
              </button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white disabled:opacity-50 transition-all active:scale-[0.98]"
                style={{ background: "var(--accent)" }}>
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Création...</>
                  : <><ChevronRight size={14} /> Continuer</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 5 — PHOTOS ─── */}
        {step === 5 && createdId && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-4"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <p className="text-xs font-black uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}>Photos du véhicule</p>
              <p className="text-[11px] mb-4" style={{ color: "var(--text-muted)" }}>
                La première photo uploadée sera automatiquement la photo de couverture ⭐
              </p>
              <StockPhotoUploader vehiculeId={createdId} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push("/stock")}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                Passer
              </button>
              <button onClick={() => router.push(`/stock/${createdId}`)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: "var(--accent)" }}>
                <Check size={14} /> Terminer
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Scanner carte grise */}
      {showScanner && (
        <CartegriseScannerSheet
          onClose={() => setShowScanner(false)}
          onDataExtracted={(data) => {
            handleCarteGriseData(data);
            setShowScanner(false);
          }}
        />
      )}

    </AppContainer>
  );
}