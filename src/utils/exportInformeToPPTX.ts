import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT, 
  CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026,
  CUENTAS_AUXILIARES_EXACTAS_OCTUBRE_2026,
  TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
  DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS,
  TOTALES_NOMINA_SEMANAL_OCTUBRE,
  DESGLOSE_NOMINA_OCTUBRE_PROYECTOS
} from '../data/mockCostosTimaca';
import { 
  TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL, 
  TOTALES_SERVICIOS_DIRECTOS_PELLAS 
} from '../data/mockServiciosDirectosPellas';
import { resolveInformeMesData } from '../data/informeMesResolver';

interface ExportPPTXParams {
  selectedMesNum: number;
  mesLabel: string;
  totalMes: number;
  cuentasAuxiliaresMes: Array<{
    codigo: string;
    proyecto: string;
    total: number;
    porcentaje: number;
    metricas?: {
      tienePresupuesto: boolean;
      totalPresupuesto: number;
      porcentajeUso: number;
      estadoAlerta: string;
    };
  }>;
  categoriasMesAnalisis: Array<{
    categoria: string;
    monto: number;
    montoPrev: number;
    varPct: number;
    varText: string;
    esPositiva?: boolean;
    esNegativa?: boolean;
  }>;
  pellasMesData: {
    montoMes: number;
    porcentajeMes: number;
    acumulado2026: number;
    cuadrilla: number;
    nominaMes: number;
    horasMaquina: number;
  };
  notasGestion?: string;
}

