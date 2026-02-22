import type { Devis } from "@/components/devis/devis.types";

export interface Task {
  id: string;
  title: string;
  priority: string;
  is_done: boolean;
}

export interface Dossier {
  id: string;
  created_at: string;
  problem: string;
  status: string;
  payment_status: string;
  estimated_price: number | null;
  paid_amount: number | null;
  paid_at: string | null;
  tasks?: Task[];
  devis?: Devis[];
  vehicles: {
    brand: string;
    model: string;
    plate?: string;
    clients: { name: string; phone?: string; email?: string } | null;
  } | null;
}