"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { getClientsWithStats as getClients, createClient } from "@/lib/api/clients";
import { supabase } from "@/lib/supabase";
import {
  User, Car, Wrench, ChevronRight, ChevronLeft,
  Check, Loader2, Plus, Phone, Mail, Search
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

const STEPS = [
  { id: 1, label: "Client",   icon: User },
  { id: 2, label: "Véhicule", icon: Car },
  { id: 3, label: "Dossier",  icon: Wrench },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {STEPS.map((step, i) => {
        const Icon    = step.icon;
        const done    = current > step.id;
        const active  = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? "var(--accent)" : active ? "var(--accent)" : "var(--card-bg)",
                  borderWidth: 1,
                  borderColor: done || active ? "var(--accent)" : "var(--card-border)",
                  opacity: done || active ? 1 : 0.5,
                }}
              >
                {done
                  ? <Check size={16} className="text-white" />
                  : <Icon size={16} style={{ color: active ? "#ffffff" : "var(--text-muted)" }} />
                }
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider"
                style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-8 h-px mb-4 transition-all duration-300"
                style={{ background: current > step.id ? "var(--accent)" : "var(--card-border)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({
  label, placeholder, value, onChange, type = "text", icon: Icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: any;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-wider px-1"
        style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon size={14} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all"
          style={{
            paddingLeft: Icon ? "2.5rem" : "1rem",
            paddingRight: "1rem",
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
            color: "var(--text-primary)",
          }}
        />
      </div>
    </div>
  );
}

export default function NewDossierPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Client
  const [clients, setClients]           = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientName, setNewClientName]   = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [search, setSearch]             = useState("");
  const [showNewClient, setShowNewClient]   = useState(false);

  // Véhicule
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");

  // Dossier
  const [problem, setProblem]             = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");

  // UI
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClients().then((data) => setClients(data || [])).catch(console.error);
  }, []);

  const isStep1Valid = selectedClient !== null || newClientName.trim().length > 0;
  const isStep2Valid = brand.trim().length > 0 && model.trim().length > 0;
  const isStep3Valid = problem.trim().length > 0;

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  async function handleCreate() {
    if (!isStep3Valid) return;
    setSaving(true);
    try {
      let clientId = selectedClient?.id;
      if (!clientId) {
        const newClient = await createClient({
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail,
        });
        clientId = newClient.id;
      }

      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({ client_id: clientId, brand, model, plate: plate || null })
        .select().single();
      if (vehicleError) throw vehicleError;

      const { error: dossierError } = await supabase
        .from("dossiers")
        .insert({
          vehicle_id: vehicleData.id,
          problem,
          estimated_price: estimatedPrice ? Number(estimatedPrice) : null,
          status: "pending",
        });
      if (dossierError) throw dossierError;

      router.push("/dossiers");
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
        <div className="px-2">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            Nouveau dossier
          </h1>
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
            {step === 1 ? "Sélectionnez ou créez un client"
           : step === 2 ? "Informations du véhicule"
           : "Détails de l'intervention"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="rounded-2xl border px-4 py-3"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <StepIndicator current={step} />
        </div>

        {/* ─── STEP 1 — CLIENT ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-3">

            {/* Recherche */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 pl-9 pr-4 rounded-2xl border text-sm focus:outline-none"
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Liste clients */}
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <button
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setShowNewClient(false); setNewClientName(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all active:scale-[0.98] text-left"
                    style={{
                      background: isSelected ? "var(--accent-light)" : "var(--card-bg)",
                      borderColor: isSelected ? "var(--accent)" : "var(--card-border)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                      style={{ background: isSelected ? "var(--accent)" : "var(--card-bg-active)", color: isSelected ? "#fff" : "var(--text-muted)" }}
                    >
                      {client.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                        {client.name}
                      </p>
                      {client.phone && (
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{client.phone}</p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "var(--accent)" }}>
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
              <span className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>ou</span>
              <div className="flex-1 h-px" style={{ background: "var(--card-border)" }} />
            </div>

            {/* Nouveau client toggle */}
            <button
              onClick={() => { setShowNewClient((p) => !p); setSelectedClient(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all active:scale-[0.98]"
              style={{
                background: showNewClient ? "var(--accent-light)" : "var(--card-bg)",
                borderColor: showNewClient ? "var(--accent)" : "var(--card-border)",
              }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--accent-light)" }}>
                <Plus size={14} style={{ color: "var(--accent)" }} />
              </div>
              <p className="text-sm font-black" style={{ color: "var(--accent)" }}>
                Nouveau client
              </p>
            </button>

            {/* Formulaire nouveau client */}
            {showNewClient && (
              <div className="space-y-3 rounded-2xl border p-4"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <InputField label="Nom *" placeholder="Jean Dupont" value={newClientName}
                  onChange={setNewClientName} icon={User} />
                <InputField label="Téléphone" placeholder="06 12 34 56 78" value={newClientPhone}
                  onChange={setNewClientPhone} icon={Phone} type="tel" />
                <InputField label="Email" placeholder="jean@exemple.fr" value={newClientEmail}
                  onChange={setNewClientEmail} icon={Mail} type="email" />
              </div>
            )}

            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#ffffff" }}
            >
              Continuer <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── STEP 2 — VÉHICULE ────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

              {/* Client sélectionné recap */}
              <div className="flex items-center gap-2 pb-2 border-b"
                style={{ borderColor: "var(--card-border)" }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0"
                  style={{ background: "var(--accent)" }}>
                  {(selectedClient?.name || newClientName)[0]?.toUpperCase()}
                </div>
                <p className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
                  {selectedClient?.name || newClientName}
                </p>
              </div>

              <InputField label="Marque *" placeholder="Renault, Peugeot..." value={brand}
                onChange={setBrand} icon={Car} />
              <InputField label="Modèle *" placeholder="Clio, 308..." value={model}
                onChange={setModel} />
              <InputField label="Plaque d'immatriculation" placeholder="AB-123-CD" value={plate}
                onChange={setPlate} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", color: "var(--text-secondary)", borderWidth: 1, borderColor: "var(--card-border)" }}>
                <ChevronLeft size={16} /> Retour
              </button>
              <button disabled={!isStep2Valid} onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: "var(--accent)", color: "#ffffff" }}>
                Continuer <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3 — DOSSIER ─────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-2xl border p-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

              {/* Recap client + véhicule */}
              <div className="flex items-center gap-3 pb-3 border-b"
                style={{ borderColor: "var(--card-border)" }}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0"
                  style={{ background: "var(--accent)" }}>
                  {(selectedClient?.name || newClientName)[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>
                    {selectedClient?.name || newClientName}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {brand} {model}{plate ? ` · ${plate}` : ""}
                  </p>
                </div>
              </div>

              <InputField label="Problème *" placeholder="Carrosserie avant, rayure portière..." value={problem}
                onChange={setProblem} icon={Wrench} />
              <InputField label="Estimation (€)" placeholder="800" value={estimatedPrice}
                onChange={setEstimatedPrice} type="number" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", color: "var(--text-secondary)", borderWidth: 1, borderColor: "var(--card-border)" }}>
                <ChevronLeft size={16} /> Retour
              </button>
              <button disabled={!isStep3Valid || saving} onClick={handleCreate}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
                style={{ background: "var(--accent)", color: "#ffffff" }}>
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Création...</>
                  : <><Check size={14} /> Créer le dossier</>
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </AppContainer>
  );
}