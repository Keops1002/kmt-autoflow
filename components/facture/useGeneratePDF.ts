import { supabase } from "@/lib/supabase";

export interface FacturePDFData {
  numero: string;
  created_at: string;
  status: string;
  payment_method?: string | null;
  paid_at?: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  tva_enabled: boolean;
  lignes: {
    label: string;
    quantity: number;
    unit_price: number;
    tva: number;
  }[];
  client: {
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  vehicle: {
    brand: string;
    model: string;
    plate?: string | null;
    km?: number | null;
  };
  garage: {
    name: string;
    legal_form?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    siret?: string | null;
    tva_number?: string | null;
    capital?: string | null;
  };
  signature_data?: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function paymentLabel(method?: string | null) {
  switch (method) {
    case "cb":       return "Carte bancaire";
    case "especes":  return "Espèces";
    case "virement": return "Virement bancaire";
    default:         return "Non précisé";
  }
}

async function buildData(factureId: string): Promise<{ data: FacturePDFData; numero: string }> {
  const { data: facture, error } = await supabase
    .from("factures")
    .select(`
      id, numero, created_at, status, payment_method, paid_at,
      total_ht, total_tva, total_ttc,
      devis:devis_id (
        tva_enabled, signature_data,
        devis_lignes ( label, quantity, unit_price, tva )
      ),
      dossiers:dossier_id (
        vehicles:vehicle_id (
          brand, model, plate, km,
          clients:client_id ( name, phone, email )
        )
      )
    `)
    .eq("id", factureId)
    .single();

  if (error || !facture) throw new Error("Facture introuvable");

  const { data: garage } = await supabase
    .from("garage_info")
    .select("*")
    .limit(1)
    .single();

  const d       = facture as any;
  const vehicle = d.dossiers?.vehicles;
  const client  = vehicle?.clients;

  const data: FacturePDFData = {
    numero:         d.numero,
    created_at:     d.created_at,
    status:         d.status,
    payment_method: d.payment_method,
    paid_at:        d.paid_at,
    total_ht:       d.total_ht,
    total_tva:      d.total_tva,
    total_ttc:      d.total_ttc,
    tva_enabled:    d.devis?.tva_enabled ?? true,
    lignes:         d.devis?.devis_lignes || [],
    signature_data: d.devis?.signature_data,
    client: {
      name:  client?.name  || "Client inconnu",
      phone: client?.phone,
      email: client?.email,
    },
    vehicle: {
      brand: vehicle?.brand || "",
      model: vehicle?.model || "",
      plate: vehicle?.plate,
      km:    vehicle?.km,
    },
    garage: {
      name:       garage?.name       || "Garage",
      legal_form: garage?.legal_form,
      address:    garage?.address,
      city:       garage?.city,
      phone:      garage?.phone,
      email:      garage?.email,
      siret:      garage?.siret,
      tva_number: garage?.tva_number,
      capital:    garage?.capital,
    },
  };

  return { data, numero: d.numero };
}

function generatePDFDoc(data: FacturePDFData): any {
  const { jsPDF } = require("jspdf");
  const doc    = new jsPDF({ unit: "mm", format: "a4" });
  const W      = 210;
  const M      = 14; // margin
  const accent = [55, 48, 163]  as [number, number, number];
  const grey   = [100, 116, 139] as [number, number, number];
  const light  = [248, 250, 252] as [number, number, number];
  const border = [226, 232, 240] as [number, number, number];
  const dark   = [30, 41, 59]   as [number, number, number];
  const green  = [16, 185, 129] as [number, number, number];
  const isFacture = data.numero.startsWith("F-");

  let y = 0;

  // ── Bande header ──
  doc.setFillColor(...accent);
  doc.rect(0, 0, W, 42, "F");

  // Nom + forme juridique
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const nomComplet = data.garage.legal_form
    ? `${data.garage.name} - ${data.garage.legal_form}`
    : data.garage.name;
  doc.text(nomComplet, M, 14);

  // Infos garage gauche
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 255);
  const garageLines: string[] = [];
  if (data.garage.address)    garageLines.push(data.garage.address);
  if (data.garage.city)       garageLines.push(data.garage.city);
  if (data.garage.phone)      garageLines.push(`Tél : ${data.garage.phone}`);
  if (data.garage.email)      garageLines.push(data.garage.email);
  garageLines.forEach((line, i) => doc.text(line, M, 21 + i * 4.2));

  // Type doc + numéro droite
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(isFacture ? "FACTURE" : "DEVIS", W - M, 14, { align: "right" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 255);
  doc.text(data.numero,                  W - M, 21, { align: "right" });
  doc.text(formatDate(data.created_at),  W - M, 26, { align: "right" });
  if (data.paid_at) {
    doc.text(`Payé le ${formatDate(data.paid_at)}`, W - M, 31, { align: "right" });
  }

  y = 52;

  // ── Blocs Client + Véhicule ──
  const boxH = 32;
  const boxW = (W - M * 2 - 6) / 2;

  // Client
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(M, y, boxW, boxH, 3, 3, "FD");
  doc.setTextColor(...grey);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT", M + 4, y + 7);
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.client.name, M + 4, y + 14);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  if (data.client.phone) doc.text(data.client.phone, M + 4, y + 20);
  if (data.client.email) doc.text(data.client.email, M + 4, y + 26);

  // Véhicule
  const vX = M + boxW + 6;
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(vX, y, boxW, boxH, 3, 3, "FD");
  doc.setTextColor(...grey);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("VÉHICULE", vX + 4, y + 7);
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.vehicle.brand} ${data.vehicle.model}`, vX + 4, y + 14);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grey);
  if (data.vehicle.plate) doc.text(`Immatriculation : ${data.vehicle.plate}`, vX + 4, y + 20);
  if (data.vehicle.km)    doc.text(`Kilométrage : ${data.vehicle.km.toLocaleString("fr-FR")} km`, vX + 4, y + 26);

  y += boxH + 10;

  // ── Tableau lignes ──
  const colLabel = M;
  const colQty   = 122;
  const colPU    = 145;
  const colTVA   = 165;
  const colTotal = W - M;

  // Header tableau
  doc.setFillColor(...accent);
  doc.rect(M, y, W - M * 2, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DÉSIGNATION",  colLabel + 2, y + 6);
  doc.text("QTÉ",          colQty,       y + 6, { align: "center" });
  doc.text("P.U. HT",      colPU + 10,   y + 6, { align: "right" });
  if (data.tva_enabled) {
    doc.text("TVA",         colTVA + 8,   y + 6, { align: "center" });
  }
  doc.text("TOTAL HT",     colTotal,     y + 6, { align: "right" });
  y += 9;

  // Lignes
  data.lignes.forEach((ligne, i) => {
    const rowH = 9;
    if (i % 2 === 1) {
      doc.setFillColor(...light);
      doc.rect(M, y, W - M * 2, rowH, "F");
    }
    doc.setTextColor(...dark);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const label = ligne.label.length > 58 ? ligne.label.substring(0, 55) + "..." : ligne.label;
    doc.text(label,                                           colLabel + 2, y + 6);
    doc.text(String(ligne.quantity),                          colQty,       y + 6, { align: "center" });
    doc.text(`${ligne.unit_price.toFixed(2)} €`,              colPU + 10,   y + 6, { align: "right" });
    if (data.tva_enabled) {
      doc.text(`${ligne.tva}%`,                               colTVA + 8,   y + 6, { align: "center" });
    }
    doc.text(`${(ligne.quantity * ligne.unit_price).toFixed(2)} €`, colTotal, y + 6, { align: "right" });
    doc.setDrawColor(...border);
    doc.line(M, y + rowH, W - M, y + rowH);
    y += rowH;
  });

  y += 8;

  // ── Totaux ──
  const totW = 75;
  const totX = W - M - totW;

  if (data.tva_enabled) {
    doc.setFillColor(...light);
    doc.setDrawColor(...border);
    doc.rect(totX, y, totW, 8, "FD");
    doc.setTextColor(...grey);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Total HT",                       totX + 4,  y + 5.5);
    doc.text(`${data.total_ht.toFixed(2)} €`,  W - M - 2, y + 5.5, { align: "right" });
    y += 8;

    doc.setFillColor(...light);
    doc.rect(totX, y, totW, 8, "FD");
    doc.text("TVA",                             totX + 4,  y + 5.5);
    doc.text(`${data.total_tva.toFixed(2)} €`, W - M - 2, y + 5.5, { align: "right" });
    y += 8;
  }

  // TTC
  doc.setFillColor(...accent);
  doc.rect(totX, y, totW, 11, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(data.tva_enabled ? "Total TTC" : "Total à payer", totX + 4, y + 7.5);
  doc.text(`${data.total_ttc.toFixed(2)} €`, W - M - 2, y + 7.5, { align: "right" });
  y += 17;

  // ── Conditions de paiement ──
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(252, 211, 77);
  doc.roundedRect(M, y, W - M * 2, 14, 3, 3, "FD");
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CONDITIONS DE PAIEMENT", M + 4, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Paiement à réception de facture. Tout retard entraîne des pénalités de 3× le taux légal + indemnité forfaitaire de 40 €.",
    M + 4, y + 10.5
  );
  y += 20;

  // ── Paiement encaissé ──
  if (data.status === "payee") {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(M, y, W - M * 2, 14, 3, 3, "FD");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("✓ Facture réglée", M + 4, y + 6);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 163, 74);
    const payLine = `Mode : ${paymentLabel(data.payment_method)}${data.paid_at ? `  ·  Le ${formatDate(data.paid_at)}` : ""}`;
    doc.text(payLine, M + 4, y + 11);
    y += 20;
  }

  // ── Signature ──
  if (data.signature_data) {
    doc.setTextColor(...grey);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("SIGNATURE CLIENT (BON POUR ACCORD)", M, y + 5);
    y += 8;
    try {
      doc.addImage(data.signature_data, "PNG", M, y, 55, 18);
    } catch (e) {
      console.error("Erreur signature", e);
    }
    y += 24;
  }

  // ── Mentions légales TVA ──
  if (!data.tva_enabled) {
    doc.setTextColor(...grey);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("TVA non applicable, art. 293 B du CGI", W / 2, y, { align: "center" });
    y += 8;
  }

  // ── Footer ──
  const footerY = 285;
  doc.setDrawColor(...border);
  doc.line(M, footerY - 5, W - M, footerY - 5);

  // Ligne 1 footer : identité légale
  doc.setTextColor(...grey);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const footerLeft = [
    data.garage.name,
    data.garage.legal_form,
    data.garage.capital ? `Capital : ${data.garage.capital}` : null,
  ].filter(Boolean).join("  ·  ");
  doc.text(footerLeft, M, footerY - 1);

  // Ligne 2 footer : SIRET + TVA intracommunautaire
  const footerRight = [
    data.garage.siret       ? `SIRET : ${data.garage.siret}` : null,
    data.garage.tva_number  ? `N° TVA : ${data.garage.tva_number}` : null,
  ].filter(Boolean).join("  ·  ");
  doc.text(footerRight, M, footerY + 3.5);

  // Numéro document centré
  doc.setFont("helvetica", "bold");
  doc.text(data.numero, W / 2, footerY + 3.5, { align: "center" });

  // Contact droite
  const footerContact = [data.garage.phone, data.garage.email].filter(Boolean).join("  ·  ");
  doc.text(footerContact, W - M, footerY + 3.5, { align: "right" });

  return doc;
}

export async function generateAndDownloadPDF(factureId: string) {
  const { data, numero } = await buildData(factureId);
  const doc = generatePDFDoc(data);
  doc.save(`${numero}.pdf`);
  return { data };
}

export async function generatePDFBlob(factureId: string): Promise<{ blob: Blob; data: FacturePDFData }> {
  const { data } = await buildData(factureId);
  const doc  = generatePDFDoc(data);
  const blob = doc.output("blob");
  return { blob, data };
}