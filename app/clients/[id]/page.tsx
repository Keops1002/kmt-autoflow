"use client";

/* =========================================================
   CLIENT DETAIL PAGE
========================================================= */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { getClientWithStatsById } from "@/lib/api/clients";
import type { ClientWithStats } from "@/lib/types";
import { ChevronLeft, Mail, Phone } from "lucide-react";

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  /* =========================================================
     STATE
  ========================================================= */
  const [client, setClient] = useState<ClientWithStats | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH
  ========================================================= */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await getClientWithStatsById(params.id);
        setClient(data);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [params.id]);

  return (
    <AppContainer>
      <div className="px-8 pt-12 pb-40 space-y-6">
        {/* =========================================================
           HEADER
        ========================================================= */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl bg-[#e2e5e9]
                       shadow-[5px_5px_10px_#bebfc3,-5px_-5px_10px_#ffffff]
                       text-slate-600 active:shadow-inner"
          >
            <ChevronLeft size={20} />
          </button>

          <h1 className="text-2xl font-extrabold text-slate-800">
            Détail client
          </h1>
        </div>

        {/* =========================================================
           STATES
        ========================================================= */}
        {loading && (
          <p className="text-slate-500 italic text-center">
            Chargement...
          </p>
        )}

        {!loading && !client && (
          <p className="text-slate-500 text-center">
            Client introuvable.
          </p>
        )}

        {/* =========================================================
           CONTENT
        ========================================================= */}
        {client && (
          <div className="p-6 rounded-[2.5rem]
                          bg-white/40 backdrop-blur-md border border-white/60
                          shadow-[15px_15px_30px_#bebfc3,-15px_-15px_30px_#ffffff]">
            <p className="text-2xl font-extrabold text-slate-800">
              {client.name}
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <Phone size={18} className="text-slate-500" />
                <span>{client.phone ?? "Téléphone non renseigné"}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-700 font-semibold">
                <Mail size={18} className="text-slate-500" />
                <span>{client.email ?? "Email non renseigné"}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-[#e2e5e9]
                            shadow-[inset_6px_6px_12px_#caced2,inset_-6px_-6px_12px_#f6f8fa]">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Historique
              </p>
              <p className="mt-2 text-lg font-black text-blue-600">
                {client.dossiers_count} dossier{client.dossiers_count > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppContainer>
  );
}
