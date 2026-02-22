"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ZoomIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PhotoUploader from "./PhotoUploader";

interface Photo {
  id: string;
  url: string;
  path: string;
}

interface Props {
  dossierId: string;
}

export default function PhotoGallery({ dossierId }: Props) {
  const [photos, setPhotos]       = useState<Photo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [preview, setPreview]     = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  useEffect(() => { 
    if (dossierId) loadPhotos(); 
  }, [dossierId]);

  async function loadPhotos() {
    try {
      const { data, error } = await supabase
        .from("dossiers_photos")
        .select("*")
        .eq("dossier_id", dossierId)
        .order("created_at");
      
      if (error) throw error;
      setPhotos((data as Photo[]) || []);
    } catch (e) {
      console.error("Erreur chargement galerie:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(photo: Photo) {
    setDeleting(photo.id);
    await supabase.storage.from("dossiers-photos").remove([photo.path]);
    await supabase.from("dossiers_photos").delete().eq("id", photo.id);
    setPhotos((p) => p.filter((ph) => ph.id !== photo.id));
    setDeleting(null);
  }

  function handleUploaded() {
    loadPhotos(); // Refetch les photos (sans le cache grâce au correctif !)
  }

  if (loading) return (
    <div className="flex justify-center py-4">
      <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black" style={{ color: "var(--text-secondary)" }}>
            Photos ({photos.length}/4)
          </p>
        </div>

        {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
            {photos.map((photo) => (
              <div key={photo.id} className="relative rounded-2xl overflow-hidden aspect-square">
                <img
                  src={photo.url}
                  alt="photo dossier"
                  className="w-full h-full object-cover"
                  onClick={() => setPreview(photo.url)}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-start justify-between p-2">
                  <button
                    type="button"
                    onClick={() => setPreview(photo.url)}
                    className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <ZoomIn size={13} className="text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    disabled={deleting === photo.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    {deleting === photo.id
                      ? <Loader2 size={13} className="text-white animate-spin" />
                      : <X size={13} className="text-white" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <PhotoUploader
          dossierId={dossierId}
          currentCount={photos.length}
          onUploaded={handleUploaded}
        />
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="preview" className="max-w-full max-h-full object-contain rounded-2xl" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      )}
    </>
  );
}