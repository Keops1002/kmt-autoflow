"use client";

/* =========================================================
   CLIENTS PAGE – LISTE
========================================================= */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import ClientCard from "@/components/clients/ClientCard";
import { getClientsWithStats } from "@/lib/api/clients";
import type { ClientWithStats } from "@/lib/types";

export default function ClientsPage() {
  const router = useRouter();

  /* =========================================================
     STATE
  ========================================================= */
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH
  ========================================================= */
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getClientsWithStats();

      // ✅ Anti-doublons au cas où (sécurité UI)
      const dedup = new Map<string, ClientWithStats>();
      for (const c of data) dedup.set(c.id, c);

      setClients(Array.from(dedup.values()));
    } catch (e) {
      console.error("fetchClients error:", e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  /* =========================================================
     UI
  ========================================================= */
  const empty = useMemo(() => !loading && clients.length === 0, [loading, clients.length]);

  return (
    <AppContainer>
      <div className="px-8 pt-12 pb-40 space-y-6">
        {/* =========================================================
           TITLE
        ========================================================= */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-800">
            Clients
          </h1>

          <button
            onClick={fetchClients}
            className="px-4 py-2 rounded-2xl bg-[#e2e5e9]
                       shadow-[5px_5px_10px_#bebfc3,-5px_-5px_10px_#ffffff]
                       text-slate-600 font-bold text-sm active:shadow-inner"
          >
            Refresh
          </button>
        </div>

        {/* =========================================================
           STATES
        ========================================================= */}
        {loading && (
          <p className="text-slate-500 italic text-center">
            Chargement des clients...
          </p>
        )}

        {empty && (
          <p className="text-slate-500 text-center">
            Aucun client pour le moment.
          </p>
        )}

        {/* =========================================================
           LIST
        ========================================================= */}
        <div className="grid gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => router.push(`/clients/${client.id}`)}
            />
          ))}
        </div>
      </div>
    </AppContainer>
  );
}
