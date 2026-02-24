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
  const [step, setStep] = useState<"form" | "chat">("form");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const [media, setMedia] = useState<string | undefined>(undefined);

  /* =========================================================
     GENERATION INITIALE
  ========================================================= */

  async function handleGenerate(mediaBase64?: string) {
    setStep("chat");
    setLoading(true);

    if (mediaBase64) {
      setMedia(mediaBase64);
    }

    const firstMsg: Message = {
      role: "user",
      content: "Génère le contenu maintenant.",
    };

    setMessages([firstMsg]);

    try {
      const result = await callAgentWebhook(
        agent,
        formData,
        [firstMsg],
        mediaBase64
      );

      const nextMessages: Message[] = [
        firstMsg,
        { role: "assistant", content: result },
      ];

      setMessages(nextMessages);
      setLastResult(result);
    } catch {
      setMessages([
        firstMsg,
        { role: "assistant", content: "❌ Erreur de connexion avec l'agent." },
      ]);
    }

    setLoading(false);
  }

  /* =========================================================
     AFFINAGE (CHAT)
  ========================================================= */

  async function handleSend(text: string) {
    if (!text.trim() || loading) return;

    setLoading(true);

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(updatedMessages);

    try {
      const result = await callAgentWebhook(
        agent,
        formData,
        updatedMessages,
        media // 🔥 on conserve l’image pour l’affinage
      );

      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: "assistant", content: result },
      ];

      setMessages(finalMessages);
      setLastResult(result);
    } catch {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "❌ Erreur. Réessaie." },
      ]);
    }

    setLoading(false);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-sm rounded-3xl flex flex-col overflow-hidden"
        style={{
          background: "var(--bg-from)",
          border: "1px solid var(--card-border)",
          zIndex: 101,
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: agent.colorLight }}
            >
              <agent.icon size={18} style={{ color: agent.color }} />
            </div>

            <div>
              <p
                className="font-black text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {agent.label}
              </p>

              <div className="flex gap-2 mt-0.5">
                {(["form", "chat"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      if (s === "form") setStep("form");
                      if (s === "chat" && messages.length > 0) setStep("chat");
                    }}
                    className="text-[10px] font-black px-2 py-0.5 rounded-full transition-all"
                    style={{
                      background: step === s ? agent.color : "transparent",
                      color: step === s ? "#fff" : "var(--text-muted)",
                      opacity:
                        s === "chat" && messages.length === 0 ? 0.4 : 1,
                    }}
                  >
                    {s === "form" ? "Formulaire" : "Chat"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--card-bg)" }}
          >
            <X size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {step === "form" ? (
            <AgentForm
              agent={agent}
              formData={formData}
              onChange={(key, value) =>
                setFormData((prev) => ({ ...prev, [key]: value }))
              }
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