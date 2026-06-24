import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const LOGO_BASE64 = "data:image/png;base64,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";

// ─── Color palette matching GeradorDocumentos ───
const RED: [number, number, number] = [216, 14, 22];
const DARK: [number, number, number] = [30, 30, 30];
const GRAY: [number, number, number] = [100, 100, 100];
const LIGHT_BG: [number, number, number] = [248, 248, 250];
const WHITE: [number, number, number] = [255, 255, 255];

// ─── Helpers ───
function fmtUSD(n: number): string {
  if (n >= 1e9) return `US$ ${(n / 1e9).toFixed(2)} Bi`;
  if (n >= 1e6) return `US$ ${(n / 1e6).toFixed(1)} Mi`;
  if (n >= 1e3) return `US$ ${(n / 1e3).toFixed(0)} Mil`;
  return `US$ ${n.toFixed(0)}`;
}

function fmtKg(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}M t`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}K t`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} t`;
  return `${n.toFixed(0)} kg`;
}

// ─── Section header helper ───
function sectionHeader(doc: jsPDF, y: number, text: string, M: number) {
  doc.setFillColor(...RED);
  doc.rect(M, y, 1.5, 6, "F");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(text, M + 4, y + 5);
  return y + 9;
}

/* ═══════════════════════════════════════════
   SIMULATION PDF
   ═══════════════════════════════════════════ */

export interface SimResultPDF {
  fobValue: number;
  freightCost: number;
  insuranceCost: number;
  cifValue: number;
  tariffRate: number;
  tariffAmount: number;
  vatRate: number | null;
  vatAmount: number;
  vatNote?: string | null;
  totalCost: number;
  totalMarkup: number;
  dataSource: string;
  hsCode: string;
  hsDesc: string;
  origin: string;
  destination: string;
}

export function exportSimulationPDF(data: SimResultPDF) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 15;
  let y = 16;

  // Top red bar
  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 4, "F");

  // Logo
  doc.addImage(LOGO_BASE64, "PNG", M, y, 14, 14);
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "italic");
  doc.text("Powered by TRADEXA", W - M, y + 4, { align: "right" });
  y += 16;

  // Document title
  doc.setFontSize(18);
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text("Simulação de Exportação", M, y);
  y += 8;

  // Red divider
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // Ref box
  const ref = `SIM-${Date.now().toString(36).toUpperCase()}`;
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - M - 50, y - 10, 50, 14, 2, 2, "S");
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text("Ref.", W - M - 48, y - 5);
  doc.setFontSize(7);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(ref, W - M - 48, y - 1);

  // Date
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, M, y);
  y += 8;

  // Product info box
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(M, y, W - M * 2, 22, 2, 2, "F");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.hsCode}`, M + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.hsDesc}`, M + 30, y + 7);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`Rota: ${data.origin} → ${data.destination}`, M + 4, y + 15);
  y += 28;

  // Cost breakdown table
  autoTable(doc, {
    startY: y,
    head: [["Item", "Valor (USD)"]],
    body: [
      ["Valor FOB", data.fobValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ["Frete Internacional", data.freightCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ["Seguro (0,15%)", data.insuranceCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ["Valor CIF", data.cifValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      [`Tarifa (${data.tariffRate.toFixed(1)}%)`, data.tariffAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      [`VAT/IVA ${data.vatRate !== null ? `(${data.vatRate}%)` : ""}`, data.vatAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
      ["CUSTO TOTAL ESTIMADO", data.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
    ],
    theme: "striped",
    headStyles: { fillColor: RED, textColor: 255, fontStyle: "bold", fontSize: 9, halign: "center" },
    styles: { fontSize: 8, cellPadding: 3, lineColor: [230, 230, 230], lineWidth: 0.1 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 }, 1: { halign: "right", cellWidth: 45 } },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: M, right: M },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 70;

  // Summary box
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(M, finalY + 8, W - M * 2, 14, 2, 2, "F");
  doc.setFontSize(11);
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text(`Markup sobre FOB: +${data.totalMarkup.toFixed(1)}%`, W / 2, finalY + 17, { align: "center" });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.text(`Fonte das tarifas: ${data.dataSource}  •  Frete: estimativa`, W / 2, finalY + 26, { align: "center" });
  doc.text("TRADEXA Market Intelligence  •  tradexa.com.br", W / 2, 282, { align: "center" });

  doc.save(`tradexa-simulacao-${data.hsCode}-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   SMART RANK PDF
   ═══════════════════════════════════════════ */

