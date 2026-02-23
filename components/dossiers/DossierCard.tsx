"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Trash2, ChevronDown, Play, CheckCircle,
  User, Car, Wrench, BadgeEuro, FileText, Camera
} from "lucide-react";

import DevisBottomSheet from "@/components/devis/DevisBottomSheet";
import DevisCard        from "@/components/devis/DevisCard";
import PhotoGallery     from "@/components/dossiers/PhotoGallery";
import PaymentModal     from "./PaymentModal";
import TaskSection      from "./TaskSection";

import type { Dossier } from "./dossier.types";
import type { Devis }   from "@/components/devis/devis.types";

function statusStyle(status: string) {
  switch (status) {
    case "done":        return { badge: "bg-emerald-100 text-emerald-700", label: "Terminé"    };
    case "in_progress": return { badge: "bg-blue-100 text-blue-700",       label: "En cours"   };
    default:            return { badge: "bg-amber-100 text-amber-700",     label: "En attente" };
  }
}

interface Props {
  dossier:  Dossier;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Dossier>) => void;
}

const SWIPE_THRESHOLD = 80;
const REVEAL_WIDTH    = 90;

export default function DossierCard({ dossier, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded]         = useState(false);
  const [updating, setUpdating]         = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDevis, setShowDevis]       = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [revealed, setRevealed]         = useState(false);

  const [devisList, setDevisList]   = useState<Devis[]>(dossier.devis || []);
  const [devisOpen, setDevisOpen]   = useState(true);
  const [tachesOpen, setTachesOpen] = useState(true);
  const [photosOpen, setPhotosOpen] = useState(false);

  const dragX = useMotionValue(0);

  // Zone rouge : s'allume progressivement
  const bgOpacity   = useTransform(dragX, [-REVEAL_WIDTH, -20], [1, 0]);
  // Icône : grossit et apparaît
  const iconScale   = useTransform(dragX, [-REVEAL_WIDTH, -30], [1.15, 0.6]);
  const iconOpacity = useTransform(dragX, [-REVEAL_WIDTH, -30], [1, 0]);

  const st      = statusStyle(dossier.status);
  const vehicle = dossier.vehicles;
  const client  = vehicle?.clients;
  const tasks   = dossier.tasks || [];
  const tasksDone  = tasks.filter((t) => t.is_done).length;
  const tasksTotal = tasks.length;

  function snapOpen()  { animate(dragX, -REVEAL_WIDTH, { type: "spring", stiffness: 400, damping: 35 }); setRevealed(true);  }
  function snapClose() { animate(dragX, 0,             { type: "spring", stiffness: 400, damping: 35 }); setRevealed(false); }

  function handleDragEnd(_: any, info: any) {
    const x = info.offset.x;
    if (x < -SWIPE_THRESHOLD) {
      snapOpen();
    } else {
      snapClose();
    }
  }

  async function handleDelete() {
    snapClose();
    setDeleting(true);
    try {
      const { data: devisList } = await supabase
        .from("devis").select("id").eq("dossier_id", dossier.id);
      if (devisList && devisList.length > 0) {
        const ids = devisList.map((d) => d.id);
        await supabase.from("devis_lignes").delete().in("devis_id", ids);
        await supabase.from("devis").delete().in("id", ids);
      }
      await supabase.from("dossiers_photos").delete().eq("dossier_id", dossier.id);
      await supabase.from("tasks").delete().eq("dossier_id", dossier.id);
      await supabase.from("factures").delete().eq("dossier_id", dossier.id);
      const { error } = await supabase.from("dossiers").delete().eq("id", dossier.id);
      if (error) throw error;
      onDelete(dossier.id);
    } catch (e: any) {
      alert(`Erreur : ${e.message}`);
    } finally {
      setDeleting(false);
    }
  }

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

  async function reloadDevis() {
    const { data } = await supabase
      .from("devis").select("*")
      .eq("dossier_id", dossier.id)
      .order("created_at", { ascending: false });
    setDevisList((data as Devis[]) || []);
  }

  return (
    <>
      <div className="relative mb-3" style={{ borderRadius: "16px", overflow: "hidden" }}>

        {/* ── Zone rouge derrière ── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-end"
          style={{ background: "rgb(220,38,38)", opacity: bgOpacity, borderRadius: "16px" }}
        >
          <motion.button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-col items-center justify-center gap-1 text-white h-full px-7"
            style={{ scale: iconScale, opacity: iconOpacity }}>
            {deleting
              ? <Loader2 size={22} className="animate-spin" />
              : <Trash2 size={22} />
            }
            <span className="text-[9px] font-black uppercase tracking-wider">
              {deleting ? "..." : "Supprimer"}
            </span>
          </motion.button>
        </motion.div>

        {/* ── Carte draggable ── */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
          dragElastic={{ left: 0.05, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{
            x: dragX,
            background:  expanded ? "var(--card-bg-active)" : "var(--card-bg)",
            borderColor: "var(--card-border)",
            borderRadius: "16px",
            border: "1px solid var(--card-border)",
            position: "relative",
            zIndex: 10,
          }}
          onClick={() => {
            if (revealed) { snapClose(); return; }
            setExpanded((p) => !p);
          }}
          className="cursor-pointer"
        >
          {/* Barre gauche dégradée */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: "linear-gradient(to bottom, #60a5fa, #6366f1, #8b5cf6)" }} />

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

          {/* Contenu déplié */}
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
                    <button onClick={(e) => { e.stopPropagation(); setShowDevis(true); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border active:scale-95 transition-all"
                      style={{ background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--accent)" }}>
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
                        <DevisCard key={d.id} devis={d} dossierId={dossier.id} clientName={client?.name || "Client"}
                          onUpdate={(updated) => setDevisList((p) => p.map((x) => x.id === updated.id ? updated : x))}
                          onDelete={(id) => setDevisList((p) => p.filter((x) => x.id !== id))} />
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
                <button onClick={handleStart} disabled={updating}
                  className="w-full py-3 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  style={{ background: "var(--accent)" }}>
                  {updating ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Démarrer le travail
                </button>
              )}
              {dossier.status === "in_progress" && (
                <button onClick={() => setShowPayModal(true)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                  <CheckCircle size={13} /> Clôturer et encaisser
                </button>
              )}
              {dossier.status === "done" && (
                <div className="w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2"
                  style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                  <CheckCircle size={13} className="text-emerald-500" /> Dossier clôturé
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {showPayModal && <PaymentModal estimatedPrice={dossier.estimated_price} onConfirm={handlePaymentConfirm} onClose={() => setShowPayModal(false)} />}
      {showDevis    && <DevisBottomSheet dossierId={dossier.id} clientName={client?.name || "Client"} onClose={() => setShowDevis(false)} onCreated={reloadDevis} />}
    </>
  );
}