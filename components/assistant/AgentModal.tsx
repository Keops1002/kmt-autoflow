"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AgentConfig, Message } from "./agent.config";
import { callAgentWebhook } from "./agent.actions";
import AgentForm from "./AgentForm";
import AgentChat from "./AgentChat";

interface Props {
  agent: AgentConfig;
  onClose: () => void;
}

export default function AgentModal({ agent, onClose }: Props) {
  const [step, setStep]           = useState<"form" | "chat">("form");
  const [formData, setFormData]   = useState<Record<string, string>>({});
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(false);
  const [lastResult, setLastResult] = useState("");
  const [media, setMedia]         = useState<string | undefined>(undefined);

  async function handleGenerate(mediaBase64?: string) {
    setStep("chat");
    setLoading(true);
    if (mediaBase64) setMedia(mediaBase64);

    const firstMsg: Message = { role: "user", content: "Génère le contenu maintenant." };
    setMessages([firstMsg]);

    try {
      const result = await callAgentWebhook(agent, formData, [firstMsg], mediaBase64);
      const next: Message[] = [firstMsg, { role: "assistant", content: result }];
      setMessages(next);
      setLastResult(result);
    } catch {
      setMessages([firstMsg, { role: "assistant", content: "❌ Erreur de connexion avec l'agent." }]);
    }
    setLoading(false);
  }

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);

    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);

    try {
      const result = await callAgentWebhook(agent, formData, updated, media);
      const final: Message[] = [...updated, { role: "assistant", content: result }];
      setMessages(final);
      setLastResult(result);
    } catch {
      setMessages([...updated, { role: "assistant", content: "❌ Erreur. Réessaie." }]);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet qui monte du bas — prend 92dvh pour laisser voir qu'on est dans l'app */}
      <div
        className="relative w-full rounded-t-3xl flex flex-col overflow-hidden"
        style={{
          background: "var(--bg-from)",
          border:     "1px solid var(--card-border)",
          zIndex:     101,
          height:     "92dvh",   // dvh = dynamic viewport height, correct sur mobile
          maxWidth:   "448px",   // max-w-md
          margin:     "0 auto",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--card-border)" }} />
        </div>

        {/* Header fixe */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: agent.colorLight }}>
              <agent.icon size={18} style={{ color: agent.color }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
                {agent.label}
              </p>
              <div className="flex gap-2 mt-0.5">
                {(["form", "chat"] as const).map((s) => (
                  <button key={s}
                    onClick={() => {
                      if (s === "form") setStep("form");
                      if (s === "chat" && messages.length > 0) setStep("chat");
                    }}
                    className="text-[10px] font-black px-2 py-0.5 rounded-full transition-all"
                    style={{
                      background: step === s ? agent.color : "transparent",
                      color:      step === s ? "#fff" : "var(--text-muted)",
                      opacity:    s === "chat" && messages.length === 0 ? 0.4 : 1,
                    }}>
                    {s === "form" ? "Formulaire" : "Chat"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--card-bg)" }}>
            <X size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Body scrollable — prend tout l'espace restant */}
        <div className="flex-1 overflow-y-auto">
          {step === "form" ? (
            <AgentForm
              agent={agent}
              formData={formData}
              onChange={(key, value) => setFormData((prev) => ({ ...prev, [key]: value }))}
              onGenerate={handleGenerate}
            />
          ) : (
            <AgentChat
              agent={agent}
              messages={messages}
              loading={loading}
              lastResult={lastResult}
              formData={formData}
              onSend={handleSend}
              mediaBase64={media}
            />
          )}
        </div>
      </div>
    </div>
  );
}