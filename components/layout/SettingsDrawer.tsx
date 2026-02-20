"use client";

import { X, User, Palette, MessageSquare, LogOut, ChevronRight, Bug, Sparkles } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Section = "main" | "contact";

function ContactForm({ onBack }: { onBack: () => void }) {
  const [type, setType]       = useState<"bug" | "feature" | "other">("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const types = [
    { id: "bug",     label: "🐛 Bug",           desc: "Quelque chose ne fonctionne pas" },
    { id: "feature", label: "✨ Amélioration",   desc: "J'ai une idée à proposer" },
    { id: "other",   label: "💬 Autre",          desc: "Question ou autre demande" },
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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <Sparkles size={24} className="text-emerald-600" />
        </div>
        <p className="font-black text-slate-700">Message envoyé !</p>
        <p className="text-xs text-slate-400 text-center">On vous répond dès que possible.</p>
        <button onClick={onBack} className="mt-2 text-xs font-bold text-[#17179C]">Retour</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-bold text-slate-400">
        ← Retour
      </button>

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Type de demande</p>
        <div className="space-y-2">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                type === t.id
                  ? "border-[#17179C]/30 bg-[#17179C]/5"
                  : "border-slate-100 bg-white/60"
              }`}
            >
              <div className="flex-1">
                <p className="text-sm font-black text-slate-700">{t.label}</p>
                <p className="text-[10px] text-slate-400">{t.desc}</p>
              </div>
              {type === t.id && (
                <div className="w-4 h-4 rounded-full bg-[#17179C] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Message</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre demande..."
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#17179C]/20"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim() || sending}
        className="w-full py-3 rounded-2xl bg-[#17179C] text-white font-black text-sm disabled:opacity-40 transition-all active:scale-[0.98]"
      >
        {sending ? "Envoi..." : "Envoyer →"}
      </button>
    </div>
  );
}

export default function SettingsDrawer({ open, onClose }: Props) {
  const [section, setSection] = useState<Section>("main");

  const menuItems = [
    {
      icon: User,
      label: "Compte",
      desc: "Profil & connexion",
      onClick: () => {},
    },
    {
      icon: Palette,
      label: "Thème",
      desc: "Apparence de l'app",
      onClick: () => {},
    },
    {
      icon: MessageSquare,
      label: "Nous contacter",
      desc: "Bug, idée, question",
      onClick: () => setSection("contact"),
    },
    {
      icon: LogOut,
      label: "Déconnexion",
      desc: "",
      onClick: () => {},
      danger: true,
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={() => { onClose(); setSection("main"); }}
        />
      )}

      {/* Drawer */}
      <div className={`absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white/90 backdrop-blur-xl shadow-2xl
                      transition-all duration-300 ease-out ${
                        open ? "translate-y-0" : "translate-y-full"
                      }`}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="px-5 pb-10 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-800">
              {section === "main" ? "Réglages" : "Nous contacter"}
            </h2>
            <button
              onClick={() => { onClose(); setSection("main"); }}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X size={15} />
            </button>
          </div>

          {section === "main" ? (
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] ${
                    item.danger
                      ? "bg-red-50 text-red-500"
                      : "bg-white/60 border border-slate-100"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    item.danger ? "bg-red-100" : "bg-slate-100"
                  }`}>
                    <item.icon size={17} strokeWidth={2} className={item.danger ? "text-red-500" : "text-slate-500"} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-black ${item.danger ? "text-red-500" : "text-slate-700"}`}>
                      {item.label}
                    </p>
                    {item.desc && <p className="text-[10px] text-slate-400">{item.desc}</p>}
                  </div>
                  {!item.danger && <ChevronRight size={15} className="text-slate-300" />}
                </button>
              ))}
            </div>
          ) : (
            <ContactForm onBack={() => setSection("main")} />
          )}
        </div>
      </div>
    </>
  );
}