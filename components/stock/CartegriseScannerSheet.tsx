"use client";

import { useRef, useState } from "react";
import { X, Camera, Image as ImageIcon, Loader2, Check, Sparkles } from "lucide-react";

interface CarteGriseData {
  marque?: string;
  modele?: string;
  version?: string;
  annee?: string;
  mise_en_circulation?: string;
  couleur?: string;
  type_vehicule?: string;
  carburant?: string;
  boite?: string;
  puissance_din?: string;
  puissance_fiscale?: string;
  nb_portes?: string;
  nb_places?: string;
  immatriculation?: string;
  vin?: string;
}

interface Props {
  onClose: () => void;
  onDataExtracted: (data: CarteGriseData) => void;
}

export default function CartegriseScannerSheet({ onClose, onDataExtracted }: Props) {
  const [showTips, setShowTips] = useState(true);
  const [preview, setPreview]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<CarteGriseData | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  const webhookUrl = process.env.NEXT_PUBLIC_N8N_CARTEGRISE_WEBHOOK;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function analyser() {
    if (!preview) return;
    setLoading(true);
    try {
      if (webhookUrl) {
        const res  = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: preview }),
        });
        const data = await res.json();
        setResult(data);
      } else {
        alert("Webhook N8N non configuré. Ajoutez NEXT_PUBLIC_N8N_CARTEGRISE_WEBHOOK dans .env.local");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  }

  function appliquer() {
    if (!result) return;
    onDataExtracted(result);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 right-0 z-[70] rounded-t-3xl overflow-hidden"
        style={{
          bottom: "64px",
          background: "var(--card-bg)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
          maxHeight: "85vh",
        }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--card-border)" }} />
        </div>

        <div className="px-5 pb-6 space-y-4 overflow-y-auto max-h-[75vh]">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(79,70,229,0.15)" }}>
                <span className="text-base">🪪</span>
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>
                  Scanner la carte grise
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  L'IA extrait les infos automatiquement
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl border flex items-center justify-center"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {/* ── Alerte conseils ── */}
          {showTips && (
            <div className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "#f59e0b", background: "rgba(245,158,11,0.08)" }}>
              <div className="px-4 py-3 space-y-2.5">
                <p className="text-xs font-black" style={{ color: "#f59e0b" }}>
                  ⚠️ Avant de scanner — lisez ceci
                </p>
                <div className="space-y-2">
                  {[
                    { icon: "💡", text: "Zone bien éclairée, évite les reflets sur le plastique" },
                    { icon: "📐", text: "Carte grise bien centrée, tout le document visible" },
                    { icon: "🔍", text: "Image nette et lisible, pas de flou ni d'ombre" },
                    { icon: "⚠️", text: "L'IA peut faire des erreurs — vérifie toujours les données avant d'appliquer" },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm shrink-0">{tip.icon}</span>
                      <p className="text-[11px] font-medium leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}>{tip.text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowTips(false)}
                  className="w-full py-2.5 rounded-xl font-black text-xs text-white mt-1 transition-all active:scale-[0.98]"
                  style={{ background: "#f59e0b" }}>
                  J'ai compris, continuer →
                </button>
              </div>
            </div>
          )}

          {/* ── Contenu principal (après tips) ── */}
          {!showTips && (
            <>
              {/* Preview photo */}
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden border"
                  style={{ borderColor: "var(--card-border)" }}>
                  <img src={preview} alt="carte grise" className="w-full h-44 object-cover" />
                  <button onClick={() => { setPreview(null); setResult(null); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.6)" }}>
                    <X size={13} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 gap-2"
                    style={{ borderColor: "var(--card-border)" }}>
                    <span className="text-3xl">🪪</span>
                    <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                      Prends une photo de la carte grise
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Assure-toi que tout le texte est lisible
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => galleryRef.current?.click()}
                      className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                      <ImageIcon size={14} style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Pellicule</span>
                    </button>
                    <button onClick={() => cameraRef.current?.click()}
                      className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                      <Camera size={14} style={{ color: "var(--accent)" }} />
                      <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Caméra</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bouton analyser */}
              {preview && !result && (
                <button onClick={analyser} disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-[0.98]"
                  style={{ background: "var(--accent)" }}>
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Analyse en cours...</>
                    : <><Sparkles size={15} /> Analyser avec l'IA</>
                  }
                </button>
              )}

              {/* Résultat */}
              {result && (
                <div className="space-y-3">
                  <div className="rounded-2xl border overflow-hidden"
                    style={{ borderColor: "var(--card-border)" }}>
                    <div className="px-3 py-2 border-b"
                      style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                      <p className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}>Données extraites — vérifiez bien</p>
                    </div>
                    <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                      {[
                        { label: "Marque",          value: result.marque              },
                        { label: "Modèle",          value: result.modele              },
                        { label: "Version",         value: result.version             },
                        { label: "Immatriculation", value: result.immatriculation     },
                        { label: "VIN",             value: result.vin                 },
                        { label: "1ère MEC",        value: result.mise_en_circulation },
                        { label: "Couleur",         value: result.couleur             },
                        { label: "Carburant",       value: result.carburant           },
                        { label: "Puissance DIN",   value: result.puissance_din       },
                        { label: "Puissance fisc.", value: result.puissance_fiscale   },
                        { label: "Nb places",       value: result.nb_places           },
                      ].filter((r) => r.value).map((row) => (
                        <div key={row.label} className="flex items-center justify-between px-3 py-2">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{row.label}</span>
                          <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Avertissement avant application */}
                  <div className="px-3 py-2 rounded-xl"
                    style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <p className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>
                      ⚠️ Vérifiez les données ci-dessus avant d'appliquer — l'IA peut faire des erreurs
                    </p>
                  </div>

                  <button onClick={appliquer}
                    className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{ background: "var(--accent)" }}>
                    <Check size={15} /> Appliquer à la fiche véhicule
                  </button>

                  <button onClick={() => { setResult(null); setPreview(null); }}
                    className="w-full py-2.5 rounded-2xl text-xs font-black border transition-all active:scale-[0.98]"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
                    ↺ Recommencer
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    </>
  );
}