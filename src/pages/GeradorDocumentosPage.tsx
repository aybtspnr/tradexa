/**
 * Gerador de Documentos de Exportação — PDF Edition
 * Gera Proforma Invoice, Packing List e Instruções de Embarque em PDF.
 */
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, Package, Ship,
  CheckCircle, Globe, Upload, X, Image,
  Building2, CreditCard, Plus, Copy, Trash2,
  Search, Save, FolderOpen, Eye, Loader2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

// ─── Dynamic imports to avoid build-time issues ───
let jsPDF: any = null;
let autoTable: any = null;

async function loadPdfLibs() {
  if (jsPDF) return;
  const [jspdfMod, autoTableMod] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  jsPDF = jspdfMod.default || jspdfMod.jsPDF;
  // jspdf-autotable v5: usar como funcao standalone, nao como metodo
  autoTable = autoTableMod.default || autoTableMod;
}

// ─── Tipos ───
type DocType = "proforma" | "packing" | "shipping";

interface Product {
  description: string;
  hsCode: string;
  ncm: string;
  quantity: string;
  unit: string;
  unitValue: string;
}

interface FormData {
  exporterName: string;
  exporterAddress: string;
  exporterCity: string;
  exporterState: string;
  exporterZip: string;
  exporterCountry: string;
  exporterCNPJ: string;
  exporterPhone: string;
  exporterEmail: string;
  exporterContactName: string;
  importerName: string;
  importerAddress: string;
  importerCity: string;
  importerCountry: string;
  importerPhone: string;
  importerEmail: string;
  importerContactName: string;
  importerTaxId: string;
  products: Product[];
  incoterm: string;
  currency: string;
  paymentTerms: string;
  totalValue: string;
  additionalCharges: string;
  insurance: string;
  transportMode: string;
  originPort: string;
  destinationPort: string;
  originCity: string;
  destinationCity: string;
  vesselFlight: string;
  voyageNumber: string;
  departureDate: string;
  arrivalDate: string;
  containerNumber: string;
  sealNumber: string;
  grossWeight: string;
  netWeight: string;
  volume: string;
  packagesQty: string;
  packageType: string;
  marks: string;
  bankName: string;
  bankSWIFT: string;
  bankAccount: string;
  bankAddress: string;
  intermediaryBank: string;
  additionalNotes: string;
  acceptedTerms: boolean;
}

interface SavedTemplate {
  id: string;
  name: string;
  data: FormData;
  docType: DocType;
  savedAt: string;
}

const emptyProduct: Product = {
  description: "", hsCode: "", ncm: "", quantity: "", unit: "UN", unitValue: "",
};

const initialForm: FormData = {
  exporterName: "", exporterAddress: "", exporterCity: "", exporterState: "", exporterZip: "", exporterCountry: "Brasil",
  exporterCNPJ: "", exporterPhone: "", exporterEmail: "", exporterContactName: "",
  importerName: "", importerAddress: "", importerCity: "", importerCountry: "", importerPhone: "", importerEmail: "",
  importerContactName: "", importerTaxId: "",
  products: [{ ...emptyProduct }],
  incoterm: "FOB", currency: "USD", paymentTerms: "TT 30/70",
  totalValue: "", additionalCharges: "", insurance: "",
  transportMode: "Marítimo", originPort: "", destinationPort: "", originCity: "", destinationCity: "",
  vesselFlight: "", voyageNumber: "", departureDate: "", arrivalDate: "",
  containerNumber: "", sealNumber: "", grossWeight: "", netWeight: "", volume: "", packagesQty: "", packageType: "Pallets",
  marks: "",
  bankName: "", bankSWIFT: "", bankAccount: "", bankAddress: "", intermediaryBank: "",
  additionalNotes: "", acceptedTerms: false,
};

// ─── Dropdowns ───
const COUNTRIES = [
  "Brasil", "EUA", "China", "Alemanha", "França", "Itália", "Espanha", "Portugal",
  "Reino Unido", "Japão", "Coreia do Sul", "Índia", "México", "Argentina", "Chile",
  "Colômbia", "Peru", "Emirados Árabes", "Arábia Saudita", "Singapura",
  "Países Baixos", "Bélgica", "Canadá", "Austrália",
];
const BRAZILIAN_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const INCOTERMS = ["EXW","FCA","FAS","FOB","CFR","CIF","CPT","CIP","DAP","DPU","DDP"];
const CURRENCIES = ["USD","EUR","BRL","GBP","CNY"];
const PAYMENT_TERMS = ["TT 30/70","TT 50/50","TT 100% antecipado","L/C à vista","L/C 30/60/90 dias","Cobrança documentária"];
const TRANSPORT_MODES = ["Marítimo","Aéreo","Rodoviário","Multimodal"];
const PACKAGE_TYPES = ["Pallets","Caixas","Sacos/Bags","Tambores","Containers","Bobinas","Fardos"];

// ─── Template storage helpers ───
const TEMPLATES_KEY = "tradexa_doc_templates";

function loadTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// ─── Notification (envia via /api/send-contact → Resend → help@tradexa.com.br) ───
async function notifyUsage(data: { docType: string; exporter: string; importer: string; pdfDataUri?: string }) {
  const body: any = {
    name: data.exporter || "Gerador de Documentos",
    email: "sistema@tradexa.com.br",
    message: `Documento gerado: ${data.docType}\nExportador: ${data.exporter}\nImportador: ${data.importer}\nData: ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR")}`,
    service: "Gerador de Documentos",
    source: "gerador_documentos",
  };
  if (data.pdfDataUri && data.pdfDataUri.includes("base64,")) {
    body.pdf_base64 = data.pdfDataUri;
    body.pdf_filename = `${data.docType}_${Date.now().toString(36)}.pdf`;
  } else {
    console.warn("[notifyUsage] pdfDataUri vazio ou inválido:", data.pdfDataUri ? data.pdfDataUri.substring(0, 50) : "undefined");
  }
  try {
    const resp = await fetch("/api/send-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      console.error("[notifyUsage] Servidor retornou erro:", resp.status);
    } else {
      console.log("[notifyUsage] Notificação enviada com sucesso");
    }
  } catch (err: any) {
    console.error("[notifyUsage] Erro ao enviar notificação:", err.message || err);
  }
}


