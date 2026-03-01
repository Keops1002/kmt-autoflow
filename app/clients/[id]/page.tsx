"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft, Phone, Mail, MapPin, Car,
  FolderOpen, Loader2, Edit3,
} from "lucide-react";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string | null;
}

interface Client {
  id: string;
  created_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  vehicles?: Vehicle[];
}

const AVATAR_COLORS = [
  { bg: "rgba(99,102,241,0.15)",  text: "#6366f1" },
  { bg: "rgba(16,185,129,0.15)",  text: "#10b981" },
  { bg: "rgba(245,158,11,0.15)",  text: "#f59e0b" },
  { bg: "rgba(239,68,68,0.15)",   text: "#ef4444" },
  { bg: "rgba(59,130,246,0.15)",  text: "#3b82f6" },
  { bg: "rgba(168,85,247,0.15)",  text: "#a855f7" },
];
function getColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [client, setClient]   = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [dossierCount, setDossierCount] = useState(0);

  useEffect(() => {
    load();
  }, [params.id]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*, vehicles (*)")
      .eq("id", params.id)
      .single();

    if (error) { console.error(error); setLoading(false); return; }
    setClient(data as Client);

    // Compte les dossiers via les véhicules du client
    const vehicleIds = (data?.vehicles ?? []).map((v: Vehicle) => v.id);
    if (vehicleIds.length > 0) {
      const { count } = await supabase
        .from("dossiers")
        .select("id", { count: "exact", head: true })
        .in("vehicle_id", vehicleIds);
      setDossierCount(count ?? 0);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <AppContainer>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
        </div>
      </AppContainer>
    );
  }

  if (!client) {
    return (
      <AppContainer>
        <div className="flex flex-col items-center justify-center h-screen gap-3">
          <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
            Client introuvable
          </p>
          <button onClick={() => router.back()}
            className="text-xs font-black px-4 py-2 rounded-xl"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            ← Retour
          </button>
        </div>
      </AppContainer>
    );
  }

  const color = getColor(client.name);
  const nbV   = client.vehicles?.length ?? 0;

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-32 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <ChevronLeft size={18} style={{ color: "var(--text-primary)" }} />
          </button>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
            Fiche client
          </h1>
        </div>

        {/* ── Identité ── */}
        <div className="rounded-2xl border p-5 space-y-4"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0"
              style={{ background: color.bg, color: color.text }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                {client.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Client depuis le {new Date(client.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: "var(--card-bg-active)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Dossiers
              </p>
              <p className="text-lg font-black mt-0.5" style={{ color: "var(--accent)" }}>
                {dossierCount}
              </p>
            </div>
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: "var(--card-bg-active)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Véhicules
              </p>
              <p className="text-lg font-black mt-0.5" style={{ color: "var(--accent)" }}>
                {nbV}
              </p>
            </div>
          </div>
        </div>

        {/* ── Coordonnées ── */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <div className="px-4 py-2.5 border-b"
            style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Coordonnées
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
            {client.phone ? (
              <a href={`tel:${client.phone}`}
                className="flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-light)" }}>
                  <Phone size={14} style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {client.phone}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--card-bg-active)" }}>
                  <Phone size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <span className="text-sm font-medium italic" style={{ color: "var(--text-muted)" }}>
                  Téléphone non renseigné
                </span>
              </div>
            )}

            {client.email ? (
              <a href={`mailto:${client.email}`}
                className="flex items-center gap-3 px-4 py-3 active:opacity-70 transition-opacity">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-light)" }}>
                  <Mail size={14} style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                  {client.email}
                </span>
              </a>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 opacity-40">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--card-bg-active)" }}>
                  <Mail size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <span className="text-sm font-medium italic" style={{ color: "var(--text-muted)" }}>
                  Email non renseigné
                </span>
              </div>
            )}

            {client.address && (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--accent-light)" }}>
                  <MapPin size={14} style={{ color: "var(--accent)" }} />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {client.address}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Notes internes ── */}
        {client.notes && (
          <div className="rounded-2xl px-4 py-3"
            style={{ background: "var(--accent-light)", borderLeft: "3px solid var(--accent)" }}>
            <p className="text-[9px] font-black uppercase tracking-wider mb-1"
              style={{ color: "var(--accent)" }}>
              Note interne
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {client.notes}
            </p>
          </div>
        )}

        {/* ── Véhicules ── */}
        {nbV > 0 && (
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div className="px-4 py-2.5 border-b"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Véhicules ({nbV})
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
              {client.vehicles?.map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--card-bg-active)" }}>
                    <Car size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
                      {v.brand} {v.model}
                    </p>
                    {v.plate && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
                        style={{ background: "var(--card-bg-active)", color: "var(--text-muted)" }}>
                        {v.plate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dossiers liés ── */}
        {dossierCount > 0 && (
          <button
            onClick={() => router.push(`/dossiers?client=${encodeURIComponent(client.name)}`)}
            className="w-full py-3 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <FolderOpen size={15} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
              Voir les {dossierCount} dossier{dossierCount > 1 ? "s" : ""}
            </span>
          </button>
        )}

      </div>
    </AppContainer>
  );
}