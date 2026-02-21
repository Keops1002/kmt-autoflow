"use client";

import { useRef, useState } from "react";
import { Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  dossierId: string;
  onUploaded?: (url: string) => void;
  currentCount?: number;
}

const MAX_PHOTOS = 4;

export default function PhotoUploader({ dossierId, onUploaded, currentCount = 0 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [isMobile]                = useState(() => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  const galleryRef                = useRef<HTMLInputElement>(null);
  const cameraRef                 = useRef<HTMLInputElement>(null);

  const remaining = MAX_PHOTOS - currentCount;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || remaining <= 0) return;

    setUploading(true);
    try {
      const ext      = file.name.split(".").pop();
      const path     = `${dossierId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("dossiers-photos")
        .upload(path, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage
        .from("dossiers-photos")
        .getPublicUrl(path);

      await supabase.from("dossiers_photos").insert({
        dossier_id: dossierId,
        url:        data.publicUrl,
        path,
      });

      onUploaded?.(data.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
    }
    setUploading(false);

    // Reset input
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current)  cameraRef.current.value  = "";
  }

  if (remaining <= 0) return null;

  return (
    <div className="flex gap-2">
      {/* Pellicule */}
      <button
        onClick={() => galleryRef.current?.click()}
        disabled={uploading}
        className="flex-1 py-3 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        {uploading
          ? <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent)" }} />
          : <ImageIcon size={16} style={{ color: "var(--accent)" }} />
        }
        <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
          {uploading ? "Upload..." : "Pellicule"}
        </span>
      </button>

      {/* Caméra — mobile seulement */}
      {isMobile && (
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          className="flex-1 py-3 rounded-2xl border flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          <Camera size={16} style={{ color: "var(--accent)" }} />
          <span className="text-xs font-black" style={{ color: "var(--text-primary)" }}>Caméra</span>
        </button>
      )}

      <p className="self-center text-[10px] font-black" style={{ color: "var(--text-muted)" }}>
        {remaining} restante{remaining > 1 ? "s" : ""}
      </p>

      {/* Inputs cachés */}
      <input ref={galleryRef} type="file" accept="image/*"
        className="hidden" onChange={handleFile} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFile} />
    </div>
  );
}