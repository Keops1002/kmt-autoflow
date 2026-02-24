"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Copy, Check, Loader2, Save, ExternalLink, CheckCircle } from "lucide-react";
import { Message, AgentConfig } from "./agent.config";
import { sendViaN8N, saveToSupabase } from "./agent.actions";

interface Props {
  agent: AgentConfig;
  messages: Message[];
  loading: boolean;
  lastResult: string;
  formData: Record<string, string>;
  onSend: (text: string) => Promise<void>;
  mediaBase64?: string; // Reçoit l'image de l'AgentModal
}

export default function AgentChat({ 
  agent, 
  messages, 
  loading, 
  lastResult, 
  formData, 
  onSend, 
  mediaBase64 
}: Props) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas lors des nouveaux messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleCopy() {
    await navigator.clipboard.writeText(lastResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    await saveToSupabase(agent, formData, lastResult);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSend_N8N() {
    if (!lastResult) return;
    // On passe mediaBase64 à l'action n8n pour l'envoi final
    await sendViaN8N(agent, formData, lastResult, mediaBase64);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Zone des Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-bold leading-relaxed whitespace-pre-wrap shadow-sm"
              style={{
                background: msg.role === "user" ? agent.color : "var(--card-bg)",
                color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                border: msg.role === "assistant" ? "1px solid var(--card-border)" : "none",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: agent.color }} />
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                L'agent réfléchit...
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Footer et Actions */}
      <div className="p-4 border-t bg-card-bg/50 backdrop-blur-md" style={{ borderColor: "var(--card-border)" }}>
        
        {/* Aperçu de l'image jointe (Glassmorphism style) */}
        {mediaBase64 && !sent && (
          <div className="mb-3 flex items-center gap-2 p-2 rounded-xl border border-dashed border-accent/30 bg-accent/5">
             <img src={mediaBase64} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
             <p className="text-[10px] font-bold text-accent">Photo prête pour l'envoi</p>
          </div>
        )}

        {/* Boutons de copie et sauvegarde */}
        <div className="flex gap-2 mb-3">
          <button onClick={handleCopy}
            className="flex-1 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 border transition-all active:scale-95"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "Copié !" : "Copier"}
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 border transition-all active:scale-95"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
            {saved ? <Check size={12} className="text-emerald-500" /> : <Save size={12} />}
            {saved ? "Sauvegardé !" : "Sauvegarder"}
          </button>
        </div>

        {/* Bouton d'action principale vers n8n */}
        {lastResult && !loading && (
          <button
            onClick={handleSend_N8N}
            disabled={sent}
            className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98]"
            style={{ 
              background: sent ? "#10b981" : "var(--text-primary)",
              color: "#fff"
            }}
          >
            {sent ? (
              <>
                <CheckCircle size={16} /> Transmis avec succès
              </>
            ) : (
              <>
                <ExternalLink size={16} /> 
                {/* Utilisation de agent.key au lieu de agent.id */}
                {agent.key === 'mail' ? 'Envoyer par Email' : 
                 agent.key === 'sms' ? 'Envoyer par SMS' : 
                 'Publier via n8n'}
              </>
            )}
          </button>
        )}

        {/* Barre d'input d'affinage */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === "Enter" && !e.shiftKey) { 
                e.preventDefault(); 
                onSend(input); 
                setInput(""); 
              } 
            }}
            placeholder="Affiner le résultat..."
            className="flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold border outline-none"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={() => { onSend(input); setInput(""); }}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: input.trim() ? agent.color : "var(--card-border)" }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}