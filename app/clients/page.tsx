"use client";

import { useEffect, useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Search, ListFilter, User, Phone, Mail, Car, MapPin, Edit3, Trash2, ChevronDown } from "lucide-react";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string | null;
  vin: string | null;
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

// ----------------------------------------------------------------------
// COMPOSANT MODALE (Création / Édition Client)
// ----------------------------------------------------------------------

function ClientModal({ 
  isOpen, onClose, onSaved, clientToEdit 
}: { 
  isOpen: boolean; onClose: () => void; onSaved: () => void; clientToEdit?: Client | null;
}) {
  const [name, setName]       = useState(clientToEdit?.name || "");
  const [phone, setPhone]     = useState(clientToEdit?.phone || "");
  const [email, setEmail]     = useState(clientToEdit?.email || "");
  const [address, setAddress] = useState(clientToEdit?.address || "");
  const [notes, setNotes]     = useState(clientToEdit?.notes || "");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(clientToEdit?.name || "");
      setPhone(clientToEdit?.phone || "");
      setEmail(clientToEdit?.email || "");
      setAddress(clientToEdit?.address || "");
      setNotes(clientToEdit?.notes || "");
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  async function handleSave() {
    if (!name.trim()) return alert("Le nom est obligatoire");
    setSaving(true);
    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    };

    if (clientToEdit) {
      await supabase.from("clients").update(payload).eq("id", clientToEdit.id);
    } else {
      await supabase.from("clients").insert(payload);
    }
    
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl p-6 space-y-4" style={{ background: "var(--card-bg)" }}>
        <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
          {clientToEdit ? "Modifier client" : "Nouveau client"}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Nom *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border font-bold focus:outline-none"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              placeholder="Jean Dupont" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Téléphone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
              className="w-full px-4 py-3 rounded-2xl border font-medium focus:outline-none"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              placeholder="06 12 34 56 78" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="w-full px-4 py-3 rounded-2xl border font-medium focus:outline-none"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              placeholder="jean@email.com" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Adresse</label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border font-medium focus:outline-none"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              placeholder="123 rue de Paris" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: "var(--text-muted)" }}>Notes internes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full px-4 py-3 rounded-2xl border font-medium focus:outline-none resize-none"
              style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
              placeholder="Client habituel..." />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold" style={{ background: "var(--card-bg-active)", color: "var(--text-secondary)" }}>Annuler</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2" style={{ background: "var(--accent)" }}>
            {saving && <Loader2 size={16} className="animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPOSANT CARTE CLIENT
// ----------------------------------------------------------------------

function ClientCard({ client, onEdit, onDelete }: { 
  client: Client; onEdit: () => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer"
      style={{ background: expanded ? "var(--card-bg-active)" : "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black leading-tight" style={{ color: "var(--text-primary)" }}>{client.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {client.vehicles?.length || 0} véhicule{(client.vehicles?.length || 0) > 1 ? "s" : ""}
                </p>
                <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>·</span>
                <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                  {new Date(client.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 space-y-4" onClick={e => e.stopPropagation()}>
          <div className="h-px" style={{ background: "var(--card-border)" }} />
          
          <div className="grid grid-cols-2 gap-3">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="flex items-center gap-2 p-3 rounded-xl border active:scale-95 transition-all" style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                <Phone size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{client.phone}</span>
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-2 p-3 rounded-xl border active:scale-95 transition-all" style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                <Mail size={14} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{client.email}</span>
              </a>
            )}
            {client.address && (
              <div className="col-span-2 flex items-center gap-2 p-3 rounded-xl border" style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                <MapPin size={14} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-bold leading-tight" style={{ color: "var(--text-primary)" }}>{client.address}</span>
              </div>
            )}
            {client.notes && (
              <div className="col-span-2 p-3 rounded-xl border" style={{ background: "var(--accent-light)", borderColor: "var(--accent)", opacity: 0.8 }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>Notes internes</p>
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{client.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Véhicules ({client.vehicles?.length || 0})</p>
            </div>
            {client.vehicles?.length === 0 ? (
              <p className="text-xs italic p-3 rounded-xl border" style={{ color: "var(--text-muted)", background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>Aucun véhicule enregistré.</p>
            ) : (
              <div className="space-y-2">
                {client.vehicles?.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center" style={{ background: "var(--card-bg)" }}>
                        <Car size={14} style={{ color: "var(--text-secondary)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-black leading-none mb-1" style={{ color: "var(--text-primary)" }}>{v.brand} {v.model}</p>
                        {v.plate && <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest" style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>{v.plate}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px" style={{ background: "var(--card-border)" }} />
          
          <div className="flex gap-2">
            <button onClick={onEdit} className="flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
              <Edit3 size={14} /> Modifier
            </button>
            <button onClick={onDelete} className="flex-1 py-2.5 rounded-xl bg-red-50/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// PAGE PRINCIPALE
// ----------------------------------------------------------------------

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient]     = useState<Client | null>(null);

  // Filtre et Tri
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder]     = useState("newest"); // newest, oldest, az, za

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select(`*, vehicles (*)`)
      .order("created_at", { ascending: false });
    
    if (error) console.error(error);
    else setClients(data as Client[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce client et tous ses véhicules ?")) return;
    await supabase.from("clients").delete().eq("id", id);
    setClients(p => p.filter(c => c.id !== id));
  }

  // LOGIQUE DE RECHERCHE ET DE TRI
  const displayedClients = clients
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchName   = c.name.toLowerCase().includes(q);
      const matchPhone  = c.phone?.toLowerCase().includes(q);
      const matchEmail  = c.email?.toLowerCase().includes(q);
      const matchVehicle = c.vehicles?.some(v => 
        v.plate?.toLowerCase().includes(q) || 
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
      return matchName || matchPhone || matchEmail || matchVehicle;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortOrder === "az") return a.name.localeCompare(b.name);
      if (sortOrder === "za") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <AppContainer>
      <div className="px-4 pt-12 pb-40 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>Clients</h1>
          <button 
            onClick={() => { setEditingClient(null); setShowClientModal(true); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* 🎛️ BARRE DE RECHERCHE ET DE TRI */}
        <div className="flex flex-col gap-3 px-2 mb-2">
          
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: "var(--text-muted)" }} />
            <input 
              type="text"
              placeholder="Rechercher nom, plaque, tel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
            />
          </div>
          
          {/* Sélecteur de tri */}
          <div className="flex items-center gap-2 px-1">
            <ListFilter size={14} style={{ color: "var(--text-muted)" }} />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
              style={{ color: "var(--text-secondary)" }}
            >
              <option value="newest">Ajouts récents</option>
              <option value="oldest">Anciens clients</option>
              <option value="az">Nom (A à Z)</option>
              <option value="za">Nom (Z à A)</option>
            </select>
            <span className="ml-auto text-xs font-bold" style={{ color: "var(--text-muted)" }}>
              {displayedClients.length} client{displayedClients.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" size={24} style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        {/* État vide */}
        {!loading && displayedClients.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-3xl border border-dashed" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <User size={32} className="mb-3" style={{ color: "var(--card-border)" }} />
            <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>Aucun client trouvé</p>
            {searchQuery ? (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Essayez une autre recherche.</p>
            ) : (
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Ajoutez votre premier client en cliquant sur le +</p>
            )}
          </div>
        )}

        {/* Liste */}
        <div className="space-y-3">
          {displayedClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onEdit={() => { setEditingClient(client); setShowClientModal(true); }}
              onDelete={() => handleDelete(client.id)}
            />
          ))}
        </div>
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