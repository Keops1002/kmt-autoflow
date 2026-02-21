import { supabase } from "@/lib/supabase";
import { AgentConfig, Message } from "./agent.config";

export async function callAgentWebhook(
  agent: AgentConfig,
  formData: Record<string, string>,
  messages: Message[],
  mediaBase64?: string
): Promise<string> {
  const webhook = process.env[agent.webhookEnvKey];

  if (!webhook) {
    await new Promise((r) => setTimeout(r, 1200));
    return getMockResponse(agent, formData);
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
      history: messages,
      ...(mediaBase64 ? { image: mediaBase64 } : {}),
    }),
  });

  const data = await res.json();
  return data.output || data.text || data.message || "Contenu généré.";
}

export async function sendViaN8N(
  agent: AgentConfig,
  formData: Record<string, string>,
  content: string
): Promise<void> {
  const webhook = process.env[`${agent.webhookEnvKey}_SEND`];
  if (!webhook) return;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, ...formData }),
  });
}

export async function saveToSupabase(
  agent: AgentConfig,
  formData: Record<string, string>,
  content: string
): Promise<void> {
  await supabase.from("agent_outputs").insert({
    agent: agent.key,
    content,
    form_data: formData,
    created_at: new Date().toISOString(),
  });
}

function getMockResponse(
  agent: AgentConfig,
  formData: Record<string, string>
): string {
  const mocks: Record<string, string> = {
    social: `🚗 [Mock] Post ${formData.platform} — ${formData.sujet}\n\nTon garage KMT est là pour vous ! Profitez de nos offres exclusives. Prenez rendez-vous dès maintenant ! 💪\n\n#GarageKMT #Auto #${formData.platform}`,
    mail: `[Mock] Objet : ${formData.objet}\n\nBonjour ${formData.client},\n\n${formData.contexte}\n\nN'hésitez pas à nous contacter pour toute question.\n\nCordialement,\nL'équipe KMT`,
    sms: `[Mock] SMS pour ${formData.client} : ${formData.message} — Garage KMT`,
    avis: `[Mock] Merci pour votre avis ! ${formData.ton === "Chaleureux" ? "Nous sommes ravis de vous avoir servi 😊" : "Votre satisfaction est notre priorité."} À bientôt chez KMT !`,
  };
  return mocks[agent.key] || "Contenu généré par l'IA.";
}