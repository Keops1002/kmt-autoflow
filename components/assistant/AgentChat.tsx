"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Copy, Check, Loader2, Save } from "lucide-react";
import { Message, AgentConfig } from "./agent.config";
import { sendViaN8N, saveToSupabase } from "./agent.actions";

interface Props {
  agent: AgentConfig;
  messages: Message[];
  loading: boolean;
  lastResult: string;
  formData: Record<string, string>;
  onSend: (text: string) => void;
}

export default function AgentChat({ agent, messages, loading, lastResult, formData, onSend }: Props) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sent, setSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    await sendViaN8N(agent, formData, lastResult);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-bold leading-relaxed whitespace-pre-wrap"
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
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <Loader2 size={14} className="animate-spin" style={{ color: agent.color }} />
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                L'agent génère...
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Actions sur le résultat */}
      {lastResult && !loading && (
        <div className="flex gap-2 px-4 pb-2">
          <button onClick={handleCopy}
            className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all active:scale-95"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
            {copied ? <Check size={13} style={{ color: "#16a34a" }} /> : <Copy size={13} />}
            {copied ? "Copié !" : "Copier"}
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all active:scale-95"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}>
            {saved ? <Check size={13} style={{ color: "#16a34a" }} /> : <Save size={13} />}
            {saved ? "Sauvegardé !" : "Sauvegarder"}
          </button>
          <button onClick={handleSend_N8N}
            className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 text-white"
            style={{ background: agent.color }}>
            {sent ? <Check size={13} /> : <Send size={13} />}
            {sent ? "Envoyé !" : "Envoyer"}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 px-4 pb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(input); setInput(""); } }}
          placeholder="Affine le résultat..."
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
  );
}