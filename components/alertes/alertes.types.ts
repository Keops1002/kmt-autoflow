import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export interface Alerte {
  id: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low" | "info";
  is_resolved: boolean;
  created_at: string;
}

export const PRIORITY_CONFIG = {
  high:   { label: "Urgent", icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
  medium: { label: "Moyen",  icon: AlertCircle,   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
  low:    { label: "Faible", icon: AlertCircle,   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
  info:   { label: "Info",   icon: Info,          color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)" },
} as const;

export const PRIORITY_ORDER: Record<Alerte["priority"], number> = {
  high: 0, medium: 1, low: 2, info: 3,
};