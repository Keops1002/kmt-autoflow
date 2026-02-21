"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Camera, Image as ImageIcon, X, ChevronDown } from "lucide-react";
import { AgentConfig, Field } from "./agent.config";
import { supabase } from "@/lib/supabase";

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
  const isValid   = agent.fields.every((f) => formData[f.key]?.trim());
  const [preview, setPreview]           = useState<string | null>(null);
  const [isMobile, setIsMobile]         = useState(false);
  const [showDossierPicker, setShowDossierPicker] = useState(false);
  const [dossierPhotos, setDossierPhotos]         = useState<DossierPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos]         = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

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

  function selectDossierPhoto(url: string) {
    setPreview(url);
    setShowDossierPicker(false);
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-4 overflow-y-auto flex-1">

      {/* Champs formulaire */}
      {agent.fields.map((field: Field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            {field.label}
          </label>

          {field.type === "select" ? (
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
            <div className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: "var(--card-border)" }}>
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
                {/* Pellicule */}
                <button onClick={() => galleryRef.current?.click()}
                  className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <ImageIcon size={15} style={{ color: agent.color }} />
                  <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Pellicule</span>
                </button>

                {/* Caméra mobile seulement */}
                {isMobile && (
                  <button onClick={() => cameraRef.current?.click()}
                    className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                    <Camera size={15} style={{ color: agent.color }} />
                    <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Caméra</span>
                  </button>
                )}
              </div>

              {/* Depuis un dossier — uniquement pour Social */}
              {agent.key === "social" && (
                <button
                  onClick={() => { setShowDossierPicker((p) => !p); if (!dossierPhotos.length) loadDossierPhotos(); }}
                  className="w-full py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  style={{ background: "var(--card-bg)", borderColor: agent.color, borderStyle: "dashed" }}>
                  <span className="text-xs font-black" style={{ color: agent.color }}>
                    📁 Choisir depuis un dossier
                  </span>
                  <ChevronDown size={13} style={{ color: agent.color,
                    transform: showDossierPicker ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s"
                  }} />
                </button>
              )}

              {/* Picker photos dossiers */}
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
                        <button key={photo.id} onClick={() => selectDossierPhoto(photo.url)}
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