"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { AGENTS, AgentConfig } from "./agent.config";

interface Props {
  onSelect: (agent: AgentConfig) => void;
}

export default function AgentGrid({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {AGENTS.map((agent) => (
        <button
          key={agent.key}
          onClick={() => onSelect(agent)}
          className="rounded-3xl border p-4 text-left transition-all duration-200 active:scale-[0.97] flex flex-col gap-3"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: agent.colorLight }}>
            <agent.icon size={20} style={{ color: agent.color }} />
          </div>
          <div>
            <p className="font-black text-sm" style={{ color: "var(--text-primary)" }}>
              {agent.label}
            </p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>
              {agent.description}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-auto">
            <Sparkles size={10} style={{ color: agent.color }} />
            <span className="text-[10px] font-black" style={{ color: agent.color }}>IA activée</span>
            <ChevronRight size={10} style={{ color: agent.color }} className="ml-auto" />
          </div>
        </button>
      ))}
    </div>
  );
}