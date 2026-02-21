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
      className="flex justify-center min-h-screen"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="w-full max-w-md min-h-screen relative flex flex-col"
        style={{
          background: `linear-gradient(to bottom, var(--bg-from), var(--bg-via), var(--bg-to))`
        }}
      >
        <TopBar currentTheme={theme} onThemeChange={applyTheme} />
        <div className="flex-1 pb-24">
          {children}
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
          <div className="w-full max-w-md">
            <BottomNav />
          </div>
        </div>
      </div>
    </div>
  );
}