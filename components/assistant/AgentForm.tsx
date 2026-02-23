"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Camera, Image as ImageIcon, X, ChevronDown, Search, Check } from "lucide-react";
import { AgentConfig, Field } from "./agent.config";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface DossierPhoto {
  id: string;
  url: string;
  dossier_id: string;
  dossierLabel?: string;
}

interface Props {
  agent: AgentConfig;
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onGenerate: (mediaBase64?: string) => void;
}

export default function AgentForm({ agent, formData, onChange, onGenerate }: Props) {
  const [preview, setPreview]                     = useState<string | null>(null);
  const [isMobile, setIsMobile]                   = useState(false);
  const [showDossierPicker, setShowDossierPicker] = useState(false);
  const [dossierPhotos, setDossierPhotos]         = useState<DossierPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos]         = useState(false);

  // Multi-client picker
  const [clients, setClients]               = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [clientSearch, setClientSearch]     = useState("");
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  // isValid prend en compte client-picker
  const isValid = agent.fields.every((f) => {
    if (f.type === "client-picker") return selectedClients.length > 0;
    return formData[f.key]?.trim();
  });

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  async function loadClients() {
    setLoadingClients(true);
    const { data } = await supabase
      .from("clients")
      .select("id, name, email, phone")
      .order("name");
    setClients((data as Client[]) || []);
    setLoadingClients(false);
  }

  function toggleClient(client: Client) {
  const exists = selectedClients.find((c) => c.id === client.id);
  const next = exists
    ? selectedClients.filter((c) => c.id !== client.id)
    : [...selectedClients, client];

  setSelectedClients(next);
  onChange("clients", next.map((c) => c.name).join(", "));
  onChange("emails",  next.filter((c) => c.email).map((c) => c.email).join(", "));
}

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  async function loadDossierPhotos() {
    setLoadingPhotos(true);
    const { data } = await supabase
      .from("dossiers_photos")
      .select("*, dossiers(problem, vehicles(brand, model))")
      .order("created_at", { ascending: false })
      .limit(20);
    const photos = (data || []).map((p: any) => ({
      id:           p.id,
      url:          p.url,
      dossier_id:   p.dossier_id,
      dossierLabel: `${p.dossiers?.vehicles?.brand || ""} ${p.dossiers?.vehicles?.model || ""} — ${p.dossiers?.problem || ""}`.trim(),
    }));
    setDossierPhotos(photos);
    setLoadingPhotos(false);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPreview(null);
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current)  cameraRef.current.value  = "";
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto flex-1">

      {/* Champs formulaire */}
      {agent.fields.map((field: Field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            {field.label}
          </label>

          {/* ── Client Picker ── */}
          {field.type === "client-picker" ? (
            <div className="flex flex-col gap-2">

              {/* Clients sélectionnés */}
              {selectedClients.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedClients.map((c) => (
                    <div key={c.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black"
                      style={{ background: `${agent.color}20`, color: agent.color }}>
                      {c.name}
                      <button onClick={() => toggleClient(c)}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton ouvrir picker */}
              <button
                onClick={() => { setShowClientPicker((p) => !p); if (!clients.length) loadClients(); }}
                className="w-full py-2.5 rounded-xl border flex items-center justify-between px-3 transition-all active:scale-[0.97]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                <span className="text-sm font-bold" style={{ color: selectedClients.length ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {selectedClients.length
                    ? `${selectedClients.length} client(s) sélectionné(s)`
                    : "Sélectionner des clients..."}
                </span>
                <ChevronDown size={14} style={{
                  color: "var(--text-muted)",
                  transform: showClientPicker ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s"
                }} />
              </button>

              {/* Dropdown picker */}
              {showClientPicker && (
                <div className="rounded-2xl border overflow-hidden"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>

                  {/* Recherche */}
                  <div className="relative p-2 border-b" style={{ borderColor: "var(--card-border)" }}>
                    <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }} />
                    <input
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold border outline-none"
                      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
                    />
                  </div>

                  {/* Liste */}
                  <div className="max-h-44 overflow-y-auto">
                    {loadingClients ? (
                      <div className="flex justify-center py-4">
                        <div className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: agent.color, borderTopColor: "transparent" }} />
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <p className="text-center text-xs font-bold py-4" style={{ color: "var(--text-muted)" }}>
                        Aucun client trouvé
                      </p>
                    ) : (
                      filteredClients.map((c) => {
                        const selected = selectedClients.some((s) => s.id === c.id);
                        return (
                          <button key={c.id} onClick={() => toggleClient(c)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left border-b last:border-0"
                            style={{
                              background: selected ? `${agent.color}10` : "transparent",
                              borderColor: "var(--card-border)",
                            }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-xs"
                              style={{ background: selected ? agent.color : "var(--card-bg-active)", color: selected ? "#fff" : "var(--text-muted)" }}>
                              {c.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                              {c.email && <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{c.email}</p>}
                            </div>
                            {selected && <Check size={13} style={{ color: agent.color }} />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

          ) : field.type === "select" ? (
            <select value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm font-bold border outline-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
              <option value="">Choisir...</option>
              {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>

          ) : field.type === "textarea" ? (
            <textarea value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder} rows={3}
              className="rounded-xl px-3 py-2.5 text-sm font-bold border outline-none resize-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />

          ) : (
            <input type="text" value={formData[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="rounded-xl px-3 py-2.5 text-sm font-bold border outline-none"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }} />
          )}
        </div>
      ))}

      {/* Section photo */}
      {agent.hasMedia && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            Photo (optionnel)
          </label>

          {preview ? (
            <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: "var(--card-border)" }}>
              <img src={preview} alt="preview" className="w-full h-40 object-cover" />
              <button onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => galleryRef.current?.click()}
                  className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <ImageIcon size={15} style={{ color: agent.color }} />
                  <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Pellicule</span>
                </button>
                {isMobile && (
                  <button onClick={() => cameraRef.current?.click()}
                    className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                    <Camera size={15} style={{ color: agent.color }} />
                    <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Caméra</span>
                  </button>
                )}
              </div>

              {agent.key === "social" && (
                <button
                  onClick={() => { setShowDossierPicker((p) => !p); if (!dossierPhotos.length) loadDossierPhotos(); }}
                  className="w-full py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ background: "var(--card-bg)", borderColor: agent.color, borderStyle: "dashed" }}>
                  <span className="text-xs font-black" style={{ color: agent.color }}>📁 Choisir depuis un dossier</span>
                  <ChevronDown size={13} style={{ color: agent.color,
                    transform: showDossierPicker ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s"
                  }} />
                </button>
              )}

              {showDossierPicker && (
                <div className="rounded-2xl border overflow-hidden"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  {loadingPhotos ? (
                    <div className="flex justify-center py-4">
                      <div className="w-4 h-4 border-2 rounded-full animate-spin"
                        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
                    </div>
                  ) : dossierPhotos.length === 0 ? (
                    <p className="text-center text-xs font-bold py-4" style={{ color: "var(--text-muted)" }}>
                      Aucune photo dans les dossiers
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {dossierPhotos.map((photo) => (
                        <button key={photo.id} onClick={() => { setPreview(photo.url); setShowDossierPicker(false); }}
                          className="relative rounded-xl overflow-hidden aspect-square transition-all active:scale-95">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5"
                            style={{ background: "rgba(0,0,0,0.5)" }}>
                            <p className="text-[8px] text-white truncate font-bold">{photo.dossierLabel}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* Bouton générer */}
      <button onClick={() => onGenerate(preview ?? undefined)} disabled={!isValid}
        className="w-full py-3 rounded-2xl font-black text-sm text-white mt-2 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        style={{ background: isValid ? agent.color : "var(--card-border)", opacity: isValid ? 1 : 0.5 }}>
        <Sparkles size={16} />
        Générer avec l'IA
      </button>
    </div>
  );
}