export interface RankResultPDF {
  country: string;
  flag: string;
  tariffRate: number;
  vatRate: number;
  freightCost: number;
  totalCost: number;
  totalMarkup: number;
  smartScore: number;
}

export function exportSmartRankPDF(
  hsCode: string,
  hsDesc: string,
  fobValue: number,
  results: RankResultPDF[]
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const W = doc.internal.pageSize.getWidth();
  const M = 14;
  let y = 14;

  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 4, "F");

  doc.addImage(LOGO_BASE64, "PNG", M, y, 12, 12);
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "italic");
  doc.text("Powered by TRADEXA", W - M, y + 3, { align: "right" });
  y += 14;

  doc.setFontSize(16);
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.text("Smart Rank — Melhores Destinos de Exportação", M, y);
  y += 8;

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(`HS ${hsCode}  •  ${hsDesc}  •  FOB US$ ${fobValue.toLocaleString("pt-BR")}  •  ${new Date().toLocaleString("pt-BR")}`, M, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["#", "País", "Alíquota", "VAT", "Frete USD", "Custo Total USD", "Markup", "Score"]],
    body: results.map((r, i) => [
      String(i + 1),
      `${r.flag} ${r.country}`,
      `${r.tariffRate.toFixed(1)}%`,
      `${r.vatRate}%`,
      r.freightCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 }),
      r.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      `+${r.totalMarkup.toFixed(1)}%`,
      String(r.smartScore),
    ]),
    theme: "striped",
    headStyles: { fillColor: RED, textColor: 255, fontStyle: "bold", fontSize: 8, halign: "center" },
    styles: { fontSize: 8, cellPadding: 2.5, lineColor: [230, 230, 230], lineWidth: 0.1 },
    columnStyles: { 0: { fontStyle: "bold", halign: "center", cellWidth: 10 }, 7: { halign: "center", cellWidth: 14 } },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: M, right: M },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || y + 60;
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("TRADEXA Market Intelligence  •  Dados reais de APIs oficiais  •  tradexa.com.br", W / 2, finalY + 8, { align: "center" });

  doc.save(`tradexa-smartrank-${hsCode}-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   MARKET INTELLIGENCE PDF EXPORT
   Updated with GeradorDocumentos style
   ═══════════════════════════════════════════ */

export interface IntelExportData {
  ncms: string[];
  ncmName?: string;
  flowType: string;
  periodLabel: string;
  totalFob: number;
  totalKg: number;
  avgPrice: number;
  cityCount: number;
  companyCount: number;
  topCountries: { nome_pais: string; vl_fob: number; kg_liquido?: number }[];
  topCompanies: { nome: string; cnpj: string; capital: number; score: number; share: string; likely_flow?: string }[];
  cities: { nome: string; uf: string; fob: number; kg?: number }[];
  companiesByCity?: { cityName: string; uf: string; companies: { nome: string; score: number; likely_flow: string }[] }[];
  pricePositioning?: { p5: number; median: number; p95: number; weightedAvg: number; spread: number };
}

export function exportIntelPDF(data: IntelExportData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 15;
  let y = 12;

  // ═══ Top red bar ═══
  doc.setFillColor(...RED);
  doc.rect(0, 0, W, 4, "F");

  // ═══ Header ═══
  doc.addImage(LOGO_BASE64, "PNG", M, y, 28, 5);
  doc.setFontSize(6);
  doc.setTextColor(180, 180, 180);
  doc.setFont("helvetica", "italic");
  doc.text("Market Intelligence", M + 30, y + 4);
  y += 10;

  // Subtitle
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  const ncmLabel = data.ncms.join(", ");
  doc.text(`NCM${data.ncms.length > 1 ? "s" : ""}: ${ncmLabel}  ·  ${data.flowType === "import" ? "Importação" : "Exportação"}  ·  ${data.periodLabel}`, M, y);
  if (data.ncmName) {
    y += 3.5;
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(data.ncmName, M, y);
  }
  y += 4;

  // Reference box (top right)
  const ref = `INTEL-${Date.now().toString(36).toUpperCase()}`;
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.5);
  doc.roundedRect(W - M - 50, y - 14, 50, 14, 2, 2, "S");
  doc.setFontSize(6.5);
  doc.setTextColor(...GRAY);
  doc.text("Ref.", W - M - 48, y - 9.5);
  doc.setFontSize(7);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(ref, W - M - 48, y - 5.5);

  // Divider
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 6;

  // Date
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, M, y);
  y += 8;

  // ═══ KPI Cards ═══
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(M, y, W - M * 2, 32, 2, 2, "F");
  
  const kpiW = (W - M * 2 - 10) / 3;
  const drawKpi = (x: number, label: string, value: string) => {
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.text(label, x + 4, y + 6);
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + 4, y + 15);
  };
  const drawKpi2 = (x: number, label: string, value: string) => {
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.text(label, x + 4, y + 21);
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(value, x + 4, y + 29);
  };

  drawKpi(M + 2, "VALOR TOTAL", fmtUSD(data.totalFob));
  drawKpi(M + kpiW + 7, "PESO TOTAL", fmtKg(data.totalKg));
  drawKpi(M + kpiW * 2 + 12, "PREÇO MÉDIO", data.avgPrice > 0 ? `US$ ${data.avgPrice.toFixed(2)}/kg` : "—");
  drawKpi2(M + 2, "CIDADES", String(data.cityCount));
  drawKpi2(M + kpiW + 7, "EMPRESAS", String(data.companyCount));
  drawKpi2(M + kpiW * 2 + 12, "PERÍODO", data.periodLabel);
  
  y += 38;

  // ═══ Top Countries ═══
  if (data.topCountries.length > 0) {
    y = sectionHeader(doc, y, "Países de Origem/Destino", M);
    autoTable(doc, {
      startY: y,
      head: [["#", "País", "Valor FOB", "Peso"]],
      body: data.topCountries.map((c, i) => [
        String(i + 1),
        c.nome_pais,
        fmtUSD(c.vl_fob),
        c.kg_liquido ? fmtKg(c.kg_liquido) : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: RED, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7, textColor: DARK, cellPadding: { top: 1.5, right: 3, bottom: 1.5, left: 3 } },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 60 }, 2: { halign: "right", cellWidth: 35 }, 3: { halign: "right", cellWidth: 30 } },
      margin: { left: M, right: M },
    });
    y = (doc as any).lastAutoTable?.finalY + 6 || y + 30;
  }

  // ═══ Companies ═══
  if (data.topCompanies.length > 0) {
    y = sectionHeader(doc, y, "Empresas Relacionadas", M);
    
    // Check if we have per-city breakdown
    if (data.companiesByCity && data.companiesByCity.length > 0) {
      for (const cityGroup of data.companiesByCity.slice(0, 5)) {
        const label = `${cityGroup.cityName}/${cityGroup.uf}`;
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFillColor(...RED);
        doc.rect(M + 4, y - 1, 1, 4, "F");
        doc.setFontSize(6.5);
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "bold");
        doc.text(label, M + 8, y + 2);
        y += 5;

        autoTable(doc, {
          startY: y,
          head: [["#", "Empresa", "Score", "Tipo"]],
          body: cityGroup.companies.slice(0, 5).map((c, i) => [
            String(i + 1),
            c.nome,
            `${c.score}`,
            c.likely_flow === "import" ? "Importador" : c.likely_flow === "export" ? "Exportador" : "Ambos",
          ]),
          theme: "striped",
          headStyles: { fillColor: RED, textColor: WHITE, fontSize: 6.5, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 6.5, textColor: DARK, cellPadding: { top: 1, right: 2, bottom: 1, left: 2 } },
          alternateRowStyles: { fillColor: [250, 250, 252] },
          columnStyles: { 0: { cellWidth: 8, halign: "center" }, 2: { halign: "center", cellWidth: 14 }, 3: { cellWidth: 22 } },
          margin: { left: M + 10, right: M },
        });
        y = (doc as any).lastAutoTable?.finalY + 4 || y + 20;
      }
    } else {
      autoTable(doc, {
        startY: y,
        head: [["#", "Empresa", "CNPJ", "Capital", "Score"]],
        body: data.topCompanies.map((c, i) => [
          String(i + 1),
          c.nome,
          c.cnpj,
          `R$ ${(c.capital / 1e6).toFixed(0)}M`,
          `${c.score}`,
        ]),
        theme: "striped",
        headStyles: { fillColor: RED, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 7, textColor: DARK, cellPadding: { top: 1.5, right: 3, bottom: 1.5, left: 3 } },
        alternateRowStyles: { fillColor: [250, 250, 252] },
        columnStyles: { 0: { cellWidth: 10, halign: "center" }, 2: { cellWidth: 30 }, 3: { halign: "right", cellWidth: 25 }, 4: { halign: "center", cellWidth: 14 } },
        margin: { left: M, right: M },
      });
      y = (doc as any).lastAutoTable?.finalY + 6 || y + 30;
    }
  }

  // ═══ Cities ═══
  if (data.cities.length > 0) {
    if (y > 230) { doc.addPage(); y = 20; }
    y = sectionHeader(doc, y, "Cidades com Movimentação", M);
    autoTable(doc, {
      startY: y,
      head: [["#", "Cidade", "UF", "Valor FOB", "Peso"]],
      body: data.cities.map((c, i) => [
        String(i + 1),
        c.nome,
        c.uf,
        fmtUSD(c.fob),
        c.kg ? fmtKg(c.kg) : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: RED, textColor: WHITE, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7, textColor: DARK, cellPadding: { top: 1.5, right: 3, bottom: 1.5, left: 3 } },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 50 }, 2: { cellWidth: 10, halign: "center" }, 3: { halign: "right", cellWidth: 35 }, 4: { halign: "right", cellWidth: 30 } },
      margin: { left: M, right: M },
    });
  }

  // ═══ Price Positioning (if available) ═══
  if (data.pricePositioning && y < 240) {
    const pp = data.pricePositioning;
    if (y > 220) { doc.addPage(); y = 20; } else { y = (doc as any).lastAutoTable?.finalY + 10 || y + 30; }
    y = sectionHeader(doc, y, "Price Positioning", M);
    
    const priceW = (W - M * 2 - 8) / 3;
    const drawPrice = (x: number, label: string, value: string, color: [number, number, number]) => {
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(x, y, priceW, 14, 2, 2, "F");
      doc.setFontSize(6.5);
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "bold");
      doc.text(label, x + 3, y + 4);
      doc.setFontSize(9);
      doc.setTextColor(...color);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + 3, y + 11);
    };
    
    drawPrice(M + 2, "P5 (menor preço)", `US$ ${pp.p5.toFixed(2)}`, [5, 150, 105]);
    drawPrice(M + priceW + 6, "P50 (mediana)", `US$ ${pp.median.toFixed(2)}`, DARK);
    drawPrice(M + priceW * 2 + 10, "P95 (maior preço)", `US$ ${pp.p95.toFixed(2)}`, RED);
    
    y += 18;
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(M, y, W - M * 2, 10, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(`Média Ponderada: US$ ${pp.weightedAvg.toFixed(2)}/kg  ·  Spread: ${pp.spread.toFixed(0)}%`, M + 4, y + 6);
    y += 14;
  }

  // ═══ Footer ═══
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.setFont("helvetica", "normal");
  doc.text("TRADEXA Market Intelligence  •  Dados oficiais do Comex Stat  •  tradexa.com.br", W / 2, 282, { align: "center" });

  doc.save(`tradexa-inteligencia-${data.ncms[0] || "ncm"}-${Date.now()}.pdf`);
}

/* ═══════════════════════════════════════════
   MARKET INTELLIGENCE CSV EXPORT
   ═══════════════════════════════════════════ */

export interface IntelExportCsv {
  flowType: string;
  totalFob: number;
  totalKg: number;
  avgPrice: number;
  ncms: string[];
  periodLabel: string;
  ncmName?: string;
  topCountries: { nome_pais: string; vl_fob: number; kg_liquido?: number }[];
  topCompanies: { nome: string; cnpj: string; capital: number; score: number; likely_flow?: string; uf: string; city: string }[];
  cities: { nome: string; uf: string; fob: number; kg?: number; ops?: number; cod_mun?: string }[];
  // Rich per-city data
  cityCountries?: Record<string, { nome_pais: string; vl_fob: number; kg_liquido: number }[]>;
  cityPorts?: Record<string, { via_name: string; urf_name?: string; urf: string; kg: number; fob: number }[]>;
  companiesByCity?: Record<string, { nome: string; score: number; likely_flow: string; cnpj: string; capital: number }[]>;
}

export function exportIntelCSV(data: IntelExportCsv) {
  const rows: string[] = [];

  // Header section
  rows.push(`"TRADEXA - Inteligência de Mercado"`);
  rows.push(`"NCM(s):","${data.ncms.join(", ")}"`);
  if (data.ncmName) rows.push(`"Descrição:","${data.ncmName}"`);
  rows.push(`"Tipo:",${data.flowType === "import" ? "Importação" : "Exportação"}`);
  rows.push(`"Período:",${data.periodLabel}`);
  rows.push(`"Gerado em:",${new Date().toLocaleString("pt-BR")}`);
  rows.push(`"Valor Total:",${data.totalFob}`);
  rows.push(`"Peso Total:",${data.totalKg}`);
  rows.push(`"Preço Médio:",${data.avgPrice.toFixed(2)}`);
  rows.push(`"Cidades:",${data.cities.length}`);
  rows.push(`"Empresas:",${data.topCompanies.length}`);
  rows.push("");

  // Countries section
  if (data.topCountries.length > 0) {
    rows.push(`"PAÍSES DE ${data.flowType === "import" ? "ORIGEM" : "DESTINO"}"`);
    rows.push(`"País","Valor FOB","Peso (kg)"`);
    data.topCountries.forEach(c => {
      rows.push(`"${c.nome_pais}",${c.vl_fob},${c.kg_liquido || 0}`);
    });
    rows.push("");
  }

  // Cities section
  if (data.cities.length > 0) {
    rows.push(`"CIDADES"`);
    rows.push(`"Cidade","UF","Valor FOB","Peso (kg)","Operações"`);
    data.cities.forEach(c => {
      rows.push(`"${c.nome}","${c.uf}",${c.fob},${c.kg || 0},${c.ops || 0}`);
    });
    rows.push("");
  }

  // Per-city countries (city_countries)
  if (data.cityCountries && Object.keys(data.cityCountries).length > 0) {
    // Build city name lookup from cities array
    const cityLookup = new Map<string, { nome: string; uf: string }>();
    for (const c of data.cities) {
      if (c.cod_mun) {
        cityLookup.set(c.cod_mun, { nome: c.nome, uf: c.uf });
      }
    }
    rows.push(`"PAÍSES POR CIDADE"`);
    rows.push(`"Código Cidade","Cidade","UF","País","Valor FOB","Peso (kg)"`);
    for (const [cityCode, countries] of Object.entries(data.cityCountries)) {
      const cityInfo = cityLookup.get(cityCode);
      const cityName = cityInfo ? cityInfo.nome : "";
      const uf = cityInfo ? cityInfo.uf : "";
      for (const cc of countries) {
        rows.push(`"${cityCode}","${cityName}","${uf}","${cc.nome_pais}",${cc.vl_fob},${cc.kg_liquido || 0}`);
      }
    }
    rows.push("");
  }

  // Per-city ports
  if (data.cityPorts && Object.keys(data.cityPorts).length > 0) {
    // Reuse cityLookup or build fresh
    const cityLookup = new Map<string, { nome: string; uf: string }>();
    for (const c of data.cities) {
      if (c.cod_mun) {
        cityLookup.set(c.cod_mun, { nome: c.nome, uf: c.uf });
      }
    }
    rows.push(`"PORTOS / VIAS POR CIDADE"`);
    rows.push(`"Código Cidade","Cidade","UF","Porto/Via","Tipo","Peso (kg)","Valor FOB"`);
    for (const [cityCode, ports] of Object.entries(data.cityPorts)) {
      const cityInfo = cityLookup.get(cityCode);
      const cityName = cityInfo ? cityInfo.nome : "";
      const uf = cityInfo ? cityInfo.uf : "";
      for (const p of ports) {
        rows.push(`"${cityCode}","${cityName}","${uf}","${p.urf_name || p.urf}","${p.via_name}",${p.kg},${p.fob}`);
      }
    }
    rows.push("");
  }

  // Companies section
  if (data.topCompanies.length > 0) {
    rows.push(`"EMPRESAS"`);
    rows.push(`"Empresa","CNPJ","Capital","Score","Tipo","UF","Cidade"`);
    data.topCompanies.forEach(c => {
      const flowLabel = c.likely_flow === "import" ? "Importador" : c.likely_flow === "export" ? "Exportador" : "Ambos";
      rows.push(`"${c.nome}","${c.cnpj}",${c.capital},${c.score},"${flowLabel}","${c.uf || ""}","${c.city || ""}"`);
    });
    rows.push("");
  }

  // Companies by city (rich version)
  if (data.companiesByCity && Object.keys(data.companiesByCity).length > 0) {
    rows.push(`"EMPRESAS POR CIDADE"`);
    rows.push(`"Cidade","UF","Empresa","Score","Tipo","CNPJ","Capital"`);
    for (const [cityKey, companies] of Object.entries(data.companiesByCity)) {
      const [cityName, uf] = cityKey.split("|");
      for (const c of companies) {
        const flowLabel = c.likely_flow === "import" ? "Importador" : c.likely_flow === "export" ? "Exportador" : "Ambos";
        rows.push(`"${cityName || ""}","${uf || ""}","${c.nome}",${c.score},"${flowLabel}","${c.cnpj}",${c.capital}`);
      }
    }
    rows.push("");
  }

  // Generate file
  const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `tradexa-inteligencia-${data.ncms[0] || "ncm"}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
