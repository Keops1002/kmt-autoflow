"use client";

import { Settings, X, User, Palette, MessageSquare, LogOut,
         ChevronRight, Building2, Calculator, Users, ChevronLeft } from "lucide-react";
import { useState } from "react";
import type { Theme } from "./AppContainer";
import ContactForm           from "./topbar/ContactForm";
import ThemeSection          from "./topbar/ThemeSection";
import GarageInfoSection     from "./topbar/GarageInfoSection";
import ComptabiliteSection   from "./topbar/ComptabiliteSection";
import CollaborateursSection from "./topbar/CollaborateursSection";

interface TopBarProps {
  currentTheme: Theme;
  onThemeChange: (t: Theme) => void;
}

type Section = "main" | "contact" | "theme" | "garage" | "comptabilite" | "collaborateurs";

const MENU_ITEMS = [
  {
    section: "garage"         as Section,
    icon: Building2,
    label: "Infos du garage",
    desc: "SIRET, TVA, adresse...",
    color: "#4f46e5",
    colorLight: "rgba(79,70,229,0.12)",
  },
  {
    section: "comptabilite"   as Section,
    icon: Calculator,
    label: "Comptabilité",
    desc: "Export factures PDF / CSV",
    color: "#16a34a",
    colorLight: "rgba(22,163,74,0.12)",
  },
  {
    section: "collaborateurs" as Section,
    icon: Users,
    label: "Collaborateurs",
    desc: "Salariés & contrats",
    color: "#0891b2",
    colorLight: "rgba(8,145,178,0.12)",
  },
  {
    section: "theme"          as Section,
    icon: Palette,
    label: "Thème",
    desc: "Apparence de l'app",
    color: "#d97706",
    colorLight: "rgba(217,119,6,0.12)",
  },
  {
    section: "contact"        as Section,
    icon: MessageSquare,
    label: "Nous contacter",
    desc: "Bug, idée, question",
    color: "#7c3aed",
    colorLight: "rgba(124,58,237,0.12)",
  },
];

const TITLES: Record<Section, string> = {
  main:           "Réglages",
  contact:        "Nous contacter",
  theme:          "Thème",
  garage:         "Infos du garage",
  comptabilite:   "Comptabilité",
  collaborateurs: "Collaborateurs",
};

export default function TopBar({ currentTheme, onThemeChange }: TopBarProps) {
  const [open, setOpen]       = useState(false);
  const [section, setSection] = useState<Section>("main");
  const [sliding, setSliding] = useState(false);

  function goTo(s: Section) {
    setSliding(true);
    setTimeout(() => {
      setSection(s);
      setSliding(false);
    }, 150);
  }

  function goBack() {
    setSliding(true);
    setTimeout(() => {
      setSection("main");
      setSliding(false);
    }, 150);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => setSection("main"), 300);
  }

  const activeItem = MENU_ITEMS.find((m) => m.section === section);

  return (
    <>
      {open && (
        <div className="absolute inset-0 z-40 bg-black/5" onPointerDown={handleClose} />
      )}

      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center">

        {/* Pilule */}
        <button onPointerDown={() => setOpen((p) => !p)}
          className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm transition-all active:scale-95 border"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <Settings size={11} strokeWidth={2}
            className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}
            style={{ color: "var(--text-muted)" }} />
          <span className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}>
            Réglages
          </span>
        </button>

        {/* Panel */}
        <div className={`w-full transition-all duration-300 ease-out overflow-hidden ${
          open ? "max-h-[75vh] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="mx-3 mt-2 mb-1 backdrop-blur-xl rounded-2xl shadow-xl border overflow-hidden"
            style={{ background: "var(--card-bg-active)", borderColor: "var(--card-border)" }}>

            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: "var(--card-border)" }}>

              {/* Bouton retour si sous-section */}
              {section !== "main" && (
                <button onClick={goBack}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "var(--card-bg)" }}>
                  <ChevronLeft size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              )}

              {/* Icône colorée de la section active */}
              {section !== "main" && activeItem && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: activeItem.colorLight }}>
                  <activeItem.icon size={14} style={{ color: activeItem.color }} />
                </div>
              )}

              <h2 className="flex-1 text-sm font-black" style={{ color: "var(--text-primary)" }}>
                {TITLES[section]}
              </h2>

              <button onClick={handleClose}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "var(--card-bg)" }}>
                <X size={13} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Contenu avec effet slide */}
            <div
  className="transition-all duration-300 ease-out"
  style={{
    opacity:   sliding ? 0 : 1,
    transform: sliding ? "scale(0.92)" : "scale(1)",
    animation: sliding ? "none" : "kmt-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  }}
>
                <div className="px-3 py-3 overflow-y-auto max-h-[55vh]">

                  {/* ── Menu principal ── */}
                  {section === "main" && (
                    <div className="space-y-2">

                      {/* Grid 2 colonnes pour les sections principales */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {MENU_ITEMS.slice(0, 3).map((item) => (
                          <button key={item.section} onClick={() => goTo(item.section)}
                            className="flex flex-col items-start gap-2 px-3 py-3 rounded-2xl border transition-all active:scale-[0.97]"
                            style={{ background: item.colorLight, borderColor: `${item.color}30` }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: `${item.color}20` }}>
                              <item.icon size={16} style={{ color: item.color }} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black leading-tight"
                                style={{ color: "var(--text-primary)" }}>
                                {item.label}
                              </p>
                              <p className="text-[9px] leading-tight mt-0.5"
                                style={{ color: "var(--text-muted)" }}>
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        ))}

                        {/* Compte — pas encore fonctionnel */}
                        <button className="flex flex-col items-start gap-2 px-3 py-3 rounded-2xl border opacity-40"
                          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: "var(--accent-light)" }}>
                            <User size={16} style={{ color: "var(--accent)" }} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black leading-tight"
                              style={{ color: "var(--text-primary)" }}>
                              Compte
                            </p>
                            <p className="text-[9px] leading-tight mt-0.5"
                              style={{ color: "var(--text-muted)" }}>
                              Bientôt disponible
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Séparateur */}
                      <div className="h-px mx-1" style={{ background: "var(--card-border)" }} />

                      {/* Thème + Contact en liste */}
                      {MENU_ITEMS.slice(3).map((item) => (
                        <button key={item.section} onClick={() => goTo(item.section)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all active:scale-[0.98]"
                          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: item.colorLight }}>
                            <item.icon size={15} style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-black" style={{ color: "var(--text-primary)" }}>
                              {item.label}
                            </p>
                            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                          </div>
                          <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
                        </button>
                      ))}

                      {/* Séparateur */}
                      <div className="h-px mx-1" style={{ background: "var(--card-border)" }} />

                      {/* Déconnexion */}
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100">
                          <LogOut size={15} className="text-red-500" />
                        </div>
                        <p className="text-xs font-black text-red-500">Déconnexion</p>
                      </button>

                    </div>
                  )}

                  {section === "contact"        && <ContactForm           onBack={goBack} />}
                  {section === "theme"          && <ThemeSection          currentTheme={currentTheme} onThemeChange={(t) => { onThemeChange(t); goBack(); }} onBack={goBack} />}
                  {section === "garage"         && <GarageInfoSection     onBack={goBack} />}
                  {section === "comptabilite"   && <ComptabiliteSection   onBack={goBack} />}
                  {section === "collaborateurs" && <CollaborateursSection onBack={goBack} />}

                </div>
              </div>
            </div>

          </div>
        </div>
      
    </>
  );
}