"use client";

import { X, User, Palette, MessageSquare, LogOut, ChevronRight,
         Sparkles, Building2, Calculator, Users } from "lucide-react";
import { useState } from "react";
import GarageInfoSection     from "./GarageInfoSection";
import ComptabiliteSection   from "./ComptabiliteSection";
import CollaborateursSection from "./CollaborateursSection";
interface Props {
  open: boolean;
  onClose: () => void;
}

type Section = "main" | "contact" | "garage" | "comptabilite" | "collaborateurs";

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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "var(--accent-light)" }}>
          <Sparkles size={24} style={{ color: "var(--accent)" }} />
        </div>
        <p className="font-black" style={{ color: "var(--text-primary)" }}>Message envoyé !</p>
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          On vous répond dès que possible.
        </p>
        <button onClick={onBack} className="mt-2 text-xs font-bold" style={{ color: "var(--accent)" }}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
        ← Retour
      </button>
      <div className="space-y-2">
        {types.map((t) => (
          <button key={t.id} onClick={() => setType(t.id as any)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left"
            style={{
              background: type === t.id ? "var(--accent-light)" : "var(--card-bg)",
              borderColor: type === t.id ? "var(--accent)" : "var(--card-border)",
            }}>
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{t.label}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
            </div>
            {type === t.id && (
              <div className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent)" }}>
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Décrivez votre demande..."
        rows={4}
        className="w-full px-4 py-3 rounded-2xl border text-sm resize-none outline-none font-bold"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          color: "var(--text-primary)",
        }}
      />
      <button onClick={handleSend} disabled={!message.trim() || sending}
        className="w-full py-3 rounded-2xl font-black text-sm text-white disabled:opacity-40 transition-all active:scale-[0.98]"
        style={{ background: "var(--accent)" }}>
        {sending ? "Envoi..." : "Envoyer →"}
      </button>
    </div>
  );
}

export default function SettingsDrawer({ open, onClose }: Props) {
  const [section, setSection] = useState<Section>("main");

  const titles: Record<Section, string> = {
    main:            "Réglages",
    contact:         "Nous contacter",
    garage:          "Infos du garage",
    comptabilite:    "Comptabilité",
    collaborateurs:  "Collaborateurs",
  };

  const menuItems = [
    { icon: Building2,  label: "Infos du garage",  desc: "SIRET, TVA, adresse...",     onClick: () => setSection("garage") },
    { icon: Calculator, label: "Comptabilité",      desc: "Export factures PDF / CSV",  onClick: () => setSection("comptabilite") },
    { icon: Users,      label: "Collaborateurs",    desc: "Salariés & contrats",        onClick: () => setSection("collaborateurs") },
    { icon: User,       label: "Compte",            desc: "Profil & connexion",         onClick: () => {} },
    { icon: Palette,    label: "Thème",             desc: "Apparence de l'app",         onClick: () => {} },
    { icon: MessageSquare, label: "Nous contacter", desc: "Bug, idée, question",        onClick: () => setSection("contact") },
    { icon: LogOut,     label: "Déconnexion",       desc: "",                           onClick: () => {}, danger: true },
  ];

  function handleClose() {
    onClose();
    setTimeout(() => setSection("main"), 300);
  }

  return (
    <>
      {open && (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={handleClose} />
      )}

      <div className={`absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl backdrop-blur-xl shadow-2xl
                      transition-all duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ background: "var(--nav-bg)", borderTop: "1px solid var(--card-border)" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--card-border)" }} />
        </div>

        <div className="px-5 pb-10 pt-2" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>
              {titles[section]}
            </h2>
            <button onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--card-bg)" }}>
              <X size={15} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>

          {section === "main" && (
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button key={item.label} onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] border"
                  style={{
                    background: item.danger ? "rgba(239,68,68,0.08)" : "var(--card-bg)",
                    borderColor: item.danger ? "rgba(239,68,68,0.2)" : "var(--card-border)",
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: item.danger ? "rgba(239,68,68,0.1)" : "var(--accent-light)" }}>
                    <item.icon size={17} strokeWidth={2}
                      style={{ color: item.danger ? "#ef4444" : "var(--accent)" }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-black"
                      style={{ color: item.danger ? "#ef4444" : "var(--text-primary)" }}>
                      {item.label}
                    </p>
                    {item.desc && (
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                    )}
                  </div>
                  {!item.danger && <ChevronRight size={15} style={{ color: "var(--text-muted)" }} />}
                </button>
              ))}
            </div>
          )}

          {section === "contact"        && <ContactForm            onBack={() => setSection("main")} />}
          {section === "garage"         && <GarageInfoSection      onBack={() => setSection("main")} />}
          {section === "comptabilite"   && <ComptabiliteSection    onBack={() => setSection("main")} />}
          {section === "collaborateurs" && <CollaborateursSection  onBack={() => setSection("main")} />}
        </div>
      </div>
    </>
  );
}