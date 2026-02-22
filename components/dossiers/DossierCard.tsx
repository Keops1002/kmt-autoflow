"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Trash2, ChevronDown, Play, CheckCircle,
  User, Car, Wrench, BadgeEuro, FileText, Camera
} from "lucide-react";

import DevisBottomSheet from "@/components/devis/DevisBottomSheet";
import DevisCard from "@/components/devis/DevisCard";
import PhotoGallery from "@/components/dossiers/PhotoGallery";
import PaymentModal from "./PaymentModal";
import TaskSection from "./TaskSection";

import type { Dossier } from "./dossier.types";
import type { Devis } from "@/components/devis/devis.types";

function statusStyle(status: string) {
  switch (status) {
    case "done":        return { badge: "bg-emerald-100 text-emerald-700", label: "Terminé" };
    case "in_progress": return { badge: "bg-blue-100 text-blue-700",       label: "En cours" };
    default:            return { badge: "bg-amber-100 text-amber-700",     label: "En attente" };
  }
}

interface Props {
  dossier: Dossier;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Dossier>) => void;
}

export default function DossierCard({ dossier, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded]         = useState(false);
  const [updating, setUpdating]         = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDevis, setShowDevis]       = useState(false);
  const [deleting, setDeleting]         = useState(false);
  
  // Accordéons
  const [devisList, setDevisList]       = useState<Devis[]>(dossier.devis || []);
  const [devisOpen, setDevisOpen]       = useState(true);
  const [tachesOpen, setTachesOpen]     = useState(true);
  const [photosOpen, setPhotosOpen]     = useState(false);

  // ── Logique du Swipe ──
  const dragX = useMotionValue(0);
  
  // L'icône poubelle apparaît et grossit
  const trashOpacity = useTransform(dragX, [-100, -20], [1, 0]);
  const trashScale   = useTransform(dragX, [-100, -20], [1.2, 0.5]);

  // --- NOUVEAU : Le conteneur rouge lui-même devient transparent quand on ne swipe pas ---
  // À 0px de drag, opacité 0. À -100px de drag, opacité 1.
  const containerOpacity = useTransform(dragX, [-100, 0], [1, 0]);


  const st      = statusStyle(dossier.status);
  const vehicle = dossier.vehicles;
  const client  = vehicle?.clients;
  const tasks   = dossier.tasks || [];
  const tasksDone  = tasks.filter((t) => t.is_done).length;
  const tasksTotal = tasks.length;

  async function handleStart(e: React.MouseEvent) {
    e.stopPropagation();
    setUpdating(true);
    await supabase.from("dossiers").update({ status: "in_progress" }).eq("id", dossier.id);
    onUpdate(dossier.id, { status: "in_progress" });
    setUpdating(false);
  }

  async function handlePaymentConfirm(amount: number) {
    await supabase.from("dossiers").update({
      status: "done", payment_status: "paid",
      paid_amount: amount, paid_at: new Date().toISOString(),
    }).eq("id", dossier.id);
    onUpdate(dossier.id, {
      status: "done", payment_status: "paid",
      paid_amount: amount, paid_at: new Date().toISOString(),
    });
    setShowPayModal(false);
  }

  async function handleSwipeDelete() {
    if (!confirm("Supprimer ce dossier ?")) {
      dragX.set(0); 
      return;
    }
    setDeleting(true);
    await supabase.from("dossiers").delete().eq("id", dossier.id);
    onDelete(dossier.id);
  }

  async function reloadDevis() {
    const { data } = await supabase
      .from("devis").select("*")
      .eq("dossier_id", dossier.id)
      .order("created_at", { ascending: false });
    setDevisList((data as Devis[]) || []);
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl mb-3 shadow-sm bg-transparent">
        
        {/* ── ZONE ROUGE (Cachée derrière) ── */}
        {/* On utilise motion.div ici pour appliquer l'opacité dynamique */}
        <motion.div 
          className="absolute inset-0 bg-red-600 flex items-center justify-end px-8 rounded-2xl"
          style={{ zIndex: 1, opacity: containerOpacity }} // <-- C'est ici que la magie opère
          onClick={handleSwipeDelete}
        >
          <motion.div 
            style={{ opacity: trashOpacity, scale: trashScale }}
            className="flex flex-col items-center gap-1 text-white"
          >
            <Trash2 size={22} />
            <span className="text-[10px] font-black uppercase">Supprimer</span>
          </motion.div>
        </motion.div>

        {/* ── CARTE DRAGGABLE (Glassmorphism conservé) ── */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -100, right: 0 }}
          dragElastic={{ right: 0, left: 0.1 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) {
              handleSwipeDelete();
            } else {
              dragX.set(0);
            }
          }}
          className="relative border rounded-2xl transition-colors duration-300 cursor-pointer backdrop-blur-md"
          // On garde tes variables CSS pour le glassmorphism
          style={{
            x: dragX,
            background: expanded ? "var(--card-bg-active)" : "var(--card-bg)", 
            borderColor: "var(--card-border)",
            zIndex: 10
          }}
          onClick={() => setExpanded((p) => !p)}
        >
          {/* Barre gauche dégradée */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />

          {/* Header */}
          <div className="pl-4 pr-3 pt-3 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {client?.name ?? "Client inconnu"}
                  </p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${st.badge}`}>
                    {st.label}
                  </span>
                  {tasksTotal > 0 && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                      {tasksDone}/{tasksTotal} tâches
                    </span>
                  )}
                  {devisList.length > 0 && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 bg-violet-100 text-violet-700">
                      {devisList.length} devis
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {vehicle?.brand} {vehicle?.model}
                  {vehicle?.plate ? ` · ${vehicle.plate}` : ""}
                  {" · "}
                  {new Date(dossier.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {deleting ? (
                    <Loader2 size={13} className="animate-spin text-red-500" />
                ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                        style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                        <ChevronDown size={13} />
                    </div>
                )}
              </div>
            </div>
            {!expanded && dossier.estimated_price && (
              <p className="text-sm font-black mt-1.5" style={{ color: "var(--accent)" }}>
                {dossier.estimated_price} €
              </p>
            )}
          </div>

          {/* Contenu Déplié */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[2500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="px-4 pb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="h-px" style={{ background: "var(--card-border)" }} />

              {client && (
                <div className="flex items-start gap-2">
                  <User size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Client</p>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{client.name}</p>
                    {client.phone && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{client.phone}</p>}
                    {client.email && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{client.email}</p>}
                  </div>
                </div>
              )}

              {vehicle && (
                <div className="flex items-start gap-2">
                  <Car size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Véhicule</p>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{vehicle.brand} {vehicle.model}</p>
                    {vehicle.plate && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md"
                        style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                        {vehicle.plate}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Wrench size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Problème</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{dossier.problem}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <BadgeEuro size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Paiement</p>
                  {dossier.status === "done" && dossier.paid_amount ? (
                    <div className="flex items-center justify-between">
                      <p className="text-base font-black text-emerald-600">{dossier.paid_amount} € encaissé</p>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Payé ✓</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-base font-black" style={{ color: "var(--accent)" }}>
                        {dossier.estimated_price ? `${dossier.estimated_price} €` : "Non défini"}
                      </p>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Non payé</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-2 pt-2">
                <div className="h-px" style={{ background: "var(--card-border)" }} />
                <div className="w-full flex items-center justify-between cursor-pointer" onClick={() => setPhotosOpen((p) => !p)}>
                  <div className="flex items-center gap-2">
                    <Camera size={13} style={{ color: "var(--text-muted)" }} />
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Photos</p>
                  </div>
                  <ChevronDown size={13} className={`transition-transform duration-300 ${photosOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${photosOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="pt-2"><PhotoGallery dossierId={dossier.id} /></div>
                </div>
              </div>

              {/* Devis */}
              <div className="space-y-2 pt-2">
                <div className="h-px" style={{ background: "var(--card-border)" }} />
                <div className="w-full flex items-center justify-between cursor-pointer" onClick={() => setDevisOpen((p) => !p)}>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Devis</p>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {devisList.length > 0 && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{devisList.length}</span>}
                    <button onClick={(e) => { e.stopPropagation(); setShowDevis(true); }} className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border active:scale-95 transition-all" style={{ background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--accent)" }}>
                      <FileText size={10} /> Nouveau
                    </button>
                    <ChevronDown size={13} className={`transition-transform duration-300 ${devisOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${devisOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="space-y-2 pt-2">
                    {devisList.length === 0 ? (
                      <p className="text-[10px] italic" style={{ color: "var(--text-muted)" }}>Aucun devis</p>
                    ) : (
                      devisList.map((d) => (
                        <DevisCard key={d.id} devis={d} dossierId={dossier.id} clientName={client?.name || "Client"} onUpdate={(updated) => setDevisList((p) => p.map((x) => x.id === updated.id ? updated : x))} onDelete={(id) => setDevisList((p) => p.filter((x) => x.id !== id))} />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Tâches */}
              <div className="space-y-2 pt-2">
                <div className="h-px" style={{ background: "var(--card-border)" }} />
                <div className="w-full flex items-center justify-between cursor-pointer" onClick={() => setTachesOpen((p) => !p)}>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Tâches</p>
                  <div className="flex items-center gap-2">
                    {tasksTotal > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>{tasksDone}/{tasksTotal}</span>}
                    <ChevronDown size={13} className={`transition-transform duration-300 ${tachesOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${tachesOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="pt-2"><TaskSection dossierId={dossier.id} initialTasks={tasks} hideHeader /></div>
                </div>
              </div>

              <div className="h-px" style={{ background: "var(--card-border)" }} />

              {/* Actions statut */}
              {dossier.status === "pending" && (
                <button onClick={handleStart} disabled={updating} className="w-full py-3 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all" style={{ background: "var(--accent)" }}>
                  {updating ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Démarrer le travail
                </button>
              )}
              {dossier.status === "in_progress" && (
                <button onClick={() => setShowPayModal(true)} className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                  <CheckCircle size={13} /> Clôturer et encaisser
                </button>
              )}
              {dossier.status === "done" && (
                <div className="w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2" style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                  <CheckCircle size={13} className="text-emerald-500" /> Dossier clôturé
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {showPayModal && <PaymentModal estimatedPrice={dossier.estimated_price} onConfirm={handlePaymentConfirm} onClose={() => setShowPayModal(false)} />}
      {showDevis && <DevisBottomSheet dossierId={dossier.id} clientName={client?.name || "Client"} onClose={() => setShowDevis(false)} onCreated={reloadDevis} />}
    </>
  );
}