// ─── Translations ───
type Language = "pt" | "en" | "es";

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  pt: {
    title: "FATURA PROFORMA",
    subtitle: "Fatura Proforma",
    parties: "PARTES",
    exporter: "EXPORTADOR",
    importer: "IMPORTADOR",
    products: "PRODUTOS",
    description: "Descricao",
    hsCode: "NCM",
    qty: "Qtd",
    unit: "Unid",
    unitPrice: "Preco Unit.",
    total: "Total",
    totals: "TOTAIS",
    subtotal: "Subtotal",
    additionalCharges: "Custos Adicionais",
    insurance: "Seguro",
    grandTotal: "TOTAL GERAL",
    commercialTerms: "CONDICOES COMERCIAIS",
    paymentTerms: "Condicoes de Pagamento",
    currency: "Moeda",
    incoterm: "Incoterm",
    bankingDetails: "DADOS BANCARIOS",
    bank: "Banco",
    swiftIban: "SWIFT / IBAN",
    account: "Conta",
    bankAddress: "Endereco do Banco",
    footerDisclaimer: "Este documento é informativo. Verifique todas as informações antes do uso.",
    intermediaryBank: "Banco Intermediario",
    notes: "OBSERVACOES",
    reference: "REFERENCIA",
    date: "Data",
    packing: "PACKING LIST",
    packingSubtitle: "",
    shipping: "INSTRUCOES DE EMBARQUE",
    shippingSubtitle: "Instrucoes ao Agente de Carga",
    shippingDetails: "DETALHES DO EMBARQUE",
    mode: "Modal / Incoterm",
    route: "Rota",
    vessel: "Navio / Voo",
    voyage: "Viagem",
    container: "Container / Lacre",
    packages: "Volumes",
    weight: "Peso (Bruto/Liquido)",
    volume: "Volume",
    dates: "ETD / ETA",
    _values: { "Maritimo": "Maritimo", "Aereo": "Aereo", "Rodoviario": "Rodoviario", "Multimodal": "Multimodal", "Pallets": "Pallets", "Caixas": "Caixas", "Sacos/Bags": "Sacos/Bags", "Tambores": "Tambores", "Containers": "Containers", "Bobinas": "Bobinas", "Fardos": "Fardos" },
  },
  en: {
    title: "PROFORMA INVOICE",
    subtitle: "Proforma Invoice",
    parties: "PARTIES",
    exporter: "EXPORTER",
    importer: "IMPORTER",
    products: "PRODUCTS",
    description: "Description",
    hsCode: "HS Code",
    qty: "Qty",
    unit: "Unit",
    unitPrice: "Unit Price",
    total: "Total",
    totals: "TOTALS",
    subtotal: "Subtotal",
    additionalCharges: "Additional Charges",
    insurance: "Insurance",
    grandTotal: "GRAND TOTAL",
    commercialTerms: "COMMERCIAL TERMS",
    paymentTerms: "Payment Terms",
    currency: "Currency",
    incoterm: "Incoterm",
    bankingDetails: "BANKING DETAILS",
    bank: "Bank",
    swiftIban: "SWIFT / IBAN",
    account: "Account",
    bankAddress: "Bank Address",
    footerDisclaimer: "This document is for informational purposes only. Verify all information before use.",
    intermediaryBank: "Intermediary Bank",
    notes: "NOTES",
    reference: "REFERENCE",
    date: "Date",
    packing: "PACKING LIST",
    packingSubtitle: "",
    shipping: "SHIPPING INSTRUCTIONS",
    shippingSubtitle: "",
    shippingDetails: "SHIPPING DETAILS",
    mode: "Mode / Incoterm",
    route: "Route",
    vessel: "Vessel / Flight",
    voyage: "Voyage",
    container: "Container / Seal",
    packages: "Packages",
    weight: "Weight (Gross/Net)",
    volume: "Volume",
    dates: "ETD / ETA",
    _values: { "Maritimo": "Maritime", "Aereo": "Air", "Rodoviario": "Road", "Multimodal": "Multimodal", "Pallets": "Pallets", "Caixas": "Cartons", "Sacos/Bags": "Bags", "Tambores": "Drums", "Containers": "Containers", "Bobinas": "Coils", "Fardos": "Bales" },
  },
  es: {
    title: "FACTURA PROFORMA",
    subtitle: "Factura Proforma",
    parties: "PARTES",
    exporter: "EXPORTADOR",
    importer: "IMPORTADOR",
    products: "PRODUCTOS",
    description: "Descripcion",
    hsCode: "Codigo Arancelario",
    qty: "Cant",
    unit: "Unid",
    unitPrice: "Precio Unit.",
    total: "Total",
    totals: "TOTALES",
    subtotal: "Subtotal",
    additionalCharges: "Cargos Adicionales",
    insurance: "Seguro",
    grandTotal: "TOTAL GENERAL",
    commercialTerms: "CONDICIONES COMERCIALES",
    paymentTerms: "Condiciones de Pago",
    currency: "Moneda",
    incoterm: "Incoterm",
    bankingDetails: "DATOS BANCARIOS",
    bank: "Banco",
    swiftIban: "SWIFT / IBAN",
    account: "Cuenta",
    bankAddress: "Direccion del Banco",
    footerDisclaimer: "Este documento es solo informativo. Verifique toda la informacion antes de usarlo.",
    intermediaryBank: "Banco Intermediario",
    notes: "NOTAS",
    reference: "REFERENCIA",
    date: "Fecha",
    packing: "PACKING LIST",
    packingSubtitle: "",
    shipping: "INSTRUCCIONES DE ENVIO",
    shippingSubtitle: "",
    shippingDetails: "DETALLES DE ENVIO",
    mode: "Modo / Incoterm",
    route: "Ruta",
    vessel: "Buque / Vuelo",
    voyage: "Viaje",
    container: "Contenedor / Sello",
    packages: "Paquetes",
    weight: "Peso (Bruto/Neto)",
    volume: "Volumen",
    dates: "ETD / ETA",
    _values: { "Maritimo": "Maritimo", "Aereo": "Aereo", "Rodoviario": "Rodoviario", "Multimodal": "Multimodal", "Pallets": "Pallets", "Caixas": "Cajas", "Sacos/Bags": "Sacos", "Tambores": "Tambores", "Containers": "Contenedores", "Bobinas": "Rollos", "Fardos": "Fardos" },
  },
};

