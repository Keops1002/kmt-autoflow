"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppContainer from "@/components/layout/AppContainer";
import { supabase } from "@/lib/supabase";
import { Loader2, ExternalLink, ScanLine } from "lucide-react";
import { StockVehicule } from "@/components/stock/stock.types";
import StockDetailHeader        from "@/components/stock/StockDetailHeader";
import StockInfoSection         from "@/components/stock/StockInfoSection";
import StockTechSection         from "@/components/stock/StockTechSection";
import StockPrixSection         from "@/components/stock/StockPrixSection";
import StockAnnonceSection      from "@/components/stock/StockAnnonceSection";
import StockPhotoSection        from "@/components/stock/StockPhotoSection";
import StockPublishSheet        from "@/components/stock/StockPublishSheet";
import CartegriseScannerSheet   from "@/components/stock/CartegriseScannerSheet";

export default function StockDetailPage() {
  const params = useParams();
  const [v, setV]                         = useState<StockVehicule | null>(null);
  const [loading, setLoading]             = useState(true);
  const [editing, setEditing]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [form, setForm]                   = useState<Partial<StockVehicule>>({});
  const [showPublish, setShowPublish]     = useState(false);
  const [showScanner, setShowScanner]     = useState(false);
  const [coverUrl, setCoverUrl]           = useState<string | null>(null);

  useEffect(() => { load(); }, [params.id]);

  async function load() {
    const { data } = await supabase
      .from("stock_vehicules").select("*")
      .eq("id", params.id).single();
    setV(data as StockVehicule);

    const { data: cover } = await supabase
      .from("stock_vehicules_photos")
      .select("url")
      .eq("vehicule_id", params.id)
      .eq("is_cover", true)
      .single();
    if (cover) setCoverUrl(cover.url);

    setLoading(false);
  }

  function startEdit() {
    if (!v) return;
    setForm({ ...v });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setForm({});
  }

  async function saveEdit() {
    if (!v) return;
    setSaving(true);
    const { error } = await supabase
      .from("stock_vehicules").update(form).eq("id", v.id);
    if (!error) {
      setV({ ...v, ...form } as StockVehicule);
      setEditing(false);
      setForm({});
    }
    setSaving(false);
  }

  async function handleStatutChange(statut: string) {
    if (!v) return;
    await supabase.from("stock_vehicules").update({ statut }).eq("id", v.id);
    setV((p) => p ? { ...p, statut } : p);
  }

  // Appelé quand l'IA extrait les données de la carte grise
  function handleCarteGriseData(data: any) {
    // Pré-remplit le formulaire d'édition avec les données extraites
    setForm((prev) => ({
      ...prev,
      ...(data.marque              && { marque:              data.marque              }),
      ...(data.modele              && { modele:              data.modele              }),
      ...(data.version             && { version:             data.version             }),
      ...(data.annee               && { annee:               Number(data.annee)       }),
      ...(data.mise_en_circulation && { mise_en_circulation: data.mise_en_circulation }),
      ...(data.couleur             && { couleur:             data.couleur             }),
      ...(data.carburant           && { carburant:           data.carburant           }),
      ...(data.puissance_din       && { puissance_din:       Number(data.puissance_din)     }),
      ...(data.puissance_fiscale   && { puissance_fiscale:   Number(data.puissance_fiscale) }),
      ...(data.nb_places           && { nb_places:           Number(data.nb_places)   }),
    }));
    setEditing(true); // Ouvre le mode édition pour que l'user puisse vérifier
  }

  if (loading) return (
    <AppContainer>
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" size={24} style={{ color: "var(--accent)" }} />
      </div>
    </AppContainer>
  );

  if (!v) return (
    <AppContainer>
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Véhicule introuvable</p>
      </div>
    </AppContainer>
  );

  return (
    <AppContainer>
      <div className="pb-32">

        {/* Cover photo */}
        {coverUrl && (
          <div className="relative w-full h-48 overflow-hidden rounded-b-3xl">
            <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 rounded-b-3xl"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, var(--bg) 100%)" }} />
          </div>
        )}

        <div className={`px-4 space-y-3 ${coverUrl ? "pt-4" : "pt-12"}`}>

          <StockDetailHeader
            v={v}
            editing={editing}
            saving={saving}
            onEdit={startEdit}
            onCancel={cancelEdit}
            onSave={saveEdit}
            onStatutChange={handleStatutChange}
          />

          <StockPhotoSection   v={v} onCoverChange={setCoverUrl} />
          <StockInfoSection    v={v} editing={editing} form={form} setForm={setForm} />
          <StockTechSection    v={v} editing={editing} form={form} setForm={setForm} />
          <StockPrixSection    v={v} editing={editing} form={form} setForm={setForm} />
          <StockAnnonceSection v={v} editing={editing} form={form} setForm={setForm} />

          {/* Boutons actions */}
          <div className="flex gap-3">
            {/* Scanner carte grise */}
            <button
              onClick={() => setShowScanner(true)}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
              <ScanLine size={15} style={{ color: "var(--accent)" }} />
              Carte grise
            </button>

            {/* Publier LeBonCoin */}
            <button
              onClick={() => setShowPublish(true)}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: "#f97316" }}>
              <ExternalLink size={15} />
              LeBonCoin
            </button>
          </div>

        </div>
      </div>

      {showPublish && (
        <StockPublishSheet v={v} onClose={() => setShowPublish(false)} />
      )}

      {showScanner && (
        <CartegriseScannerSheet
          onClose={() => setShowScanner(false)}
          onDataExtracted={handleCarteGriseData}
        />
      )}

    </AppContainer>
  );
}