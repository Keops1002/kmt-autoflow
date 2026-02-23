"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, Image as ImageIcon, X, Star, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StockPhoto {
  id: string;
  url: string;
  path: string;
  is_cover: boolean;
  ordre: number;
}

interface Props {
  vehiculeId: string;
  onCoverChange?: (url: string | null) => void;
}

const MAX_PHOTOS = 20;

export default function StockPhotoUploader({ vehiculeId, onCoverChange }: Props) {
  const [photos, setPhotos]       = useState<StockPhoto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    loadPhotos();
  }, [vehiculeId]);

  async function loadPhotos() {
    setLoading(true);
    const { data } = await supabase
      .from("stock_vehicules_photos")
      .select("*")
      .eq("vehicule_id", vehiculeId)
      .order("ordre");
    setPhotos((data as StockPhoto[]) || []);
    setLoading(false);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toUpload  = files.slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const path = `${vehiculeId}/${Date.now()}-${i}-${file.name.replace(/\s/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`;
        const { error: uploadError } = await supabase.storage
          .from("stock-photos")
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("stock-photos").getPublicUrl(path);

        const isCover = photos.length === 0 && i === 0;

        const { data: inserted } = await supabase
          .from("stock_vehicules_photos")
          .insert({
            vehicule_id: vehiculeId,
            url:         urlData.publicUrl,
            path,
            is_cover:    isCover,
            ordre:       photos.length + i,
          })
          .select()
          .single();

       if (inserted) {
  setPhotos((prev) => [...prev, inserted as StockPhoto]);
  if (isCover && onCoverChange) onCoverChange(urlData.publicUrl);
}
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (galleryRef.current) galleryRef.current.value = "";
      if (cameraRef.current)  cameraRef.current.value  = "";
    }
  }

  async function setCover(photo: StockPhoto) {
    // Retire l'ancienne cover
    await supabase
      .from("stock_vehicules_photos")
      .update({ is_cover: false })
      .eq("vehicule_id", vehiculeId);

    // Met la nouvelle
    await supabase
      .from("stock_vehicules_photos")
      .update({ is_cover: true })
      .eq("id", photo.id);

    setPhotos((prev) =>
  prev.map((p) => ({ ...p, is_cover: p.id === photo.id }))
);
if (onCoverChange) onCoverChange(photo.url);
  }

  async function deletePhoto(photo: StockPhoto) {
    await supabase.storage.from("stock-photos").remove([photo.path]);
    await supabase.from("stock_vehicules_photos").delete().eq("id", photo.id);

    const next = photos.filter((p) => p.id !== photo.id);

    // Si on supprime la cover, la première devient cover
    if (photo.is_cover && next.length > 0) {
      await supabase
        .from("stock_vehicules_photos")
        .update({ is_cover: true })
        .eq("id", next[0].id);
      next[0].is_cover = true;
      if (onCoverChange) onCoverChange(next[0].url);
    } else if (photo.is_cover && next.length === 0) {
      if (onCoverChange) onCoverChange(null);
    }

    setPhotos(next);
  }

  const remaining = MAX_PHOTOS - photos.length;

  return (
    <div className="space-y-3">

      {/* Grid photos */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin" size={20} style={{ color: "var(--accent)" }} />
        </div>
      ) : (
        <>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square group">
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />

                  {/* Badge cover */}
                  {photo.is_cover && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: "rgba(0,0,0,0.7)" }}>
                      <Star size={9} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px] font-black text-white">Cover</span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.4)" }}>
                    {!photo.is_cover && (
                      <button onClick={() => setCover(photo)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.7)" }}>
                        <Star size={13} className="text-yellow-400" />
                      </button>
                    )}
                    <button onClick={() => deletePhoto(photo)}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(220,38,38,0.8)" }}>
                      <Trash2 size={13} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {photos.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 gap-2"
              style={{ borderColor: "var(--card-border)" }}>
              <ImageIcon size={24} style={{ color: "var(--text-muted)" }} />
              <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                Aucune photo — la 1ère uploadée sera la cover
              </p>
            </div>
          )}
        </>
      )}

      {/* Boutons upload */}
      {remaining > 0 && (
        <div className="flex gap-2">
          <button onClick={() => galleryRef.current?.click()} disabled={uploading}
            className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            {uploading
              ? <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
              : <ImageIcon size={14} style={{ color: "var(--accent)" }} />
            }
            <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
              {uploading ? "Upload..." : "Pellicule"}
            </span>
          </button>

          {isMobile && (
            <button onClick={() => cameraRef.current?.click()} disabled={uploading}
              className="flex-1 py-2.5 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <Camera size={14} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Caméra</span>
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
        {photos.length}/{MAX_PHOTOS} photos · ⭐ = photo de couverture
      </p>

      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFiles} />
    </div>
  );
}