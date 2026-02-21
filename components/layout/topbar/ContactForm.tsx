"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function ContactForm({ onBack }: { onBack: () => void }) {
  const [type, setType]       = useState<"bug"|"feature"|"other">("bug");
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
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  }

  if (sent) return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
        <Sparkles size={20} className="text-emerald-600" />
      </div>
      <p className="font-black text-slate-700">Message envoyé !</p>
      <p className="text-xs text-slate-400 text-center">On vous répond dès que possible.</p>
      <button onClick={onBack} className="text-xs font-bold text-[#17179C]">← Retour</button>
    </div>
  );

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
      <textarea value={message} onChange={(e) => setMessage(e.target.value)}
        placeholder="Décrivez votre demande..." rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white/70 text-xs text-slate-700 resize-none focus:outline-none" />
      <button onClick={handleSend} disabled={!message.trim() || sending}
        className="w-full py-2.5 rounded-xl bg-[#17179C] text-white font-black text-xs disabled:opacity-40 flex items-center justify-center gap-2">
        {sending && <Loader2 size={12} className="animate-spin" />}
        {sending ? "Envoi..." : "Envoyer →"}
      </button>
    </div>
  );
}