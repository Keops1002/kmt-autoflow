"use client";

// 👇 Les deux lignes pour tuer le cache et forcer l'affichage des photos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Loader2, ChevronLeft, Car, User, Wrench, BadgeEuro, Play, CheckCircle, X, Camera } from "lucide-react";

// 👇 N'oublie pas que ton composant PhotoGallery doit bien être importé ici
import PhotoGallery from "@/components/dossiers/PhotoGallery";

interface DossierDetail {
  id: string;
  problem: string;
  status: string;
  payment_status: string;
  estimated_price: number | null;
  paid_amount: number | null;
  paid_at: string | null;
  created_at: string;
  vehicles: {
    brand: string;
    model: string;
    plate?: string;
    clients: { name: string; phone?: string; email?: string } | null;
  } | null;
}

function statusStyle(status: string) {
  switch (status) {
    case "done":        return { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", label: "Terminé" };
    case "in_progress": return { dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700",       label: "En cours" };
    default:            return { dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700",     label: "En attente" };
  }
}

function PaymentModal({
  estimatedPrice, onConfirm, onClose,
}: {
  estimatedPrice: number | null;
  onConfirm: (amount: number) => Promise<void>;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(String(estimatedPrice ?? ""));
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!amount || isNaN(Number(amount))) return;
    setSaving(true);
    await onConfirm(Number(amount));
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Clôturer le dossier</p>
            <h3 className="text-white font-black text-lg mt-1">Confirmer le paiement</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Montant encaissé (€)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
              placeholder="0" />
            {estimatedPrice && Number(amount) !== estimatedPrice && (
              <p className="text-xs text-amber-500 font-medium px-1">Estimation initiale : {estimatedPrice} €</p>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm">
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!amount || saving}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? "Enregistrement..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DossierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dossier, setDossier]           = useState<DossierDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [updating, setUpdating]         = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => { fetchDossier(); }, [params.id]);

  async function fetchDossier() {
    const { data, error } = await supabase
      .from("dossiers")
      .select(`
        id, problem, status, payment_status,
        estimated_price, paid_amount, paid_at, created_at,
        vehicles:vehicle_id (
          brand, model, plate,
          clients:client_id ( name, phone, email )
        )
      `)
      .eq("id", params.id)
      .single();
    if (error) console.error("Erreur fetch dossier:", error);
    setDossier(data as unknown as DossierDetail);
    setLoading(false);
  }

  async function handleStart() {
    if (!dossier) return;
    setUpdating(true);
    await supabase.from("dossiers").update({ status: "in_progress" }).eq("id", dossier.id);
    setDossier((d) => d ? { ...d, status: "in_progress" } : d);
    setUpdating(false);
  }

  async function handlePaymentConfirm(amount: number) {
    if (!dossier) return;
    await supabase.from("dossiers").update({
      status: "done", payment_status: "paid",
      paid_amount: amount, paid_at: new Date().toISOString(),
    }).eq("id", dossier.id);
    setDossier((d) => d ? {
      ...d, status: "done", payment_status: "paid",
      paid_amount: amount, paid_at: new Date().toISOString(),
    } : d);
    setShowPayModal(false);
  }

  if (loading) return (
    <AppContainer>
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <Loader2 className="animate-spin text-[#17179C]" size={28} />
      </div>
    </AppContainer>
  );

  if (!dossier) return (
    <AppContainer>
      <div className="flex flex-col items-center justify-center h-screen gap-3 px-8">
        <p className="text-slate-500 font-medium">Dossier introuvable</p>
        <button onClick={() => router.back()} className="text-[#17179C] font-bold text-sm">← Retour</button>
      </div>
    </AppContainer>
  );

  const vehicle = dossier.vehicles;
  const client  = vehicle?.clients;
  const st      = statusStyle(dossier.status);

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-40 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3 px-2 mb-2">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-2xl bg-white/70 border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-all shrink-0">
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-2xl font-black text-slate-800 leading-tight flex-1 truncate">
            {dossier.problem || "Dossier"}
          </h1>
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${st.badge}`}>
            {st.label}
          </span>
        </div>

        {/* Card Client */}
        <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
          <div className="pl-5 pr-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</span>
            </div>
            <p className="font-black text-slate-800">{client?.name ?? "Inconnu"}</p>
            {client?.phone && <p className="text-sm text-slate-500 mt-0.5">{client.phone}</p>}
            {client?.email && <p className="text-xs text-slate-400 mt-0.5">{client.email}</p>}
          </div>
        </div>

        {/* Card Véhicule */}
        {vehicle && (
          <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
            <div className="pl-5 pr-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Car size={13} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule</span>
              </div>
              <p className="font-black text-slate-800">{vehicle.brand} {vehicle.model}</p>
              {vehicle.plate && (
                <span className="inline-block mt-1 text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
                  {vehicle.plate}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card Problème */}
        <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
          <div className="pl-5 pr-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problème</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{dossier.problem}</p>
          </div>
        </div>

        {/* Card Prix / Paiement */}
        <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
          <div className="pl-5 pr-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <BadgeEuro size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paiement</span>
            </div>
            {dossier.status === "done" && dossier.paid_amount ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black text-emerald-600">{dossier.paid_amount} €</p>
                  {dossier.paid_at && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Encaissé le {new Date(dossier.paid_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  )}
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                  Payé ✓
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  {dossier.estimated_price
                    ? <p className="text-xl font-black text-[#17179C]">{dossier.estimated_price} €</p>
                    : <p className="text-sm text-slate-400 italic">Prix non défini</p>
                  }
                  <p className="text-xs text-slate-400 mt-0.5">Estimation</p>
                </div>
                <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
                  Non payé
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 👇 LA SECTION PHOTOS EST ICI 👇 */}
        <div className="relative rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />
          <div className="pl-5 pr-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera size={13} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photos du véhicule</span>
            </div>
            {/* L'appel à ton composant Galerie */}
            <PhotoGallery dossierId={dossier.id} />
          </div>
        </div>
        {/* 👆 FIN DE LA SECTION PHOTOS 👆 */}

        {/* ── Boutons d'action ── */}
        {dossier.status === "pending" && (
          <button onClick={handleStart} disabled={updating}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50">
            {updating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Démarrer le travail
          </button>
        )}

        {dossier.status === "in_progress" && (
          <button onClick={() => setShowPayModal(true)}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <CheckCircle size={16} />
            Clôturer et encaisser
          </button>
        )}

        {dossier.status === "done" && (
          <div className="w-full py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-sm flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            Dossier clôturé
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 font-medium pt-2">
          Créé le {new Date(dossier.created_at).toLocaleDateString("fr-FR", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </p>

      </div>

      {showPayModal && (
        <PaymentModal
          estimatedPrice={dossier.estimated_price}
          onConfirm={handlePaymentConfirm}
          onClose={() => setShowPayModal(false)}
        />
      )}

    </AppContainer>
  );
}