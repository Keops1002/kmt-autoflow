"use client";

import { useState } from "react";
import AppContainer from "@/components/layout/AppContainer";
import { Bot, Sparkles } from "lucide-react";
import AgentGrid from "@/components/assistant/AgentGrid";
import AgentModal from "@/components/assistant/AgentModal";
import { AgentConfig } from "@/components/assistant/agent.config";

export default function AssistantPage() {
  const [activeAgent, setActiveAgent] = useState<AgentConfig | null>(null);

  return (
    <AppContainer>
      <div className="px-4 pt-10 pb-40 space-y-6">

        {/* Header */}
        <div className="px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, var(--kmt-from), var(--kmt-to))" }}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Agent KMT
            </h1>
            <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
              Ton assistant IA garage
            </p>
          </div>
        </div>

        {/* Grille */}
        <AgentGrid onSelect={setActiveAgent} />

        {/* Info */}
        <div className="rounded-2xl border px-4 py-3 flex items-center gap-3"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <Sparkles size={16} style={{ color: "var(--accent)" }} />
          <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            Chaque agent est connecté à N8N et spécialisé pour une tâche précise.
          </p>
        </div>

      </div>

      {/* Modal */}
      {activeAgent && (
        <AgentModal
          agent={activeAgent}
          onClose={() => setActiveAgent(null)}
        />
      )}
    </AppContainer>
  );
}
