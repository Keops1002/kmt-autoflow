"use client";

import { Settings, X, User, Palette, MessageSquare, LogOut, ChevronRight, Sparkles, Loader2, Sun, Moon } from "lucide-react";
import { useState } from "react";
import type { Theme } from "./AppContainer";

interface TopBarProps {
  currentTheme: Theme;
  onThemeChange: (t: Theme) => void;
}

type Section = "main" | "contact" | "theme";

function ContactForm({ onBack }: { onBack: () => void }) {
  const [type, setType]       = useState<"bug" | "feature" | "other">("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const types = [
    { id: "bug",     label: "🐛 Bug",         desc: "Quelque chose ne fonctionne pas" },
    { id: "feature", label: "✨ Amélioration", desc: "J'ai une idée à proposer" },
    { id: "other",   label: "💬 Autre",        desc: "Question ou autre demande" },
  ];

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("https://your-n8n-webhook/formulaire-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, date: new Date().toISOString() }),
      });
      setSent(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <Sparkles size={20} className="text-emerald-600" />
        </div>
        <p className="font-black text-slate-700">Message envoyé !</p>
        <p className="text-xs text-slate-400 text-center">On vous répond dès que possible.</p>
        <button onClick={onBack} className="text-xs font-bold text-[#17179C]">← Retour</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-slate-400">← Retour</button>
      <div className="space-y-1.5">
        {types.map((t) => (
          <button key={t.id} onClick={() => setType(t.id as any)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
              type === t.id ? "border-[#17179C]/30 bg-[#17179C]/5" : "border-slate-100 bg-white/60"
            }`}>
            <div className="flex-1">
              <p className="text-xs font-black text-slate-700">{t.label}</p>
              <p className="text-[10px] text-slate-400">{t.desc}</p>
            </div>
            {type === t.id && (
              <div className="w-3.5 h-3.5 rounded-full bg-[#17179C] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Décrivez votre demande..."
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-xs text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#17179C]/20"
      />
      <button
        onClick={handleSend}
        disabled={!message.trim() || sending}
        className="w-full py-2.5 rounded-xl bg-[#17179C] text-white font-black text-xs disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {sending && <Loader2 size={12} className="animate-spin" />}
        {sending ? "Envoi..." : "Envoyer →"}
      </button>
    </div>
  );
}

function ThemeSection({
  currentTheme, onThemeChange, onBack,
}: {
  currentTheme: Theme;
  onThemeChange: (t: Theme) => void;
  onBack: () => void;
}) {
  const themes = [
    {
      id: "light" as Theme,
      label: "Light Blue",
      desc: "Fond clair, accent bleu",
      preview: "bg-gradient-to-br from-[#eef1f4] to-[#cfd4d9]",
      dot: "bg-[#17179C]",
      icon: Sun,
    },
    {
      id: "silver" as Theme,
      label: "Silver Dark",
      desc: "Fond dark, bordures argent",
      preview: "bg-gradient-to-br from-[#16213e] to-[#0f0f1a]",
      dot: "bg-indigo-400",
      icon: Moon,
    },
    {
  id: "gold" as Theme,
  label: "Gold Égypte",
  desc: "Fond noir, or antique",
  preview: "bg-gradient-to-br from-[#1a1508] to-[#0a0805]",
  dot: "bg-yellow-500",
  icon: Sun,
},
  ];

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-slate-400">← Retour</button>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Choisir un thème</p>
      <div className="space-y-2">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = currentTheme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all active:scale-[0.98] ${
                isActive ? "border-[#17179C]/40 bg-[#17179C]/5" : "border-slate-100 bg-white/60"
              }`}
            >
              {/* Preview */}
              <div className={`w-10 h-10 rounded-xl ${t.preview} flex items-center justify-center shadow-inner`}>
                <Icon size={16} className={t.id === "light" ? "text-slate-600" : "text-slate-300"} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-black text-slate-700">{t.label}</p>
                <p className="text-[10px] text-slate-400">{t.desc}</p>
              </div>
              {isActive && (
                <div className="w-4 h-4 rounded-full bg-[#17179C] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TopBar({ currentTheme, onThemeChange }: TopBarProps) {
  const [open, setOpen]       = useState(false);
  const [section, setSection] = useState<Section>("main");

  const menuItems = [
    {
      icon: User,
      label: "Compte",
      desc: "Profil & connexion",
      onClick: () => {},
      danger: false,
    },
    {
      icon: Palette,
      label: "Thème",
      desc: currentTheme === "light" ? "Light Blue" : "Silver Dark",
      onClick: () => setSection("theme"),
      danger: false,
    },
    {
      icon: MessageSquare,
      label: "Nous contacter",
      desc: "Bug, idée, question",
      onClick: () => setSection("contact"),
      danger: false,
    },
    {
      icon: LogOut,
      label: "Déconnexion",
      desc: "",
      onClick: () => {},
      danger: true,
    },
  ];

  function handleClose() {
    setOpen(false);
    setTimeout(() => setSection("main"), 300);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-40 bg-black/5"
          onPointerDown={handleClose}
        />
      )}

      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center">

       {/* Pilule handle */}
<button
  onPointerDown={() => setOpen((p) => !p)}
  className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm transition-all active:scale-95 border"
  style={{
    background: "var(--card-bg)",
    borderColor: "var(--card-border)",
  }}
>
  <Settings
    size={11} strokeWidth={2}
    className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}
    style={{ color: "var(--text-muted)" }}
  />
  <span className="text-[10px] font-black uppercase tracking-wider"
    style={{ color: "var(--text-muted)" }}>
    Réglages
  </span>
</button>

        {/* Panel */}
<div className={`w-full transition-all duration-300 ease-out overflow-hidden ${
  open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
}`}>
  <div className="mx-3 mt-2 mb-1 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border"
    style={{
      background: "var(--card-bg-active)",
      borderColor: "var(--card-border)",
    }}>

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b"
      style={{ borderColor: "var(--card-border)" }}>
      <h2 className="text-sm font-black"
        style={{ color: "var(--text-primary)" }}>
        {section === "main"    ? "Réglages"        :
         section === "contact" ? "Nous contacter"  :
                                  "Thème"}
      </h2>
      <button onClick={handleClose}
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "var(--card-bg)", color: "var(--text-muted)" }}>
        <X size={13} />
      </button>
    </div>

            {/* Contenu */}
            <div className="px-3 py-3 overflow-y-auto max-h-[55vh]">
              {section === "main" && (
                <div className="space-y-1.5">
                  {menuItems.map((item) => (
                    <button key={item.label} onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${
                        item.danger ? "bg-red-50" : "bg-slate-50/80 border border-slate-100"
                      }`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        item.danger ? "bg-red-100" : "bg-white shadow-sm"
                      }`}>
                        <item.icon size={15} strokeWidth={2}
                          className={item.danger ? "text-red-500" : "text-slate-500"} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-xs font-black ${item.danger ? "text-red-500" : "text-slate-700"}`}>
                          {item.label}
                        </p>
                        {item.desc && <p className="text-[10px] text-slate-400">{item.desc}</p>}
                      </div>
                      {!item.danger && <ChevronRight size={13} className="text-slate-300" />}
                    </button>
                  ))}
                </div>
              )}

              {section === "contact" && (
                <ContactForm onBack={() => setSection("main")} />
              )}

              {section === "theme" && (
                <ThemeSection
                  currentTheme={currentTheme}
                  onThemeChange={(t) => { onThemeChange(t); setSection("main"); }}
                  onBack={() => setSection("main")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}