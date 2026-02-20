export interface DevisLigne {
  id?: string;
  devis_id?: string;
  label: string;
  quantity: number;
  unit_price: number;
  tva: number;
}

export interface Devis {
  id: string;
  numero: string;
  status: string;
  tva_enabled: boolean;
  signature_data?: string | null;
  signed_at?: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  created_at: string;
  facture_id?: string | null; // ← nouveau
}

export function calcTotaux(lignes: DevisLigne[], tvaEnabled: boolean) {
  const total_ht = lignes.reduce((s, l) => s + l.quantity * l.unit_price, 0);
  const total_tva = tvaEnabled
    ? lignes.reduce((s, l) => s + l.quantity * l.unit_price * (l.tva / 100), 0)
    : 0;
  const total_ttc = total_ht + total_tva;
  return { total_ht, total_tva, total_ttc };
}

export async function getNextNumero(prefix: "D" | "F" | "A", supabase: any): Promise<string> {
  const year = new Date().getFullYear();
  const table = prefix === "D" ? "devis" : prefix === "F" ? "factures" : "avoirs";
  const { data } = await supabase
    .from(table)
    .select("numero")
    .like("numero", `${prefix}-${year}-%`)
    .order("numero", { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return `${prefix}-${year}-001`;
  const last = data[0].numero;
  const num  = parseInt(last.split("-")[2]) + 1;
  return `${prefix}-${year}-${String(num).padStart(3, "0")}`;
}