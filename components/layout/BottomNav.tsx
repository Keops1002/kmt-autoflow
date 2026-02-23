"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Car, Users, AlertTriangle,
  Bot, BarChart2, Plus, BookOpen, CarFront,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen]   = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  function handleToggle() {
    if (!open) {
      setBurst(true);
      setTimeout(() => setBurst(false), 500);
    }
    setOpen((p) => !p);
  }

  const leftItems = [
    { icon: Home,          path: "/"         },
    { icon: Calendar,      path: "/planning" },
    { icon: Car,           path: "/dossiers" },
  ];

  const rightItems = [
    { icon: Users,         path: "/clients"  },
    { icon: AlertTriangle, path: "/alertes"  },
    { icon: BarChart2,     path: "/stats"    },
  ];

  const actions = [
    { icon: Bot,      label: "Agent KMT",       path: "/assistant",    kmt: true  },
    { icon: Plus,     label: "Nouveau dossier", path: "/dossiers/new", kmt: false },
    { icon: BookOpen, label: "Catalogue",        path: "/catalogue",    kmt: false },
    { icon: CarFront, label: "Stock véhicules",  path: "/stock",        kmt: false },
  ];

  return (
    <>
      <style>{`
        @keyframes kmt-burst-ring {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0;   }
        }
        @keyframes kmt-burst-ring2 {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(3.0); opacity: 0;   }
        }
        @keyframes kmt-pop-in {
          0%   { transform: scale(0.3) translateY(20px); opacity: 0; }
          65%  { transform: scale(1.1) translateY(-4px); opacity: 1; }
          100% { transform: scale(1)   translateY(0);    opacity: 1; }
        }
        @keyframes kmt-idle-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0), 0 4px 20px rgba(0,0,0,0.3); }
          50%       { box-shadow: 0 0 0 7px rgba(99,102,241,0.18), 0 4px 20px rgba(0,0,0,0.3); }
        }
        @keyframes kmt-wave {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }
        @keyframes kmt-shimmer {
          0%   { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
        @keyframes kmt-glow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>

      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu slide-up */}
      <div
        className="absolute left-0 right-0 z-30 flex justify-center px-6"
        style={{ bottom: "72px", pointerEvents: open ? "auto" : "none" }}
      >
        <div className={`flex flex-col gap-2 w-52 transition-all duration-300 ease-out ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}>
          {actions.map((action, i) => {
            const isKMT = action.kmt;
            return (
              <Link
                key={action.path}
                href={action.path}
                prefetch={true}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm shadow-lg active:scale-[0.97] transition-all duration-200 border overflow-hidden relative"
                style={{
                  animation:   open ? `kmt-pop-in 0.38s cubic-bezier(0.34,1.56,0.64,1) ${i * 55}ms both` : undefined,
                  borderColor: isKMT ? "var(--kmt-border)" : "var(--card-border)",
                  background:  isKMT ? "transparent"        : "var(--card-bg)",
                  boxShadow:   isKMT ? "0 0 20px var(--kmt-glow), 0 4px 15px rgba(0,0,0,0.2)" : undefined,
                }}
              >
                {isKMT && (
                  <>
                    <span className="absolute inset-0 z-0" style={{
                      background:     "linear-gradient(135deg, var(--kmt-from), var(--kmt-mid), var(--kmt-to), var(--kmt-mid), var(--kmt-from))",
                      backgroundSize: "400% 400%",
                      animation:      "kmt-wave 4s ease infinite",
                    }} />
                    <span className="absolute inset-0 z-0" style={{
                      background: "radial-gradient(ellipse at 30% 50%, var(--kmt-glow) 0%, transparent 55%), radial-gradient(ellipse at 70% 50%, var(--kmt-glow) 0%, transparent 55%)",
                      animation:  "kmt-shimmer 2.5s ease-in-out infinite alternate",
                    }} />
                    <span className="absolute inset-0 z-0" style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)",
                      animation:  "kmt-glow 2s ease-in-out infinite",
                    }} />
                  </>
                )}
                <action.icon
                  size={16}
                  strokeWidth={2.5}
                  className="relative z-10"
                  style={{ color: isKMT ? "#ffffff" : "var(--accent)" }}
                />
                <span
                  className="relative z-10 tracking-wide"
                  style={{ color: isKMT ? "#ffffff" : "var(--text-primary)" }}
                >
                  {action.label}
                </span>
                {isKMT && (
                  <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full" style={{
                    background: "var(--kmt-dot)",
                    boxShadow:  "0 0 6px 2px var(--kmt-glow)",
                    animation:  "kmt-glow 1.5s ease-in-out infinite",
                  }} />
                )}
              </Link>
            );
          })}
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

          {/* Notch SVG */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] pointer-events-none">
            <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
              <path
                d="M0 0 C10 0 14 0 20 6 C26 12 28 20 40 20 C52 20 54 12 60 6 C66 0 70 0 80 0 L80 1 C70 1 66.5 1 61 6.5 C55 13 52.5 21 40 21 C27.5 21 25 13 19 6.5 C13.5 1 10 1 0 1 Z"
                fill="var(--nav-bg)"
              />
            </svg>
          </div>

          {/* ── Bouton KMT central ── */}
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-5">

            {/* Rings burst au clic */}
            {burst && (
              <>
                <span style={{
                  position:      "absolute",
                  top: "50%", left: "50%",
                  width: "48px", height: "48px",
                  borderRadius:  "50%",
                  border:        "2px solid var(--accent)",
                  animation:     "kmt-burst-ring 0.45s ease-out forwards",
                  pointerEvents: "none",
                }} />
                <span style={{
                  position:      "absolute",
                  top: "50%", left: "50%",
                  width: "48px", height: "48px",
                  borderRadius:  "50%",
                  border:        "1.5px solid var(--accent)",
                  animation:     "kmt-burst-ring2 0.5s ease-out 0.06s forwards",
                  pointerEvents: "none",
                }} />
              </>
            )}

            <button
              onClick={handleToggle}
              className="w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-90 overflow-hidden relative"
              style={{
                background: open ? "var(--text-secondary)" : "var(--accent)",
                animation:  !open ? "kmt-idle-pulse 2.8s ease-in-out infinite" : "none",
                transition: "background 0.25s ease, transform 0.15s ease",
              }}
            >
              {/* Reflet haut */}
              {!open && (
                <span className="absolute inset-0 pointer-events-none" style={{
                  background:   "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 55%)",
                  borderRadius: "50%",
                }} />
              )}

              {open ? (
                /* X quand ouvert */
                <Plus
                  size={20}
                  strokeWidth={3}
                  className="text-white"
                  style={{
                    transform:  "rotate(45deg)",
                    transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
              ) : (
                /* + KMT quand fermé */
                <div
                  className="flex flex-col items-center"
                  style={{ animation: "kmt-pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}
                >
                  <span style={{
                    fontSize:     "8px",
                    fontWeight:   900,
                    color:        "rgba(255,255,255,0.75)",
                    lineHeight:   1,
                    marginBottom: "1px",
                  }}>+</span>
                  <span style={{
                    fontSize:      "11px",
                    fontWeight:    900,
                    color:         "#ffffff",
                    letterSpacing: "0.1em",
                    lineHeight:    1,
                  }}>KMT</span>
                </div>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}