"use client";

/* =========================================================
   DASHBOARD HOME – ACCUEIL PRINCIPAL
   Version prête Supabase (via mock)
========================================================= */

import AppContainer from "@/components/layout/AppContainer";
import Header from "@/components/dashboard/Header";
import DateSelector from "@/components/dashboard/DateSelector";
import DossierCard from "@/components/dashboard/DossierCard";
import AlertsPanel from "@/components/dashboard/AlertsPanel";

import { dossiersMock } from "@/lib/mockData";

export default function DashboardHome() {
  return (
    <AppContainer>

      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= DATE SELECTOR ================= */}
      <DateSelector />

      {/* ================= DOSSIERS LIST ================= */}
      <div className="px-8 space-y-6 flex-1 overflow-y-auto pb-40">

        {dossiersMock
          .filter((dossier) => dossier.garage_id === "atlas_01")
          .map((dossier) => (
            <DossierCard
              key={dossier.id}
              dossier={dossier}
            />
        ))}

        {/* ================= ALERTS PANEL ================= */}
        <AlertsPanel />

      </div>

    </AppContainer>
  );
}
