"use client";

import { useEffect, useState } from "react";

function MountainSVG() {
  return (
    <svg
      viewBox="0 0 400 160"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      preserveAspectRatio="none"
    >
      {/* Montagne arrière gauche */}
      <polygon points="0,160 80,40 160,160" fill="var(--accent)" opacity="0.15" />
      {/* Montagne arrière droite */}
      <polygon points="200,160 310,20 400,160" fill="var(--accent)" opacity="0.12" />
      {/* Montagne milieu */}
      <polygon points="100,160 220,10 340,160" fill="var(--accent)" opacity="0.18" />
      {/* Neige sommet milieu */}
      <polygon points="207,28 220,10 233,28" fill="white" opacity="0.4" />
      {/* Montagne avant gauche */}
      <polygon points="-10,160 70,70 160,160" fill="var(--accent)" opacity="0.25" />
      {/* Montagne avant droite */}
      <polygon points="240,160 330,65 420,160" fill="var(--accent)" opacity="0.22" />
      {/* Neige sommet avant gauche */}
      <polygon points="60,82 70,70 80,82" fill="white" opacity="0.35" />
      {/* Neige sommet avant droite */}
      <polygon points="320,76 330,65 340,76" fill="white" opacity="0.35" />
      {/* Sol */}
      <rect x="0" y="145" width="400" height="15" fill="var(--accent)" opacity="0.08" />
    </svg>
  );
}

export default function HeroBanner() {
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const h = now.getHours();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      if (h < 12) setGreeting("Bonjour");
      else if (h < 18) setGreeting("Bon après-midi");
      else setGreeting("Bonsoir");
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long"
  });

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, var(--accent) 0%, #3730a3 100%)` }}
    >
      {/* Montagnes en fond */}
      <div className="absolute bottom-0 left-0 right-0">
        <MountainSVG />
      </div>

      {/* Halo lumineux */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ background: "#ffffff" }}
      />

      {/* Contenu */}
      <div className="relative z-10 px-5 pt-5 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
              {greeting}
            </p>
            <h1 className="text-white font-black text-2xl mt-0.5 leading-tight">
              Atlas Carrosserie
            </h1>
            <p className="text-white/50 text-xs mt-1 capitalize">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-2xl">{time}</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              Tableau de bord
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}