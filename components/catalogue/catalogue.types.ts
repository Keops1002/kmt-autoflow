export interface CatalogueItem {
  id: string;
  label: string;
  unit_price: number;
  tva: number;
  type: "forfait" | "piece" | "main_oeuvre";
  created_at: string;
}

export const TYPE_CONFIG = {
  forfait:      { label: "Forfait",        color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)" },
  piece:        { label: "Pièce",          color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)" },
  main_oeuvre:  { label: "Main d'œuvre",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)" },
} as const;