export async function exportInformeToPPTX(params: ExportPPTXParams) {
  const {
    selectedMesNum,
    mesLabel,
    totalMes,
    cuentasAuxiliaresMes,
    categoriasMesAnalisis,
    pellasMesData,
    notasGestion
  } = params;

  // Motor Central de Datos del Mes (Sincronización Total 100% con Plataforma Web)
  const datosMesInforme = resolveInformeMesData(selectedMesNum);

  const isOct = selectedMesNum === 10;
  const mesTitle = isOct ? 'Octubre 2026' : (selectedMesNum === 8 ? 'Agosto 2026' : 'Septiembre 2026');
  const mesUpper = mesTitle.toUpperCase();

  const PptxConstructor: any = (pptxgen as any).default || pptxgen;
  const pptx = new PptxConstructor();

  // 16:9 Widescreen Standard Layout (13.333\" x 7.5\")
  pptx.defineLayout({ name: 'LAYOUT_16_9_HD', width: 13.333, height: 7.5 });
  pptx.layout = 'LAYOUT_16_9_HD';
  pptx.author = 'Ing. Civil Alejandra Tesara';
  pptx.company = 'TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. (TIMACA)';
  pptx.title = `Informe Ejecutivo de Costos - ${mesTitle}`;
  pptx.subject = 'Costos en Proyectos Externos y Cuentas Auxiliares';

  // Palette colors
  const C_NAVY = '002060';
  const C_DARK = '0B2545';
  const C_SLATE = '334155';
  const C_WHITE = 'FFFFFF';
  const C_BG_LIGHT = 'F8FAFC';
  const C_AMBER = 'D97706';
  const C_EMERALD = '059669';
  const C_BLUE = '1D4ED8';
  const C_BORDER = 'CBD5E1';

  // Helper Header for interior slides (13.333\" width)
  const addSlideHeader = (slide: any, slideNumber: number | string, title: string, subtitle: string) => {
    // Top banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.82,
      fill: { color: C_DARK }
    });

    slide.addText('TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. (TIMACA) · MODELO ESTRELLA DE COSTOS', {
      x: 0.6,
      y: 0.1,
      w: 9.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '93C5FD'
    });

    slide.addText(title.toUpperCase(), {
      x: 0.6,
      y: 0.33,
      w: 9.8,
      h: 0.44,
      fontSize: 18,
      bold: true,
      color: C_WHITE
    });

    slide.addText(`LÁMINA ${slideNumber} · ${mesUpper}`, {
      x: 9.5,
      y: 0.25,
      w: 3.2,
      h: 0.35,
      fontSize: 10.5,
      bold: true,
      color: 'FCD34D',
      align: 'right'
    });

    // Subtitle bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0.82,
      w: 13.333,
      h: 0.38,
      fill: { color: 'F1F5F9' },
      line: { color: C_BORDER, width: 0.5 }
    });

    slide.addText(subtitle, {
      x: 0.6,
      y: 0.88,
      w: 12.13,
      h: 0.26,
      fontSize: 11.5,
      italic: true,
      color: C_SLATE
    });
  };

  // Helper Footer for interior slides (13.333\" width)
  const addSlideFooter = (slide: any) => {
    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 6.95,
      w: 12.13,
      h: 0,
      line: { color: C_BORDER, width: 0.5 }
    });

    slide.addText('TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. (TIMACA) · RIF: J-09500315-9', {
      x: 0.6,
      y: 7.02,
      w: 6.0,
      h: 0.25,
      fontSize: 10,
      color: '64748B'
    });

    slide.addText('Elaborado por: Ing. Civil Alejandra Tesara (Analista de Costos) | Destinatario: Dirección General y Presidencia · TIMACA', {
      x: 6.6,
      y: 7.02,
      w: 6.13,
      h: 0.25,
      fontSize: 10,
      color: '64748B',
      align: 'right'
    });
  };


  // =========================================================================
  // SLIDE 0: PORTADA EJECUTIVA INSTITUCIONAL LIMPIA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: 'F1F5F9' };

    // Outer decorative border
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 0.4,
      w: 12.333,
      h: 6.7,
      fill: { color: 'FFFFFF' },
      line: { color: C_BORDER, width: 1.2 },
      rectRadius: 0.12
    });

    // Brand section
    const getAssetPath = (assetUrl: string) => {
      if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}${assetUrl}`;
      }
      return `./public${assetUrl.startsWith('/') ? assetUrl : '/' + assetUrl}`;
    };
    try {
      slide.addImage({
        path: getAssetPath('/timaca-logo.png'),
        x: 0.8,
        y: 0.65,
        w: 1.8,
        h: 0.55,
        altText: 'Logotipo Corporativo TIMACA'
      });
    } catch (e) {}

    slide.addText('TIMACA · MODELO ESTRELLA', {
      x: 2.7,
      y: 0.65,
      w: 5.5,
      h: 0.25,
      fontSize: 13,
      bold: true,
      color: C_NAVY
    });

    slide.addText('TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. · RIF J-09500315-9', {
      x: 2.7,
      y: 0.90,
      w: 6.5,
      h: 0.22,
      fontSize: 8.5,
      color: '64748B'
    });

    // Confidentiality Tag (Top Right)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.8,
      y: 0.65,
      w: 2.7,
      h: 0.45,
      fill: { color: 'FEF3C7' },
      line: { color: 'F59E0B', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText('DOCUMENTO OFICIAL AUDITADO', {
      x: 9.8,
      y: 0.72,
      w: 2.7,
      h: 0.16,
      fontSize: 8,
      bold: true,
      color: '92400E',
      align: 'center'
    });

    slide.addText('USO EXCLUSIVO JUNTA DIRECTIVA', {
      x: 9.8,
      y: 0.88,
      w: 2.7,
      h: 0.16,
      fontSize: 7.5,
      color: 'B45309',
      align: 'center'
    });

    // Divider
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.30,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    // Operational Period Pill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.66,
      y: 1.48,
      w: 4.0,
      h: 0.36,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText(`PERÍODO OPERATIVO: ${mesUpper}`, {
      x: 4.66,
      y: 1.54,
      w: 4.0,
      h: 0.24,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY,
      align: 'center'
    });

    // Main Title
    slide.addText('INFORME GESTIÓN DE COSTOS', {
      x: 0.8,
      y: 1.95,
      w: 11.733,
      h: 0.55,
      fontSize: 34,
      bold: true,
      color: '0F172A',
      align: 'center'
    });

    // Subtitle
    slide.addText('Modelo de Gestión y Control Integral de Proyectos Externos · TIMACA 2026', {
      x: 0.8,
      y: 2.50,
      w: 11.733,
      h: 0.35,
      fontSize: 14,
      color: '475569',
      align: 'center'
    });

    // Banner Fotográfico Industrial Corporativo (Tira Continua)
    try {
      slide.addImage({
        path: getAssetPath('/ppt-assets/portada-banner-industrial.png'),
        x: 0.8,
        y: 2.95,
        w: 11.733,
        h: 1.65,
        altText: 'Instalaciones Industriales y Operaciones TIMACA'
      });
    } catch (e) {}

    // Methodology & Technical Framework Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.75,
      w: 11.733,
      h: 1.35,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText('ALCANCE Y FUNDAMENTO TÉCNICO DEL CONTROL DE GESTIÓN', {
      x: 1.05,
      y: 4.88,
      w: 11.233,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Conciliación 100% Analítica: Base de datos oficial unificada cruzando los módulos de Materiales SIP, Nómina Directa (MOD), Horas Máquina de Flota Pesada y Costos Indirectos CIF.\n' +
      '• Estructura de Proyectos Externos: Análisis auditado al centavo de los frentes de obra TTE-C ejecutados para VISCO ORINOCO (CVG Ferrominera Orinoco, Planta de Pellas, Complejo PMH, Briqueteras y Buque Boca Grande II).\n' +
      '• Prorrateo Riguroso CIF: Distribución corporativa oficial de la bolsa indirecta ($314.914 USD) anclada a la intensidad de Mano de Obra Directa devengada en campo.',
      {
        x: 1.05,
        y: 5.14,
        w: 11.233,
        h: 0.85,
        fontSize: 9.5,
        color: '334155',
        lineSpacingMultiple: 1.15
      }
    );

    // Signatures Line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 6.25,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    slide.addText('Elaborado por: Ing. Civil Alejandra Tesara (Analista de Costos)', {
      x: 0.8,
      y: 6.42,
      w: 4.5,
      h: 0.25,
      fontSize: 9.5,
      bold: true,
      color: '334155'
    });

    slide.addText('Destinatario: Dirección General y Presidencia · TIMACA', {
      x: 5.3,
      y: 6.42,
      w: 5.0,
      h: 0.25,
      fontSize: 9.5,
      bold: true,
      color: '334155'
    });

    slide.addText('Puerto Ordaz, Venezuela', {
      x: 10.3,
      y: 6.42,
      w: 2.2,
      h: 0.25,
      fontSize: 9.5,
      color: '64748B',
      align: 'right'
    });
  }


  // =========================================================================
  // SLIDE 1: VISIÓN GENERAL Y DISTRIBUCIÓN CONSOLIDADA DE COSTOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '1',
      `1. Visión General y Distribución Consolidada de Costos (${mesTitle})`,
      `Gasto Total Oficial Proyectos Externos: $${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD (${datosMesInforme.variacionTotalPct > 0 ? '+' : ''}${datosMesInforme.variacionTotalPct}% vs ${datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'mes anterior'}) · Acumulado 2026: $14.792.289 USD (10 Meses)`
    );

    // 4 KPI Cards (Top Row)
    const topCards = [
      {
        tag: `GASTO TOTAL ${mesUpper}`,
        val: `$${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD`,
        desc: `+$355.781 USD (+20,8% vs Sep)`,
        color: C_NAVY
      },
      {
        tag: 'ACUMULADO CONSOLIDADO 2026',
        val: '$14.823.374 USD',
        desc: '10 Meses (Ene - Oct) · 100% Proyectos Externos',
        color: C_BLUE
      },
      {
        tag: 'FUERZA LABORAL ACTIVA',
        val: '399 Trabajadores',
        desc: '399 Cédulas Auditadas en 7 Frentes de Obra',
        color: C_EMERALD
      },
      {
        tag: 'FRENTES CONTRACTUALES ACTIVOS',
        val: '18 Cuentas Auxiliares',
        desc: '100% Contratos Externos TTE-C Auditados',
        color: C_AMBER
      }
    ];

    topCards.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.25,
        w: 2.92,
        h: 1.10,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.08
      });

      slide.addText(c.tag, {
        x: xPos + 0.12,
        y: 1.33,
        w: 2.68,
        h: 0.20,
        fontSize: 8.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.12,
        y: 1.53,
        w: 2.68,
        h: 0.40,
        fontSize: 16,
        bold: true,
        color: c.color
      });

      slide.addText(c.desc, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.32,
        fontSize: 8,
        color: C_SLATE
      });
    });

    // LEFT COLUMN: TABLE OF 5 COST CATEGORIES
    slide.addText(`DISTRIBUCIÓN OFICIAL POR CATEGORÍA DE COSTO (${mesUpper})`, {
      x: 0.6,
      y: 2.45,
      w: 6.3,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: C_DARK
    });

    // Table Data
    const catRows = [
      [
        { text: 'Categoría de Costo', options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE } },
        { text: `${mesTitle} (USD)`, options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, align: 'right' } },
        { text: '%', options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, align: 'right' } },
        { text: 'Septiembre (USD)', options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, align: 'right' } },
        { text: 'Var %', options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, align: 'right' } }
      ],
      [
        { text: 'Materiales Directos', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$475.060', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '23,0%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$823.463', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '-42,3%', options: { fontSize: 8.5, align: 'right', bold: true, color: 'B91C1C' } }
      ],
      [
        { text: 'Servicios Directos', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$956.835', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '46,4%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$280.541', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '+241,1%', options: { fontSize: 8.5, align: 'right', bold: true, color: '059669' } }
      ],
      [
        { text: 'Mano de Obra Directa (MOD)', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$257.750', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '12,5%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$208.501', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '+23,6%', options: { fontSize: 8.5, align: 'right', bold: true, color: '059669' } }
      ],
      [
        { text: 'Horas Máquina (Pellas Prov.)', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$58.500', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '2,8%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$53.398', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '+9,6%', options: { fontSize: 8.5, align: 'right', bold: true, color: '059669' } }
      ],
      [
        { text: 'Costos Indirectos', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$314.914', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '15,3%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$341.375', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '-7,7%', options: { fontSize: 8.5, align: 'right', bold: true, color: 'DC2626' } }
      ],
      [
        { text: 'TOTAL CONSOLIDADO', options: { fontSize: 9.0, bold: true, fill: { color: 'F1F5F9' }, color: C_NAVY } },
        { text: '$2.063.059', options: { fontSize: 9.0, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' }, color: C_NAVY, align: 'right' } },
        { text: '100,0%', options: { fontSize: 9.0, bold: true, fill: { color: 'F1F5F9' }, color: C_NAVY, align: 'right' } },
        { text: '$1.707.278', options: { fontSize: 9.0, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' }, color: '64748B', align: 'right' } },
        { text: '+20,8%', options: { fontSize: 9.0, bold: true, fill: { color: 'F1F5F9' }, color: '059669', align: 'right' } }
      ]
    ];

    slide.addTable(catRows, {
      x: 0.6,
      y: 2.75,
      w: 6.3,
      h: 2.30,
      colW: [2.3, 1.05, 0.65, 1.3, 1.0],
      border: { pt: 0.5, color: C_BORDER }
    });

    // Strategic Insights Callout Box (Left Column Bottom)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.20,
      w: 6.3,
      h: 1.55,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText('SÍNTESIS ESTRATÉGICA Y DRIVERS DEL MES', {
      x: 0.75,
      y: 5.28,
      w: 6.0,
      h: 0.18,
      fontSize: 8.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Servicios Especializados (+241,1%): Principal impulsor ($956.835 USD) por contratos en Pellas L1 (Yokogawa DCS $686K y Henan Front $40K).\n' +
      '• Mano de Obra Directa (+23,6%): $257.750 USD y 69.635 HH con 399 trabajadores auditados tras regularizar nómina de Boca Grande II ($13,7K).\n' +
      '• Provisión Horas Máquina ($58.500 USD): Continuidad operativa en 16 equipos de Pellas (820,5 H/M) sujeta a conciliación final de horómetros.',
      {
        x: 0.75,
        y: 5.50,
        w: 6.0,
        h: 1.15,
        fontSize: 8.0,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
      }
    );

    // RIGHT COLUMN: HISTORICAL LINE / CURVE CHART (10 MONTHS)
    slide.addText('CURVA EVOLUTIVA HISTÓRICA DEL GASTO MENSUAL (ENE - OCT 2026)', {
      x: 7.1,
      y: 2.45,
      w: 5.6,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: C_DARK
    });

    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    const monthValues = [1028, 1251, 1400, 1009, 874, 2591, 1088, 1781, 1707, 2063];
    const chartData = [
      {
        name: 'Gasto Mensual (Miles USD)',
        labels: monthLabels,
        values: monthValues
      }
    ];

    slide.addChart(pptx.ChartType.line, chartData, {
      x: 7.1,
      y: 2.70,
      w: 5.6,
      h: 2.35,
      chartColors: [C_NAVY],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 5,
      lineSize: 2.5,
      lineSmooth: true,
      showLegend: false,
      dataLabelColor: '0F172A',
      dataLabelPosition: 'top',
      dataLabelFormatCode: '$#,##0k',
      valAxisLabelFormatCode: '$#,##0k',
      showValue: true,
      valAxisMinVal: 500,
      valAxisMaxVal: 2800
    });

    // Right Column Bottom Callout Box (Purged non-external and 100% external accounts)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.1,
      y: 5.20,
      w: 5.6,
      h: 1.55,
      fill: { color: 'F8FAFC' },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText('ALCANCE Y COBERTURA DE PROYECTOS EXTERNOS (100% TTE-C)', {
      x: 7.25,
      y: 5.28,
      w: 5.3,
      h: 0.18,
      fontSize: 8.5,
      bold: true,
      color: C_DARK
    });

    slide.addText(
      '• Conciliación 100% Proyectos Externos: Los 18 contratos auxiliares TTE-C absorben exactamente $2.063.059 USD, habiéndose depurado gastos no imputables a contratos externos (flota interna y soporte central corporativo).\n' +
      '• Ejes Principales de Inversión: Pellas Línea 1 ($1.219.527 USD · 59,1%) y Segunda Línea PMH ($434.469 USD · 21,1%) concentran el 80,2% de la ejecución técnica de octubre.\n' +
      '• Tendencia de Curva: La trayectoria gráfica refleja el repunte controlado de +20,8% ($2.063k), acorde con la fase crítica de comisionamiento preoperativo y frentes simultáneos.',
      {
        x: 7.25,
        y: 5.50,
        w: 5.3,
        h: 1.15,
        fontSize: 8.0,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    addSlideFooter(slide);
  }



  // =========================================================================
  // SLIDE 3: AUDITORÍA Y DESGLOSE DE MANO DE OBRA DIRECTA (NÓMINA)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '3',
      isOct
        ? '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Octubre 2026)'
        : '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Septiembre 2026)',
      isOct
        ? 'Total Nómina Octubre Devengada: $257.750 USD · 69.635 HH · 7 Frentes Activos (100% Regularizados y Conciliados con CIF)'
        : 'Total Nómina Septiembre: $196.665 USD · 55.277 Horas-Hombre · Cuadrilla Activa en 10 Proyectos Externos'
    );

    // 4 KPI Cards
    const modCards = isOct
      ? [
          { label: 'TOTAL NÓMINA DIRECTA OCT', val: '$257.750 USD', note: 'Semanas 39 a 43 · 7 Frentes devengados' },
          { label: 'VOLUMEN DE HORAS-HOMBRE', val: '69.635 HH', note: 'Promedio 13.927 HH/semana en campo' },
          { label: 'TARIFA PROMEDIO EFECTIVA', val: '$3,70 USD/HH', note: 'Costo integral de mano de obra' },
          { label: 'FRENTES CON CUADRILLA', val: '7 Frentes Devengados', note: '50,9% Pellas · 7 Frentes devengados' }
        ]
      : [
          { label: 'TOTAL NÓMINA DIRECTA SEP', val: '$196.665 USD', note: 'Semanas 36 a 39 · 4 cortes regulares de nómina' },
          { label: 'VOLUMEN DE HORAS-HOMBRE', val: '55.277 HH', note: 'Promedio 13.819 HH/semana en campo' },
          { label: 'TARIFA PROMEDIO EFECTIVA', val: '$3,56 USD/HH', note: 'Costo integral de mano de obra en obra' },
          { label: 'FRENTES CON CUADRILLA', val: '10 Proyectos', note: '65,2% concentrado en Pellas Línea 1' }
        ];

    modCards.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(c.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(c.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Left Box: Explicación del Corte Contable
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 5.6,
      h: 4.25,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.1
    });

    slide.addText('CRITERIO DE CORTE CONTABLE Y AUDITORÍA DE NÓMINA', {
      x: 0.8,
      y: 2.65,
      w: 5.2,
      h: 0.25,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      isOct
        ? '• Ciclo de Nómina (Octubre 2026): Semanas 39 a 43 en los 7 frentes activos: Pellas L1, 2da Línea PMH, Briquetas Fase 2, Boca Grande II, Briqueteras, Caldera y Bandas.\n\n' +
          '• Regularización Boca Grande II (TTE-C-0680): Incorporación de los cortes semanales correspondientes al ciclo por $13.685 USD y 3.946 HH (23 trabajadores en sitio), activando el frente en la contabilidad devengada.\n\n' +
          '• Desglose Briquetas Fase 2 y Caldera: Nómina de Briquetas conciliada en $23.925 USD (5.427 HH) y cuadrilla de Caldera en $3.190 USD (725 HH), sumando $27.115 USD.\n\n' +
          '• Base de Prorrateo CIF ($257.750 USD): La nómina devengada constituye la base matemática unívoca para la distribución exacta de la bolsa corporativa indirecta ($314.914 USD).'
        : '• Ciclo Operativo de Nómina Directa:\n' +
          '  La nómina imputada a Septiembre totaliza 4 cortes semanales de pago del período contable (Semanas 36 a 39 de Recursos Humanos):\n' +
          '    - Semana 36 (Corte 05/09): $54.804 USD (15.433 HH)\n' +
          '    - Semana 37 (Corte 12/09): $54.173 USD (15.216 HH)\n' +
          '    - Semana 38 (Corte 19/09): $53.833 USD (15.091 HH)\n' +
          '    - Semana 39 (Cierre mensual): $33.855 USD (9.537 HH)\n' +
          '  *Nota operativa Semana 39: El menor volumen de horas (-38%) obedece a la culminación del montaje de virolas en Pellas Línea 1 y al repliegue programado de cuadrillas de montaje previo al cierre del mes.\n\n' +
          '• Conciliación Contable de Nómina:\n' +
          '  La sumatoria de los 4 cortes regulares totaliza $196.665 USD y 55.277 HH, cuadrando con los registros de nómina directa de los libros mayores corporativos ($196.665 USD).\n\n' +
          '• Matriz Corporativa de Distribución CIF:\n' +
          '  La distribución de la nómina directa ($196.665 USD) y el despliegue de personal en campo sustentan la asignación de costos indirectos bajo la Matriz Corporativa de Distribución CIF (Pellas Línea 1 60,17% = $236.688 USD / Resto 39,83% = $156.687 USD).',
      {
        x: 0.8,
        y: 2.95,
        w: 5.2,
        h: 3.70,
        fontSize: 9.0,
        color: '1E3A8A',
        lineSpacingMultiple: 1.14
      }
    );

    // Right Box: Tabla de Nómina por Proyecto
    const modTableRows: any[][] = [
      [
        { text: 'Cuenta', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: 'Proyecto / Frente de Obra', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: 'Monto (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: 'Horas (HH)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: '% MOD', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.0, margin: [2, 3, 2, 3] } }
      ]
    ];

    const activeNominaProjects = isOct ? DESGLOSE_NOMINA_OCTUBRE_PROYECTOS : DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS;

    activeNominaProjects.forEach((p: any) => {
      modTableRows.push([
        { text: p.cta, options: { bold: true, fontSize: 8.8, color: C_DARK, margin: [2, 3, 2, 3] } },
        { text: p.retraso ? `${p.proyecto} (RETRASO RRHH)` : p.proyecto, options: { fontSize: 8.8, color: p.retraso ? 'DC2626' : C_SLATE, margin: [2, 3, 2, 3] } },
        { text: `$${p.monto.toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 8.8, color: C_NAVY, margin: [2, 3, 2, 3] } },
        { text: p.hh.toLocaleString('de-DE'), options: { align: 'right', fontSize: 8.8, color: '64748B', margin: [2, 3, 2, 3] } },
        { text: `${p.pct.toFixed(2).replace('.', ',')}%`, options: { align: 'right', fontSize: 8.8, color: C_DARK, bold: true, margin: [2, 3, 2, 3] } }
      ]);
    });

    modTableRows.push([
      { text: 'TOTAL', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, margin: [2, 3, 2, 3] } },
      { text: isOct ? 'NÓMINA OCTUBRE DEVENGADA (7 FRENTES)' : '10 PROYECTOS EXTERNOS ACTIVOS', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, margin: [2, 3, 2, 3] } },
      { text: isOct ? '$257.750' : '$196.665 USD', options: { bold: true, fontSize: 9.0, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } },
      { text: isOct ? '69.635' : '55.277 HH', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } },
      { text: '100,00%', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } }
    ]);

    slide.addTable(modTableRows, {
      x: 6.4,
      y: 2.50,
      w: 6.33,
      colW: [1.2, 2.73, 1.0, 0.8, 0.6],
      border: { pt: 0.5, color: C_BORDER }
    });

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 4A: TOTAL PROYECTOS EXTERNOS · DISTRIBUCIÓN PARETO 80/20
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '4A',
      `4A. Total Proyectos Externos: Curva Pareto 80/20 y Concentración (${mesTitle})`,
      `Regla 80/20: Concentración de inversión en los frentes operacionales más intensivos de TIMACA`
    );

    const totalMesCuentas = cuentasAuxiliaresMes.reduce((acc, curr) => acc + curr.total, 0) || totalMes || 1;
    const top4Total = cuentasAuxiliaresMes.slice(0, 4).reduce((acc, curr) => acc + curr.total, 0);
    const top4Pct = Math.round((top4Total / totalMesCuentas) * 1000) / 10;

    // Top Summary Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 0.75,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('RANKING PARETO TOP PROYECTOS EXTERNOS · CONCENTRACIÓN OPERATIVA Y FINANCIERA', {
      x: 0.8,
      y: 1.42,
      w: 8.5,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      `El análisis de Pareto evidencia que los primeros 4 proyectos concentran el ${top4Pct}% del desembolso total del mes ($${Math.round(top4Total).toLocaleString('de-DE')} USD de $${Math.round(totalMesCuentas).toLocaleString('de-DE')} USD).`,
      {
        x: 0.8,
        y: 1.66,
        w: 8.5,
        h: 0.35,
        fontSize: 9.5,
        color: C_SLATE
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.5,
      y: 1.43,
      w: 3.0,
      h: 0.58,
      fill: { color: 'FEF3C7' },
      line: { color: 'F59E0B', width: 1.0 },
      rectRadius: 0.06
    });

    slide.addText(`TOP 4 PROYECTOS = ${top4Pct}%`, {
      x: 9.6,
      y: 1.50,
      w: 2.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '92400E',
      align: 'center'
    });
    slide.addText('Concentración Estratégica', {
      x: 9.6,
      y: 1.72,
      w: 2.8,
      h: 0.20,
      fontSize: 8.5,
      color: 'B45309',
      align: 'center'
    });

    // Left Column: Top 7 Pareto Ranking Table / Cards (x: 0.6, w: 7.2, y: 2.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.25,
      w: 7.2,
      h: 4.55,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('TOP 7 PROYECTOS EXTERNOS POR VOLUMEN DE INVERSIÓN', {
      x: 0.8,
      y: 2.38,
      w: 6.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const paretoRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: 'Cuenta', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: 'Proyecto / Frente Operativo', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: '% Mes', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: '% Acum.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } }
      ]
    ];

    let runningSum = 0;
    const top7 = cuentasAuxiliaresMes.slice(0, 7);
    top7.forEach((it, idx) => {
      runningSum += it.total;
      const singlePct = Math.round((it.total / totalMesCuentas) * 1000) / 10;
      const accumPct = Math.round((runningSum / totalMesCuentas) * 1000) / 10;
      const isUnder80 = accumPct <= 82;

      paretoRows.push([
        { text: `${idx + 1}`, options: { align: 'center', fontSize: 8.5, bold: true, color: idx < 3 ? C_AMBER : C_SLATE } },
        { text: it.codigo, options: { align: 'left', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: C_DARK } },
        { text: it.proyecto.length > 34 ? it.proyecto.substring(0, 32) + '...' : it.proyecto, options: { align: 'left', fontSize: 8 } },
        { text: `$${Math.round(it.total).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas' } },
        { text: `${singlePct}%`, options: { align: 'right', fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE } },
        {
          text: `${accumPct}%`,
          options: {
            align: 'center',
            fontSize: 8.5,
            bold: true,
            fontFace: 'Consolas',
            color: isUnder80 ? '1E40AF' : '475569',
            fill: { color: isUnder80 ? 'DBEAFE' : 'F1F5F9' }
          }
        }
      ]);
    });

    slide.addTable(paretoRows, {
      x: 0.8,
      y: 2.70,
      w: 6.8,
      colW: [0.4, 1.1, 2.6, 1.1, 0.7, 0.9],
      rowH: 0.44,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: 3 Pareto Strategic Insights Cards (x: 8.05, w: 4.68, y: 2.25)
    const paretoInsights = [
      {
        title: '1. MÁXIMA CONCENTRACIÓN OPERATIVA (80%)',
        desc: `Pellas Línea 1, PMH Segunda Línea y DRAVO PA-9020 absorben la mayor parte del flujo financiero del mes. El control de rendimientos, horas grúa y cubicaciones debe focalizarse diariamente en estos 3 frentes.`,
        bg: 'EFF6FF',
        border: '93C5FD',
        titleColor: C_NAVY
      },
      {
        title: '2. FRENTES COMPLEMENTARIOS Y SECUNDARIOS (20%)',
        desc: `Los frentes de Briquetas, Bandas Transportadoras y Silos operan con presupuestos menores pero críticos para la cadena productiva. Se verifica que sus requisiciones mantengan justificación técnica estricta.`,
        bg: 'F0FDF4',
        border: '86EFAC',
        titleColor: '166534'
      },
      {
        title: '3. DISCIPLINA DE CIERRE Y FINIQUITO',
        desc: `Se requiere certificar oportunamente los hitos de entrega en proyectos que alcanzan el 95%+ de su ejecución presupuestaria para liberar fondos de garantía y evitar desvíos administrativos.`,
        bg: 'FFFBEB',
        border: 'FDE68A',
        titleColor: '92400E'
      }
    ];

    paretoInsights.forEach((card, idx) => {
      const cardY = 2.25 + (idx * 1.54);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.05,
        y: cardY,
        w: 4.68,
        h: 1.44,
        fill: { color: card.bg },
        line: { color: card.border, width: 1.0 },
        rectRadius: 0.08
      });

      slide.addText(card.title, {
        x: 8.25,
        y: cardY + 0.12,
        w: 4.3,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: card.titleColor
      });

      slide.addText(card.desc, {
        x: 8.25,
        y: cardY + 0.38,
        w: 4.3,
        h: 0.95,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 4B: TOTAL PROYECTOS EXTERNOS · MATRIZ DE CUENTAS & PRESUPUESTO
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '4B',
      `4B. Matriz Oficial de Cuentas Auxiliares y Control Presupuestario (${mesTitle})`,
      `Consolidado oficial de ${cuentasAuxiliaresMes.length} Cuentas Auxiliares Activas · Monitoreo de desvíos y alertas presupuestarias`
    );

    // Full Table of Cuentas Auxiliares
    const totalMesCuentas = cuentasAuxiliaresMes.reduce((acc, curr) => acc + curr.total, 0) || totalMes || 1;
    let totalPresupuestoConsolidado = 0;

    const cuentasRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Cuenta Auxiliar', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Proyecto Externo (Cliente / Obra)', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Monto ${mesTitle.split(' ')[0]} (USD)`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Mes', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Presupuesto (USD)', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Uso Presup.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Estado Control', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    cuentasAuxiliaresMes.forEach((c, idx) => {
      const pctMes = Math.round((c.total / totalMesCuentas) * 1000) / 10;
      const m = c.metricas;
      const tieneP = m?.tienePresupuesto;
      const pMonto = tieneP ? m.totalPresupuesto : 0;
      if (tieneP) totalPresupuestoConsolidado += pMonto;
      const pUso = tieneP ? m.porcentajeUso : 0;
      const alerta = m?.estadoAlerta || 'normal';

      let alertaLabel = 'Normal';
      let alertaBg = 'DCFCE7';
      let alertaColor = '166534';
      if (!tieneP) {
        alertaLabel = 'S/P';
        alertaBg = 'F1F5F9';
        alertaColor = '64748B';
      } else if (alerta === 'critico' || alerta === 'excedido') {
        alertaLabel = 'Crítico';
        alertaBg = 'FEE2E2';
        alertaColor = '991B1B';
      } else if (alerta === 'alerta') {
        alertaLabel = 'Alerta';
        alertaBg = 'FEF3C7';
        alertaColor = '92400E';
      }

      cuentasRows.push([
        { text: `${idx + 1}`, options: { align: 'center', fontSize: 8, color: '64748B' } },
        { text: c.codigo, options: { align: 'left', fontSize: 8, bold: true, fontFace: 'Consolas', color: C_DARK } },
        { text: c.proyecto.length > 38 ? c.proyecto.substring(0, 36) + '...' : c.proyecto, options: { align: 'left', fontSize: 8 } },
        { text: `$${Math.round(c.total).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas' } },
        { text: `${pctMes}%`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: tieneP ? `$${Math.round(pMonto).toLocaleString('de-DE')}` : '-', options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: tieneP ? C_DARK : '94A3B8' } },
        { text: tieneP ? `${pUso}%` : '-', options: { align: 'center', fontSize: 8, bold: tieneP, fontFace: 'Consolas', color: tieneP ? C_DARK : '94A3B8' } },
        { text: alertaLabel, options: { align: 'center', fontSize: 7.5, bold: true, fill: { color: alertaBg }, color: alertaColor } }
      ]);
    });

    // Total General Row
    const globalUso = totalPresupuestoConsolidado > 0 ? Math.round((totalMesCuentas / totalPresupuestoConsolidado) * 1000) / 10 : 0;
    cuentasRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL GENERAL', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${Math.round(totalMesCuentas).toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } },
      { text: `$${Math.round(totalPresupuestoConsolidado).toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `${globalUso}%`, options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_DARK, fill: { color: 'F1F5F9' } } },
      { text: 'CONSOLIDADO', options: { align: 'center', bold: true, fontSize: 8, fill: { color: 'DBEAFE' }, color: '1E40AF' } }
    ]);

    slide.addTable(cuentasRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [0.4, 1.3, 3.8, 1.4, 0.9, 1.5, 1.2, 1.63],
      rowH: 0.36,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Footnote
    slide.addText(
      `* Nota de Control Presupuestario: S/P = Cuenta sin presupuesto formal asignado en matriz inicial. Alerta = Ejecución > 80% del presupuesto. Crítico = Ejecución > 100% (requiere addendum contractual).`,
      {
        x: 0.6,
        y: 6.68,
        w: 12.13,
        h: 0.22,
        fontSize: 8,
        italic: true,
        color: '64748B'
      }
    );

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 5A: VARIACIONES EN PROYECTOS PRINCIPALES (DIVERGENTE)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '5A',
      `5A. Variaciones Mensuales en Proyectos Principales (${mesTitle})`,
      `Dinámica de obras en campo: Proyectos en aceleración vs desaceleración (${isOct ? 'Octubre vs Septiembre 2026' : 'Septiembre vs Agosto 2026'})`
    );

    const variaciones = datosMesInforme.variaciones || [];
    const acelerados = variaciones.filter(v => v.delta > 0);
    const desacelerados = variaciones.filter(v => v.delta < 0);

    // Left Column: Divergent Variation Matrix (x: 0.6, w: 7.6, y: 1.35)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 7.6,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('MATRIZ DE VARIACIONES MENSUALES Y JUSTIFICACIÓN TÉCNICA', {
      x: 0.8,
      y: 1.48,
      w: 7.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const varRows: any[][] = [
      [
        { text: 'Cuenta', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Proyecto / Frente', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Mes Ant.', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Mes Act.', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Delta ($)', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Var %', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Causa Operativa', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    variaciones.slice(0, 8).forEach(v => {
      const isPos = v.delta >= 0;
      varRows.push([
        { text: v.cta, options: { align: 'left', fontSize: 8, bold: true, fontFace: 'Consolas', color: C_DARK } },
        { text: v.name.length > 22 ? v.name.substring(0, 20) + '...' : v.name, options: { align: 'left', fontSize: 8 } },
        { text: `$${Math.round(v.montoPrev / 1000)}K`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: '64748B' } },
        { text: `$${Math.round(v.montoMes / 1000)}K`, options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas' } },
        {
          text: `${isPos ? '+' : ''}$${Math.round(v.delta)}K`,
          options: {
            align: 'right',
            fontSize: 8,
            bold: true,
            fontFace: 'Consolas',
            color: isPos ? '166534' : '991B1B'
          }
        },
        {
          text: v.pct,
          options: {
            align: 'center',
            fontSize: 8,
            bold: true,
            fontFace: 'Consolas',
            fill: { color: isPos ? 'DCFCE7' : 'FEE2E2' },
            color: isPos ? '166534' : '991B1B'
          }
        },
        { text: v.why.length > 32 ? v.why.substring(0, 30) + '...' : v.why, options: { align: 'left', fontSize: 7.5, color: C_SLATE } }
      ]);
    });

    slide.addTable(varRows, {
      x: 0.8,
      y: 1.82,
      w: 7.2,
      colW: [0.9, 1.8, 0.7, 0.7, 0.8, 0.7, 1.6],
      rowH: 0.45,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: Summary Analysis Boxes (x: 8.4, w: 4.33, y: 1.35)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.4,
      y: 1.35,
      w: 4.33,
      h: 2.65,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PROYECTOS EN ACELERACIÓN (MAYOR INVERSIÓN)', {
      x: 8.6,
      y: 1.48,
      w: 3.9,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: '166534'
    });

    slide.addText(
      acelerados.length > 0
        ? acelerados.map(a => `• ${a.name} (${a.cta}): +$${Math.round(a.delta)}K USD (${a.pct})\n  ${a.why}`).join('\n\n')
        : '• No se registran aceleraciones atípicas en el período evaluado.',
      {
        x: 8.6,
        y: 1.78,
        w: 3.9,
        h: 2.1,
        fontSize: 8.5,
        color: '14532D'
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.4,
      y: 4.15,
      w: 4.33,
      h: 2.65,
      fill: { color: 'FFFBEB' },
      line: { color: 'FDE68A', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PROYECTOS EN CIERRE O DESACELERACIÓN', {
      x: 8.6,
      y: 4.28,
      w: 3.9,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: '92400E'
    });

    slide.addText(
      desacelerados.length > 0
        ? desacelerados.slice(0, 3).map(d => `• ${d.name} (${d.cta}): ${Math.round(d.delta)}K USD (${d.pct})\n  ${d.why}`).join('\n\n')
        : '• Cierres controlados de acuerdo con la programación contractual.',
      {
        x: 8.6,
        y: 4.58,
        w: 3.9,
        h: 2.1,
        fontSize: 8.5,
        color: '78350F'
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 5B: MIX DE PROCURA DE MATERIALES DIRECTOS POR SECTOR
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const matTotal = categoriasMesAnalisis[0]?.monto || 524340;
    addSlideHeader(
      slide,
      '5B',
      `5B. Mix de Procura de Materiales Directos por Sector (${mesTitle})`,
      `Composición de compras e insumos directos de almacén ($${Math.round(matTotal).toLocaleString('de-DE')} USD · 50,3% del gasto total)`
    );

    // Top Summary Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 0.70,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('COMPOSICIÓN DE PROCURA Y MATERIALES DIRECTOS POR ESPECIALIDAD INDUSTRIAL', {
      x: 0.8,
      y: 1.42,
      w: 9.0,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      `El 50,1% de los materiales directos se concentra en Acero Estructural y Materiales Eléctricos para los frentes de Pellas Línea 1, PMH y DRAVO.`,
      {
        x: 0.8,
        y: 1.66,
        w: 9.0,
        h: 0.30,
        fontSize: 9.5,
        color: C_SLATE
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 10.0,
      y: 1.42,
      w: 2.5,
      h: 0.55,
      fill: { color: 'DBEAFE' },
      line: { color: '3B82F6', width: 1.0 },
      rectRadius: 0.06
    });

    slide.addText(`TOTAL: $${Math.round(matTotal).toLocaleString('de-DE')} USD`, {
      x: 10.1,
      y: 1.55,
      w: 2.3,
      h: 0.30,
      fontSize: 10,
      bold: true,
      color: '1E40AF',
      align: 'center'
    });

    // 5 Sector Cards horizontally (x: 0.6, w: 2.27 each, gap: 0.19)
    const sectors = [
      {
        rubro: 'Materiales Eléctricos',
        monto: 154000,
        pct: '29,4%',
        desc: 'Cables de potencia, bandejas portacables, transformadores y canalizaciones DRAVO.',
        borderTop: '3B82F6',
        bg: 'EFF6FF'
      },
      {
        rubro: 'Acero Estructural',
        monto: 108700,
        pct: '20,7%',
        desc: 'Planchas ASTM A36, perfiles IPN/UPN y vigas soldadas para Segunda Línea PMH.',
        borderTop: '10B981',
        bg: 'ECFDF5'
      },
      {
        rubro: 'Mecánico / Fluidos',
        monto: 97600,
        pct: '18,6%',
        desc: 'Válvulas de alta presión, actuadores neumáticos, mangueras y sellos Briquetas.',
        borderTop: '8B5CF6',
        bg: 'F5F3FF'
      },
      {
        rubro: 'Soldadura y Gases',
        monto: 78400,
        pct: '15,0%',
        desc: 'Electrodos E7018, argón líquido, alambre tubular AWS y fundentes en talleres.',
        borderTop: 'F97316',
        bg: 'FFF7ED'
      },
      {
        rubro: 'Misceláneos Calderería',
        monto: 85640,
        pct: '16,3%',
        desc: 'Tornillería Grado 8 pavonada, discos abrasivos, pernos de anclaje y consumibles.',
        borderTop: '64748B',
        bg: 'F8FAFC'
      }
    ];

    sectors.forEach((sec, idx) => {
      const cardX = 0.6 + (idx * 2.47);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX,
        y: 2.25,
        w: 2.27,
        h: 3.1,
        fill: { color: sec.bg },
        line: { color: sec.borderTop, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText(sec.rubro.toUpperCase(), {
        x: cardX + 0.12,
        y: 2.38,
        w: 2.03,
        h: 0.35,
        fontSize: 9.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(`$${sec.monto.toLocaleString('de-DE')} USD`, {
        x: cardX + 0.12,
        y: 2.78,
        w: 2.03,
        h: 0.35,
        fontSize: 15,
        bold: true,
        fontFace: 'Consolas',
        color: C_NAVY
      });

      slide.addText(`Participación: ${sec.pct}`, {
        x: cardX + 0.12,
        y: 3.18,
        w: 2.03,
        h: 0.22,
        fontSize: 9,
        bold: true,
        color: C_BLUE
      });

      slide.addText(sec.desc, {
        x: cardX + 0.12,
        y: 3.48,
        w: 2.03,
        h: 1.75,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    // Bottom Strategy Insight Box (x: 0.6, y: 5.55, w: 12.13, h: 1.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.55,
      w: 12.13,
      h: 1.25,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('ESTRATEGIA DE PROCURA Y LOGÍSTICA TIMACA · CONTROL DE GESTIÓN', {
      x: 0.8,
      y: 5.68,
      w: 11.7,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Concentración Estratégica: El 50,1% del volumen de materiales entre sector Eléctrico ($154K) y Acero Estructural ($108,7K) responde directamente a los hitos de entrega electromecánica para Ferrominera y Briquetera.\n' +
      '• Optimización Logística: Los convenios marco con proveedores nacionales para entrega directa en talleres de Puerto Ordaz han mitigado costos de flete internacional y almacenamiento prolongado.\n' +
      '• Control de Calidad: El 100% de los despachos cuenta con certificados de colada (Mill Test Certificates) y control de trazabilidad en almacén central antes de su liberación a campo.',
      {
        x: 0.8,
        y: 5.92,
        w: 11.7,
        h: 0.78,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 6A: PROYECTO PELLAS LÍNEA 1 (TTE-C-0706) · AVANCE Y BURN-RATE
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const pAcum = pellasMesData.acumulado2026;
    const pTotal = 29720000;
    const pPct = Math.round((pAcum / pTotal) * 1000) / 10;
    const pSaldo = pTotal - pAcum;

    addSlideHeader(
      slide,
      '6A',
      `6A. Proyecto Pellas Línea 1 (TTE-C-0706): Avance Contractual y Burn-Rate (${mesTitle})`,
      `Contrato Insignia TIMACA ($29,72M USD) · Avance acumulado: $${pAcum.toLocaleString('de-DE')} USD (${pPct}% ejecutado)`
    );

    // Top Summary Gauge Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 1.05,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PROGRESO FINANCIERO DEL CONTRATO MARCO ($29.720.000 USD)', {
      x: 0.8,
      y: 1.45,
      w: 6.0,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      `Ejecutado Acumulado: $${pAcum.toLocaleString('de-DE')} USD (${pPct}%) | Saldo por Ejecutar: $${pSaldo.toLocaleString('de-DE')} USD`,
      {
        x: 0.8,
        y: 1.68,
        w: 11.7,
        h: 0.22,
        fontSize: 9.5,
        bold: true,
        color: C_SLATE
      }
    );

    // Visual Progress Bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.95,
      w: 11.7,
      h: 0.32,
      fill: { color: 'E2E8F0' },
      line: { color: C_BORDER, width: 0.5 },
      rectRadius: 0.05
    });

    const progressW = Math.max(0.5, (pPct / 100) * 11.7);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.95,
      w: progressW,
      h: 0.32,
      fill: { color: C_NAVY },
      rectRadius: 0.05
    });

    slide.addText(`${pPct}%`, {
      x: 0.8 + progressW - 0.7,
      y: 1.98,
      w: 0.65,
      h: 0.25,
      fontSize: 8.5,
      bold: true,
      color: C_WHITE,
      align: 'right'
    });

    // Middle Left: Burn-Rate Monthly Execution (x: 0.6, y: 2.55, w: 6.8, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.55,
      w: 6.8,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('CURVA DE EJECUCIÓN FINANCIERA MENSUAL (BURN-RATE 2026)', {
      x: 0.8,
      y: 2.68,
      w: 6.4,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: C_NAVY
    });

    const pellasMesesTable: any[][] = [
      [
        { text: 'Mes', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Mes', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Acumulado USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Estado Operativo', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const pCurva = [
      { mes: 'Ene', val: 1837, desc: 'Ingeniería preliminar' },
      { mes: 'Feb', val: 1416, desc: 'Levantamiento topográfico' },
      { mes: 'Mar', val: 684, desc: 'Acondicionamiento taller' },
      { mes: 'Abr', val: 5583, desc: 'Llegada de primeros equipos' },
      { mes: 'May', val: 305561, desc: 'Despliegue cuadrilla 220 trab.' },
      { mes: 'Jun', val: 404215, desc: 'Montaje de refractario' },
      { mes: 'Jul', val: 404984, desc: 'Calderería y tolvas' },
      { mes: 'Ago', val: 596358, desc: 'Rampa de montaje mecánico' },
      { mes: 'Sep', val: 663316, desc: 'Mayor avance operativo previo' },
      { mes: 'Oct', val: 1219527, desc: 'Nuevo pico histórico: instrumentación DCS, cuadrilla y montaje' }
    ];

    let pRun = 0;
    pCurva.slice(0, selectedMesNum).forEach(pm => {
      pRun += pm.val;
      pellasMesesTable.push([
        { text: pm.mes, options: { align: 'center', fontSize: 8, bold: true, color: C_DARK } },
        { text: `$${pm.val.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: true } },
        { text: `${Math.round((pm.val / pTotal) * 1000) / 10}%`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: `$${pRun.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: '166534' } },
        { text: pm.desc, options: { align: 'left', fontSize: 7.5, color: C_SLATE } }
      ]);
    });

    slide.addTable(pellasMesesTable, {
      x: 0.8,
      y: 3.0,
      w: 6.4,
      colW: [0.7, 1.2, 0.8, 1.3, 2.4],
      rowH: 0.35,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: 3 Strategic Key Metrics Cards (x: 7.65, y: 2.55, w: 5.08, h: 4.25)
    const hitos = [
      {
        title: 'CAPACIDAD INSTALADA Y PROYECCIÓN 2026',
        desc: `El avance acumulado de $${pAcum.toLocaleString('de-DE')} USD (${pPct}% sobre contrato marco) consolida la curva de ejecución. Los frentes de calcinación, tolvas y refractario cumplen con el cronograma crítico.`,
        bg: 'EFF6FF',
        border: '93C5FD',
        titleColor: C_NAVY
      },
      {
        title: 'ESTABILIDAD LABORAL Y CUADRILLAS EN CAMPO',
        desc: `La plantilla promedio se mantiene en 254 trabajadores directos sin accidentes con tiempo perdido. La disponibilidad de módulos de hidratación, comedores y dotaciones EPP garantiza la continuidad de obra.`,
        bg: 'F0FDF4',
        border: '86EFAC',
        titleColor: '166534'
      },
      {
        title: 'CONTROL FINANCIERO Y AUDITORÍA DE VALUACIONES',
        desc: `La conciliación quincenal de valuaciones con la inspección del cliente ha permitido mantener un ciclo de cobranza estable, mitigando desviaciones de flujo de caja y asegurando la procura oportuna.`,
        bg: 'FFFBEB',
        border: 'FDE68A',
        titleColor: '92400E'
      }
    ];

    hitos.forEach((h, idx) => {
      const hY = 2.55 + (idx * 1.44);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 7.65,
        y: hY,
        w: 5.08,
        h: 1.34,
        fill: { color: h.bg },
        line: { color: h.border, width: 1.0 },
        rectRadius: 0.08
      });

      slide.addText(h.title, {
        x: 7.85,
        y: hY + 0.12,
        w: 4.7,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: h.titleColor
      });

      slide.addText(h.desc, {
        x: 7.85,
        y: hY + 0.38,
        w: 4.7,
        h: 0.88,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 6B: PROYECTO PELLAS LÍNEA 1 · FUERZA LABORAL Y OPERACIONES
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '6B',
      `6B. Proyecto Pellas Línea 1 (TTE-C-0706): Fuerza Laboral y Operaciones (${mesTitle})`,
      `Cuadrilla activa de ${pellasMesData.cuadrilla} trabajadores en campo · Nómina devengada: $${pellasMesData.nominaMes.toLocaleString('de-DE')} USD`
    );

    // 4 KPI Cards across top
    const kpisPellas = [
      { label: 'MES OPERATIVO', val: `$${pellasMesData.montoMes.toLocaleString('de-DE')} USD`, note: `${pellasMesData.porcentajeMes}% del total de ${mesTitle.split(' ')[0]}` },
      { label: 'ACUMULADO 2026', val: `$${pellasMesData.acumulado2026.toLocaleString('de-DE')} USD`, note: `${Math.round((pellasMesData.acumulado2026 / 29720000) * 1000) / 10}% sobre contrato marco` },
      { label: 'CUADRILLA EN CAMPO', val: `${pellasMesData.cuadrilla} Trabajadores`, note: 'Promedio activo estabilizado' },
      { label: `NÓMINA ${mesTitle.split(' ')[0].toUpperCase()}`, val: `$${pellasMesData.nominaMes.toLocaleString('de-DE')} USD`, note: 'Fuerza laboral en frentes de obra' }
    ];

    kpisPellas.forEach((kpi, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(kpi.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(kpi.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Two Large Thematic Boxes (Left and Right)
    // Left: Fuerza Laboral y Continuidad Operativa (x: 0.6, y: 2.50, w: 5.95, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 5.95,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('FUERZA LABORAL Y CONTINUIDAD OPERATIVA EN CAMPO', {
      x: 0.8,
      y: 2.65,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      isOct
        ? '• Despliegue de Cuadrillas: Pellas Línea 1 concentró 254 trabajadores directos distribuidos en 5 semanas operativas continuas (Semanas 39 a 43).\n\n' +
          '• Especialidades Técnicas: El personal activo incluye soldadores 6G homologados, armadores de calderería pesada, mecánicos montadores y especialistas en revestimiento refractario.\n\n' +
          '• Absorción Salarial: La nómina directa devengada en Pellas representa el 55,8% del total de nómina de proyectos externos procesada por TIMACA en el mes.\n\n' +
          '• Cumplimiento HSE: Cero incidentes incapacitantes reportados, con cumplimiento del 100% de charlas de seguridad de 5 minutos y dotación de EPP certificado.'
        : '• Despliegue de Cuadrillas: Pellas Línea 1 concentró 254 trabajadores directos distribuidos en 4 semanas operativas regulares (Semanas 36 a 39).\n\n' +
          '• Especialidades Técnicas: Cuadrillas altamente capacitadas en alineación micrométrica de transmisiones, montaje de tolvas y soldadura de alta resistencia.\n\n' +
          '• Absorción Salarial: La nómina devengada de $133.185 USD representó el 60,2% del total de MOD externa de TIMACA en septiembre.\n\n' +
          '• Cumplimiento HSE: Récord operativo sin tiempos perdidos y estricta disciplina en permisos de trabajo en caliente y alturas.',
      {
        x: 0.8,
        y: 2.95,
        w: 5.5,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    // Right: Garantía de Suministro y Despliegue de Talleres (x: 6.78, y: 2.50, w: 5.95, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 2.50,
      w: 5.95,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: '86EFAC', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('SOPORTE DE TALLERES, FLOTA Y ABSORCIÓN INDIRECTA', {
      x: 6.98,
      y: 2.65,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: '166534'
    });

    slide.addText(
      '• Fabricación Previa en Talleres: La capacidad instalada de talleres TIMACA en Puerto Ordaz ha prefabricado ductos, soportes estructurales y virolas metálicas, reduciendo tiempos de izaje en campo.\n\n' +
      '• Soporte de Maquinaria y Grúas: La flota de izaje (grúas telescópicas de 60T a 120T) respalda las maniobras de montaje de componentes de gran tonelaje en el edificio de calcinación.\n\n' +
      `• Absorción de Indirectos Corporativos (CIF 60,2%): Por su escala operativa y volumen de horas-hombre, el proyecto absorbe el 60,2% de los costos indirectos corporativos de TIMACA ($${Math.round((categoriasMesAnalisis[4]?.monto || 393375) * 0.602).toLocaleString('de-DE')} USD).\n\n` +
      '• Garantía de Calidad: Los ensayos no destructivos (Tintas penetrantes y Ultrasonido) ejecutados en taller y campo garantizan cero rechazos en las uniones soldadas.',
      {
        x: 6.98,
        y: 2.95,
        w: 5.5,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 6C: PROYECTO PELLAS LÍNEA 1 · MATRIZ OFICIAL DE EVOLUCIÓN MENSUAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '6C',
      `6C. Matriz Oficial de Evolución Mensual: Proyecto Pellas Línea 1 (${mesTitle})`,
      `Desglose financiero consolidado por categoría de costo de Enero a ${mesTitle.split(' ')[0]} 2026 (Valores en USD)`
    );

    // Master Evolution Table matching slide5Tab === 'tabla-evolutivo'
    const pellasMatrixRows: any[][] = [
      [
        { text: 'Categoría / Rubro de Costo', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Ene', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Feb', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Mar', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Abr', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'May', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Jun', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Jul', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Ago', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Sep', options: { bold: true, align: 'right', fill: { color: isOct ? C_NAVY : 'D97706' }, color: C_WHITE, fontSize: 8 } },
        { text: 'Oct', options: { bold: true, align: 'right', fill: { color: isOct ? 'D97706' : C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Total 2026', options: { bold: true, align: 'right', fill: { color: '052E16' }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Part.', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } }
      ],
      // Row 1: Materiales Directos
      [
        { text: 'Materiales Directos (Acero, Refractario, Soldadura)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$782', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$9.704', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$38.108', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$50.489', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$71.709', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$173.833', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$89.498', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', bold: isOct } },
        { text: '$434.124', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '13,3%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 2: Servicios Especializados
      [
        { text: 'Servicios Especializados (Yokogawa, Henan Front, Traslados)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$48', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$5.105', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$60.101', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$56.907', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$63.106', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$69.056', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$778.363', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', bold: isOct } },
        { text: '$1.032.686', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '31,7%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 3: Mano de Obra Directa
      [
        { text: 'Mano de Obra Directa (MOD / Cuadrilla en Campo)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$121.093', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$109.550', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$126.977', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$167.193', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$133.185', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: isOct ? 'Pendiente' : '$0', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', italic: isOct, color: isOct ? C_AMBER : '94A3B8' } },
        { text: '$657.998', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '20,2%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 4: Horas Máquina
      [
        { text: 'Horas Máquina (Equipos Propios y Grúas Telescópicas)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$1.837', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$1.416', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$684', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$4.753', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$53.269', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$61.309', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$63.126', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$89.789', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$55.578', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: isOct ? 'Pendiente' : '$0', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', italic: isOct, color: isOct ? C_AMBER : '94A3B8' } },
        { text: '$331.762', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '10,2%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 5: Costos Indirectos CIF
      [
        { text: 'Costos Indirectos CIF (Absorción Corporativa 60,2%)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$116.389', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$135.147', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$107.485', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$204.561', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$236.688', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: isOct ? 'Pendiente' : '$0', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', italic: isOct, color: isOct ? C_AMBER : '94A3B8' } },
        { text: '$800.270', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '24,6%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row Total General
      [
        { text: 'TOTAL GENERAL PROYECTO PELLAS LÍNEA 1', options: { fontSize: 8.5, bold: true, color: C_NAVY, fill: { color: 'F1F5F9' } } },
        { text: '$1.837', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$1.416', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$684', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$5.583', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$305.565', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$344.115', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$348.507', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$596.358', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$668.340', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$867.861', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$3.256.839', options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } },
        { text: '100.0%', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } }
      ]
    ];

    slide.addTable(pellasMatrixRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [3.43, 0.72, 0.72, 0.72, 0.72, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 1.05, 0.67],
      rowH: 0.65,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Technical note at bottom
    slide.addText(
      '* Conciliación Analítica: Las cifras de Enero a Septiembre reflejan la liquidación contable auditada al 100%. Las partidas marcadas como "Pendiente" en Octubre corresponden a los rubros en proceso de regularización con RRHH (MOD) y Logística de Equipos (Horas Máquina).',
      {
        x: 0.6,
        y: 6.68,
        w: 12.13,
        h: 0.22,
        fontSize: 8,
        italic: true,
        color: '64748B'
      }
    );

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 7A: PROYECTO PELLAS LÍNEA 1 · SERVICIOS ESPECIALIZADOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const servData = datosMesInforme.servicios;
    addSlideHeader(
      slide,
      '7A',
      `7A. Proyecto Pellas Línea 1: Servicios Directos y Especializados (${mesTitle})`,
      servData.subtitulo || `Desglose oficial de servicios especializados en frentes de obra y campamento`
    );

    // Left Column: 3 Strategic Impulsores Cards (x: 0.6, y: 1.35, w: 5.6, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 5.6,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PRINCIPALES IMPULSORES DE SERVICIOS EN EL MES', {
      x: 0.8,
      y: 1.48,
      w: 5.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const impulsores = servData.principalesImpulsores || [];
    impulsores.forEach((imp, idx) => {
      const impY = 1.82 + (idx * 1.55);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: impY,
        w: 5.2,
        h: 1.42,
        fill: { color: idx === 0 ? 'EFF6FF' : (idx === 1 ? 'F0FDF4' : 'FFFBEB') },
        line: { color: idx === 0 ? '93C5FD' : (idx === 1 ? '86EFAC' : 'FDE68A'), width: 1.0 },
        rectRadius: 0.06
      });

      slide.addText(imp.titulo, {
        x: 0.95,
        y: impY + 0.12,
        w: 4.9,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: idx === 0 ? C_NAVY : (idx === 1 ? '166534' : '92400E')
      });

      slide.addText(imp.descripcion, {
        x: 0.95,
        y: impY + 0.38,
        w: 4.9,
        h: 0.95,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    // Right Column: Matrix Breakdown of Specialized Services (x: 6.45, y: 1.35, w: 6.28, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.45,
      y: 1.35,
      w: 6.28,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('DESGLOSE DE CONTRATOS Y ASISTENCIA TÉCNICA (USD)', {
      x: 6.65,
      y: 1.48,
      w: 5.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const servRows: any[][] = [
      [
        { text: 'Rubro / Contratista Especializado', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Especialidad Operativa', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Monto (${mesTitle.split(' ')[0]})`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Part.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const servDetail = isOct ? [
      { name: 'Yokogawa América do Sul', spec: 'Automatización y Sistemas DCS', monto: 686040, pct: '88,1%' },
      { name: 'Henan Front', spec: 'Asistencia Técnica Calcinación', monto: 40000, pct: '5,1%' },
      { name: 'Logística de Cuadrillas', spec: 'Traslado Terrestre 254 trab.', monto: 38600, pct: '5,0%' },
      { name: 'Vigilancia Patrimonial', spec: 'Custodia 24/7 Frentes de Obra', monto: 13723, pct: '1,8%' }
    ] : [
      { name: 'Traslado de Personal', spec: 'Transporte Cuadrillas 254 trab.', monto: 45878, pct: '66,4%' },
      { name: 'Vigilancia Patrimonial', spec: 'Custodia 24/7 Áreas de Obra', monto: 13182, pct: '19,1%' },
      { name: 'Alquiler de Módulos y Baños', spec: 'Infraestructura de Campamento', monto: 8400, pct: '12,2%' },
      { name: 'Servicios Técnicos Menores', spec: 'Certificaciones y Calibraciones', monto: 1596, pct: '2,3%' }
    ];

    let sumServ = 0;
    servDetail.forEach(sd => {
      sumServ += sd.monto;
      servRows.push([
        { text: sd.name, options: { align: 'left', fontSize: 8.5, bold: true, color: C_DARK } },
        { text: sd.spec, options: { align: 'left', fontSize: 8, color: C_SLATE } },
        { text: `$${sd.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas' } },
        { text: sd.pct, options: { align: 'center', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: C_BLUE } }
      ]);
    });

    servRows.push([
      { text: 'TOTAL SERVICIOS DEL MES', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${sumServ.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(servRows, {
      x: 6.65,
      y: 1.82,
      w: 5.88,
      colW: [2.3, 1.9, 1.0, 0.68],
      rowH: 0.48,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Technical note at bottom of right column
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.65,
      y: 4.85,
      w: 5.88,
      h: 1.75,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.5 },
      rectRadius: 0.06
    });

    slide.addText('DICTAMEN DE AUDITORÍA DE CONTRATOS Y SERVICIOS', {
      x: 6.8,
      y: 4.98,
      w: 5.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      isOct
        ? '• Hito Contractual Yokogawa: El registro de $686.040 USD corresponde al hito de procura e ingeniería del sistema de control distribuido (DCS), validado por la gerencia técnica.\n' +
          '• Soporte Internacional Henan Front: Facturación por supervisión en frío de hornos de calcinación según cronograma acordado.\n' +
          '• Continuidad Logística: Los servicios recurrentes de traslado y custodia se liquidan al día sin reclamos de proveedores.'
        : '• Eficiencia en Movilidad: El costo de transporte ($45.878 USD) representa $180,6 USD por trabajador al mes, garantizando 100% de asistencia.\n' +
          '• Seguridad de Activos: El servicio de vigilancia ha prevenido pérdidas de materiales en áreas de almacenamiento abierto.\n' +
          '• Saneamiento y Campamentos: Los módulos portátiles cumplen con las normativas sanitarias y estándares laborales.',
      {
        x: 6.8,
        y: 5.22,
        w: 5.5,
        h: 1.3,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 7B: PROYECTO PELLAS LÍNEA 1 · HORAS MÁQUINA Y FLOTA PESADA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const hmData = datosMesInforme.horasMaquina;
    addSlideHeader(
      slide,
      '7B',
      `7B. Proyecto Pellas Línea 1: Horas Máquina y Flota de Izaje (${mesTitle})`,
      hmData.subtituloLámina || `Auditoría y conciliación de maquinaria pesada propia y grúas telescópicas`
    );

    if (hmData.estado === 'retraso') {
      // Alert Box for October (Retraso en Horómetros)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 1.35,
        w: 12.13,
        h: 5.45,
        fill: { color: 'FFFBEB' },
        line: { color: 'F59E0B', width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText('ESTADO DE AUDITORÍA OPERATIVA: HORAS MÁQUINA EN CONCILIACIÓN TÉCNICA', {
        x: 1.0,
        y: 1.60,
        w: 11.3,
        h: 0.30,
        fontSize: 13,
        bold: true,
        color: '92400E',
        align: 'center'
      });

      slide.addText(
        hmData.mensajeAlerta ||
        'Se registra retraso en la recepción de partes de horómetros de maquinaria pesada y grúas de obra. El rubro figura preliminarmente en $0,00 USD en la matriz analítica de costos a la espera de la entrega técnica formal por parte de los supervisores de campo.',
        {
          x: 1.5,
          y: 2.05,
          w: 10.3,
          h: 0.70,
          fontSize: 10.5,
          color: '78350F',
          align: 'center'
        }
      );

      // 2 KPI cards inside alert
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 3.2,
        y: 2.95,
        w: 3.2,
        h: 1.1,
        fill: { color: C_WHITE },
        line: { color: 'FDE68A', width: 1.0 },
        rectRadius: 0.08
      });
      slide.addText('HORAS COMPUTADAS', { x: 3.4, y: 3.05, w: 2.8, h: 0.20, fontSize: 9.5, bold: true, color: '64748B' });
      slide.addText('0,0 H/M', { x: 3.4, y: 3.28, w: 2.8, h: 0.35, fontSize: 18, bold: true, color: C_DARK });
      slide.addText('Partes de horómetros en proceso', { x: 3.4, y: 3.65, w: 2.8, h: 0.22, fontSize: 8.5, color: C_AMBER });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.9,
        y: 2.95,
        w: 3.2,
        h: 1.1,
        fill: { color: C_WHITE },
        line: { color: 'FDE68A', width: 1.0 },
        rectRadius: 0.08
      });
      slide.addText('COSTO IMPUTADO PRELIMINAR', { x: 7.1, y: 3.05, w: 2.8, h: 0.20, fontSize: 9.5, bold: true, color: '64748B' });
      slide.addText('$0,00 USD', { x: 7.1, y: 3.28, w: 2.8, h: 0.35, fontSize: 18, bold: true, color: C_DARK });
      slide.addText('Pendiente regularización contable', { x: 7.1, y: 3.65, w: 2.8, h: 0.22, fontSize: 8.5, color: C_AMBER });

      // Protocol & Action Items
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 2.0,
        y: 4.35,
        w: 9.3,
        h: 2.1,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1.0 },
        rectRadius: 0.08
      });

      slide.addText('PROTOCOLO DE REGULARIZACIÓN Y ACCIÓN DE AUDITORÍA', {
        x: 2.2,
        y: 4.50,
        w: 8.9,
        h: 0.22,
        fontSize: 10.5,
        bold: true,
        color: C_NAVY
      });

      slide.addText(
        '1. Requerimiento Formal: Se ha cursado solicitud formal a la jefatura de equipos pesados para la remisión de los reportes diarios de horómetros correspondientes a las semanas 39 a 43.\n' +
        '2. Trazabilidad de Combustible: Como validación cruzada, el consumo de combustible diesel registrado en almacén central confirma que la flota estuvo operativa al 100%.\n' +
        '3. Ajuste en Cierre Definitivo: El costo devengado se computará en la conciliación del próximo corte mensual sin impacto patrimonial negativo para el proyecto.',
        {
          x: 2.2,
          y: 4.78,
          w: 8.9,
          h: 1.5,
          fontSize: 9,
          color: C_SLATE
        }
      );
    } else {
      // Table of 16 Equipos for September / Available months
      const tablaHM = hmData.tablaEquipos || [];
      const totH = hmData.totalHoras || 811.7;
      const totC = hmData.totalCosto || 55578;

      const hmRows: any[][] = [
        [
          { text: 'Cuenta-Aux', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Código', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Equipo / Maquinaria Pesada', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Tarifa USD/h', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Total H/M', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Costo Total USD', options: { bold: true, align: 'right', fill: { color: '052E16' }, color: C_WHITE, fontSize: 8 } }
        ]
      ];

      tablaHM.forEach(eq => {
        const isGR20 = eq.codigo === 'GR20';
        const costVal = eq.costoTotalHM ?? eq.costoTotal ?? 0;
        hmRows.push([
          { text: eq.cuentaAux, options: { align: 'left', fontSize: 7.5, fontFace: 'Consolas', color: '64748B' } },
          { text: eq.codigo, options: { align: 'center', fontSize: 7.5, bold: true, fontFace: 'Consolas', color: isGR20 ? C_AMBER : C_BLUE } },
          { text: eq.equipo, options: { align: 'left', fontSize: 7.5, bold: isGR20 } },
          { text: `$${eq.tarifa}`, options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
          { text: `${eq.totalHM}`, options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', bold: true } },
          { text: `$${Math.round(costVal).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 7.5, bold: true, fontFace: 'Consolas', color: isGR20 ? '92400E' : C_DARK } }
        ]);
      });

      // Total Row
      hmRows.push([
        { text: 'TOTAL FLOTA PESADA Y EQUIPOS', options: { colspan: 4, bold: true, fontSize: 8, color: C_NAVY, fill: { color: 'F1F5F9' } } },
        { text: `${totH.toLocaleString('de-DE')} H/M`, options: { align: 'right', bold: true, fontSize: 8, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
        { text: `$${Math.round(totC).toLocaleString('de-DE')} USD`, options: { align: 'right', bold: true, fontSize: 8, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } }
      ]);

      slide.addTable(hmRows, {
        x: 0.6,
        y: 1.35,
        w: 12.13,
        colW: [1.6, 1.1, 4.83, 1.4, 1.4, 1.8],
        rowH: 0.28,
        border: { pt: 0.5, color: C_BORDER }
      });

      slide.addText(
        '* La Grúa Telescópica Link-Belt 60T (GR20) concentró el 58,4% del costo de horas máquina del proyecto, siendo indispensable en los izajes pesados del edificio de molienda y calcinación.',
        {
          x: 0.6,
          y: 6.68,
          w: 12.13,
          h: 0.22,
          fontSize: 8,
          italic: true,
          color: '64748B'
        }
      );
    }

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 8A: PLANTA PMH · SEGUNDA LÍNEA (TTE-C-0671) · MATERIALES CRÍTICOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const pmh = datosMesInforme.pmh;
    addSlideHeader(
      slide,
      '8A',
      `8A. Frente PMH · Segunda Línea (TTE-C-0671): Materiales Críticos (${mesTitle})`,
      pmh.subtitulo || `Inversión y despacho de planchas estructurales A36, perfiles y vigas en muelle de mineral`
    );

    // 4 KPI Cards across top
    const kpisPMH = [
      {
        label: `INVERSIÓN ${mesTitle.split(' ')[0].toUpperCase()} (TTE-C-0671)`,
        val: `$${pmh.montoMes.toLocaleString('de-DE')} USD`,
        note: `${pmh.varPctText} vs mes anterior`
      },
      {
        label: 'ACUMULADO ANUAL 2026',
        val: `$${pmh.acumulado2026.toLocaleString('de-DE')} USD`,
        note: 'Frente portuario estratégico TIMACA'
      },
      {
        label: `MATERIALES DIRECTOS (${mesTitle.split(' ')[0]})`,
        val: `$${pmh.materialesMes.toLocaleString('de-DE')} USD`,
        note: `${pmh.materialesPct}% de la inversión del mes`
      },
      {
        label: 'TOTAL COMPLEJO PMH',
        val: `$${pmh.totalComplejoPMH.toLocaleString('de-DE')} USD`,
        note: `${pmh.pctComplejoEnTimaca}% del gasto total de TIMACA`
      }
    ];

    kpisPMH.forEach((kpi, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(kpi.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(kpi.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Left Column: Table of Critical Materials (x: 0.6, y: 2.50, w: 7.2, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 7.2,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('MATERIALES CRÍTICOS DESPACHADOS A SEGUNDA LÍNEA PMH', {
      x: 0.8,
      y: 2.65,
      w: 6.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const matRows: any[][] = [
      [
        { text: 'Material / Insumo Crítico', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Cant. / UM', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Part.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Destino / Aplicación en Planta', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const mats = pmh.materialesCriticos || [];
    let matSum = 0;
    mats.forEach(m => {
      matSum += m.monto;
      matRows.push([
        { text: m.item, options: { align: 'left', fontSize: 8, bold: true, color: C_DARK } },
        { text: m.cantUM || 'Global', options: { align: 'center', fontSize: 8, fontFace: 'Consolas' } },
        { text: `$${m.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: true } },
        { text: `${m.pct}%`, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: m.uso.length > 30 ? m.uso.substring(0, 28) + '...' : m.uso, options: { align: 'left', fontSize: 7.5, color: C_SLATE } }
      ]);
    });

    matRows.push([
      { text: 'TOTAL MATERIALES CRÍTICOS', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${matSum.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } },
      { text: 'SEGUNDA LÍNEA', options: { align: 'left', bold: true, fontSize: 8, color: '166534', fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(matRows, {
      x: 0.8,
      y: 2.95,
      w: 6.8,
      colW: [2.2, 0.9, 1.0, 0.7, 2.0],
      rowH: 0.44,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: Dictamen Técnico (x: 8.05, y: 2.50, w: 4.68, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.05,
      y: 2.50,
      w: 4.68,
      h: 4.25,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('DICTAMEN TÉCNICO Y CONTROL OPERATIVO PMH', {
      x: 8.25,
      y: 2.65,
      w: 4.3,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const dPmh = pmh.dictamenTecnico || {
      punto1Titulo: 'Avance Estructural:',
      punto1Texto: 'El montaje de estructuras metálicas para la Segunda Línea de PMH avanza según el cronograma convenido, con prioridad en la bancada de transferencia y los chutes de descarga.',
      punto2Titulo: 'Calidad Metalúrgica:',
      punto2Texto: 'El 100% de los perfiles y planchas de acero ASTM A36 cuentan con pruebas de impacto Charpy y certificados de trazabilidad verificados en taller.'
    };

    slide.addText(
      `• ${dPmh.punto1Titulo}\n${dPmh.punto1Texto}\n\n` +
      `• ${dPmh.punto2Titulo}\n${dPmh.punto2Texto}\n\n` +
      '• Logística de Muelle: Los despachos terrestres desde los talleres de Puerto Ordaz hasta el área portuaria se realizan bajo escolta interna, garantizando la integridad de las vigas soldadas de gran gálibo.',
      {
        x: 8.25,
        y: 2.95,
        w: 4.3,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 8B: PLANTA PMH · RED COMPLEJO DE MANEJO DE MINERAL (PMH)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const pmh = datosMesInforme.pmh;
    addSlideHeader(
      slide,
      '8B',
      `8B. Red de Frentes de Manejo de Mineral y Muelles: Complejo PMH (${mesTitle})`,
      `Articulación integral de muelles, correas transportadoras y sistemas de apilamiento en Puerto Ordaz`
    );

    // 4 KPI Cards across top
    const kpisComplejo = [
      { label: 'TOTAL COMPLEJO PMH', val: `$${pmh.totalComplejoPMH.toLocaleString('de-DE')} USD`, note: `${pmh.pctComplejoEnTimaca}% del total de la empresa` },
      { label: 'ACUMULADO COMPLEJO 2026', val: `$${pmh.totalAcumuladoComplejo.toLocaleString('de-DE')} USD`, note: 'Inversión acumulada en 10 meses' },
      { label: 'FRENTES ACTIVOS EN RED', val: `${(pmh.redComplejoPMH || []).length} Frentes`, note: 'Segunda Línea, Bandas y Muelles' },
      { label: 'PROYECTO PRINCIPAL PMH', val: `TTE-C-0671 ($${pmh.montoMes.toLocaleString('de-DE')})`, note: 'Segunda Línea lidera la ejecución' }
    ];

    kpisComplejo.forEach((kpi, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(kpi.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(kpi.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Left Column: Table of Red Complejo PMH (x: 0.6, y: 2.50, w: 7.2, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 7.2,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('MATRIZ DE FRENTES OPERATIVOS · COMPLEJO PMH', {
      x: 0.8,
      y: 2.65,
      w: 6.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const frentesRows: any[][] = [
      [
        { text: 'Frente Operativo / Obra', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Cuenta', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Monto (${mesTitle.split(' ')[0]})`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Acumulado 2026', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Red', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const frentes = pmh.redComplejoPMH || [];
    let totRedMes = 0;
    let totRedAcum = 0;
    frentes.forEach(f => {
      totRedMes += f.montoMes;
      totRedAcum += f.acumulado2026;
      const pctFrente = pmh.totalComplejoPMH > 0 ? Math.round((f.montoMes / pmh.totalComplejoPMH) * 1000) / 10 : 0;
      frentesRows.push([
        { text: f.frente, options: { align: 'left', fontSize: 8, bold: true, color: C_DARK } },
        { text: f.cta, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: `$${f.montoMes.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: true } },
        { text: `$${f.acumulado2026.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: '166534' } },
        { text: `${pctFrente}%`, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } }
      ]);
    });

    frentesRows.push([
      { text: 'TOTAL COMPLEJO PMH', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${totRedMes.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${totRedAcum.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: '166534', fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(frentesRows, {
      x: 0.8,
      y: 2.95,
      w: 6.8,
      colW: [2.5, 1.1, 1.1, 1.3, 0.8],
      rowH: 0.44,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: Strategic Infrastructure Box (x: 8.05, y: 2.50, w: 4.68, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.05,
      y: 2.50,
      w: 4.68,
      h: 4.25,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('SINERGIA OPERATIVA EN INFRAESTRUCTURA PORTUARIA', {
      x: 8.25,
      y: 2.65,
      w: 4.3,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '166534'
    });

    slide.addText(
      '• Eje Portuario Ferrominera: La red PMH comprende la infraestructura crítica para el embarque marítimo y fluvial de mineral de hierro hacia el mercado internacional.\n\n' +
      '• Correas y Transferencias: El mantenimiento y repotenciación simultánea de los frentes de bandas y Segunda Línea minimiza tiempos muertos y paradas de cargador de barcos.\n\n' +
      '• Optimización de Cuadrillas: Equipos de montaje multidisciplinarios rotan entre frentes de acuerdo a las ventanas de operación naval, maximizando la productividad de la mano de obra.\n\n' +
      '• Respaldo en Talleres: La fabricación de rodillos, poleas y estructuras de soporte en talleres TIMACA garantiza tiempos de respuesta inferiores a 24 horas ante fallas operativas.',
      {
        x: 8.25,
        y: 2.95,
        w: 4.3,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 9A: REPOTENCIACIÓN RUEDA DRAVO PA-9020 · CURVA Y JUSTIFICACIÓN
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const dravo = datosMesInforme.dravo;
    addSlideHeader(
      slide,
      '9A',
      `9A. Repotenciación Rueda de Cangilones DRAVO PA-9020 (TTE-C-0653) · ${mesTitle}`,
      dravo.subtitulo || `Auditoría financiera y justificación técnica de la inversión en equipo recuperador de mineral`
    );

    // 4 KPI Cards across top
    const kpisDravo = [
      {
        label: `INVERSIÓN EN ${mesTitle.split(' ')[0].toUpperCase()}`,
        val: `$${dravo.montoMes.toLocaleString('de-DE')} USD`,
        note: `${dravo.delta >= 0 ? '+' : ''}$${dravo.delta.toLocaleString('de-DE')} USD vs mes anterior`
      },
      {
        label: 'VARIACIÓN MENSUAL',
        val: dravo.varPctText,
        note: dravo.isPos ? 'Aceleración presupuestaria' : 'Ajuste operativo programado'
      },
      {
        label: 'ACUMULADO ANUAL 2026',
        val: `$${dravo.acumulado2026.toLocaleString('de-DE')} USD`,
        note: `${Math.round((dravo.montoMes / (dravo.acumulado2026 || 1)) * 1000) / 10}% en ${mesTitle.split(' ')[0]}`
      },
      {
        label: `MATERIALES DIRECTOS (${mesTitle.split(' ')[0]})`,
        val: `$${dravo.materialesMes.toLocaleString('de-DE')} USD`,
        note: `${dravo.materialesPct}% de la inversión del mes`
      }
    ];

    kpisDravo.forEach((kpi, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(kpi.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(kpi.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Left Column: Evolution Table (x: 0.6, y: 2.50, w: 6.0, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 6.0,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('HISTÓRICO DE EJECUCIÓN MENSUAL DRAVO PA-9020 (2026)', {
      x: 0.8,
      y: 2.65,
      w: 5.6,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const dCurvaRows: any[][] = [
      [
        { text: 'Mes', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Acum.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Hito Operacional en Rueda', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const dHist = [
      { mes: 'Ene', val: 767, desc: 'Inspección preliminar de desgaste' },
      { mes: 'Feb', val: 14687, desc: 'Desarme de guardas y tolva' },
      { mes: 'Mar', val: 60627, desc: 'Ingeniería de blindajes Hardox' },
      { mes: 'Abr', val: 34885, desc: 'Procura de pernos de alta resistencia' },
      { mes: 'May', val: 154916, desc: 'Acopio de planchas antidesgaste' },
      { mes: 'Jun', val: 37829, desc: 'Ajuste de chumaceras y alineación' },
      { mes: 'Jul', val: 27036, desc: 'Mantenimiento preventivo en caliente' },
      { mes: 'Ago', val: 23166, desc: 'Preparación para parada mayor' },
      { mes: 'Sep', val: 199356, desc: 'PARADA MAYOR: Blindajes en 10 cangilones' },
      { mes: 'Oct', val: 106812, desc: 'Estabilización post-parada y tolva' }
    ];

    let dAcc = 0;
    dHist.slice(0, selectedMesNum).forEach(dh => {
      dAcc += dh.val;
      const pct = Math.round((dh.val / (dravo.acumulado2026 || 1)) * 1000) / 10;
      const isCur = (dh.mes === 'Sep' && selectedMesNum === 9) || (dh.mes === 'Oct' && selectedMesNum === 10);
      dCurvaRows.push([
        { text: dh.mes, options: { align: 'center', fontSize: 8, bold: true, color: isCur ? C_AMBER : C_DARK } },
        { text: `$${dh.val.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: isCur } },
        { text: `${pct}%`, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: dh.desc, options: { align: 'left', fontSize: 7.5, color: isCur ? C_DARK : C_SLATE } }
      ]);
    });

    slide.addTable(dCurvaRows, {
      x: 0.8,
      y: 2.95,
      w: 5.6,
      colW: [0.7, 1.2, 0.9, 2.8],
      rowH: 0.35,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: Justificación Técnica (x: 6.85, y: 2.50, w: 5.88, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.85,
      y: 2.50,
      w: 5.88,
      h: 4.25,
      fill: { color: 'FFFBEB' },
      line: { color: 'F59E0B', width: 1.0 },
      rectRadius: 0.08
    });

    const just = dravo.justificacionTecnica || {
      titulo: 'JUSTIFICACIÓN TÉCNICA OPERATIVA Y AUDITORÍA:',
      punto1Titulo: 'Intervención Crítica en Muelle:',
      punto1Texto: 'La repotenciación mayor de la Rueda DRAVO PA-9020 responde a la necesidad de recuperar la capacidad nominal de recuperación de mineral (2.500 T/h) tras alcanzar el límite de desgaste en cuchillas y cantoneras.',
      punto2Titulo: 'Trazabilidad y Respaldo SIP:',
      punto2Texto: 'El 100% de las requisiciones e imputaciones contables se encuentran respaldadas por vales de almacén y órdenes de compra con destino inequívoco al equipo PA-9020 en el muelle de FMO.'
    };

    slide.addText(just.titulo.toUpperCase(), {
      x: 7.05,
      y: 2.65,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '92400E'
    });

    slide.addText(
      `• ${just.punto1Titulo}\n${just.punto1Texto}\n\n` +
      `• ${just.punto2Titulo}\n${just.punto2Texto}\n\n` +
      '• Conclusión de Auditoría: No se observan anomalías contables ni sobreprecios. La variación de gasto corresponde de forma unívoca a la ejecución física del hito de blindaje antiabrasivo.',
      {
        x: 7.05,
        y: 2.95,
        w: 5.5,
        h: 3.65,
        fontSize: 9,
        color: '78350F'
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 9B: DRAVO PA-9020 · DESGLOSE DE BLINDAJES Y PARTIDAS MECÁNICAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const dravo = datosMesInforme.dravo;
    addSlideHeader(
      slide,
      '9B',
      `9B. DRAVO PA-9020: Desglose de Blindajes Hardox y Componentes Mecánicos (${mesTitle})`,
      `Despiece de insumos antiabrasivos, pernería de alta resistencia grado 8 y sistemas de giro`
    );

    // 4 KPI Cards across top
    const kpisBlindajes = [
      { label: 'TOTAL INSUMOS MECÁNICOS', val: `$${dravo.totalBlindajes.toLocaleString('de-DE')} USD`, note: 'Acopio y reemplazo de blindajes' },
      { label: 'CONCENTRACIÓN EN DESGASTE', val: `${dravo.blindajesItems[0]?.pct || 50.7}%`, note: 'Planchas antiabrasivas lideran gasto' },
      { label: 'ESPECIFICACIÓN DE ACERO', val: 'Hardox 450 / 500', note: 'Alta resistencia al impacto y abrasión' },
      { label: 'CALIDAD DE TORNILLERÍA', val: 'Grado 8 Pavonado', note: 'Pernos A325 con torque controlado' }
    ];

    kpisBlindajes.forEach((kpi, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(kpi.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(kpi.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Left Column: Table of Blindajes Items (x: 0.6, y: 2.50, w: 7.2, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 7.2,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('DESGLOSE DE PARTIDAS DE BLINDAJE Y REPUESTOS MECÁNICOS', {
      x: 0.8,
      y: 2.65,
      w: 6.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const bRows: any[][] = [
      [
        { text: 'Componente / Repuesto Mecánico', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Part.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Aplicación / Subconjunto en Rueda', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const bItems = dravo.blindajesItems || [];
    let bTot = 0;
    bItems.forEach(b => {
      bTot += b.monto;
      bRows.push([
        { text: b.componente, options: { align: 'left', fontSize: 8, bold: true, color: C_DARK } },
        { text: `$${b.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: true } },
        { text: `${b.pct}%`, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: b.aplicacion, options: { align: 'left', fontSize: 7.5, color: C_SLATE } }
      ]);
    });

    bRows.push([
      { text: 'TOTAL PARTIDAS DE REPOTENCIACIÓN', options: { bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${bTot.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } },
      { text: 'CONCILIADO AL 100%', options: { align: 'left', bold: true, fontSize: 8, color: '166534', fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(bRows, {
      x: 0.8,
      y: 2.95,
      w: 6.8,
      colW: [2.7, 1.2, 0.8, 2.1],
      rowH: 0.50,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: Assurance and Technical Box (x: 8.05, y: 2.50, w: 4.68, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.05,
      y: 2.50,
      w: 4.68,
      h: 4.25,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('ASEGURAMIENTO METROLOGICO Y DE CALIDAD', {
      x: 8.25,
      y: 2.65,
      w: 4.3,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Ensayos Metalográficos: Las planchas Hardox 450/500 fueron sometidas a control de dureza Brinell (HBW 425-475) previo al corte por plasma computarizado en talleres TIMACA.\n\n' +
      '• Soldadura Homologada: Procedimiento WPS/PQR específico para unión de aceros antiabrasivos con precalentamiento a 150°C y electrodos de bajo hidrógeno E7018-1.\n\n' +
      '• Control de Apriete: El montaje de los 10 cangilones contó con verificación de torque mediante multiplicador neumático calibrado, asegurando 850 lb-ft en cada perno grado 8.\n\n' +
      '• Garantía de Servicio: Se estima una vida útil mínima de 18 meses continuos bajo régimen de cargamento de 45.000 toneladas/día.',
      {
        x: 8.25,
        y: 2.95,
        w: 4.3,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 10: COSTOS INDIRECTOS (CIF) · ESTRUCTURA DE BOLSA Y MATRIZ DE PRORRATEO
  // (FUSIÓN UNIFICADA DE LÁMINAS 10A Y 10B)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const cifTotal = isOct ? 314913.80 : (categoriasMesAnalisis[4]?.monto || 393375);
    const modBase = isOct ? 257750.82 : 229149;
    const pellasCIF = Math.round(isOct ? 160285.32 : cifTotal * 0.602);
    const restoCIF = Math.round(cifTotal - pellasCIF);

    addSlideHeader(
      slide,
      '10',
      `10. Costos Indirectos (CIF): Estructura de Bolsa y Matriz de Prorrateo (${mesTitle})`,
      `Bolsa corporativa de $${Math.round(cifTotal).toLocaleString('de-DE')} USD distribuida en función de la Mano de Obra Directa ($${Math.round(modBase).toLocaleString('de-DE')} USD) · Cuadre exacto al céntimo`
    );

    // 4 KPI Cards across top (y: 1.25, h: 0.88, w: 2.92)
    const kpisCIF = [
      { label: `TOTAL BOLSA CIF (${mesTitle.split(' ')[0]})`, val: `$${Math.round(cifTotal).toLocaleString('de-DE')} USD`, note: 'Soporte central y talleres' },
      { label: 'BASE ASIGNACIÓN (MOD)', val: `$${Math.round(modBase).toLocaleString('de-DE')} USD`, note: 'Nómina directa auditada' },
      { label: isOct ? 'ABSORCIÓN PELLAS (50,90%)' : 'PELLAS LÍNEA 1 (60,17%)', val: `$${pellasCIF.toLocaleString('de-DE')} USD`, note: isOct ? 'Mayor volumen MOD ($131K)' : 'Mayor volumen HH de MOD' },
      { label: isOct ? 'RESTO 6 PROYECTOS (49,10%)' : 'RESTO DE PROYECTOS (39,83%)', val: `$${restoCIF.toLocaleString('de-DE')} USD`, note: isOct ? '6 frentes de obra activos' : 'Frentes restantes' }
    ];

    kpisCIF.forEach((kpi, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.25,
        w: 2.92,
        h: 0.88,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(kpi.label, {
        x: xPos + 0.12,
        y: 1.31,
        w: 2.68,
        h: 0.17,
        fontSize: 8.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.12,
        y: 1.48,
        w: 2.68,
        h: 0.32,
        fontSize: 15,
        bold: true,
        color: C_DARK
      });

      slide.addText(kpi.note, {
        x: xPos + 0.12,
        y: 1.81,
        w: 2.68,
        h: 0.24,
        fontSize: 8.5,
        color: C_BLUE
      });
    });

    // =========================================================================
    // COLUMNA IZQUIERDA: COMPOSICIÓN DE LA BOLSA CIF ($314.914 USD)
    // =========================================================================
    slide.addText(`COMPOSICIÓN DE LA BOLSA CORPORATIVA CIF ($${Math.round(cifTotal).toLocaleString('de-DE')} USD)`, {
      x: 0.6,
      y: 2.22,
      w: 5.85,
      h: 0.22,
      fontSize: 9.5,
      bold: true,
      color: C_NAVY
    });

    const subconceptos = isOct ? [
      { num: '1', concepto: 'Nómina - Talleres Centrales TIMACA', monto: 123000, pct: '39,06%' },
      { num: '2', concepto: 'Nómina Personal TIMACA (Dirección)', monto: 75000, pct: '23,82%' },
      { num: '3', concepto: 'Sindicato (Aporte y Gestión Gremial)', monto: 72633, pct: '23,06%' },
      { num: '4', concepto: 'Combustible y Lubricantes de Flota', monto: 23015, pct: '7,31%' },
      { num: '5', concepto: 'Incentivos Laborales (Bonos de Obra)', monto: 7000, pct: '2,22%' },
      { num: '6', concepto: 'Vigilancia Perimetral y Custodia', monto: 6750, pct: '2,14%' },
      { num: '7', concepto: 'Timbres Fiscales / Notarías / Registros', monto: 2753, pct: '0,87%' },
      { num: '8', concepto: 'Servicios Públicos (Luz / Agua / Aseo)', monto: 1980, pct: '0,63%' },
      { num: '9', concepto: 'Gastos de Viajes y Viáticos Nacionales', monto: 1115, pct: '0,35%' },
      { num: '10', concepto: 'Servicios Telecomunicaciones', monto: 602, pct: '0,19%' },
      { num: '11', concepto: 'Otros Gastos Menores y Financieros', monto: 1066, pct: '0,35%' }
    ] : [
      { num: '1', concepto: 'Nómina Mensual Administrativa e Ingeniería', monto: 125000, pct: '31,78%' },
      { num: '2', concepto: 'Nómina Semanal Talleres Centrales TIMACA', monto: 122000, pct: '31,01%' },
      { num: '3', concepto: 'Aporte y Gestión Sindical', monto: 58952, pct: '14,99%' },
      { num: '4', concepto: 'Combustible y Lubricantes de Soporte', monto: 50413, pct: '12,82%' },
      { num: '5', concepto: 'Otros Costos Indirectos y Operativos', monto: 25507, pct: '6,48%' },
      { num: '6', concepto: 'Bonificaciones de Productividad y Campo', monto: 6700, pct: '1,70%' },
      { num: '7', concepto: 'Seguridad y Vigilancia Perimetral', monto: 4803, pct: '1,22%' }
    ];

    const cifRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Subconcepto Indirecto de Soporte (CIF)', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: `Monto (${mesTitle.split(' ')[0]})`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: '% CIF', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } }
      ]
    ];

    subconceptos.forEach((sub, idx) => {
      const isTop = idx < 2;
      cifRows.push([
        { text: sub.num, options: { align: 'center', fontSize: 7.2, fontFace: 'Consolas', bold: isTop, color: isTop ? C_BLUE : '64748B' } },
        { text: sub.concepto, options: { align: 'left', fontSize: 7.2, bold: isTop, color: isTop ? C_NAVY : C_DARK } },
        { text: `$${sub.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 7.2, bold: true, fontFace: 'Consolas', color: isTop ? '166534' : C_DARK } },
        { text: sub.pct, options: { align: 'center', fontSize: 7.2, fontFace: 'Consolas', bold: isTop, color: isTop ? C_BLUE : '334155' } }
      ]);
    });

    cifRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL GENERAL BOLSA CIF', options: { bold: true, fontSize: 7.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${cifTotal.toLocaleString('de-DE')} USD`, options: { align: 'right', bold: true, fontSize: 8, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } },
      { text: '100,00%', options: { align: 'center', bold: true, fontSize: 7.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(cifRows, {
      x: 0.6,
      y: 2.48,
      w: 5.85,
      colW: [0.35, 3.35, 1.25, 0.90],
      rowH: isOct ? 0.27 : 0.38,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Callout box below left table
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: isOct ? 6.10 : 5.75,
      w: 5.85,
      h: isOct ? 0.75 : 1.10,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(
      '• Núcleo Operativo (62,9%): Talleres Centrales ($123K) y Dirección Técnica ($75K) proveen pailería, mecanizado y supervisión de ingeniería a todos los contratos.\n' +
      '• Logística y Bienestar: Sindicato ($72,6K) y Combustible ($23,0K) garantizan paz laboral, dotaciones y transporte.',
      {
        x: 0.72,
        y: isOct ? 6.15 : 5.82,
        w: 5.61,
        h: isOct ? 0.65 : 0.95,
        fontSize: 7.5,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    // =========================================================================
    // COLUMNA DERECHA: MATRIZ OFICIAL DE PRORRATEO POR PROYECTO
    // =========================================================================
    slide.addText('MATRIZ OFICIAL DE PRORRATEO POR MANO DE OBRA DIRECTA (MOD)', {
      x: 6.80,
      y: 2.22,
      w: 5.93,
      h: 0.22,
      fontSize: 9.5,
      bold: true,
      color: C_NAVY
    });

    const prorrateoRows = isOct ? [
      { rank: '1', proyecto: 'Recuperación Línea 1 Pellas', cta: 'TTE-C-0706', mod: 131190, pct: '50,90%', cif: 160285.32 },
      { rank: '2', proyecto: 'Segunda Línea PMH', cta: 'TTE-C-0671', mod: 79030, pct: '30,66%', cif: 96557.27 },
      { rank: '3', proyecto: 'Fase 2 Planta Briquetas', cta: 'TTE-C-0668', mod: 23925, pct: '9,28%', cif: 29231.09 },
      { rank: '4', proyecto: 'Mantenimiento Boca Grande II', cta: 'TTE-C-0680', mod: 13685, pct: '5,31%', cif: 16720.06 },
      { rank: '5', proyecto: 'Mantenimiento Briqueteadoras', cta: 'TTE-C-0670', mod: 5100, pct: '1,98%', cif: 6231.08 },
      { rank: '6', proyecto: 'Suministro Caldera Briquetas', cta: 'TTE-C-0694', mod: 3190, pct: '1,24%', cif: 3897.48 },
      { rank: '7', proyecto: 'Rehabilitación de Bandas PMH', cta: 'TTE-C-0656', mod: 1630, pct: '0,63%', cif: 1991.50 }
    ] : [
      { rank: '1', proyecto: 'Recuperación Línea 1 Pellas', cta: 'TTE-C-0706', mod: 137878, pct: '60,17%', cif: 236688.09 },
      { rank: '2', proyecto: 'Servicio Mantenimiento Boca Grande II', cta: 'TTE-C-0680', mod: 28551, pct: '12,46%', cif: 49007.60 },
      { rank: '3', proyecto: 'Fase 2 Planta Briquetas', cta: 'TTE-C-0668', mod: 23400, pct: '10,21%', cif: 40166.75 },
      { rank: '4', proyecto: 'Segunda Línea PMH', cta: 'TTE-C-0671', mod: 23003, pct: '10,04%', cif: 39485.45 },
      { rank: '5', proyecto: 'Rehabilitación de Bandas PMH', cta: 'TTE-C-0656', mod: 16340, pct: '7,13%', cif: 28027.11 }
    ];

    const tableRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Proyecto / Frente de Obra', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Cuenta', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Base MOD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: '% MOD', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: `Prorrateo CIF`, options: { bold: true, align: 'right', fill: { color: '052E16' }, color: C_WHITE, fontSize: 8 } }
      ]
    ];

    prorrateoRows.forEach((r, idx) => {
      const isTop = idx === 0;
      tableRows.push([
        { text: r.rank, options: { align: 'center', fontSize: 7.5, fontFace: 'Consolas', bold: true, color: isTop ? C_BLUE : '64748B' } },
        { text: r.proyecto, options: { align: 'left', fontSize: 7.5, bold: isTop, color: isTop ? C_NAVY : C_DARK } },
        { text: r.cta, options: { align: 'center', fontSize: 7.2, fontFace: 'Consolas', color: '475569' } },
        { text: `$${Math.round(r.mod).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: r.pct, options: { align: 'center', fontSize: 7.5, fontFace: 'Consolas', bold: true, color: isTop ? C_BLUE : '334155' } },
        { text: `$${r.cif.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, options: { align: 'right', fontSize: 7.8, bold: true, fontFace: 'Consolas', color: isTop ? '166534' : C_DARK } }
      ]);
    });

    tableRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL PRORRATEADO', options: { bold: true, fontSize: 7.8, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `${prorrateoRows.length} frentes`, options: { align: 'center', bold: true, fontSize: 7.2, color: '64748B', fill: { color: 'F1F5F9' } } },
      { text: `$${Math.round(modBase).toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 7.8, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100,00%', options: { align: 'center', bold: true, fontSize: 7.8, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${cifTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`, options: { align: 'right', bold: true, fontSize: 8.2, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } }
    ]);

    slide.addTable(tableRows, {
      x: 6.80,
      y: 2.48,
      w: 5.93,
      colW: [0.30, 2.18, 0.85, 0.85, 0.65, 1.10],
      rowH: isOct ? 0.33 : 0.42,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Callout box below right table
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.80,
      y: isOct ? 5.65 : 5.50,
      w: 5.93,
      h: isOct ? 1.20 : 1.35,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(
      '• Los $314.913,80 USD se absorben 100% en los 7 proyectos con fuerza laboral activa (MOD) con fuerza laboral directa.\n' +
      '• Concentración en Ejes Clave: Pellas Línea 1 ($160.285 USD · 50,9%) y Segunda Línea PMH ($96.557 USD · 30,7%) absorben el 81,6% de la bolsa indirecta.',
      {
        x: 6.92,
        y: isOct ? 5.72 : 5.58,
        w: 5.69,
        h: isOct ? 1.05 : 1.18,
        fontSize: 7.5,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
      }
    );

    addSlideFooter(slide);
  }


  // =========================================================================
  // SLIDE 11A: CONCLUSIONES DE CONTROL & MATRIZ SEMÁFORO ESTRATÉGICA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '11A',
      `11A. Conclusiones de Control & Matriz Semáforo Estratégica (${mesTitle})`,
      `Evaluación integral en 4 dimensiones operativas: Fortalezas, Alertas, Riesgos y Recomendaciones Directivas`
    );

    // 4 Quadrants Matrix (2x2 Grid)
    // Quadrant 1: Fortalezas Operativas (Green) - Top-Left: x: 0.6, y: 1.35, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 5.95,
      h: 2.65,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('1. FORTALEZAS OPERATIVAS & CUMPLIMIENTO (VERDE)', {
      x: 0.8,
      y: 1.48,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '166534'
    });

    slide.addText(
      isOct
        ? '• Conciliación 100% Proyectos Externos: Gasto mensual auditado en $2.092.774,28 USD distribuidos en 18 frentes auxiliares (TTE-C) con exclusión estricta de flota y gastos centrales.\n' +
          '• Tracción Sostenida en Pellas Línea 1: Acumulado anual alcanzó $3.624.087 USD con 254 trabajadores estables y absorción de $175K en costos indirectos CIF.\n' +
          '• Expansión en Segunda Línea PMH: Inversión de $444.020 USD en el mes con cuadrilla y suministro masivo de vigas y perfiles ASTM A36.'
        : '• Mano de Obra Directa al Día: $196.665 USD devengados en 10 proyectos externos sin pasivos atrasados ni contingencias laborales.\n' +
          '• Avance Sólido en Pellas Línea 1: Acumulado consolidado de $2.388.978 USD (8,0% sobre contrato marco) con 254 trabajadores y 812 horas grúa.\n' +
          '• Eficiencia en Procura: Costos de flete mitigados mediante convenios de entrega directa en talleres de Puerto Ordaz.',
      {
        x: 0.8,
        y: 1.76,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: '14532D'
      }
    );

    // Quadrant 2: Alertas Contables y Reconciliaciones (Amber) - Top-Right: x: 6.78, y: 1.35, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 1.35,
      w: 5.95,
      h: 2.65,
      fill: { color: 'FFFBEB' },
      line: { color: 'FDE68A', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('2. ALERTAS CONTABLES & CONCILIACIONES EN CURSO (AMARILLO)', {
      x: 6.98,
      y: 1.48,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '92400E'
    });

    slide.addText(
      isOct
        ? '• Conciliación de Horas Máquina (Octubre): Incorporada provisión técnica temporal de $58.500 USD (821 H/M en 16 equipos de Pellas) a la espera de conciliación con horómetros finales.\n' +
          '• Regularización Nómina Boca Grande II: Cuenta TTE-C-0680 regularizada tras incorporar los 4 cortes semanales de RRHH ($13.685 USD / 3.946 HH), activando la cuenta con 23 trabajadores.\n' +
          '• Auditoría de Vales de Almacén: Seguimiento a vales de salida pendientes de descargo físico en almacenes de obra.'
        : '• Conciliación Horómetros de Equipos Propios: Se requiere mayor celeridad en la entrega de reportes semanales de horómetros para evitar imputaciones tardías.\n' +
          '• Seguimiento a Cuentas en Cierre: Frentes que alcanzan el 90%+ de ejecución requieren verificación de garantías y finiquitos técnicos.\n' +
          '• Control de Requisiciones Menores: Monitoreo estricto sobre compras locales de emergencia sin orden previa.',
      {
        x: 6.98,
        y: 1.76,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: '78350F'
      }
    );

    // Quadrant 3: Riesgos Críticos y Desviaciones (Red) - Bottom-Left: x: 0.6, y: 4.15, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.15,
      w: 5.95,
      h: 2.65,
      fill: { color: 'FEF2F2' },
      line: { color: 'FCA5A5', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('3. RIESGOS CRÍTICOS & PUNTOS DE CONTROL (ROJO)', {
      x: 0.8,
      y: 4.28,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '991B1B'
    });

    slide.addText(
      '• Agotamiento de Techos Presupuestarios: Identificación de proyectos secundarios con ejecución acumulada superior al 85% de la orden de compra inicial sin adenda aprobada.\n' +
      '• Volatilidad en Precios de Aceros Especiales: Incrementos en cotizaciones de planchas antiabrasivas Hardox y tuberías sin costura requieren cobertura de inventario estratégico.\n' +
      '• Dependencia de Grúas Críticas: La paralización por mantenimiento correctivo de la grúa Link-Belt 60T (GR20) generaría cuellos de botella en la ruta crítica de izaje.',
      {
        x: 0.8,
        y: 4.56,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: '7F1D1D'
      }
    );

    // Quadrant 4: Recomendaciones Directivas (Blue) - Bottom-Right: x: 6.78, y: 4.15, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 4.15,
      w: 5.95,
      h: 2.65,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('4. RECOMENDACIONES DIRECTIVAS DE GESTIÓN (AZUL)', {
      x: 6.98,
      y: 4.28,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Formalización de Adendas: Gestionar de inmediato con los clientes las ampliaciones de alcance y presupuestos de obras con sobreconsumo justificado.\n' +
      '• Automatización de Partes Diarios: Implementar el módulo digital de horómetros y asistencia en campo para erradicar retrasos en el corte mensual contable.\n' +
      '• Reconciliación Quincenal de Cubicaciones: Cruzar semanalmente los avances físicos medidos por la inspección con las imputaciones contables de almacén SIP.',
      {
        x: 6.98,
        y: 4.56,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 11B: DOSSIER EJECUTIVO Y DICTAMEN TÉCNICO OFICIAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '11B',
      `11B. Dossier Ejecutivo y Dictamen Técnico Oficial de Costos (${mesTitle})`,
      'Memorando formal de control de gestión · Conclusiones, dictamen técnico y firmas oficiales'
    );

    // Left Column: Formal Memorandum (x: 0.6, y: 1.35, w: 7.6, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 7.6,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('MEMORANDO DE CONTROL DE GESTIÓN Y AUDITORÍA DE COSTOS', {
      x: 0.8,
      y: 1.48,
      w: 7.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const dictamenDefault = isOct
      ? `Para el período correspondiente a Octubre 2026, el gasto operativo consolidado en proyectos externos alcanzó $2.092.774,28 USD (18 contratos auxiliares TTE-C activos con imputación contable auditada al 100%).\n\n` +
        `El proyecto con mayor ejecución fue Línea 1 Pellas (TTE-C-0706) con $1.235.109 USD (59,0% del total mensual), seguido por Planta PMH Segunda Línea (TTE-C-0671) con $444.020 USD (21,2%) y DRAVO PA-9020 con $126.963 USD (6,1%).\n\n` +
        `Se deja constancia formal de que el rubro Horas Máquina incluye una provisión técnica temporal de $58.500 USD para continuidad contable a la espera de la recepción final de partes de horómetros por parte de la jefatura de equipos pesados.`
      : `Para el período correspondiente a Septiembre 2026, el gasto operativo consolidado en proyectos externos se situó en $1.613.225 USD, distribuidos en 10 cuentas auxiliares activas.\n\n` +
        `El proyecto con mayor ejecución fue Línea 1 Pellas con $668.340 USD (40,8% del total mensual), seguido por DRAVO PA-9020 con $199.356 USD (parada técnica mayor con suministro concentrado de blindajes Hardox).\n\n` +
        `La distribución del costo por categorías se mantuvo alineada con las necesidades de procura y fuerza laboral directa (64.585 HH devengadas), orientada a la máxima eficiencia operativa y al estricto cumplimiento de los hitos de entrega con el cliente.`;

    const textoNotas = notasGestion ? notasGestion.replace(/\n/g, '\n') : dictamenDefault;

    slide.addText(textoNotas, {
      x: 0.8,
      y: 1.80,
      w: 7.2,
      h: 4.85,
      fontSize: 9,
      color: C_SLATE
    });

    // Right Column: Official Signatures and Endorsements (x: 8.4, y: 1.35, w: 4.33, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.4,
      y: 1.35,
      w: 4.33,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('AVAL TÉCNICO Y FIRMAS DIRECTIVAS', {
      x: 8.6,
      y: 1.48,
      w: 3.9,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    // Signature 1: Analista de Costos
    slide.addShape(pptx.ShapeType.line, {
      x: 8.8,
      y: 2.75,
      w: 3.5,
      h: 0,
      line: { color: C_BORDER, width: 1.0 }
    });
    slide.addText('ING. CIVIL ALEJANDRA TESARA', {
      x: 8.8,
      y: 2.82,
      w: 3.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_DARK,
      align: 'center'
    });
    slide.addText('Analista de Control de Gestión y Costos\nTIMACA - Puerto Ordaz', {
      x: 8.8,
      y: 3.02,
      w: 3.5,
      h: 0.35,
      fontSize: 8,
      color: C_SLATE,
      align: 'center'
    });

    // Signature 2: Gerencia de Operaciones
    slide.addShape(pptx.ShapeType.line, {
      x: 8.8,
      y: 4.15,
      w: 3.5,
      h: 0,
      line: { color: C_BORDER, width: 1.0 }
    });
    slide.addText('GERENCIA DE OPERACIONES', {
      x: 8.8,
      y: 4.22,
      w: 3.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_DARK,
      align: 'center'
    });
    slide.addText('Dirección de Montaje y Construcción\nTIMACA - Puerto Ordaz', {
      x: 8.8,
      y: 4.42,
      w: 3.5,
      h: 0.35,
      fontSize: 8,
      color: C_SLATE,
      align: 'center'
    });

    // Signature 3: Dirección General / Presidencia
    slide.addShape(pptx.ShapeType.line, {
      x: 8.8,
      y: 5.55,
      w: 3.5,
      h: 0,
      line: { color: C_BORDER, width: 1.0 }
    });
    slide.addText('DIRECCIÓN GENERAL Y PRESIDENCIA', {
      x: 8.8,
      y: 5.62,
      w: 3.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_DARK,
      align: 'center'
    });
    slide.addText('Aprobación Ejecutiva de Control de Gestión\nTIMACA - Modelo Estrella', {
      x: 8.8,
      y: 5.82,
      w: 3.5,
      h: 0.35,
      fontSize: 8,
      color: C_SLATE,
      align: 'center'
    });

    addSlideFooter(slide);
  }


  // =========================================================================
  // BROWSER DOWNLOAD WITH OPENXML SPANISH LOCALIZATION (es-VE)
  // =========================================================================
  const fileName = `Informe_Ejecutivo_Costos_TIMACA_${mesLabel.replace(/\s+/g, '_')}.pptx`;
  if (typeof window !== 'undefined') {
    const rawBlob: any = await pptx.write({ outputType: 'blob' });
    const zip = await JSZip.loadAsync(rawBlob);
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      if (relativePath.endsWith('.xml') || relativePath.endsWith('.rels')) {
        let content = await zipEntry.async('string');
        let modified = false;
        if (content.includes('lang="en-US"')) {
          content = content.replace(/lang="en-[A-Z]+"/g, 'lang="es-VE"');
          modified = true;
        }
        if (modified) {
          zip.file(relativePath, content);
        }
      }
    }
    const cleanBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(cleanBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } else {
    await pptx.writeFile({ fileName });
  }
}
