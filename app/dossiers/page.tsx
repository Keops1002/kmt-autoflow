"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Trash2, ChevronDown, Play, CheckCircle,
  X, User, Car, Wrench, BadgeEuro, FileText,
} from "lucide-react";
import DevisBottomSheet from "@/components/devis/DevisBottomSheet";
import DevisCard from "@/components/devis/DevisCard";
import type { Devis } from "@/components/devis/devis.types";

interface Task {
  id: string;
  title: string;
  priority: string;
  is_done: boolean;
}

interface Dossier {
  id: string;
  problem: string;
  status: string;
  payment_status: string;
  estimated_price: number | null;
  paid_amount: number | null;
  paid_at: string | null;
  tasks?: Task[];
  devis?: Devis[];
  vehicles: {
    brand: string;
    model: string;
    plate?: string;
    clients: { name: string; phone?: string; email?: string } | null;
  } | null;
}

function statusStyle(status: string) {
  switch (status) {
    case "done":        return { badge: "bg-emerald-100 text-emerald-700", label: "Terminé" };
    case "in_progress": return { badge: "bg-blue-100 text-blue-700",       label: "En cours" };
    default:            return { badge: "bg-amber-100 text-amber-700",     label: "En attente" };
  }
}

function PaymentModal({ estimatedPrice, onConfirm, onClose }: {
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
      <div className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card-bg-active)" }}>
        <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Clôturer</p>
            <h3 className="text-white font-black text-lg mt-1">Confirmer le paiement</h3>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>
              Montant encaissé (€)
            </label>
            <input
              type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border text-lg font-bold focus:outline-none"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />
            {estimatedPrice && Number(amount) !== estimatedPrice && (
              <p className="text-xs text-amber-500 font-medium px-1">Estimation : {estimatedPrice} €</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-sm"
              style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!amount || saving}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? "..." : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskSection({ dossierId, initialTasks, hideHeader }: {
  dossierId: string;
  initialTasks: Task[];
  hideHeader?: boolean;
}) {
  const [tasks, setTasks]         = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle]   = useState("");
  const [adding, setAdding]       = useState(false);
  const [showInput, setShowInput] = useState(false);

  async function handleToggle(task: Task) {
    const updated = !task.is_done;
    setTasks((p) => p.map((t) => t.id === task.id ? { ...t, is_done: updated } : t));
    await supabase.from("tasks").update({ is_done: updated }).eq("id", task.id);
  }

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ dossier_id: dossierId, title: newTitle.trim(), priority: "medium", is_done: false })
      .select().single();
    if (!error && data) setTasks((p) => [...p, data as Task]);
    setNewTitle(""); setShowInput(false); setAdding(false);
  }

  async function handleDelete(id: string) {
    setTasks((p) => p.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  const done  = tasks.filter((t) => t.is_done).length;
  const total = tasks.length;

  return (
    <div className="space-y-2">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-[9px] font-black uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}>Tâches</p>
            {total > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
                {done}/{total}
              </span>
            )}
          </div>
          <button onClick={() => setShowInput((p) => !p)}
            className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            +
          </button>
        </div>
      )}

      {hideHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {total > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
                {done}/{total}
              </span>
            )}
          </div>
          <button onClick={() => setShowInput((p) => !p)}
            className="w-5 h-5 rounded-full flex items-center justify-center font-black text-xs"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            +
          </button>
        </div>
      )}

      {total > 0 && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
          <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }} />
        </div>
      )}

      {showInput && (
        <div className="flex gap-1.5">
          <input autoFocus value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nouvelle tâche..."
            className="flex-1 px-2 py-1.5 rounded-xl border text-xs focus:outline-none"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
          <button onClick={handleAdd} disabled={adding || !newTitle.trim()}
            className="px-2 py-1.5 rounded-xl text-white font-bold text-[10px] disabled:opacity-40"
            style={{ background: "var(--accent)" }}>
            {adding ? <Loader2 size={10} className="animate-spin" /> : "OK"}
          </button>
        </div>
      )}

      {tasks.length === 0 && !showInput && (
        <p className="text-[10px] italic" style={{ color: "var(--text-muted)" }}>Aucune tâche</p>
      )}

      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2 group">
          <button onClick={() => handleToggle(task)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              task.is_done ? "bg-emerald-500 border-emerald-500" : ""
            }`}
            style={!task.is_done ? { borderColor: "var(--text-muted)" } : {}}>
            {task.is_done && <CheckCircle size={9} className="text-white" />}
          </button>
          <p className={`flex-1 text-xs transition-all ${task.is_done ? "line-through" : ""}`}
            style={{ color: task.is_done ? "var(--text-muted)" : "var(--text-secondary)" }}>
            {task.title}
          </p>
          <button onClick={() => handleDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all">
            <X size={8} />
          </button>
        </div>
      ))}
    </div>
  );
}

function DossierCard({ dossier, onDelete, onUpdate }: {
  dossier: Dossier;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Dossier>) => void;
}) {
  const [expanded, setExpanded]         = useState(false);
  const [updating, setUpdating]         = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDevis, setShowDevis]       = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [devisList, setDevisList]       = useState<Devis[]>(dossier.devis || []);
  const [devisOpen, setDevisOpen]       = useState(true);
  const [tachesOpen, setTachesOpen]     = useState(true);

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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Supprimer ce dossier ?")) return;
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
      <div
        className="relative rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background: expanded ? "var(--card-bg-active)" : "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Barre gauche */}
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
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={handleDelete} disabled={deleting}
                className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 transition-all active:scale-90">
                {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              </button>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                <ChevronDown size={13} />
              </div>
            </div>
          </div>
          {!expanded && dossier.estimated_price && (
            <p className="text-sm font-black mt-1.5" style={{ color: "var(--accent)" }}>
              {dossier.estimated_price} €
            </p>
          )}
        </div>

        {/* Contenu expandé */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="px-4 pb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="h-px" style={{ background: "var(--card-border)" }} />

            {/* Client */}
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

            {/* Véhicule */}
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

            {/* Problème */}
            <div className="flex items-start gap-2">
              <Wrench size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Problème</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{dossier.problem}</p>
              </div>
            </div>

            {/* Paiement */}
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

            {/* ── Section Devis ── */}
<div className="space-y-2">
  <div className="h-px" style={{ background: "var(--card-border)" }} />
  <div
    className="w-full flex items-center justify-between cursor-pointer"
    onClick={() => setDevisOpen((p) => !p)}
  >
    <p className="text-[10px] font-black uppercase tracking-wider"
      style={{ color: "var(--text-muted)" }}>Devis</p>
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {devisList.length > 0 && (
        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
          {devisList.length}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); setShowDevis(true); }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black border active:scale-95 transition-all"
        style={{ background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--accent)" }}>
        <FileText size={10} /> Nouveau
      </button>
      <ChevronDown size={13}
        className={`transition-transform duration-300 ${devisOpen ? "rotate-180" : ""}`}
        style={{ color: "var(--text-muted)" }} />
    </div>
  </div>
  <div className={`overflow-hidden transition-all duration-300 ${
    devisOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
  }`}>
    <div className="space-y-2">
      {devisList.length === 0 ? (
        <p className="text-[10px] italic" style={{ color: "var(--text-muted)" }}>Aucun devis</p>
      ) : (
        devisList.map((d) => (
          <DevisCard
            key={d.id} devis={d}
            dossierId={dossier.id}
            clientName={client?.name || "Client"}
            onUpdate={(updated) => setDevisList((p) => p.map((x) => x.id === updated.id ? updated : x))}
            onDelete={(id) => setDevisList((p) => p.filter((x) => x.id !== id))}
          />
        ))
      )}
    </div>
  </div>
</div>

{/* ── Section Tâches ── */}
<div className="space-y-2">
  <div className="h-px" style={{ background: "var(--card-border)" }} />
  <div
    className="w-full flex items-center justify-between cursor-pointer"
    onClick={() => setTachesOpen((p) => !p)}
  >
    <p className="text-[10px] font-black uppercase tracking-wider"
      style={{ color: "var(--text-muted)" }}>Tâches</p>
    <div className="flex items-center gap-2">
      {tasksTotal > 0 && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
          style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}>
          {tasksDone}/{tasksTotal}
        </span>
      )}
      <ChevronDown size={13}
        className={`transition-transform duration-300 ${tachesOpen ? "rotate-180" : ""}`}
        style={{ color: "var(--text-muted)" }} />
    </div>
  </div>
  <div className={`overflow-hidden transition-all duration-300 ${
    tachesOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
  }`}>
    <TaskSection dossierId={dossier.id} initialTasks={tasks} hideHeader />
  </div>
</div>

            <div className="h-px" style={{ background: "var(--card-border)" }} />

            {/* Actions statut */}
            {dossier.status === "pending" && (
              <button onClick={handleStart} disabled={updating}
                className="w-full py-3 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ background: "var(--accent)" }}>
                {updating ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                Démarrer le travail
              </button>
            )}
            {dossier.status === "in_progress" && (
              <button onClick={() => setShowPayModal(true)}
                className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                <CheckCircle size={13} />
                Clôturer et encaisser
              </button>
            )}
            {dossier.status === "done" && (
              <div className="w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2"
                style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                <CheckCircle size={13} className="text-emerald-500" />
                Dossier clôturé
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayModal && (
        <PaymentModal
          estimatedPrice={dossier.estimated_price}
          onConfirm={handlePaymentConfirm}
          onClose={() => setShowPayModal(false)}
        />
      )}

      {showDevis && (
        <DevisBottomSheet
          dossierId={dossier.id}
          clientName={client?.name || "Client"}
          onClose={() => setShowDevis(false)}
          onCreated={reloadDevis}
        />
      )}
    </>
  );
}

export default function DossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // Charge le cache immédiatement
    const cached = sessionStorage.getItem("dossiers_cache");
    if (cached) {
      setDossiers(JSON.parse(cached));
      setLoading(false);
    }
    // Fetch en arrière-plan quand même
    fetchDossiers();
  }, []);

  async function fetchDossiers() {
  const { data, error } = await supabase
    .from("dossiers")
    .select(`
      id, problem, status, payment_status,
      estimated_price, paid_amount, paid_at,
      tasks ( id, title, priority, is_done ),
      devis ( id, numero, status, tva_enabled, signature_data, signed_at, total_ht, total_tva, total_ttc, created_at, facture_id ),
      vehicles:vehicle_id (
        brand, model, plate,
        clients:client_id ( name, phone, email )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) { console.error(error); return; }
  const result = (data as unknown as Dossier[]) || [];

  const newJSON = JSON.stringify(result);
  const cached  = sessionStorage.getItem("dossiers_cache");
  if (newJSON !== cached) {
    setDossiers(result);
    sessionStorage.setItem("dossiers_cache", newJSON);
  }
  setLoading(false);
}
  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-40 space-y-3">
        <div className="flex items-center justify-between px-2 mb-2">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>Dossiers</h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ color: "var(--text-muted)", background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            {dossiers.length} dossier{dossiers.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading && (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
        <div className="pl-4 pr-3 pt-3 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 rounded-full animate-pulse"
                style={{ background: "var(--card-border)" }} />
              <div className="h-3 w-24 rounded-full animate-pulse"
                style={{ background: "var(--card-border)" }} />
            </div>
            <div className="h-6 w-16 rounded-full animate-pulse"
              style={{ background: "var(--card-border)" }} />
          </div>
          <div className="h-3 w-16 rounded-full animate-pulse"
            style={{ background: "var(--card-border)" }} />
        </div>
      </div>
    ))}
  </div>
)}

        {!loading && dossiers.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun dossier pour le moment</p>
          </div>
        )}

        {dossiers.map((dossier) => (
          <DossierCard key={dossier.id} dossier={dossier}
            onDelete={(id) => setDossiers((p) => p.filter((d) => d.id !== id))}
            onUpdate={(id, patch) => setDossiers((p) => p.map((d) => d.id === id ? { ...d, ...patch } : d))}
          />
        ))}
      </div>
    </AppContainer>
  );


  
}

