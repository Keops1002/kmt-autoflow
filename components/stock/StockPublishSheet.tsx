"use client";

import { useState } from "react";
import { X, ExternalLink, Copy, Check, Sparkles, Loader2, FileText } from "lucide-react";
import { StockVehicule } from "./stock.types";

interface Props {
  v: StockVehicule;
  onClose: () => void;
}

interface AnnonceResult {
  titre: string;
  description: string;
  prix: string;
}

export default function StockPublishSheet({ v, onClose }: Props) {
  const [loading, setLoading]     = useState(false);
  const [annonce, setAnnonce]     = useState<AnnonceResult | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);

  const webhookUrl = process.env.NEXT_PUBLIC_N8N_LEBONCOIN_WEBHOOK;

  async function genererAnnonce() {
    setLoading(true);
    try {
      const payload = {
        marque:              v.marque,
        modele:              v.modele,
        version:             v.version,
        annee:               v.annee,
        kilometrage:         v.kilometrage,
        carburant:           v.carburant,
        boite:               v.boite,
        couleur:             v.couleur,
        puissance_din:       v.puissance_din,
        puissance_fiscale:   v.puissance_fiscale,
        nb_portes:           v.nb_portes,
        nb_places:           v.nb_places,
        crit_air:            v.crit_air,
        type_vehicule:       v.type_vehicule,
        mise_en_circulation: v.mise_en_circulation,
        prix:                v.prix,
        tva_recuperable:     v.tva_recuperable,
        points_forts:        v.points_forts,
        equipements:         v.equipements?.liste || [],
        description:         v.description,
        plateforme:          "leboncoin",
      };

      if (webhookUrl) {
        const res  = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setAnnonce({
          titre:       data.titre       || "",
          description: data.description || "",
          prix:        data.prix        || String(v.prix ?? ""),
        });
      } else {
        // Fallback local si pas de webhook configuré
        const equipements = v.equipements?.liste?.slice(0, 4).join(", ") || "";
        const points = v.points_forts?.slice(0, 3).join(" · ") || "";
        setAnnonce({
          titre: `${v.marque} ${v.modele}${v.version ? " " + v.version : ""} - ${v.boite ?? ""} - ${v.carburant ?? ""}`,
          description: `${v.marque} ${v.modele}${v.version ? " " + v.version : ""}\n${v.annee ?? ""} · ${v.kilometrage?.toLocaleString() ?? ""} km · ${v.carburant ?? ""} · ${v.boite ?? ""}\n${v.couleur ? "Couleur : " + v.couleur + "\n" : ""}${v.puissance_din ? v.puissance_din + " ch · " : ""}${v.nb_portes ? v.nb_portes + " portes · " : ""}${v.nb_places ? v.nb_places + " places\n" : ""}\n${points ? "✅ " + points + "\n" : ""}${equipements ? "\nÉquipements : " + equipements : ""}\n\n${v.description ?? ""}\n\nPrix : ${v.prix?.toLocaleString() ?? ""} €${v.tva_recuperable ? " (TVA récupérable)" : ""}`,
          prix: String(v.prix ?? ""),
        });
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  }

  function copier(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
     {/* Backdrop */}
<div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />

{/* Sheet */}
<div className="fixed left-0 right-0 z-[70] rounded-t-3xl overflow-hidden"
  style={{
    bottom: "64px",
    background: "var(--card-bg)",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
    maxHeight: "75vh",
  }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--card-border)" }} />
        </div>

        <div className="px-5 pb-8 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(249,115,22,0.15)" }}>
                <span className="text-base">🏷️</span>
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>Publier sur LeBonCoin</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {v.marque} {v.modele} · {v.prix?.toLocaleString()} €
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl border flex items-center justify-center"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {/* Bouton générer */}
          {!annonce && (
  <div className="space-y-2">
    {/* Option 1 — Génération IA via N8N */}
    <button onClick={genererAnnonce} disabled={loading}
      className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-[0.98]"
      style={{ background: "#f97316" }}>
      {loading
        ? <><Loader2 size={15} className="animate-spin" /> Génération en cours...</>
        : <><Sparkles size={15} /> Générer avec l'IA (N8N)</>
      }
    </button>

    {/* Option 2 — Remplissage manuel */}
    <button onClick={() => setAnnonce({
      titre:       [v.marque, v.modele, v.version, v.boite, v.carburant].filter(Boolean).join(" - "),
      description: [
        `${v.marque} ${v.modele}${v.version ? " " + v.version : ""}`,
        `${v.annee ?? ""} · ${v.kilometrage?.toLocaleString() ?? ""} km · ${v.carburant ?? ""} · ${v.boite ?? ""}`,
        v.couleur ? `Couleur : ${v.couleur}` : "",
        v.puissance_din ? `${v.puissance_din} ch · ${v.nb_portes ?? ""} portes · ${v.nb_places ?? ""} places` : "",
        "",
        ...(v.points_forts?.filter(Boolean).map(p => `✅ ${p}`) || []),
        (v.equipements?.liste || []).filter(Boolean).length > 0
          ? `\nÉquipements :\n- ${(v.equipements.liste).filter(Boolean).join("\n- ")}` : "",
        "",
        v.description ?? "",
        "",
        `Prix : ${v.prix?.toLocaleString() ?? ""} €${v.tva_recuperable ? " (TVA récupérable)" : ""}`,
      ].filter(Boolean).join("\n").trim(),
      prix: String(v.prix ?? ""),
    })}
      className="w-full py-3.5 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
      <FileText size={15} />
      Remplissage automatique basique
    </button>

    <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
      L'IA nécessite un webhook N8N configuré · Le basique utilise les infos du véhicule
    </p>
  </div>
)}

          {/* Résultat */}
          {annonce && (
            <div className="space-y-3">

              {/* Titre */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "var(--card-border)" }}>
                <div className="flex items-center justify-between px-3 py-2 border-b"
                  style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>Titre</p>
                  <button onClick={() => copier("titre", annonce.titre)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all"
                    style={{ background: copied === "titre" ? "#f97316" : "var(--card-bg)", color: copied === "titre" ? "#fff" : "var(--text-muted)" }}>
                    {copied === "titre" ? <><Check size={10} /> Copié</> : <><Copy size={10} /> Copier</>}
                  </button>
                </div>
                <p className="px-3 py-2.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {annonce.titre}
                </p>
              </div>

              {/* Description */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "var(--card-border)" }}>
                <div className="flex items-center justify-between px-3 py-2 border-b"
                  style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>Description</p>
                  <button onClick={() => copier("desc", annonce.description)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all"
                    style={{ background: copied === "desc" ? "#f97316" : "var(--card-bg)", color: copied === "desc" ? "#fff" : "var(--text-muted)" }}>
                    {copied === "desc" ? <><Check size={10} /> Copié</> : <><Copy size={10} /> Copier</>}
                  </button>
                </div>
                <pre className="px-3 py-2.5 text-xs whitespace-pre-wrap leading-relaxed"
                  style={{ color: "var(--text-secondary)", fontFamily: "inherit" }}>
                  {annonce.description}
                </pre>
              </div>

              {/* Prix */}
              <div className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "var(--card-border)" }}>
                <div className="flex items-center justify-between px-3 py-2 border-b"
                  style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>
                  <p className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>Prix</p>
                  <button onClick={() => copier("prix", annonce.prix)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all"
                    style={{ background: copied === "prix" ? "#f97316" : "var(--card-bg)", color: copied === "prix" ? "#fff" : "var(--text-muted)" }}>
                    {copied === "prix" ? <><Check size={10} /> Copié</> : <><Copy size={10} /> Copier</>}
                  </button>
                </div>
                <p className="px-3 py-2.5 text-sm font-black" style={{ color: "#f97316" }}>
                  {annonce.prix} €
                </p>
              </div>

              {/* Bouton Tout copier + Ouvrir LBC */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => copier("all", `${annonce.titre}\n\n${annonce.description}\n\nPrix : ${annonce.prix} €`)}
                  className="flex-1 py-3 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
                  {copied === "all" ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Tout copier</>}
                </button>
                <button
                  onClick={() => window.open("https://www.leboncoin.fr/deposer-une-annonce", "_blank")}
                  className="flex-1 py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background: "#f97316" }}>
                  <ExternalLink size={14} /> Ouvrir LBC
                </button>
              </div>

              {/* Regénérer */}
              <button onClick={genererAnnonce}
                className="w-full py-2.5 rounded-2xl text-xs font-black border transition-all active:scale-[0.98]"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
                ↺ Regénérer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}