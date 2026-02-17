"use client";

/* =========================================================
   NEW DOSSIER – WIZARD COMPLET SUPABASE
   Client → Véhicule → Dossier
========================================================= */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { getClientsWithStats as getClients, createClient } from "@/lib/api/clients";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export default function NewDossierPage() {
  const router = useRouter();

  /* =========================================================
     STATE
  ========================================================= */

  const [step, setStep] = useState(1);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");

  const [problem, setProblem] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");

  /* =========================================================
     FETCH CLIENTS
  ========================================================= */

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data || []);
      } catch (err) {
        console.error("Erreur chargement clients:", err);
      }
    };

    loadClients();
  }, []);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const isStep1Valid =
    selectedClient !== null || newClientName.trim().length > 0;

  const isStep2Valid =
    brand.trim().length > 0 && model.trim().length > 0;

  const isStep3Valid =
    problem.trim().length > 0;

  /* =========================================================
     CREATE DOSSIER
  ========================================================= */

  const handleCreate = async () => {
    try {
      let clientId = selectedClient?.id;

      /* =========================
         SI NOUVEAU CLIENT
      ========================= */

      if (!clientId) {
        const newClient = await createClient({
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail,
        });

        clientId = newClient.id;
      }

      /* =========================
         INSERT VEHICLE
      ========================= */

      const { data: vehicleData, error: vehicleError } =
        await supabase
          .from("vehicles")
          .insert({
            client_id: clientId,
            brand,
            model,
            plate: plate || null,
          })
          .select()
          .single();

      if (vehicleError) throw vehicleError;

      /* =========================
         INSERT DOSSIER
      ========================= */

      const { data: dossierData, error: dossierError } =
        await supabase
          .from("dossiers")
          .insert({
            vehicle_id: vehicleData.id,
            problem,
            estimated_price: estimatedPrice
              ? Number(estimatedPrice)
              : null,
            status: "pending",
          })
          .select()
          .single();

      if (dossierError) throw dossierError;

      router.push("/dossiers");

    } catch (error) {
      console.error("Erreur création :", error);
      alert("Erreur lors de la création du dossier");
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <AppContainer>
      <div className="px-8 pt-12 pb-40 space-y-8">

        <h1 className="text-3xl font-extrabold text-slate-800">
          Nouveau Dossier
        </h1>

        {/* ================= PROGRESS BAR ================= */}

        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                step >= s ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* =========================================================
           STEP 1 – CLIENT
        ========================================================= */}

        {step === 1 && (
          <div className="space-y-6">

            <h2 className="text-xl font-bold text-slate-700">
              Choisir un client
            </h2>

            {/* CLIENTS EXISTANTS */}

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setNewClientName("");
                  }}
                  className={`p-4 rounded-2xl cursor-pointer bg-white shadow transition-all
                    ${
                      selectedClient?.id === client.id
                        ? "border-2 border-blue-600"
                        : ""
                    }`}
                >
                  <p className="font-bold text-slate-800">
                    {client.name}
                  </p>
                  {client.phone && (
                    <p className="text-sm text-slate-500">
                      {client.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center text-slate-500 font-bold">
              OU
            </div>

            {/* NOUVEAU CLIENT */}

            <input
              placeholder="Nom du nouveau client"
              value={newClientName}
              onChange={(e) => {
                setSelectedClient(null);
                setNewClientName(e.target.value);
              }}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <input
              placeholder="Téléphone (optionnel)"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <input
              placeholder="Email (optionnel)"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <button
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className={`w-full p-4 rounded-2xl font-bold transition-all ${
                isStep1Valid
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              Continuer
            </button>
          </div>
        )}

        {/* =========================================================
           STEP 2 – VEHICLE
        ========================================================= */}

        {step === 2 && (
          <div className="space-y-6">

            <h2 className="text-xl font-bold text-slate-700">
              Véhicule
            </h2>

            <input
              placeholder="Marque"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <input
              placeholder="Modèle"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <input
              placeholder="Plaque (optionnel)"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 p-4 rounded-2xl bg-slate-200 text-slate-700 font-semibold"
              >
                Retour
              </button>

              <button
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className={`flex-1 p-4 rounded-2xl font-bold ${
                  isStep2Valid
                    ? "bg-blue-600 text-white"
                    : "bg-slate-300 text-slate-500"
                }`}
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
           STEP 3 – DOSSIER
        ========================================================= */}

        {step === 3 && (
          <div className="space-y-6">

            <h2 className="text-xl font-bold text-slate-700">
              Détail du dossier
            </h2>

            <input
              placeholder="Problème"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <input
              placeholder="Prix estimé (€)"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white shadow-inner text-slate-900"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 p-4 rounded-2xl bg-slate-200 text-slate-700 font-semibold"
              >
                Retour
              </button>

              <button
                disabled={!isStep3Valid}
                onClick={handleCreate}
                className={`flex-1 p-4 rounded-2xl font-bold ${
                  isStep3Valid
                    ? "bg-blue-600 text-white"
                    : "bg-slate-300 text-slate-500"
                }`}
              >
                Créer le dossier
              </button>
            </div>
          </div>
        )}

      </div>
    </AppContainer>
  );
}
