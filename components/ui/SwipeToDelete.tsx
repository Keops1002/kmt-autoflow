"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  onDelete: () => void;
  children: React.ReactNode;
}

const TRIGGER = 100; // swipe de 100px → suppression directe

export default function SwipeToDelete({ onDelete, children }: Props) {
  const [offset, setOffset]       = useState(0);
  const [animating, setAnimating] = useState(false);
  const [gone, setGone]           = useState(false);

  const startX     = useRef(0);
  const startY     = useRef(0);
  const active     = useRef(false);
  const blocked    = useRef(false);
  const firstMove  = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    startX.current  = e.touches[0].clientX;
    startY.current  = e.touches[0].clientY;
    active.current  = true;
    blocked.current = false;
    firstMove.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!active.current || blocked.current) return;

    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!firstMove.current) {
      firstMove.current = true;
      // Scroll vertical dominant → bloque le swipe
      if (Math.abs(dy) > Math.abs(dx) + 4) {
        blocked.current = true;
        return;
      }
    }

    if (dx > 0) return; // pas de swipe droite
    e.preventDefault();
    setOffset(Math.max(-220, dx));
  }

  function onTouchEnd() {
    if (!active.current || blocked.current) {
      active.current = false;
      return;
    }
    active.current = false;

    if (offset < -TRIGGER) {
      doDelete();
    } else {
      // Snap retour
      setAnimating(true);
      setOffset(0);
      setTimeout(() => setAnimating(false), 300);
    }
  }

  async function doDelete() {
    // Glisse hors écran
    setAnimating(true);
    setOffset(-600);
    await new Promise((r) => setTimeout(r, 260));
    // Collapse hauteur
    setGone(true);
    await new Promise((r) => setTimeout(r, 200));
    onDelete();
  }

  const p           = Math.min(1, Math.abs(offset) / TRIGGER);
  const bgOpacity   = p;
  const iconOpacity = Math.min(1, p * 1.6);
  const iconScale   = 0.55 + p * 0.55;

  if (gone) return (
    <div style={{ height: 0, overflow: "hidden", transition: "height 0.2s ease" }} />
  );

  return (
    <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden" }}>

      {/* Fond rouge — invisible à 0, apparaît au swipe */}
      <div style={{
        position:       "absolute",
        inset:          0,
        borderRadius:   "16px",
        background:     "linear-gradient(to left, #ef4444 0%, rgba(239,68,68,0.35) 100%)",
        opacity:        bgOpacity,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "flex-end",
        pointerEvents:  "none",
      }}>
        <div style={{
          paddingRight:  "22px",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          gap:           "3px",
          opacity:       iconOpacity,
          transform:     `scale(${iconScale})`,
        }}>
          <Trash2 size={20} color="white" strokeWidth={1.8} />
          <span style={{
            fontSize: "9px", fontWeight: 600, color: "white",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>Supprimer</span>
        </div>
      </div>

      {/* Carte */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform:  `translateX(${offset}px)`,
          transition: animating ? "transform 0.28s cubic-bezier(0.25,1,0.5,1)" : "none",
          position:   "relative",
          zIndex:     10,
          willChange: "transform",
        }}>
        {children}
      </div>
    </div>
  );
}