"use client";

import { useRef, useState, useEffect } from "react";
import { X, RotateCcw, Check } from "lucide-react";

interface Props {
  clientName: string;
  totalTtc: number;
  onConfirm: (signatureBase64: string) => Promise<void>;
  onClose: () => void;
}

export default function SignatureModal({ clientName, totalTtc, onConfirm, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]   = useState(false);
  const [hasSign, setHasSign]   = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function getPos(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasSign(true);
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() { setDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSign(false);
  }

  async function handleConfirm() {
    if (!hasSign || !canvasRef.current) return;
    setSaving(true);
    const base64 = canvasRef.current.toDataURL("image/png");
    await onConfirm(base64);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: "var(--card-bg-active)" }}>

        {/* Header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>Signature client</p>
              <p className="font-black text-base mt-0.5" style={{ color: "var(--text-primary)" }}>
                {clientName}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            En signant, le client accepte le devis de{" "}
            <span className="font-black" style={{ color: "var(--accent)" }}>
              {totalTtc.toFixed(2)} €
            </span>
          </p>
        </div>

        {/* Zone signature */}
        <div className="px-4 py-4">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-center"
            style={{ color: "var(--text-muted)" }}>
            Signez dans le cadre ci-dessous
          </p>
          <div className="rounded-2xl overflow-hidden border-2 border-dashed"
            style={{ borderColor: "var(--card-border)" }}>
            <canvas
              ref={canvasRef}
              width={600} height={200}
              className="w-full touch-none"
              style={{ cursor: "crosshair", display: "block" }}
              onMouseDown={startDraw} onMouseMove={draw}
              onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
            />
          </div>
          {!hasSign && (
            <p className="text-center text-xs italic mt-2" style={{ color: "var(--text-muted)" }}>
              ✍️ Signez avec votre doigt
            </p>
          )}
        </div>

        {/* Boutons */}
        <div className="flex gap-3 px-4 pb-8">
          <button onClick={clearCanvas}
            className="flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
            style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
            <RotateCcw size={14} /> Effacer
          </button>
          <button onClick={handleConfirm} disabled={!hasSign || saving}
            className="flex-2 px-6 py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
            style={{ background: "var(--accent)", flex: 2 }}>
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /></>
              : <><Check size={14} /> Valider la signature</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}