"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { getClientsWithStats } from "@/lib/api/clients";
import { supabase } from "@/lib/supabase";
import type { ClientWithStats } from "@/lib/types";
import { Loader2, ChevronDown, Phone, Mail, Car, Trash2, Plus } from "lucide-react";

interface Dossier {
  id: string;
  problem: string;
  status: string;
  estimated_price: number | null;
  vehicles: { brand: string; model: string } | null;
}

function statusBadge(status: string) {
  switch (status) {
    case "done":        return "bg-emerald-100 text-emerald-700";
    case "in_progress": return "bg-blue-100 text-blue-700";
    default:            return "bg-amber-100 text-amber-700";
  }
}
function statusLabel(status: string) {
  switch (status) {
    case "done":        return "Terminé";
    case "in_progress": return "En cours";
    default:            return "En attente";
  }
}

function ClientCard({ client, onDelete }: { client: ClientWithStats; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [dossiers, setDossiers] = useState<Dossier[] | null>(null);
  const [loaded, setLoaded]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadDossiers() {
  if (loaded) return;

  // 1. Récupère les véhicules du client
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, brand, model")
    .eq("client_id", client.id);

  if (!vehicles || vehicles.length === 0) {
    setDossiers([]);
    setLoaded(true);
    return;
  }

  const vehicleIds = vehicles.map((v) => v.id);

  // 2. Récupère les dossiers de ces véhicules
  const { data: dossiers } = await supabase
    .from("dossiers")
    .select("id, problem, status, estimated_price, vehicle_id")
    .in("vehicle_id", vehicleIds);

  // 3. Associe le véhicule à chaque dossier
  const result = (dossiers || []).map((d) => ({
    ...d,
    vehicles: vehicles.find((v) => v.id === d.vehicle_id) || null,
  }));

  setDossiers(result as unknown as Dossier[]);
  setLoaded(true);
}

  function handleExpand() {
    setExpanded((p) => !p);
    if (!loaded) loadDossiers();
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Supprimer ce client ?")) return;
    setDeleting(true);
    await supabase.from("clients").delete().eq("id", client.id);
    onDelete(client.id);
  }

  return (
    <div
      className="relative rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        background: expanded ? "var(--card-bg-active)" : "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
      onClick={handleExpand}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />

      <div className="pl-4 pr-3 pt-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-sm truncate" style={{ color: "var(--text-primary)" }}>
                {client.name}
              </p>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                {client.dossiers_count} dossier{client.dossiers_count > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {client.phone && (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  <Phone size={10} />{client.phone}
                </span>
              )}
              {client.email && (
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  <Mail size={10} />{client.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleDelete} disabled={deleting}
              className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 transition-all active:scale-90">
              {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/dossiers/new?clientId=${client.id}`); }}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <Plus size={11} />
            </button>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
              <ChevronDown size={13} />
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        expanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 pb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="h-px" style={{ background: "var(--card-border)" }} />

          {!loaded ? (
            <div className="flex justify-center py-3">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : dossiers && dossiers.length > 0 ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Dossiers
              </p>
              {dossiers.map((d) => (
                <div key={d.id}
                  onClick={() => router.push(`/dossiers`)}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border cursor-pointer active:scale-[0.98] transition-all"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Car size={11} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{d.problem}</p>
                      {d.vehicles && (
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {d.vehicles.brand} {d.vehicles.model}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.estimated_price && (
                      <span className="text-xs font-black" style={{ color: "var(--accent)" }}>
                        {d.estimated_price}€
                      </span>
                    )}
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${statusBadge(d.status)}`}>
                      {statusLabel(d.status)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className="text-xs italic py-2" style={{ color: "var(--text-muted)" }}>Aucun dossier</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("clients_cache");
    if (cached) {
      setClients(JSON.parse(cached));
      setLoading(false);
    }
    fetchClients();
  }, []);

  async function fetchClients() {
  try {
    const data = await getClientsWithStats();
    const dedup = new Map<string, ClientWithStats>();
    for (const c of data) dedup.set(c.id, c);
    const result = Array.from(dedup.values());

    // Ne met à jour que si les données ont changé
    const newJSON = JSON.stringify(result);
    const cached  = sessionStorage.getItem("clients_cache");
    if (newJSON !== cached) {
      setClients(result);
      sessionStorage.setItem("clients_cache", newJSON);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
}

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-40 space-y-3">
        <div className="flex items-center justify-between px-2 mb-2">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>Clients</h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ color: "var(--text-muted)", background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            {clients.length} client{clients.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <div className="pl-4 pr-3 pt-3 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-28 rounded-full animate-pulse"
                        style={{ background: "var(--card-border)" }} />
                      <div className="h-3 w-36 rounded-full animate-pulse"
                        style={{ background: "var(--card-border)" }} />
                    </div>
                    <div className="h-7 w-7 rounded-full animate-pulse"
                      style={{ background: "var(--card-border)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && clients.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun client pour le moment</p>
          </div>
        )}

        {clients.map((client) => (
          <ClientCard key={client.id} client={client}
            onDelete={(id) => setClients((p) => p.filter((c) => c.id !== id))}
          />
        ))}
      </div>
    </AppContainer>
  );
}