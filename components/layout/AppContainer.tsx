"use client";

import BottomNav from "./BottomNav";
import TopBar from "./TopBar";
import { useEffect, useState } from "react";

export type Theme = "light" | "silver" | "gold";

export default function AppContainer({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) applyTheme(saved);
  }, []);

  function applyTheme(t: Theme) {
    setTheme(t);
    localStorage.setItem("theme", t);
    if (t === "light") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  }

  return (
    <div
      className="flex justify-center"
      style={{
        background: `linear-gradient(to bottom, var(--bg-from), var(--bg-via), var(--bg-to))`,
        backgroundAttachment: "fixed",
        minHeight: "100dvh",
      }}
    >
      {/* Colonne centrale max-w-md, positionnée en relative pour ancrer la BottomNav */}
      <div
        className="w-full max-w-md relative flex flex-col"
        style={{ minHeight: "100dvh" }}
      >
        <TopBar currentTheme={theme} onThemeChange={applyTheme} />

        <div className="flex-1 pb-20">
          {children}
        </div>

        {/* BottomNav sticky en bas de la colonne, pas de tout l'écran */}
        <div className="sticky bottom-0 z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}