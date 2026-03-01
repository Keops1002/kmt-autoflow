import { supabase } from "@/lib/supabase";
import type { AgentConfig, Message } from "./agent.config";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStaticWebhook(agentKey: string): string | undefined {
  if (agentKey === "mail")   return process.env.NEXT_PUBLIC_N8N_MAIL_WEBHOOK;
  if (agentKey === "social") return process.env.NEXT_PUBLIC_N8N_SOCIAL_WEBHOOK;
  if (agentKey === "sms")    return process.env.NEXT_PUBLIC_N8N_SMS_WEBHOOK;
  if (agentKey === "avis")   return process.env.NEXT_PUBLIC_N8N_AVIS_WEBHOOK;
  if (agentKey === "phone")  return process.env.NEXT_PUBLIC_N8N_PHONE_WEBHOOK;
  return undefined;
}

function safePick(v: any): string {
  return typeof v === "string" && v.trim().length > 0 ? v : "";
}

function extractOutput(data: any): string {
  return (
    safePick(data?.output)           ||
    safePick(data?.text)             ||
    safePick(data?.message)          ||
    safePick(data?.data?.output)     ||
    safePick(data?.body?.output)     ||
    safePick(data?.[0]?.output)      ||
    safePick(data?.[0]?.json?.output)||
    safePick(data?.[0]?.data?.output)
  );
}

function getLastAssistantMessage(messages: Message[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "assistant") return messages[i].content || "";
  }
  return "";
}

// Récupère le nom du garage depuis Supabase
async function getGarageNom(): Promise<string> {
  try {
    const { data } = await supabase
      .from("garage_info")
      .select("nom")
      .single();
    return data?.nom || "Le Garage";
  } catch {
    return "Le Garage";
  }
}

// ─── Génération + Affinage ─────────────────────────────────────────────────────

export async function callAgentWebhook(
  agent: AgentConfig,
  formData: Record<string, string>,
  messages: Message[],
  mediaBase64?: string
): Promise<string> {

  const webhook = getStaticWebhook(agent.key);

  if (!webhook) {
    await new Promise((r) => setTimeout(r, 800));
    return getMockResponse(agent, formData);
  }

  const sessionId      = `session_${agent.key}_${formData.emails || "default"}`;
  const lastUserMsg    = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const previousOutput = getLastAssistantMessage(messages);
  const isRefinement   = messages.length > 1 && previousOutput.length > 0;

  // Nom du garage (uniquement pour mail — évite un appel Supabase inutile)
  const garageNom = agent.key === "mail" ? await getGarageNom() : "";

  try {
    const res = await fetch(webhook, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        garageNom,
        message:          formData.message || formData.contexte || formData.sujet || "",
        refineInstruction: isRefinement ? lastUserMsg    : "",
        previousOutput:    isRefinement ? previousOutput : "",
        history:   messages,
        sessionId,
        ...(mediaBase64 ? { image: mediaBase64 } : {}),
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Erreur HTTP ${res.status} ${txt}`);
    }

    const data   = await res.json().catch(() => ({} as any));
    const output = extractOutput(data);
    return output || "Contenu généré.";

  } catch (error) {
    console.error("Erreur callAgentWebhook :", error);
    return "❌ Erreur de connexion avec l'agent.";
  }
}

// ─── Envoi mail via N8N ────────────────────────────────────────────────────────

export async function sendViaN8N(
  agent: AgentConfig,
  formData: Record<string, string>,
  content: string,
  mediaBase64?: string
): Promise<void> {

  if (agent.key !== "mail") return;

  const webhook = process.env.NEXT_PUBLIC_N8N_MAIL_WEBHOOK_SEND;
  if (!webhook) { console.error("❌ Webhook SEND non défini"); return; }

  const res = await fetch(webhook, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      ...formData,
      // image en base64 — N8N le convertira en pièce jointe
      ...(mediaBase64 ? { image: mediaBase64 } : {}),
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ─── Sauvegarde Supabase ───────────────────────────────────────────────────────

export async function saveToSupabase(
  agent: AgentConfig,
  formData: Record<string, string>,
  content: string
): Promise<void> {
  await supabase.from("agent_outputs").insert({
    agent:      agent.key,
    content,
    form_data:  formData,
    created_at: new Date().toISOString(),
  });
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

function getMockResponse(agent: AgentConfig, formData: Record<string, string>): string {
  const mocks: Record<string, string> = {
    social: `🚗 [Mock] Post ${formData.platform || ""} — ${formData.sujet || ""}\n\n#Garage`,
    mail:   `Objet : ${formData.objet || ""}\n\nBonjour ${formData.clients || ""},\n\n${formData.contexte || ""}\n\nCordialement,\nLe Garage`,
    sms:    `[Mock] SMS pour ${formData.clients || ""} :\n${formData.message || ""}`,
    avis:   `[Mock] Merci pour votre avis !\n— Le Garage`,
  };
  return mocks[agent.key] || "Contenu généré par l'IA.";
}