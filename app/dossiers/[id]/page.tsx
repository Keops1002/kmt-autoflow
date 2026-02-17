"use client";

/* =========================================================
   DOSSIER DETAIL PAGE
========================================================= */

import { useParams, useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { dossierStore } from "@/store/dossierStore";

export default function DossierDetailPage() {

  const params = useParams();
  const router = useRouter();

  const dossier = dossierStore.getById(params.id as string);

  if (!dossier) {
    return (
      <AppContainer>
        <div className="p-8">
          <h1 className="text-xl font-bold text-slate-800">
            Dossier introuvable
          </h1>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>

      <div className="px-8 pt-12 pb-32 space-y-8">

        <button
          onClick={() => router.back()}
          className="text-slate-500 font-semibold"
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-extrabold text-slate-800">
          {dossier.problem}
        </h1>

        <div className="p-6 rounded-3xl bg-white/70 shadow-lg space-y-3">

          <p className="text-slate-700">
            Status : {dossier.status}
          </p>

          <p className="text-slate-500 text-sm">
            Créé le : {dossier.created_at
  ? new Date(dossier.created_at).toLocaleDateString()
  : "Date inconnue"}

          </p>

        </div>

      </div>

    </AppContainer>
  );
}