// ─── PDF Generator (Premium Design) ───
function generatePDF(docType: DocType, data: FormData, logoBase64: string | null, language: Language = "pt"): string {
  const t = TRANSLATIONS[language];
  const RED = [216, 14, 22] as [number, number, number];
  const DARK = [30, 30, 30] as [number, number, number];
  const GRAY = [100, 100, 100] as [number, number, number];
  const LIGHT_BG = [248, 248, 250] as [number, number, number];
  
  const doc = new (jsPDF as any)({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 15;
  const now = new Date().toLocaleDateString("pt-BR");
  const ref = `TRX-${Date.now().toString(36).toUpperCase()}`;

  // ═══════════════ TOP BAR ═══════════════
  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 4, "F");
  
  // ═══════════════ HEADER ═══════════════
  let y = 12;
  
  // Client logo at top-left
  if (logoBase64) {
    try {
      const prefixed = logoBase64 && !logoBase64.startsWith("data:") 
        ? `data:image/png;base64,${logoBase64}` 
        : logoBase64;
      doc.addImage(prefixed, "PNG", M, y, 30, 15);
    } catch {}
  }
  
  // TRADEXA branding top-right (subtle)
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "italic");
  doc.text("Powered by TRADEXA", W - M, y + 2, { align: "right" });

  y += logoBase64 ? 18 : 6;

  // Divider line
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // ── Document Title ──
  const titles: Record<DocType, string> = {
    proforma: t.title,
    packing: t.packing,
    shipping: t.shipping,
  };
  const subTitles: Record<DocType, string> = {
    proforma: t.subtitle,
    packing: t.packingSubtitle,
    shipping: t.shippingSubtitle,
  };
  
  doc.setFontSize(16);
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text(titles[docType], M, y);
  
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  if (subTitles[docType]) doc.text(subTitles[docType], M, y + 5);
  
  // Reference box top-right
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - M - 55, y - 3, 55, 14, 2, 2, "S");
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text(t.reference, W - M - 53, y + 1);
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(ref, W - M - 53, y + 5);
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(`${t.date}: ${now}`, W - M - 53, y + 8.5);
  
  y += 12;

  // ═══════════════ PARTIES ═══════════════
  if (docType === "proforma" || docType === "packing") {
    // Section header with red accent
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.parties, M + 4, y + 5);
    y += 9;

    // Two-column layout for exporter / importer
    const colW = (W - 2 * M - 6) / 2;
    const drawPartyBox = (x: number, label: string, name: string, details: string[]) => {
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(x, y, colW, 22, 2, 2, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(...RED);
      doc.setFont("helvetica", "bold");
      doc.text(label, x + 3, y + 4);
      doc.setFontSize(7.5);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.text(name || "—", x + 3, y + 9);
      doc.setFontSize(6);
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "normal");
      details.forEach((d, i) => {
        if (d) doc.text(d, x + 3, y + 12.5 + (i * 3.5));
      });
    };

    const exporterDetails = [
      data.exporterAddress ? `${data.exporterAddress}, ${data.exporterCity} — ${data.exporterState}` : "",
      data.exporterCNPJ ? `CNPJ: ${data.exporterCNPJ}` : "",
      data.exporterContactName ? `Contact: ${data.exporterContactName} | ${data.exporterEmail} | ${data.exporterPhone}` : "",
    ].filter(Boolean);
    
    drawPartyBox(M, t.exporter, data.exporterName, exporterDetails);

    const importerDetails = [
      data.importerAddress ? `${data.importerAddress}, ${data.importerCity} — ${data.importerCountry}` : "",
      data.importerTaxId ? `Tax ID: ${data.importerTaxId}` : "",
      data.importerContactName ? `Contact: ${data.importerContactName} | ${data.importerEmail} | ${data.importerPhone}` : "",
    ].filter(Boolean);
    
    drawPartyBox(M + colW + 6, t.importer, data.importerName, importerDetails);
    y += 26;
  }

  // ═══════════════ PRODUCTS TABLE ═══════════════
  const prods = data.products.filter((p) => p.description.trim());
  if (prods.length > 0) {
    // Section header
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.products, M + 4, y + 5);
    y += 8;

    const rows = prods.map((p, i) => [
      String(i + 1),
      p.description,
      p.hsCode || p.ncm,
      p.quantity,
      p.unit || "UN",
      `${data.currency} ${Number(p.unitValue || 0).toFixed(2)}`,
      `${data.currency} ${(Number(p.quantity || 0) * Number(p.unitValue || 0)).toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: y,
      head: [["#", t.description, t.hsCode, t.qty, t.unit, t.unitPrice, t.total]],
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: RED,
        textColor: [255, 255, 255],
        fontSize: 6.5,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 6.5,
        textColor: DARK,
        cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
      },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 52 },
        2: { cellWidth: 17, halign: "center" },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 11, halign: "center" },
        5: { cellWidth: 26, halign: "right" },
        6: { cellWidth: 26, halign: "right" },
      },
      margin: { left: M, right: M },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ═══════════════ SHIPPING DETAILS ═══════════════
  if (docType === "packing" || docType === "shipping") {
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.shippingDetails, M + 4, y + 5);
    y += 9;

    const v = t._values;
    const details = [
      [t.mode, `${v[data.transportMode] || data.transportMode} / ${data.incoterm}`],
      [t.route, `${data.originPort || data.originCity} → ${data.destinationPort || data.destinationCity}`],
      [t.vessel, data.vesselFlight || "TBA"],
      [t.voyage, data.voyageNumber || ""],
      [t.container, `${data.containerNumber || "N/A"} / ${data.sealNumber || "N/A"}`],
      [t.packages, `${data.packagesQty} × ${v[data.packageType] || data.packageType}`],
      [t.weight, `${data.grossWeight || "—"} kg / ${data.netWeight || "—"} kg`],
      [t.volume, data.volume ? `${data.volume} m³` : "—"],
      [t.dates, `${data.departureDate || "TBA"} / ${data.arrivalDate || "TBA"}`],
    ].filter(([, val]) => val && val !== " / " && val !== "/ " && val !== "—" && !val.includes("undefined"));
    
    details.forEach(([label, value], i) => {
      const rowY = y + (i * 5);
      doc.setFillColor(i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      // Simple two-column layout
      doc.setFontSize(6.5);
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "bold");
      doc.text(label, M + 3, rowY + 3.5);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.text(value, M + 55, rowY + 3.5);
    });
    y += details.length * 5 + 5;
  }

  // ═══════════════ COMMERCIAL TERMS ═══════════════
  if (docType === "proforma") {
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.commercialTerms, M + 4, y + 5);
    y += 9;

    const terms = [
      [t.paymentTerms, data.paymentTerms || "—"],
      [t.currency, data.currency || "—"],
      [t.incoterm, data.incoterm || "—"],
    ].filter(([, v]) => v);
    
    terms.forEach(([label, value], i) => {
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "bold");
      doc.text(label, M + 3, y + (i * 5) + 3.5);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.text(value, M + 50, y + (i * 5) + 3.5);
    });
    y += terms.length * 5 + 5;
  }

  // ═══════════════ TOTALS (Proforma) ═══════════════
  if (docType === "proforma") {
    const total = Number(data.totalValue || 0);
    const charges = Number(data.additionalCharges || 0);
    const insurance = Number(data.insurance || 0);
    const grandTotal = total + charges + insurance;
    
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.totals, M + 4, y + 5);
    y += 10;

    if (grandTotal > 0) {
      autoTable(doc, {
        startY: y,
        theme: "plain",
        body: [
          [{ content: t.subtotal, styles: { fontStyle: "normal", fontSize: 7 } },
           { content: `${data.currency} ${total.toFixed(2)}`, styles: { halign: "right", fontSize: 7 } }],
          [{ content: t.additionalCharges, styles: { fontStyle: "normal", fontSize: 7 } },
           { content: `${data.currency} ${charges.toFixed(2)}`, styles: { halign: "right", fontSize: 7 } }],
          [{ content: t.insurance, styles: { fontStyle: "normal", fontSize: 7 } },
           { content: `${data.currency} ${insurance.toFixed(2)}`, styles: { halign: "right", fontSize: 7 } }],
          [{ content: t.grandTotal, styles: { fontStyle: "bold", fontSize: 8, fillColor: RED, textColor: [255, 255, 255] } },
           { content: `${data.currency} ${grandTotal.toFixed(2)}`, styles: { fontStyle: "bold", fontSize: 8, halign: "right", fillColor: RED, textColor: [255, 255, 255] } }],
        ],
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 55 } },
        margin: { left: 85, right: M },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // ═══════════════ BANKING DETAILS ═══════════════
  if (docType !== "shipping" && (data.bankName || data.bankSWIFT)) {
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.bankingDetails, M + 4, y + 5);
    y += 9;

    const banks = [
      [t.bank, data.bankName || "—"],
      [t.swiftIban, data.bankSWIFT || "—"],
      [t.account, data.bankAccount || "—"],
      [t.bankAddress, data.bankAddress || ""],
      [t.intermediaryBank, data.intermediaryBank || ""],
    ].filter(([, v]) => v);
    
    banks.forEach(([label, value], i) => {
      doc.setFontSize(6.5);
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "bold");
      doc.text(label, M + 3, y + (i * 4.5) + 3.5);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.text(value, M + 45, y + (i * 4.5) + 3.5);
    });
    y += banks.length * 4.5 + 5;
  }

  // ═══════════════ NOTES ═══════════════
  if (data.additionalNotes && (docType === "proforma" || docType === "shipping")) {
    doc.setFillColor(...RED);
    doc.rect(M, y, 1.5, 6, "F");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(t.notes, M + 4, y + 5);
    y += 8;
    
    doc.setFontSize(7);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.additionalNotes, W - 2 * M - 6);
    doc.text(lines, M + 3, y);
    y += lines.length * 4 + 4;
  }

  // ═══════════════ FOOTER ═══════════════
  const footerY = 283;
  // Red bar
  doc.setFillColor(...RED);
  doc.rect(0, footerY - 1, W, 2, "F");
  // Subtle gray bar
  doc.setFillColor(245, 245, 247);
  doc.rect(0, footerY + 1, W, 14, "F");
  
  doc.setFontSize(6);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "italic");
  doc.text(t.footerDisclaimer, M, footerY + 7);

  return doc.output("datauristring");
}

// ─── Form components ───
function FormInput({ label, value, onChange, placeholder = "", type = "text", required = false }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      {label && <label className="text-[11px] font-bold text-[#5E6278] block mb-1">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 placeholder:text-slate-400" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: {
  label?: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      {label && <label className="text-[11px] font-bold text-[#5E6278] block mb-1">{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:border-[#D80E16]/30 appearance-none bg-no-repeat bg-[right_0.75rem_center] pr-8"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20viewBox=%220%2024%2024%22%20fill=%22none%22%20stroke=%22%235E6278%22%20stroke-width=%222%22%3E%3Cpath%20d=%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Main Page ───
export default function GeradorDocumentosPage() {
  const [docType, setDocType] = useState<DocType>("proforma");
  const [language, setLanguage] = useState<Language>("pt");
  const [form, setForm] = useState<FormData>(initialForm);
  const [generated, setGenerated] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── CNPJ Lookup state ──
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState("");

  // ── PDF Preview state ──
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);

  // ── Templates state ──
  const [templates, setTemplates] = useState<SavedTemplate[]>(() => loadTemplates());
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  useSeo({
    title: "Gerador de Documentos de Exportação — PDF Grátis | TRADEXA",
    description: "Gere Proforma Invoice, Packing List e Instruções de Embarque em PDF. Upload de logo e formulário completo.",
    canonical: "https://www.tradexa.com.br/ferramentas/gerador-documentos",
  });

  const update = useCallback((field: keyof FormData, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
  }, []);

  const updateProduct = useCallback((i: number, field: keyof Product, value: string) => {
    setForm((f) => {
      const prods = [...f.products];
      prods[i] = { ...prods[i], [field]: value };
      return { ...f, products: prods };
    });
  }, []);

  const addProduct = useCallback(() => {
    setForm((f) => ({ ...f, products: [...f.products, { ...emptyProduct }] }));
  }, []);

  const duplicateProduct = useCallback((i: number) => {
    setForm((f) => {
      const prods = [...f.products];
      prods.splice(i + 1, 0, { ...prods[i] });
      return { ...f, products: prods };
    });
  }, []);

  const removeProduct = useCallback((i: number) => {
    setForm((f) => {
      if (f.products.length <= 1) return f;
      return { ...f, products: f.products.filter((_, idx) => idx !== i) };
    });
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErrorMsg("Logo muito grande. Use imagem até 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
      setLogoBase64(reader.result as string);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  }, []);

  // ═══════════════ CNPJ LOOKUP ═══════════════
  const handleCnpjLookup = useCallback(async () => {
    const cnpj = form.exporterCNPJ.replace(/\D/g, "");
    if (cnpj.length !== 14) {
      setCnpjError("CNPJ deve ter 14 dígitos");
      return;
    }
    setCnpjLoading(true);
    setCnpjError("");
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!resp.ok) throw new Error("CNPJ não encontrado");
      const data = await resp.json();
      
      // Parse address: logradouro + numero + complemento
      const fullAddress = [data.logradouro, data.numero, data.complemento].filter(Boolean).join(", ");
      
      setForm((f) => ({
        ...f,
        exporterName: data.nome || f.exporterName,
        exporterAddress: fullAddress || f.exporterAddress,
        exporterCity: data.municipio || f.exporterCity,
        exporterState: data.uf || f.exporterState,
        exporterZip: data.cep?.replace(/(\d{5})(\d{3})/, "$1-$2") || f.exporterZip,
        exporterPhone: data.telefone || data.ddd_telefone_1 ? `(${data.ddd_telefone_1?.substring(0,2)}) ${data.ddd_telefone_1?.substring(2)}` : f.exporterPhone,
        exporterEmail: data.email || f.exporterEmail,
        exporterContactName: data.qsa?.[0]?.nome_socio || data.nome_fantasia || f.exporterContactName,
      }));
    } catch (err: any) {
      setCnpjError("CNPJ não encontrado. Verifique o número.");
    } finally {
      setCnpjLoading(false);
    }
  }, [form.exporterCNPJ]);

  // ═══════════════ AUTO-CALCULATE TOTAL ═══════════════
  const calculatedTotal = useMemo(() => {
    return form.products.reduce((sum, p) => {
      const qty = Number(p.quantity) || 0;
      const unitVal = Number(p.unitValue) || 0;
      return sum + qty * unitVal;
    }, 0);
  }, [form.products]);

  // Auto-update totalValue when products change (only if user hasn't manually overridden)
  useEffect(() => {
    if (calculatedTotal > 0) {
      setForm((f) => ({ ...f, totalValue: calculatedTotal.toFixed(2) }));
    }
  }, [calculatedTotal]);

  // ═══════════════ VALIDATION ═══════════════
  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    if (!form.exporterName.trim()) errors.push("Nome do Exportador é obrigatório");
    if (!form.importerName.trim()) errors.push("Nome do Importador é obrigatório");
    if (!form.products.some(p => p.description.trim())) errors.push("Pelo menos 1 produto com descrição é obrigatório");
    if (!form.incoterm) errors.push("Incoterm é obrigatório");
    if (!form.currency) errors.push("Moeda é obrigatória");
    if (!form.acceptedTerms) errors.push("Aceite os Termos de Uso");
    return errors;
  }, [form]);

  // ═══════════════ PDF PREVIEW ═══════════════
  const handlePreview = useCallback(async () => {
    setErrorMsg("");
    const errors = validateForm();
    if (errors.length > 0) {
      setErrorMsg(errors.join(" • "));
      return;
    }
    setSending(true);
    try {
      await loadPdfLibs();
      const previewPdf = generatePDF(docType, form, logoBase64, language);
      setPdfDataUri(previewPdf);
      setShowPreview(true);
    } catch (err: any) {
      console.error("Preview error:", err);
      setErrorMsg("Erro ao gerar preview. Tente novamente.");
    } finally {
      setSending(false);
    }
  }, [docType, form, logoBase64, validateForm]);

  const handleDownloadFromPreview = useCallback(() => {
    if (!pdfDataUri) return;
    const byteString = atob(pdfDataUri.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${docType}_TRADEXA_${Date.now().toString(36)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setGenerated(true);
    setShowPreview(false);

    // Notify
    notifyUsage({
      docType,
      exporter: form.exporterName || form.exporterCNPJ || "N/I",
      importer: form.importerName || form.importerCountry || "N/I",
      pdfDataUri,
    });
  }, [pdfDataUri, docType, form]);

  // ═══════════════ TEMPLATES ═══════════════
  const handleSaveTemplate = useCallback(() => {
    if (!templateName.trim()) return;
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(36),
      name: templateName.trim(),
      data: { ...form },
      docType,
      savedAt: new Date().toLocaleDateString("pt-BR"),
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveTemplates(updated);
    setTemplateName("");
    setShowSaveTemplate(false);
  }, [templateName, form, docType, templates]);

  const handleLoadTemplate = useCallback((template: SavedTemplate) => {
    setForm({ ...template.data });
    setDocType(template.docType);
    setShowTemplates(false);
    setGenerated(false);
    setErrorMsg("");
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
  }, [templates]);

  const docLabels: Record<DocType, { title: string; icon: React.ElementType; desc: string }> = {
    proforma: { title: "Proforma Invoice", icon: FileText, desc: "Fatura proforma profissional para negociação e aduana." },
    packing: { title: "Packing List", icon: Package, desc: "Romaneio de embarque com detalhamento de volumes e itens." },
    shipping: { title: "Instruções de Embarque", icon: Ship, desc: "Documento de instruções ao agente de carga." },
  };

  // Auto-dismiss error
  if (errorMsg) { setTimeout(() => setErrorMsg(""), 6000); }

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Ferramenta Gratuita
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4">
              Gerador de Documentos de <span className="text-[#D80E16]">Exportação</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Gere PDFs profissionais de Proforma Invoice, Packing List e Instruções de Embarque.
              Faça upload da sua logo e baixe em segundos.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto">
          {/* Doc Type Selector */}
          <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-3 sm:gap-3 mb-8">
            {(Object.entries(docLabels) as [DocType, typeof docLabels[DocType]][]).map(([key, val]) => {
              const Icon = val.icon;
              const active = docType === key;
              return (
                <button key={key} onClick={() => { setDocType(key); setGenerated(false); setErrorMsg(""); }}
                  className={`flex-1 min-w-0 flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl border text-left transition-all ${
                    active ? "border-[#D80E16] bg-[#D80E16]/[0.04] shadow-sm" : "border-black/[0.06] bg-white hover:border-[#D80E16]/20"
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${active ? "text-[#D80E16]" : "text-slate-400"}`} />
                  <div className="min-w-0">
                    <p className={`font-bold text-[10px] sm:text-sm leading-tight truncate ${active ? "text-[#D80E16]" : "text-[#0F111A]"}`}>{val.title}</p>
                    <p className="hidden sm:block text-[10px] text-[#5E6278]">{val.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">Corrija os seguintes erros:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {errorMsg.split(" • ").map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div key={docType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 sm:p-6 md:p-8 shadow-sm space-y-6 sm:space-y-8">

            {/* ── Language Selector ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D80E16]" /> Idioma do Documento
              </legend>
              <div className="flex gap-2">
                {([
                  { code: "pt" as Language, label: "Portugues", flag: "BR" },
                  { code: "en" as Language, label: "English", flag: "US" },
                  { code: "es" as Language, label: "Espanol", flag: "ES" },
                ]).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                      language === lang.code
                        ? "border-[#D80E16] bg-[#D80E16]/[0.04] text-[#D80E16]"
                        : "border-black/[0.06] bg-white text-[#5E6278] hover:border-[#D80E16]/20"
                    }`}
                  >
                    <span className="text-lg">{lang.flag === "BR" ? "🇧🇷" : lang.flag === "US" ? "🇺🇸" : "🇪🇸"}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* ── Logo Upload ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <Image className="w-5 h-5 text-[#D80E16]" /> Logo da Empresa
              </legend>
              <div className="flex items-center gap-3 flex-wrap">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-xl text-sm" type="button">
                  <Upload className="w-4 h-4" /> Upload Logo
                </Button>
                {logoPreview && (
                  <div className="flex items-center gap-2">
                    <img src={logoPreview} alt="Logo" className="h-8 sm:h-10 object-contain rounded border" />
                    <button onClick={() => { setLogoPreview(null); setLogoBase64(null); }} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <p className="text-[10px] text-[#5E6278]">PNG/JPG até 2MB. Sua logo aparecerá no topo do PDF.</p>
              </div>
            </fieldset>

            {/* ── Exportador ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D80E16]" /> Exportador
              </legend>

              {/* CNPJ Lookup */}
              <div className="mb-3">
                <label className="text-[11px] font-bold text-[#5E6278] block mb-1">CNPJ (auto-preenchimento)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.exporterCNPJ}
                    onChange={(e) => {
                      // Auto-format CNPJ: 00.000.000/0000-00
                      let v = e.target.value.replace(/\D/g, "").substring(0, 14);
                      if (v.length > 2) v = v.substring(0, 2) + "." + v.substring(2);
                      if (v.length > 6) v = v.substring(0, 6) + "." + v.substring(6);
                      if (v.length > 10) v = v.substring(0, 10) + "/" + v.substring(10);
                      if (v.length > 15) v = v.substring(0, 15) + "-" + v.substring(15);
                      update("exporterCNPJ", v);
                      setCnpjError("");
                    }}
                    placeholder="00.000.000/0000-00"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10 placeholder:text-slate-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCnpjLookup}
                    disabled={cnpjLoading || form.exporterCNPJ.replace(/\D/g, "").length !== 14}
                    className="gap-1.5 rounded-xl text-sm px-4 shrink-0"
                  >
                    {cnpjLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
                    ) : (
                      <><Search className="w-4 h-4" /> Buscar</>
                    )}
                  </Button>
                </div>
                {cnpjError && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{cnpjError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2 lg:col-span-2"><FormInput label="Nome da empresa" value={form.exporterName} onChange={(v) => update("exporterName", v)} placeholder="Razão Social" required /></div>
                <FormInput label="Nome de contato" value={form.exporterContactName} onChange={(v) => update("exporterContactName", v)} />
                <FormInput label="Email" value={form.exporterEmail} onChange={(v) => update("exporterEmail", v)} type="email" />
                <FormInput label="Telefone" value={form.exporterPhone} onChange={(v) => update("exporterPhone", v)} />
                <div className="sm:col-span-2 lg:col-span-3"><FormInput label="Endereço" value={form.exporterAddress} onChange={(v) => update("exporterAddress", v)} /></div>
                <FormInput label="Cidade" value={form.exporterCity} onChange={(v) => update("exporterCity", v)} />
                <FormSelect label="Estado" value={form.exporterState} onChange={(v) => update("exporterState", v)} options={BRAZILIAN_STATES} />
                <FormInput label="CEP" value={form.exporterZip} onChange={(v) => update("exporterZip", v)} />
                <FormSelect label="País" value={form.exporterCountry} onChange={(v) => update("exporterCountry", v)} options={COUNTRIES} />
              </div>
            </fieldset>

            {/* ── Importador ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#D80E16]" /> Importador
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2"><FormInput label="Nome da empresa" value={form.importerName} onChange={(v) => update("importerName", v)} placeholder="Company Name Inc." /></div>
                <FormInput label="Tax ID / VAT" value={form.importerTaxId} onChange={(v) => update("importerTaxId", v)} />
                <FormInput label="Nome de contato" value={form.importerContactName} onChange={(v) => update("importerContactName", v)} />
                <FormInput label="Email" value={form.importerEmail} onChange={(v) => update("importerEmail", v)} type="email" />
                <FormInput label="Telefone" value={form.importerPhone} onChange={(v) => update("importerPhone", v)} />
                <div className="sm:col-span-2"><FormInput label="Endereço" value={form.importerAddress} onChange={(v) => update("importerAddress", v)} /></div>
                <FormInput label="Cidade" value={form.importerCity} onChange={(v) => update("importerCity", v)} />
                <FormSelect label="País" value={form.importerCountry} onChange={(v) => update("importerCountry", v)} options={COUNTRIES} />
              </div>
            </fieldset>

            {/* ── Produtos (mobile-friendly) ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D80E16]" /> Produtos
              </legend>
              <div className="space-y-3">
                {form.products.map((p, i) => (
                  <div key={i} className="p-3 rounded-xl border border-black/[0.04] bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5E6278]">Produto {i + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => duplicateProduct(i)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Duplicar">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => removeProduct(i)} disabled={form.products.length <= 1}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-20 transition-colors" title="Remover">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="xs:col-span-2 sm:col-span-2"><FormInput placeholder="Descrição do produto" value={p.description} onChange={(v) => updateProduct(i, "description", v)} /></div>
                      <FormInput placeholder="HS Code" value={p.hsCode} onChange={(v) => updateProduct(i, "hsCode", v)} />
                      <FormInput placeholder="NCM" value={p.ncm} onChange={(v) => updateProduct(i, "ncm", v)} />
                      <FormInput placeholder="Qtd" value={p.quantity} onChange={(v) => updateProduct(i, "quantity", v)} />
                      <FormSelect value={p.unit} onChange={(v) => updateProduct(i, "unit", v)} options={["UN","KG","TON","L","M²","M³","CX","PÇ"]} />
                      <FormInput placeholder="Valor Unit." value={p.unitValue} onChange={(v) => updateProduct(i, "unitValue", v)} />
                      <div className="text-[11px] font-bold text-[#D80E16] self-center xs:col-span-2 sm:col-span-1">
                        = {form.currency} {(Number(p.quantity || 0) * Number(p.unitValue || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addProduct}
                  className="flex items-center gap-2 text-sm font-bold text-[#D80E16] hover:underline w-full justify-center py-2">
                  <Plus className="w-4 h-4" /> Adicionar Produto
                </button>
              </div>
            </fieldset>

            {/* ── Comercial ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D80E16]" /> Condições Comerciais
              </legend>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                <FormSelect label="Incoterm" value={form.incoterm} onChange={(v) => update("incoterm", v)} options={INCOTERMS} />
                <FormSelect label="Moeda" value={form.currency} onChange={(v) => update("currency", v)} options={CURRENCIES} />
                <div className="col-span-2 sm:col-span-1"><FormSelect label="Pagamento" value={form.paymentTerms} onChange={(v) => update("paymentTerms", v)} options={PAYMENT_TERMS} /></div>
                <div>
                  <label className="text-[11px] font-bold text-[#5E6278] block mb-1">Valor Total (auto-calculado)</label>
                  <div className="w-full px-3 py-2.5 rounded-xl border border-[#D80E16]/20 bg-[#D80E16]/[0.02] text-[#0F111A] text-sm font-semibold">
                    {form.currency} {Number(form.totalValue || 0).toFixed(2)}
                  </div>
                </div>
                <FormInput label="Custos Adicionais" value={form.additionalCharges} onChange={(v) => update("additionalCharges", v)} />
                <FormInput label="Seguro" value={form.insurance} onChange={(v) => update("insurance", v)} />
              </div>
            </fieldset>

            {/* ── Transporte ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <Ship className="w-5 h-5 text-[#D80E16]" /> Transporte e Logística
              </legend>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                <FormSelect label="Modal" value={form.transportMode} onChange={(v) => update("transportMode", v)} options={TRANSPORT_MODES} />
                <FormInput 
                  label={form.transportMode === "Marítimo" || form.transportMode === "Multimodal" ? "Porto/Terminal Origem" : form.transportMode === "Aéreo" ? "Aeroporto Origem" : "Cidade Origem"}
                  value={form.originPort} 
                  onChange={(v) => update("originPort", v)} 
                  placeholder={form.transportMode === "Marítimo" || form.transportMode === "Multimodal" ? "Ex: Santos (SP)" : form.transportMode === "Aéreo" ? "Ex: Guarulhos (GRU)" : "Ex: São Paulo/SP"}
                />
                <FormInput 
                  label={form.transportMode === "Marítimo" || form.transportMode === "Multimodal" ? "Porto/Terminal Destino" : form.transportMode === "Aéreo" ? "Aeroporto Destino" : "Cidade Destino"}
                  value={form.destinationPort} 
                  onChange={(v) => update("destinationPort", v)} 
                  placeholder={form.transportMode === "Marítimo" || form.transportMode === "Multimodal" ? "Ex: Shanghai (China)" : form.transportMode === "Aéreo" ? "Ex: Miami (MIA)" : "Ex: Buenos Aires"}
                />
                <FormInput 
                  label={form.transportMode === "Marítimo" || form.transportMode === "Multimodal" ? "Navio" : form.transportMode === "Aéreo" ? "Nº Voo" : "Veículo/Placa"}
                  value={form.vesselFlight} 
                  onChange={(v) => update("vesselFlight", v)}
                  placeholder={form.transportMode === "Marítimo" ? "Ex: MSC ANA" : form.transportMode === "Aéreo" ? "Ex: AA 995" : "Ex: ABC-1234"}
                />
                <FormInput label="Nº Viagem" value={form.voyageNumber} onChange={(v) => update("voyageNumber", v)} />
                <FormSelect label="Embalagem" value={form.packageType} onChange={(v) => update("packageType", v)} options={PACKAGE_TYPES} />
                <FormInput label="Qtde Volumes" value={form.packagesQty} onChange={(v) => update("packagesQty", v)} />
                <FormInput label="Peso Bruto (kg)" value={form.grossWeight} onChange={(v) => update("grossWeight", v)} />
                <FormInput label="Peso Líquido (kg)" value={form.netWeight} onChange={(v) => update("netWeight", v)} />
                <FormInput label="Volume (m³)" value={form.volume} onChange={(v) => update("volume", v)} />
                <FormInput label="Container" value={form.containerNumber} onChange={(v) => update("containerNumber", v)} />
                <FormInput label="Lacre (Seal)" value={form.sealNumber} onChange={(v) => update("sealNumber", v)} />
                <FormInput label="ETD (saída)" value={form.departureDate} onChange={(v) => update("departureDate", v)} type="date" />
                <FormInput label="ETA (chegada)" value={form.arrivalDate} onChange={(v) => update("arrivalDate", v)} type="date" />
                <div className="col-span-2 sm:col-span-3"><FormInput label="Marcas (Marks)" value={form.marks} onChange={(v) => update("marks", v)} placeholder="PO#12345 / MADE IN BRAZIL" /></div>
              </div>
            </fieldset>

            {/* ── Bancário ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D80E16]" /> Dados Bancários
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormInput label="Banco" value={form.bankName} onChange={(v) => update("bankName", v)} />
                <FormInput label="SWIFT / IBAN" value={form.bankSWIFT} onChange={(v) => update("bankSWIFT", v)} />
                <FormInput label="Conta" value={form.bankAccount} onChange={(v) => update("bankAccount", v)} />
                <FormInput label="Endereço do Banco" value={form.bankAddress} onChange={(v) => update("bankAddress", v)} />
                <div className="sm:col-span-2"><FormInput label="Banco Intermediário" value={form.intermediaryBank} onChange={(v) => update("intermediaryBank", v)} /></div>
              </div>
            </fieldset>

            {/* ── Observações ── */}
            <fieldset>
              <legend className="text-base sm:text-lg font-extrabold text-[#0F111A] mb-3">Observações</legend>
              <textarea value={form.additionalNotes} onChange={(e) => update("additionalNotes", e.target.value)}
                placeholder="Instruções especiais, observações sobre a carga..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:border-[#D80E16]/30 resize-none" />
            </fieldset>

            {/* ── Terms ── */}
            <div className="flex items-start gap-3 pt-3 border-t border-black/[0.04]">
              <input
                type="checkbox" id="terms" checked={form.acceptedTerms}
                onChange={(e) => update("acceptedTerms", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-black/[0.15] accent-[#D80E16] shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-[#5E6278] leading-relaxed cursor-pointer">
                Aceito os{" "}
                <Link to="/termos" target="_blank" className="text-[#D80E16] font-bold hover:underline">Termos de Uso</Link>
                {" "}e a{" "}
                <Link to="/privacidade" target="_blank" className="text-[#D80E16] font-bold hover:underline">Política de Privacidade</Link>
                {" "}da TRADEXA. Autorizo o processamento dos dados preenchidos para geração do documento.
              </label>
            </div>

            {/* ── Templates + Generate ── */}
            <div className="flex flex-col items-center gap-4 pt-3 border-t border-black/[0.04]">
              {/* Template buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Carregar Template {templates.length > 0 && `(${templates.length})`}
                </Button>
              </div>

              {/* Save Template form */}
              <AnimatePresence>
                {showSaveTemplate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="flex gap-2 p-3 rounded-xl bg-slate-50 border border-black/[0.06]">
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Nome do template..."
                        className="flex-1 px-3 py-2 rounded-lg border border-black/[0.08] bg-white text-sm focus:outline-none focus:border-[#D80E16]/30"
                        onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                      />
                      <Button type="button" size="sm" onClick={handleSaveTemplate} disabled={!templateName.trim()}
                        className="rounded-lg bg-[#D80E16] hover:bg-[#b80c12] text-white text-xs">
                        Salvar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setShowSaveTemplate(false)}
                        className="rounded-lg text-xs">
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Templates list */}
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-slate-50 border border-black/[0.06]">
                      {templates.length === 0 ? (
                        <p className="text-xs text-[#5E6278] text-center py-2">Nenhum template salvo.</p>
                      ) : (
                        <div className="space-y-2">
                          {templates.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-black/[0.04]">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0F111A] truncate">{t.name}</p>
                                <p className="text-[10px] text-[#5E6278]">
                                  {t.docType === "proforma" ? "Proforma Invoice" : t.docType === "packing" ? "Packing List" : "Instruções de Embarque"} • {t.savedAt}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button type="button" size="sm" variant="ghost" onClick={() => handleLoadTemplate(t)}
                                  className="text-xs text-[#D80E16] hover:text-[#b80c12]">
                                  Carregar
                                </Button>
                                <button type="button" onClick={() => handleDeleteTemplate(t.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate & Preview buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button size="lg" onClick={handlePreview} disabled={sending}
                  className="gap-2 bg-white border-2 border-[#D80E16] text-[#D80E16] hover:bg-[#D80E16]/5 px-6 py-5 text-sm font-bold rounded-2xl disabled:opacity-50 w-full sm:w-auto">
                  {sending ? <div className="w-5 h-5 border-2 border-[#D80E16]/30 border-t-[#D80E16] rounded-full animate-spin" /> : <><Eye className="w-5 h-5" /> Preview PDF</>}
                </Button>
                <Button size="lg" onClick={handlePreview} disabled={sending}
                  className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-5 text-base font-bold rounded-2xl shadow-[0_0_30px_rgba(216,14,22,0.2)] disabled:opacity-50 w-full sm:w-auto">
                  {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Download className="w-5 h-5" /> Gerar {docLabels[docType].title} (PDF)</>}
                </Button>
              </div>
              {generated && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> PDF gerado! Verifique seus downloads.
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ PDF PREVIEW MODAL ═══════════════ */}
      <AnimatePresence>
        {showPreview && pdfDataUri && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPreview(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#D80E16]" />
                  <h3 className="font-bold text-[#0F111A] text-sm">
                    Preview — {docLabels[docType].title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PDF preview */}
              <div className="flex-1 overflow-auto p-4 bg-slate-100">
                <object
                  data={pdfDataUri}
                  type="application/pdf"
                  className="w-full h-full min-h-[60vh] rounded-xl border border-black/[0.06] bg-white"
                >
                  <p className="text-center text-sm text-gray-500 p-8">
                    Nao foi possivel visualizar o PDF. Clique em Baixar PDF para salvar.
                  </p>
                </object>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-black/[0.06]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="rounded-xl text-sm"
                >
                  Fechar
                </Button>
                <Button
                  type="button"
                  onClick={handleDownloadFromPreview}
                  className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-6 py-2.5 text-sm font-bold rounded-xl shadow-md"
                >
                  <Download className="w-4 h-4" /> Baixar PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
