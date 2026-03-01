import { Instagram, Mail, MessageSquare, Star, Phone } from "lucide-react";

export type AgentKey = "social" | "mail" | "sms" | "avis" | "phone";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Field {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "client-picker";
  placeholder?: string;
  options?: string[];
}

export interface AgentConfig {
  key: AgentKey;
  label: string;
  icon: React.ElementType;
  color: string;
  colorLight: string;
  description: string;
  fields: Field[];
  webhookEnvKey: string;
  hasMedia?: boolean;
}

export const AGENTS: AgentConfig[] = [
  {
    key: "social",
    label: "Réseaux Sociaux",
    icon: Instagram,
    color: "#e1306c",
    colorLight: "rgba(225,48,108,0.12)",
    description: "Génère des posts engageants pour tes réseaux",
    webhookEnvKey: "NEXT_PUBLIC_N8N_SOCIAL_WEBHOOK",
    hasMedia: true,
    fields: [
      { key: "platform", label: "Plateforme",    type: "select",   options: ["Instagram", "Facebook", "TikTok", "LinkedIn"] },
      { key: "sujet",    label: "Sujet du post", type: "text",     placeholder: "Ex: promotion vidange, nouveau service..." },
      { key: "ton",      label: "Ton",           type: "select",   options: ["Professionnel", "Décontracté", "Humoristique", "Urgent"] },
    ],
  },
  {
    key: "mail",
    label: "Mail Client",
    icon: Mail,
    color: "#4f46e5",
    colorLight: "rgba(79,70,229,0.12)",
    description: "Rédige des emails professionnels à tes clients",
    webhookEnvKey: "NEXT_PUBLIC_N8N_MAIL_WEBHOOK",
    hasMedia: true,
    fields: [
      { key: "objet",    label: "Objet de l'email",  type: "text",          placeholder: "Ex: Devis prêt, véhicule terminé..."     },
      { key: "clients",  label: "Destinataires",      type: "client-picker"                                                         },
      { key: "contexte", label: "Contexte",           type: "textarea",      placeholder: "Ex: La voiture est prête, total 350€..." },
      { key: "ton",      label: "Ton",                type: "select",        options: ["Professionnel", "Chaleureux", "Urgent"]      },
    ],
  },
  {
    key: "sms",
    label: "SMS Client",
    icon: MessageSquare,
    color: "#16a34a",
    colorLight: "rgba(22,163,74,0.12)",
    description: "Envoie des SMS courts et efficaces",
    webhookEnvKey: "NEXT_PUBLIC_N8N_SMS_WEBHOOK",
    hasMedia: false,
    fields: [
      { key: "client",  label: "Nom du client",         type: "text",     placeholder: "Ex: M. Martin"                         },
      { key: "message", label: "Message à transmettre", type: "textarea", placeholder: "Ex: Voiture prête, freins changés, 180€" },
      { key: "ton",     label: "Ton",                   type: "select",   options: ["Neutre", "Urgent", "Amical"]               },
    ],
  },
  {
    key: "avis",
    label: "Avis Google",
    icon: Star,
    color: "#d97706",
    colorLight: "rgba(217,119,6,0.12)",
    description: "Réponds aux avis clients avec classe",
    webhookEnvKey: "NEXT_PUBLIC_N8N_AVIS_WEBHOOK",
    hasMedia: false,
    fields: [
      { key: "avis", label: "Contenu de l'avis",  type: "textarea", placeholder: "Colle ici l'avis du client..."                                              },
      { key: "note", label: "Note",                type: "select",   options: ["⭐ 1 étoile", "⭐⭐ 2 étoiles", "⭐⭐⭐ 3 étoiles", "⭐⭐⭐⭐ 4 étoiles", "⭐⭐⭐⭐⭐ 5 étoiles"] },
      { key: "ton",  label: "Ton de réponse",      type: "select",   options: ["Professionnel", "Chaleureux", "Diplomatique"]                                   },
    ],
  },
  {
    key: "phone",
    label: "Répondeur IA",
    icon: Phone,
    color: "#0891b2",
    colorLight: "rgba(8,145,178,0.12)",
    description: "Un agent IA répond à tes appels manqués automatiquement",
    webhookEnvKey: "NEXT_PUBLIC_N8N_PHONE_WEBHOOK",
    hasMedia: false,
    fields: [
      { key: "formule", label: "Formule de politesse", type: "select", options: [
          "Bonjour, garage KMT, que puis-je faire pour vous ?",
          "Garage KMT bonjour, j'écoute.",
          "Bienvenue chez KMT, comment puis-je vous aider ?",
        ],
      },
      { key: "infos_garage", label: "Infos du garage à communiquer", type: "textarea",
        placeholder: "Ex: Horaires lun-ven 8h-18h, adresse 12 rue des Acacias...",
      },
      { key: "questions", label: "Infos à collecter sur le client", type: "select", options: [
          "Nom + Téléphone + Problème véhicule",
          "Nom + Téléphone + Problème + Marque/Modèle",
          "Nom + Téléphone + Problème + Marque/Modèle + Kilométrage",
        ],
      },
      { key: "urgence", label: "Si client urgent", type: "select", options: [
          "Envoyer SMS au garagiste",
          "Proposer un rappel dans 1h",
          "Donner un numéro de secours",
        ],
      },
    ],
  },
];