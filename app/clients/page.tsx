"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Plus, Search, Phone, Mail,
  Car, MapPin, Edit3, ChevronDown, SlidersHorizontal, User
} from "lucide-react";
import SwipeToDelete from "@/components/ui/SwipeToDelete";

interface Vehicle {
  id: string; brand: string; model: string;
  plate: string | null; vin: string | null;
}

interface Client {
  id: string; created_at: string; name: string;
  phone: string | null; email: string | null;
  address: string | null; notes: string | null;
  vehicles?: Vehicle[];
}

// ─── MODALE ───────────────────────────────────────────────────────────────────

function ClientModal({ isOpen, onClose, onSaved, clientToEdit }: {
  isOpen: boolean; onClose: () => void; onSaved: () => void; clientToEdit?: Client | null;
}) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [email, setEmail]     = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes]     = useState("");
  const [saving, setSaving]   = useState(false);

  // Reset des champs à chaque ouverture avec les bonnes données
  useEffect(() => {
    if (!isOpen) return;
    setName(clientToEdit?.name ?? "");
    setPhone(clientToEdit?.phone ?? "");
    setEmail(clientToEdit?.email ?? "");
    setAddress(clientToEdit?.address ?? "");
    setNotes(clientToEdit?.notes ?? "");
  // clientToEdit?.id garantit le re-déclenchement même si l'objet change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clientToEdit?.id]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!name.trim()) return alert("Le nom est obligatoire");
    setSaving(true);
    const payload = {
      name:    name.trim(),
      phone:   phone.trim()   || null,
      email:   email.trim()   || null,
      address: address.trim() || null,
      notes:   notes.trim()   || null,
    };
    if (clientToEdit) {
      const { error } = await supabase.from("clients").update(payload).eq("id", clientToEdit.id);
      if (error) { alert(`Erreur : ${error.message}`); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("clients").insert(payload);
      if (error) { alert(`Erreur : ${error.message}`); setSaving(false); return; }
    }
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm">
      {/* Backdrop cliquable */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet — pb-20 pour passer au dessus de la BottomNav (64px) */}
      <div
        className="relative w-full rounded-t-3xl p-6 space-y-4 overflow-y-auto"
        style={{
          background: "var(--card-bg)",
          paddingBottom: "88px", // au-dessus de la BottomNav
          maxHeight:     "90vh",
        }}>

        {/* Handle */}
        <div className="flex justify-center -mt-2 mb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--card-border)" }} />
        </div>

        <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
          {clientToEdit ? "Modifier le client" : "Nouveau client"}
        </h2>

        <div className="space-y-2.5">
          {[
            { label: "Nom *",     value: name,    set: setName,    placeholder: "Jean Dupont",      type: "text"  },
            { label: "Téléphone", value: phone,   set: setPhone,   placeholder: "06 12 34 56 78",   type: "tel"   },
            { label: "Email",     value: email,   set: setEmail,   placeholder: "jean@email.com",   type: "email" },
            { label: "Adresse",   value: address, set: setAddress, placeholder: "123 rue de Paris", type: "text"  },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider px-1"
                style={{ color: "var(--text-muted)" }}>{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none"
                style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider px-1"
              style={{ color: "var(--text-muted)" }}>Notes internes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Client habituel..."
              className="w-full px-3 py-2.5 rounded-xl border text-sm font-medium outline-none resize-none"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-black border transition-all active:scale-[0.97]"
            style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: "var(--accent)" }}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</> : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COULEURS ─────────────────────────────────────────────────────────────────

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

// ─── CLIENT CARD ──────────────────────────────────────────────────────────────

function ClientCard({ client, onEdit }: { client: Client; onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const color = getColor(client.name);
  const nbV   = client.vehicles?.length || 0;

  return (
    <div
      onClick={() => setExpanded((p) => !p)}
      className="cursor-pointer"
      style={{
        background:   expanded ? "var(--card-bg-active)" : "var(--card-bg)",
        border:       "1px solid var(--card-border)",
        borderRadius: "16px",
      }}>

      {/* Row principal */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
          style={{ background: color.bg, color: color.text }}>
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate" style={{ color: "var(--text-primary)" }}>
            {client.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: color.bg, color: color.text }}>
              {nbV} véhicule{nbV > 1 ? "s" : ""}
            </span>
            {client.phone && (
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                · {client.phone}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {new Date(client.created_at).toLocaleDateString("fr-FR")}
          </span>
          <ChevronDown size={14} style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }} />
        </div>
      </div>

      {/* Contenu expandé */}
      <div className={`overflow-hidden transition-all duration-300 ${
        expanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 pb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="h-px" style={{ background: "var(--card-border)" }} />

          <div className="flex flex-wrap gap-2">
            {client.phone && (
              <a href={`tel:${client.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold active:scale-95 transition-all"
                style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
                <Phone size={11} style={{ color: "var(--accent)" }} /> {client.phone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold active:scale-95 transition-all"
                style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
                <Mail size={11} style={{ color: "var(--accent)" }} />
                <span className="truncate max-w-[120px]">{client.email}</span>
              </a>
            )}
            {client.address && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold"
                style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
                <MapPin size={11} style={{ color: "var(--accent)" }} /> {client.address}
              </div>
            )}
          </div>

          {client.notes && (
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: "var(--accent-light)", borderLeft: "3px solid var(--accent)" }}>
              <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>Note interne</p>
              <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{client.notes}</p>
            </div>
          )}

          {nbV > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Véhicules ({nbV})
              </p>
              {client.vehicles?.map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border"
                  style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--card-bg)" }}>
                    <Car size={13} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>
                      {v.brand} {v.model}
                    </p>
                    {v.plate && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest"
                        style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
                        {v.plate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1">
            <button onClick={onEdit}
              className="w-full py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)", background: "var(--card-bg-active)" }}>
              <Edit3 size={12} /> Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients]             = useState<Client[]>([]);
  const [loading, setLoading]             = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [sortOrder, setSortOrder]         = useState("newest");
  const [showSort, setShowSort]           = useState(false);

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients").select("*, vehicles (*)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setClients(data as Client[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { alert(`Erreur : ${error.message}`); return; }
    setClients((p) => p.filter((c) => c.id !== id));
  }

  const SORT_LABELS: Record<string, string> = {
    newest: "Récents", oldest: "Anciens", az: "A → Z", za: "Z → A",
  };

  const displayed = clients
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.vehicles?.some((v) =>
          v.plate?.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
        )
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortOrder === "az")     return a.name.localeCompare(b.name);
      if (sortOrder === "za")     return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-32 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>Clients</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() => { setEditingClient(null); setShowClientModal(true); }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all active:scale-90"
            style={{ background: "var(--accent)" }}>
            <Plus size={18} />
          </button>
        </div>

        {/* Recherche + tri */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" placeholder="Nom, plaque, tel..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
            </div>
            <div className="relative">
              <button onClick={() => setShowSort((p) => !p)}
                className="h-full px-3 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <SlidersHorizontal size={13} style={{ color: "var(--accent)" }} />
                <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
                  {SORT_LABELS[sortOrder]}
                </span>
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 rounded-2xl border overflow-hidden shadow-xl"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", minWidth: "140px" }}>
                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                      <button key={key} onClick={() => { setSortOrder(key); setShowSort(false); }}
                        className="w-full px-4 py-2.5 text-left text-xs font-black transition-all"
                        style={{
                          color:      sortOrder === key ? "var(--accent)" : "var(--text-primary)",
                          background: sortOrder === key ? "var(--accent-light)" : "transparent",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="text-[11px] px-1" style={{ color: "var(--text-muted)" }}>
              {displayed.length} résultat{displayed.length > 1 ? "s" : ""} pour "{searchQuery}"
            </p>
          )}
        </div>

        {/* Hint */}
        {!loading && clients.length > 0 && (
          <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
            ← Swipe gauche pour supprimer
          </p>
        )}

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--card-bg)" }}>
              <User size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-black" style={{ color: "var(--text-muted)" }}>
              {searchQuery ? "Aucun client trouvé" : "Aucun client"}
            </p>
            {!searchQuery && (
              <button onClick={() => { setEditingClient(null); setShowClientModal(true); }}
                className="px-4 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95"
                style={{ background: "var(--accent)" }}>
                + Ajouter un client
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((client) => (
              <SwipeToDelete key={client.id} onDelete={() => handleDelete(client.id)}>
                <ClientCard
                  client={client}
                  onEdit={() => { setEditingClient(client); setShowClientModal(true); }}
                />
              </SwipeToDelete>
            ))}
          </div>
        )}
      </div>

      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSaved={fetchClients}
        clientToEdit={editingClient}
      />
    </AppContainer>
  );
}