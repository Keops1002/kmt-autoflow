"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Car, Users, AlertTriangle, Plus, Bot, BarChart2, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  const leftItems = [
    { icon: Home,     path: "/" },
    { icon: Calendar, path: "/planning" },
    { icon: Bot,      path: "/assistant" },
  ];
  const rightItems = [
    { icon: Car,           path: "/dossiers" },
    { icon: Users,         path: "/clients" },
    { icon: AlertTriangle, path: "/alertes" },
  ];

  const actions = [
    { icon: BarChart2, label: "Statistiques",    path: "/stats" },
    { icon: BookOpen,  label: "Catalogue",       path: "/catalogue" },
    { icon: Plus,      label: "Nouveau dossier", path: "/dossiers/new" },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu slide */}
      <div
        className="absolute left-0 right-0 z-30 flex justify-center px-6"
        style={{ bottom: "72px", pointerEvents: open ? "auto" : "none" }}
      >
        <div className={`flex flex-col gap-2 w-52 transition-all duration-300 ease-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}>
          {actions.map((action, i) => (
            <Link
              key={action.path}
              href={action.path}
              prefetch={true}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm shadow-md
                         active:scale-[0.97] transition-all duration-200 theme-card border"
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              <action.icon size={16} strokeWidth={2.5} style={{ color: "var(--accent)" }} />
              <span style={{ color: "var(--text-primary)" }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Barre */}
      <div className="absolute bottom-0 w-full z-30">
        <div className="relative h-16 theme-nav backdrop-blur-2xl border-t flex items-center px-6 pb-1">

          {/* Icônes gauche */}
          <div className="flex-1 flex items-center justify-around">
            {leftItems.map(({ icon: Icon, path }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  prefetch={true}
                  className={`transition-all duration-150 active:scale-75 active:rotate-12 ${
                    isActive ? "scale-110" : ""
                  }`}
                  style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </Link>
              );
            })}
          </div>

          <div className="w-14" />

          {/* Icônes droite */}
          <div className="flex-1 flex items-center justify-around">
            {rightItems.map(({ icon: Icon, path }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  prefetch={true}
                  className="transition-all duration-150 active:scale-75 active:rotate-12"
                  style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </Link>
              );
            })}
          </div>

          {/* Notch SVG */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] pointer-events-none">
            <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
              <path
                d="M0 0 C10 0 14 0 20 6 C26 12 28 20 40 20 C52 20 54 12 60 6 C66 0 70 0 80 0 L80 1 C70 1 66.5 1 61 6.5 C55 13 52.5 21 40 21 C27.5 21 25 13 19 6.5 C13.5 1 10 1 0 1 Z"
                fill="var(--nav-bg)"
              />
            </svg>
          </div>

          {/* Bouton + central */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-5">
            <button
              onClick={() => setOpen((p) => !p)}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl
                         transition-all duration-300 active:scale-90"
              style={{ background: open ? "var(--text-secondary)" : "var(--accent)" }}
            >
              {!open && (
                <span className="absolute inset-0 rounded-full animate-pulse"
                  style={{ background: "var(--accent-light)" }} />
              )}
              <Plus
                size={20} strokeWidth={3}
                className="text-white transition-transform duration-300"
                style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
              />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}