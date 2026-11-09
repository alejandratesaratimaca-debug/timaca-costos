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
    pellasMesData
  } = params;

  const isOct = selectedMesNum === 10;
  const mesTitle = isOct ? 'Octubre 2026' : (selectedMesNum === 8 ? 'Agosto 2026' : 'Septiembre 2026');
  const mesUpper = mesTitle.toUpperCase();

  const PptxConstructor: any = (pptxgen as any).default || pptxgen;
  const pptx = new PptxConstructor();

  // 16:9 Widescreen Standard Layout (13.333" x 7.5")
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

  // Helper Header for interior slides (13.333" width)
  const addSlideHeader = (slide: any, slideNumber: number, title: string, subtitle: string) => {
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

    slide.addText(`LÁMINA ${slideNumber} · SEPTIEMBRE 2026`, {
      x: 10.2,
      y: 0.25,
      w: 2.5,
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

  // Helper Footer for interior slides (13.333" width)
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
  // SLIDE 0: PORTADA OFICIAL EJECUTIVA (IDÉNTICA A LA VISTA WEB)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Outer card container with clean slate border
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
      return assetUrl;
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

    slide.addText('Taller Industrial Metalúrgico Antonio C.A.', {
      x: 2.7,
      y: 0.90,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      color: '64748B'
    });

    // Pill Badge on Right
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.8,
      y: 0.65,
      w: 2.7,
      h: 0.42,
      fill: { color: 'F1F5F9' },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.2
    });

    slide.addText('Presentación Ejecutiva Oficial', {
      x: 9.8,
      y: 0.73,
      w: 2.7,
      h: 0.26,
      fontSize: 11,
      bold: true,
      color: C_NAVY,
      align: 'center'
    });

    // Divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.30,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    // Period Chip
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.66,
      y: 1.45,
      w: 4.0,
      h: 0.35,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(`PERÍODO OPERATIVO: ${mesUpper}`, {
      x: 4.66,
      y: 1.50,
      w: 4.0,
      h: 0.25,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY,
      align: 'center'
    });

    // Main Title
    slide.addText('INFORME GESTIÓN DE COSTOS', {
      x: 0.8,
      y: 1.88,
      w: 11.733,
      h: 0.55,
      fontSize: 34,
      bold: true,
      color: '0F172A',
      align: 'center'
    });

    // Subtitle
    slide.addText(mesUpper, {
      x: 0.8,
      y: 2.45,
      w: 11.733,
      h: 0.38,
      fontSize: 20,
      bold: true,
      color: '475569',
      align: 'center'
    });

    // 3 Metadata KPI Chips
    const chips = [
      { label: 'Ejecución del Mes:', val: isOct ? '$1.428.905 USD' : (selectedMesNum === 8 ? '$1.197.600 USD' : '$1.613.225 USD') },
      { label: 'Acumulado 2026:', val: isOct ? '$13.481.082 USD' : (selectedMesNum === 8 ? '$10.438.951 USD' : '$12.052.176 USD') },
      { label: 'Proyectos Activos:', val: isOct ? `${cuentasAuxiliaresMes.length || 18} Cuentas Auxiliares` : (selectedMesNum === 8 ? '20 Cuentas Auxiliares' : '25 Cuentas Auxiliares') }
    ];

    chips.forEach((ch, idx) => {
      const xPos = 1.8 + (idx * 3.4);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.92,
        w: 3.1,
        h: 0.40,
        fill: { color: 'F8FAFC' },
        line: { color: C_BORDER, width: 0.6 },
        rectRadius: 0.08
      });

      slide.addText([
        { text: `${ch.label} `, options: { fontSize: 11, color: '64748B' } },
        { text: ch.val, options: { fontSize: 12, bold: true, color: C_NAVY } }
      ], {
        x: xPos + 0.1,
        y: 2.98,
        w: 2.9,
        h: 0.28,
        align: 'center'
      });
    });

    // Industrial Banner Image
    try {
      slide.addImage({
        path: getAssetPath('/ppt-assets/portada-banner-industrial.png'),
        x: 0.8,
        y: 3.45,
        w: 11.733,
        h: 2.75,
        altText: 'Vista de Operaciones TIMACA'
      });
    } catch (e) {}

    // Footer divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 6.35,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    slide.addText('Elaborado por: Ing. Civil Alejandra Tesara (Analista de Costos)', {
      x: 0.8,
      y: 6.45,
      w: 4.5,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: '334155'
    });

    slide.addText('Destinatario: Dirección General y Presidencia · TIMACA', {
      x: 5.3,
      y: 6.45,
      w: 5.0,
      h: 0.25,
      fontSize: 10.5,
      color: '475569',
      align: 'center'
    });

    slide.addText('Puerto Ordaz, Venezuela', {
      x: 10.3,
      y: 6.45,
      w: 2.233,
      h: 0.25,
      fontSize: 10.5,
      color: '64748B',
      align: 'right'
    });
  }

  // =========================================================================
  // SLIDE 1: DISTRIBUCIÓN MENSUAL POR CATEGORÍA DE COSTO (CONSOLIDADO 2026)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      1,
      '1. Distribución Mensual por Categoría de Costo (Consolidado 2026)',
      'Evolución histórica Ene-Oct 2026 · Total 10 Meses: $14.753.270 USD'
    );

    // Native Table (13.333" width)
    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    const varHeader = selectedMesNum > 1 ? `Var. % (${shortMonths[selectedMesNum - 1]} vs ${shortMonths[selectedMesNum - 2]})` : 'Var. %';
    const headers = ['Categoría', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Total 2026', varHeader];
    const tableRows: any[][] = [];

    tableRows.push(
      headers.map((h, i) => ({
        text: h,
        options: {
          bold: true,
          color: C_WHITE,
          fill: { color: i === selectedMesNum ? C_AMBER : C_DARK },
          align: i === 0 ? 'left' : 'right',
          fontSize: 8.5
        }
      }))
    );

    TABLA_PPT_DISTRIBUCION_2026.forEach((row) => {
      const cells: any[] = [
        { text: row.categoria, options: { bold: true, fontSize: 10.0, color: C_DARK, align: 'left' } }
      ];
      row.meses.forEach((val, mIdx) => {
        const isSelected = mIdx === (selectedMesNum - 1);
        cells.push({
          text: val.toLocaleString('de-DE'),
          options: {
            fontSize: 9.0,
            color: isSelected ? C_NAVY : C_SLATE,
            bold: isSelected,
            fill: isSelected ? { color: 'FEF3C7' } : undefined,
            align: 'right'
          }
        });
      });
      cells.push({
        text: row.total2026.toLocaleString('de-DE'),
        options: { bold: true, fontSize: 9.0, color: C_DARK, fill: { color: 'F1F5F9' }, align: 'right' }
      });

      const mIdx = Math.max(0, Math.min(row.meses.length - 1, selectedMesNum - 1));
      const prevIdx = mIdx > 0 ? mIdx - 1 : null;
      const valActivo = row.meses[mIdx] || 0;
      const valAnterior = prevIdx !== null ? (row.meses[prevIdx] || 0) : null;
      let varText = '-';
      let esPositiva = false;

      if (valAnterior !== null && valAnterior > 0) {
        if (row.categoria.toLowerCase().includes('máquina') && valActivo === 0) {
          varText = '0,0%';
        } else {
          const diff = valActivo - valAnterior;
          const varPct = Math.round((diff / valAnterior) * 1000) / 10;
          esPositiva = varPct > 0;
          varText = (varPct > 0 ? '+' : '') + varPct.toFixed(1).replace('.', ',') + '%';
        }
      } else if (valAnterior !== null && valAnterior === 0 && valActivo > 0) {
        varText = '+100%';
        esPositiva = true;
      } else if (valAnterior !== null && valAnterior === 0 && valActivo === 0) {
        varText = '0,0%';
      }

      cells.push({
        text: varText,
        options: {
          bold: true,
          fontSize: 9.0,
          color: esPositiva ? C_EMERALD : 'B45309',
          align: 'center'
        }
      });
      tableRows.push(cells);
    });

    // Total Row
    const totalCells: any[] = [
      { text: 'TOTAL MENSUAL (USD)', options: { bold: true, fontSize: 9.5, color: C_WHITE, fill: { color: C_NAVY }, align: 'left' } }
    ];
    TOTALES_MESES_PPT.forEach((tm, mIdx) => {
      const isSelected = mIdx === (selectedMesNum - 1);
      totalCells.push({
        text: tm.total.toLocaleString('de-DE'),
        options: {
          bold: true,
          fontSize: 9.5,
          color: isSelected ? 'FCD34D' : C_WHITE,
          fill: { color: isSelected ? '1E3A8A' : C_NAVY },
          align: 'right'
        }
      });
    });
    const grandTotal2026 = TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0);
    totalCells.push({
      text: Math.round(grandTotal2026).toLocaleString('de-DE'),
      options: { bold: true, fontSize: 9.5, color: C_WHITE, fill: { color: '0F172A' }, align: 'right' }
    });

    const mIdx = Math.max(0, Math.min(TOTALES_MESES_PPT.length - 1, selectedMesNum - 1));
    const prevIdx = mIdx > 0 ? mIdx - 1 : null;
    const totActivo = TOTALES_MESES_PPT[mIdx]?.total || 0;
    const totAnterior = prevIdx !== null ? (TOTALES_MESES_PPT[prevIdx]?.total || 0) : null;
    let totVarText = '-';
    let totPositiva = false;

    if (totAnterior !== null && totAnterior > 0) {
      const totDiff = totActivo - totAnterior;
      const totPct = Math.round((totDiff / totAnterior) * 1000) / 10;
      totPositiva = totPct > 0;
      totVarText = (totPct > 0 ? '+' : '') + totPct.toFixed(1).replace('.', ',') + '%';
    }

    totalCells.push({
      text: totVarText,
      options: { bold: true, fontSize: 9.5, color: totPositiva ? '34D399' : 'FCD34D', fill: { color: '0F172A' }, align: 'center' }
    });
    tableRows.push(totalCells);

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [2.13, 0.76, 0.76, 0.76, 0.76, 0.76, 0.76, 0.76, 0.76, 0.82, 0.85, 1.15, 0.95],
      border: { pt: 0.5, color: C_BORDER }
    });

    // 3 Strategic Callout Cards
    const insights = [
      {
        title: 'Materiales Directos ($3.967.416 USD · 32,9%)',
        desc: 'Mayor rubro acumulado del año. En septiembre alcanzó su récord mensual de $868.067 USD (+133,4% vs agosto) por la procura mayor de perfiles estructurales A36, tolvas, planchas antiabrasivas Hardox 450/500 y componentes mecánicos para Segunda Línea PMH, DRAVO y Pellas Línea 1.'
      },
      {
        title: 'Servicios Directos ($2.904.145 USD · 24,1%)',
        desc: 'Concentra el hito extraordinario de junio ($1.639.332 USD · 56,4% del rubro anual) por fletes marítimos internacionales, desaduanamiento y maniobras fluviales para el desembarque de módulos pesados. En septiembre totaliza $99.540 USD (-15,6% vs agosto), con un 69,4% concentrado en Pellas Línea 1 ($69.056 USD) para logística y custodia.'
      },
      {
        title: 'Mano de Obra Directa ($2.218.229 USD · 18,4%)',
        desc: 'Fuerza laboral en 10 proyectos externos con cuadrilla activa. En septiembre cerró en $196.665 USD (-29,2% vs agosto al computar 4 semanas regulares de 55.277 HH @ $3,56 USD/HH sin pasivos laborales), liderada por Pellas Línea 1 ($128.161 USD · 65,2%) y Segunda Línea PMH ($30.305 USD · 15,4%).'
      }
    ];

    insights.forEach((ins, idx) => {
      const xPos = 0.6 + (idx * 4.1);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.45,
        w: 3.93,
        h: 2.35,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.1
      });

      slide.addText(ins.title, {
        x: xPos + 0.15,
        y: 4.60,
        w: 3.63,
        h: 0.35,
        fontSize: 11.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(ins.desc, {
        x: xPos + 0.15,
        y: 5.00,
        w: 3.63,
        h: 1.65,
        fontSize: 10,
        color: C_SLATE,
        lineSpacingMultiple: 1.2
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 2: ANÁLISIS DE COSTOS DEL MES (SEPTIEMBRE)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      2,
      '2. Análisis de Costos del Mes (Septiembre 2026)',
      'Gasto Total Oficial: $1.613.225 USD · Variación vs mes anterior: +34,7% (+415.625 USD vs Agosto)'
    );

    // Left Column: Native Office Donut Chart
    const directCost = 1219850;
    const indirectCost = 393375;
    const donutData = [
      {
        name: 'Distribución de Costo',
        labels: ['Costos Directos (75,6%) · $1.219.850 USD', 'Costos Indirectos CIF (24,4%) · $393.375 USD'],
        values: [directCost, indirectCost]
      }
    ];

    slide.addChart(pptx.ChartType.doughnut, donutData, {
      x: 0.6,
      y: 1.30,
      w: 5.8,
      h: 2.30,
      chartColors: [C_NAVY, C_AMBER],
      dataLabelColor: 'FFFFFF',
      showPercent: false,
      showLegend: true,
      legendPos: 'b'
    });

    // Right Column: 2 Summary Cards
    // Direct Costs Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.6,
      y: 1.30,
      w: 6.13,
      h: 1.12,
      fill: { color: C_WHITE },
      line: { color: '3B82F6', width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('COSTOS DIRECTOS (75,6%) · $1.219.850 USD', {
      x: 6.8,
      y: 1.38,
      w: 5.7,
      h: 0.24,
      fontSize: 12,
      bold: true,
      color: C_BLUE
    });

    slide.addText(
      'Materiales: $868.067 USD (53,8%) | MOD: $196.665 USD (12,2%)\n' +
      'Servicios: $99.540 USD (6,2%) | Horas Máquina: $55.578 USD (3,4%)\n' +
      '→ Costo directo en 25 cuentas activas (con nómina de obra concentrada en 10 frentes).',
      {
        x: 6.8,
        y: 1.64,
        w: 5.7,
        h: 0.72,
        fontSize: 10,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    // Indirect Costs Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.6,
      y: 2.48,
      w: 6.13,
      h: 1.12,
      fill: { color: C_WHITE },
      line: { color: C_AMBER, width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('COSTOS INDIRECTOS CIF (24,4%) · $393.375 USD', {
      x: 6.8,
      y: 2.56,
      w: 5.7,
      h: 0.24,
      fontSize: 12,
      bold: true,
      color: 'B45309'
    });

    slide.addText(
      'Nómina TIMACA: $125.000 | Nómina Talleres: $122.000 | Sindicato: $58.952\n' +
      'Combustible: $50.413 | Otros: $25.235 | Bonos: $6.700 | Vigilancia: $5.075\n' +
      '→ Matriz Corporativa de Distribución CIF: 60,17% Pellas Línea 1 ($236.688 USD) / 39,83% Resto ($156.687 USD).',
      {
        x: 6.8,
        y: 2.82,
        w: 5.7,
        h: 0.72,
        fontSize: 10,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    // Bottom Table: 5 Official Categories
    const catRows: any[][] = [
      [
        { text: 'Categoría de Costo', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: 'Monto Septiembre (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: '% Mes', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: 'Monto Agosto (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: 'Variación vs Anterior', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 10.5, margin: [1, 3, 1, 3] } }
      ],
      [
        { text: 'Materiales Directos', options: { bold: true, fontSize: 10, color: C_DARK, margin: [1, 3, 1, 3] } },
        { text: '$868.067', options: { fontSize: 10, align: 'right', bold: true, margin: [1, 3, 1, 3] } },
        { text: '53,8%', options: { fontSize: 10, align: 'right', color: C_SLATE, margin: [1, 3, 1, 3] } },
        { text: '$371.927', options: { fontSize: 10, align: 'right', color: '64748B', margin: [1, 3, 1, 3] } },
        { text: '+133,4%', options: { fontSize: 10, align: 'center', bold: true, color: C_EMERALD, margin: [1, 3, 1, 3] } }
      ],
      [
        { text: 'Servicios Directos', options: { bold: true, fontSize: 10, color: C_DARK, margin: [1, 3, 1, 3] } },
        { text: '$99.540', options: { fontSize: 10, align: 'right', bold: true, margin: [1, 3, 1, 3] } },
        { text: '6,2%', options: { fontSize: 10, align: 'right', color: C_SLATE, margin: [1, 3, 1, 3] } },
        { text: '$117.970', options: { fontSize: 10, align: 'right', color: '64748B', margin: [1, 3, 1, 3] } },
        { text: '-15,6%', options: { fontSize: 10, align: 'center', bold: true, color: 'B45309', margin: [1, 3, 1, 3] } }
      ],
      [
        { text: 'Mano de Obra Directa', options: { bold: true, fontSize: 10, color: C_DARK, margin: [1, 3, 1, 3] } },
        { text: '$196.665', options: { fontSize: 10, align: 'right', bold: true, margin: [1, 3, 1, 3] } },
        { text: '12,2%', options: { fontSize: 10, align: 'right', color: C_SLATE, margin: [1, 3, 1, 3] } },
        { text: '$277.936', options: { fontSize: 10, align: 'right', color: '64748B', margin: [1, 3, 1, 3] } },
        { text: '-29,2%', options: { fontSize: 10, align: 'center', bold: true, color: 'B45309', margin: [1, 3, 1, 3] } }
      ],
      [
        { text: 'Horas Máquina', options: { bold: true, fontSize: 10, color: C_DARK, margin: [1, 3, 1, 3] } },
        { text: '$55.578', options: { fontSize: 10, align: 'right', bold: true, margin: [1, 3, 1, 3] } },
        { text: '3,4%', options: { fontSize: 10, align: 'right', color: C_SLATE, margin: [1, 3, 1, 3] } },
        { text: '$89.789', options: { fontSize: 10, align: 'right', color: '64748B', margin: [1, 3, 1, 3] } },
        { text: '-38,1%', options: { fontSize: 10, align: 'center', bold: true, color: 'B45309', margin: [1, 3, 1, 3] } }
      ],
      [
        { text: 'Costos Indirectos (CIF)', options: { bold: true, fontSize: 10, color: C_DARK, margin: [1, 3, 1, 3] } },
        { text: '$393.375', options: { fontSize: 10, align: 'right', bold: true, margin: [1, 3, 1, 3] } },
        { text: '24,4%', options: { fontSize: 10, align: 'right', color: C_SLATE, margin: [1, 3, 1, 3] } },
        { text: '$339.978', options: { fontSize: 10, align: 'right', color: '64748B', margin: [1, 3, 1, 3] } },
        { text: '+15,7%', options: { fontSize: 10, align: 'center', bold: true, color: C_EMERALD, margin: [1, 3, 1, 3] } }
      ]
    ];

    slide.addTable(catRows, {
      x: 0.6,
      y: 3.68,
      w: 12.13,
      colW: [4.0, 2.2, 1.5, 2.2, 2.23],
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.30,
      w: 12.13,
      h: 1.55,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.7 },
      rectRadius: 0.08
    });

    slide.addText(
      isOct
        ? 'NOTAS OPERATIVAS DE CONTROL (JUSTIFICACIÓN DE VARIACIONES - OCTUBRE 2026):\n' +
          '• Servicios Especializados (+872% vs sep): Inyección estratégica en instrumentación, ingeniería y automatización para Línea 1 Pellas con Yokogawa ($686K) y Henan Front ($40K).\n' +
          '• Materiales Directos: Procura SIP ($476.866 USD) para calderería y tolvas en Pellas Línea 1 ($174K), Segunda Línea PMH ($258K) y Rueda DRAVO ($106K).\n' +
          '• Costos Indirectos (CIF): $344.629 USD en estructura corporativa de administración, talleres centrales, combustible y soporte de flota.\n' +
          '• Mano de Obra Directa (MOD): Devengado procesado de cuadrillas en Pellas, PMH y Briquetas. Nota de control: Se registra retraso en la recepción de la nómina de cuadrilla en Boca Grande II (TTE-C-0680), que se incorporará al recibir el corte de RRHH.\n' +
          '• Horas Máquina: El rubro se mantiene preliminarmente en $0,00 USD debido a retraso operativo en la consolidación de partes de horómetros y reporte de utilización de maquinaria pesada.'
        : 'NOTAS OPERATIVAS DE CONTROL (JUSTIFICACIÓN DE VARIACIONES):\n' +
          '• Materiales Directos (+133,4% / +$496.140 USD): Incremento neto mensual de $371.927 USD a $868.067 USD concentrado en tres frentes: Segunda Línea PMH ($249.494 USD en perfiles A36, apoyos, conduit y concreto), Rueda DRAVO ($182.885 USD en planchas Hardox 450/500 y componentes mecánicos) y Pellas Línea 1 ($173.833 USD en calderería y tolvas), sumando entre los tres $606.212 USD (69,8% de los materiales del mes).\n' +
          '• Costos Indirectos CIF (+15,7% / +$53.397 USD): Variación neta mensual de $339.978 USD a $393.375 USD impulsada por los rubros operativos variables de soporte (combustible de flota auxiliar, compromisos sindicales y consumibles menores), manteniéndose estables las cuotas mensuales de nómina indirecta de estructura ($247.000 USD entre administración y taller central).\n' +
          '• Servicios Directos (-15,6% / -$18.430 USD): Disminución neta en los restantes proyectos de obra (-$24.380 USD) tras culminar fletes extrapesados y ensayos END en agosto, mientras Pellas Línea 1 incrementó su logística de transporte de personal y vigilancia ($69.056 USD, +$5.950 USD vs agosto).\n' +
          '• Mano de Obra Directa (-29,2% / -$81.271 USD): Agosto computó 5 semanas con sobretiempo extraordinario por parada de planta, mientras septiembre computó 4 semanas operativas regulares (55.277 HH @ $3,56 USD/HH sin pasivos diferidos).\n' +
          '• Horas Máquina (-38,1% / -$34.211 USD): Culminación de maniobras pesadas de la Demag AC200 en agosto; en septiembre los 16 equipos activos en Pellas sumaron 811,7 h ($46.178 USD en 5 grúas y $9.400 USD en 11 equipos de soporte).',
      {
        x: 0.75,
        y: 5.34,
        w: 11.83,
        h: 1.48,
        fontSize: 8.7,
        color: '1E3A8A',
        lineSpacingMultiple: 1.12
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 3: AUDITORÍA Y DESGLOSE DE MANO DE OBRA DIRECTA (NÓMINA SEPTIEMBRE 2026)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      3,
      isOct
        ? '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Octubre 2026)'
        : '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Septiembre 2026)',
      isOct
        ? 'Total Nómina Octubre Devengada: $235.066 USD · 64.585 HH · Cuadrillas en Pellas, PMH y Briquetas (BG II en retraso)'
        : 'Total Nómina Septiembre: $196.665 USD · 55.277 Horas-Hombre · Cuadrilla Activa en 10 Proyectos Externos'
    );

    // 4 KPI Cards
    const modCards = isOct
      ? [
          { label: 'TOTAL NÓMINA DIRECTA OCT', val: '$235.066 USD', note: 'Semanas 39 a 43 · Devengo procesado' },
          { label: 'VOLUMEN DE HORAS-HOMBRE', val: '64.585 HH', note: 'Promedio 12.917 HH/semana en campo' },
          { label: 'TARIFA PROMEDIO EFECTIVA', val: '$3,64 USD/HH', note: 'Costo integral de mano de obra' },
          { label: 'FRENTES CON CUADRILLA', val: '5 Frentes Devengados', note: '55,8% Pellas · Boca Grande pendiente' }
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
        ? '• Ciclo Operativo de Nómina Directa (Octubre 2026):\n' +
          '  La nómina procesada incorpora 4 cortes semanales regulares (Semanas 40 a 43) en los frentes de Planta de Pellas Línea 1, FMO PMH y Planta de Briquetas.\n\n' +
          '• Alerta de Control: Nómina Boca Grande II (TTE-C-0680):\n' +
          '  Se registra retraso en la entrega de la nómina de cuadrilla de Boca Grande II por parte de Recursos Humanos; actualmente la cuenta solo refleja $5.772,32 USD en insumos de almacén SIP. Se incluirá en la consolidación final tras recibir el soporte de RRHH.\n\n' +
          '• Alerta de Maquinaria: Horas Máquina en Conciliación:\n' +
          '  El renglón de Horas Máquina registra retraso en los partes de horómetros de grúas y flota pesada, figurando preliminarmente en $0,00 USD.'
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

    activeNominaProjects.forEach(p => {
      modTableRows.push([
        { text: p.cta, options: { bold: true, fontSize: 8.8, color: C_DARK, margin: [2, 3, 2, 3] } },
        { text: p.retraso ? `${p.proyecto} (RETRASO RRHH)` : p.proyecto, options: { fontSize: 8.8, color: p.retraso ? 'DC2626' : C_SLATE, margin: [2, 3, 2, 3] } },
        { text: `$${p.monto.toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 8.8, color: C_NAVY, margin: [2, 3, 2, 3] } },
        { text: p.hh.toLocaleString('de-DE'), options: { align: 'right', fontSize: 8.8, color: '64748B', margin: [2, 3, 2, 3] } },
        { text: `${p.pct.toFixed(1).replace('.', ',')}%`, options: { align: 'right', fontSize: 8.8, color: C_DARK, bold: true, margin: [2, 3, 2, 3] } }
      ]);
    });

    modTableRows.push([
      { text: 'TOTAL', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, margin: [2, 3, 2, 3] } },
      { text: isOct ? 'NÓMINA OCTUBRE (DEVENGADA)' : '10 PROYECTOS EXTERNOS ACTIVOS', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, margin: [2, 3, 2, 3] } },
      { text: isOct ? '$235.066 USD' : '$196.665 USD', options: { bold: true, fontSize: 9.0, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } },
      { text: isOct ? '64.585 HH' : '55.277 HH', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } },
      { text: '100,0%', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } }
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
  // SLIDE 4: TOTAL PROYECTOS EXTERNOS CON DESPACHOS (SEPTIEMBRE 2026)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const activeCuentas = isOct ? CUENTAS_AUXILIARES_EXACTAS_OCTUBRE_2026 : CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026;
    addSlideHeader(
      slide,
      4,
      `4. Total Proyectos Externos con Despachos (${mesTitle})`,
      `${activeCuentas.length} Cuentas Auxiliares Activas · Distribución Pareto y Control Presupuestario`
    );

    const pryTable: any[][] = [
      [
        { text: '#', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 10.5 } },
        { text: 'Código', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: 'Proyecto / OT (Cliente)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: `Monto ${isOct ? 'Oct' : 'Sep'} (USD)`, options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: '% Mes', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: 'Presupuesto Total (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: '% Uso Presup.', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 10.5 } }
      ]
    ];

    const pryBudgets: Record<string, { pres: string; pct: string }> = {
      'TTE-C-0706': { pres: '$29.720.000', pct: isOct ? '10,9%' : '8,0%' },
      'TTE-C-0671': { pres: '$3.260.000', pct: isOct ? '43,8%' : '35,5%' },
      'TTE-C-0653': { pres: '$2.220.000', pct: isOct ? '32,6%' : '24,9%' },
      'TTE-C-0668': { pres: '$1.850.000', pct: '38,2%' },
      'TTE-C-0694': { pres: '$450.000', pct: '23,2%' },
      'TTE-C-0656': { pres: '$1.500.000', pct: isOct ? '81,1%' : '80,8%' },
      'TTE-C-0678': { pres: '$680.000', pct: '47,2%' },
      'TTE-C-0680': { pres: '$520.000', pct: isOct ? '46,7%' : '41,6%' },
      'TTE-C-0640': { pres: '$180.000', pct: '38,9%' },
      'TTE-C-0670': { pres: '$210.000', pct: '32,7%' },
      'TTE-C-0655': { pres: '$980.000', pct: '21,4%' },
      'TTE-C-0641': { pres: '$820.000', pct: '18,5%' },
      'TTE-C-0696': { pres: '$350.000', pct: '14,2%' },
      'TTE-C-0682': { pres: '$420.000', pct: '9,8%' },
      'TTE-C-0700': { pres: '$280.000', pct: '7,4%' },
      'TTE-C-0697': { pres: '$1.091.248', pct: '90,0%' }
    };

    const top10 = activeCuentas.slice(0, 10);
    const subtotalTop10 = top10.reduce((s, c) => s + ((c as any).montoOctubre ?? c.montoSeptiembre ?? 0), 0);
    const pctTop10 = top10.reduce((s, c) => s + c.porcentaje, 0);

    const resto = activeCuentas.slice(10);
    const subtotalResto = resto.reduce((s, c) => s + ((c as any).montoOctubre ?? c.montoSeptiembre ?? 0), 0);
    const pctResto = resto.reduce((s, c) => s + c.porcentaje, 0);

    const grandTotal = subtotalTop10 + subtotalResto;

    top10.forEach((c, i) => {
      const bInfo = pryBudgets[c.cuentaAuxiliar] || { pres: '-', pct: 'S/P' };
      const cleanPry = (c.proyectoCorto || c.proyecto).replace(/610TG1\s*\/\s*/g, '610TG1 / ').replace(/\s+/g, ' ').trim();
      const monto = Math.round((c as any).montoOctubre ?? c.montoSeptiembre ?? 0);
      pryTable.push([
        { text: (i + 1).toString(), options: { align: 'center', fontSize: 8.5, color: '64748B', margin: [1, 2, 1, 2] } },
        { text: c.cuentaAuxiliar, options: { bold: true, fontSize: 8.5, color: C_DARK, margin: [1, 2, 1, 2] } },
        { text: cleanPry, options: { fontSize: 8.5, color: C_SLATE, margin: [1, 2, 1, 2] } },
        { text: `$${monto.toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: `${c.porcentaje.toFixed(1).replace('.', ',')}%`, options: { align: 'right', fontSize: 8.5, color: C_SLATE, margin: [1, 2, 1, 2] } },
        { text: bInfo.pres, options: { align: 'right', fontSize: 8.5, color: '64748B', margin: [1, 2, 1, 2] } },
        { text: bInfo.pct, options: { align: 'center', bold: true, fontSize: 8.5, color: C_DARK, margin: [1, 2, 1, 2] } }
      ]);
    });

    pryTable.push([
      { text: '', options: { fill: { color: 'F1F5F9' }, margin: [1, 2, 1, 2] } },
      { text: 'SUBTOTAL', options: { bold: true, fontSize: 8.0, fill: { color: 'F1F5F9' }, color: C_DARK, margin: [1, 2, 1, 2] } },
      { text: 'TOP 10 CUENTAS PRIORITARIAS (SEGUIMIENTO EJECUTIVO)', options: { bold: true, fontSize: 8.0, fill: { color: 'F1F5F9' }, color: C_DARK, margin: [1, 2, 1, 2] } },
      { text: `$${Math.round(subtotalTop10).toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 8.0, fill: { color: 'F1F5F9' }, color: C_NAVY, margin: [1, 2, 1, 2] } },
      { text: `${pctTop10.toFixed(1).replace('.', ',')}%`, options: { bold: true, align: 'right', fontSize: 8.0, fill: { color: 'F1F5F9' }, color: C_DARK, margin: [1, 2, 1, 2] } },
      { text: '-', options: { align: 'right', fontSize: 8.0, fill: { color: 'F1F5F9' }, margin: [1, 2, 1, 2] } },
      { text: '-', options: { align: 'center', fontSize: 8.0, fill: { color: 'F1F5F9' }, margin: [1, 2, 1, 2] } }
    ]);

    pryTable.push([
      { text: '', options: { fill: { color: 'F8FAFC' }, margin: [1, 2, 1, 2] } },
      { text: 'RESTO', options: { fontSize: 8.0, fill: { color: 'F8FAFC' }, color: '64748B', margin: [1, 2, 1, 2] } },
      { text: `OTRAS ${resto.length} CUENTAS ACTIVAS MENORES (TALLERES / SERVICIOS AUXILIARES)`, options: { fontSize: 8.0, fill: { color: 'F8FAFC' }, color: '64748B', margin: [1, 2, 1, 2] } },
      { text: `$${Math.round(subtotalResto).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8.0, fill: { color: 'F8FAFC' }, color: '64748B', margin: [1, 2, 1, 2] } },
      { text: `${pctResto.toFixed(1).replace('.', ',')}%`, options: { align: 'right', fontSize: 8.0, fill: { color: 'F8FAFC' }, color: '64748B', margin: [1, 2, 1, 2] } },
      { text: '-', options: { align: 'right', fontSize: 8.0, fill: { color: 'F8FAFC' }, margin: [1, 2, 1, 2] } },
      { text: '-', options: { align: 'center', fontSize: 8.0, fill: { color: 'F8FAFC' }, margin: [1, 2, 1, 2] } }
    ]);

    pryTable.push([
      { text: '', options: { fill: { color: C_NAVY }, margin: [1, 2, 1, 2] } },
      { text: 'TOTAL', options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, margin: [1, 2, 1, 2] } },
      { text: `CONSOLIDADO ${activeCuentas.length} PROYECTOS EXTERNOS ACTIVOS`, options: { bold: true, fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, margin: [1, 2, 1, 2] } },
      { text: `$${Math.round(grandTotal).toLocaleString('de-DE')} USD`, options: { bold: true, align: 'right', fontSize: 8.5, fill: { color: C_NAVY }, color: 'FCD34D', margin: [1, 2, 1, 2] } },
      { text: '100,0%', options: { bold: true, align: 'right', fontSize: 8.5, fill: { color: C_NAVY }, color: C_WHITE, margin: [1, 2, 1, 2] } },
      { text: '-', options: { align: 'right', fontSize: 8.5, fill: { color: C_NAVY }, margin: [1, 2, 1, 2] } },
      { text: '-', options: { align: 'center', fontSize: 8.5, fill: { color: C_NAVY }, margin: [1, 2, 1, 2] } }
    ]);

    slide.addTable(pryTable, {
      x: 0.6,
      y: 1.18,
      w: 12.13,
      colW: [0.45, 1.35, 4.63, 1.8, 1.1, 1.6, 1.2],
      border: { pt: 0.5, color: C_BORDER }
    });

    // Callout underneath (positioned below table without overlap)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.80,
      w: 12.13,
      h: 2.00,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      isOct
        ? 'OBSERVACIONES PARETO Y CONTROL PRESUPUESTARIO:\n' +
          '• Concentración Top 3 (91,6%): Proyecto Pellas Línea 1 ($867.861 USD · 60,7%), Segunda Línea PMH ($270.730 USD · 18,9%) y Rueda DRAVO ($170.941 USD · 12,0%) concentran el 91,6% de la inversión de TIMACA en proyectos externos.\n' +
          '• Conciliación de Cuentas Activas: Las 10 cuentas principales suman $1.416.950 USD (99,2%) y los 8 frentes auxiliares complementarios suman $11.955 USD (0,8%), totalizando los $1.428.905 USD ejecutados en los 18 proyectos externos activos (TTE-C).\n' +
          '• Proyecto Tractor Pellas Línea 1 (TTE-C-0706): Servicios especializados de ingeniería, instrumentación y control con Yokogawa ($686K) y Henan Front ($40K) lideran el avance físico y alistamiento preoperativo para el comisionamiento de planta.'
        : 'OBSERVACIONES PARETO Y CONTROL PRESUPUESTARIO:\n' +
          '• Concentración Top 3 (72,5%): Proyecto Pellas Línea 1 ($663.316 USD · 41,1%), Segunda Línea PMH ($307.436 USD · 19,1%) y Rueda DRAVO ($199.356 USD · 12,4%) concentran el 72,5% de la ejecución mensual de TIMACA.\n' +
          '• Conciliación de Cuentas Activas: Las 10 cuentas principales suman $1.585.913 USD (98,3%) y los 15 frentes auxiliares complementarios suman $27.312 USD (1,7%), totalizando $1.613.225 USD de costo total ejecutado a través de las 25 cuentas activas (incluyendo la absorción de CIF).\n' +
          '• Control Contractual TTE-C-0656 (Rehabilitación Bandas PMH): Acumula $1.211.440 USD sobre un presupuesto contractual de $1.500.000 USD (80,8% de ejecución). Se recomienda tramitar preventivamente ante Junta Directiva la solicitud de adenda antes de superar el 90% del techo presupuestario.',
      {
        x: 0.8,
        y: 4.88,
        w: 11.73,
        h: 1.84,
        fontSize: 9.5,
        color: '1E3A8A',
        lineSpacingMultiple: 1.18
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 5: VARIACIONES EN PROYECTOS Y TOP DESPACHOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      5,
      '5. Variaciones Mensuales en Proyectos Principales (Septiembre vs Agosto)',
      'Diferencial neto respecto al mes de agosto · Frentes en aceleración vs frentes en desaceleración'
    );

    // Left Column: Native Office Bar Chart
    const barData = [
      {
        name: 'Variación Neta (USD)',
        labels: ['DRAVO', '2da Línea', 'Briquetas', 'Pellas 1', 'Caldera', 'Bandas PMH', 'Tolva PMH'],
        values: [176190, 109474, 77755, 66958, 55632, -41115, -25725]
      }
    ];

    slide.addChart(pptx.ChartType.bar, barData, {
      x: 0.6,
      y: 1.35,
      w: 5.9,
      h: 5.35,
      chartColors: [C_NAVY],
      showLegend: false,
      dataLabelColor: '000000',
      dataLabelPosition: 'outEnd',
      dataLabelFormatCode: '$#,##0',
      valAxisLabelFormatCode: '$#,##0',
      valAxisMinVal: -60000,
      valAxisMaxVal: 200000,
      showValue: true
    });

    // Right Column: Detailed Cards List
    const variaciones = [
      { pry: 'Repotenciación Rueda DRAVO', delta: '+$176.190 USD', pct: '+760,6%', desc: 'Inyección en planchas antiabrasivas Hardox 450/500 y componentes mecánicos.', color: C_EMERALD },
      { pry: 'Segunda Línea PMH (Incremento Capacidad)', delta: '+$109.474 USD', pct: '+55,3%', desc: 'Aceleración en obras civiles, pedestales de transferencia y apoyos elastoméricos.', color: C_EMERALD },
      { pry: 'Fase 2 Planta Briquetas', delta: '+$77.755 USD', pct: '+87,4%', desc: 'Fabricación y premontaje de estructuras de ampliación para tren de briqueteado.', color: C_EMERALD },
      { pry: 'Proyecto Pellas Línea 1', delta: '+$66.958 USD', pct: '+11,2%', desc: 'Récord mensual en procura de materiales ($173.833 USD) y calderería.', color: C_EMERALD },
      { pry: 'Suministro Caldera Briquetas', delta: '+$55.632 USD', pct: '+391,8%', desc: 'Recepción de tuberías presurizadas y válvulas de alta presión.', color: C_EMERALD },
      { pry: 'Rehabilitación Bandas PMH', delta: '-$41.115 USD', pct: '-37,6%', desc: 'Desaceleración programada tras culminar empalmes mayores de bandas.', color: 'B45309' },
      { pry: 'Interconexión Tolva PMH', delta: '-$25.725 USD', pct: '-78,2%', desc: 'Cierre de fase de montaje metalmecánico previo a pruebas de tolva.', color: 'B45309' }
    ];

    variaciones.forEach((v, idx) => {
      const yPos = 1.35 + (idx * 0.76);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.8,
        y: yPos,
        w: 5.93,
        h: 0.68,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.6 },
        rectRadius: 0.08
      });

      slide.addText(v.pry, {
        x: 6.95,
        y: yPos + 0.12,
        w: 3.3,
        h: 0.25,
        fontSize: 11.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(`${v.delta} (${v.pct})`, {
        x: 10.3,
        y: yPos + 0.12,
        w: 2.3,
        h: 0.25,
        fontSize: 11.5,
        bold: true,
        color: v.color,
        align: 'right'
      });

      slide.addText(v.desc, {
        x: 6.95,
        y: yPos + 0.38,
        w: 5.6,
        h: 0.26,
        fontSize: 9.8,
        color: C_SLATE
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 6: PROYECTO PELLAS LÍNEA 1 (TTE-C-0706)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      6,
      '6. Proyecto Pellas Línea 1 (TTE-C-0706) · Septiembre 2026',
      'Frente prioritario de ejecución industrial TIMACA · Acumulado 2026: $2.383.954 USD'
    );

    // 4 KPI Cards
    const pellasCards = [
      { label: 'EJECUTADO EN SEPTIEMBRE', val: '$663.316 USD', note: '41,1% del gasto total de TIMACA' },
      { label: 'EJECUCIÓN DE COSTO CONTRACTUAL', val: '8,02%', note: '$2.383.954 USD sobre contrato marco ($29.720.000 USD)' },
      { label: 'MANO DE OBRA DIRECTA (MOD)', val: '$128.161 USD', note: '254 trabajadores adscritos (65,2% nómina de obra)' },
      { label: 'CIF ASIGNADO ACUMULADO', val: '$800.271 USD', note: 'Asignación Taller Central ($236.688 en Sep)' }
    ];

    pellasCards.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.25,
        w: 2.92,
        h: 0.95,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(c.label, {
        x: xPos + 0.12,
        y: 1.32,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.12,
        y: 1.50,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(c.note, {
        x: xPos + 0.12,
        y: 1.85,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Section Title
    slide.addText('MATRIZ DE EVOLUCIÓN MENSUAL PELLAS LÍNEA 1 (TTE-C-0706) · ENERO A SEPTIEMBRE 2026', {
      x: 0.6,
      y: 2.28,
      w: 12.13,
      h: 0.24,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY
    });

    const pellasMonthlyTable: any[][] = [
      [
        { text: 'Categoría / Rubro de Costo', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 9.8 } },
        { text: 'Ene', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Feb', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Mar', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Abr', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'May', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Jun', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Jul', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Ago', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } },
        { text: 'Sep', options: { bold: true, color: C_WHITE, fill: { color: 'B45309' }, align: 'right', fontSize: 9.8 } },
        { text: 'Total 2026', options: { bold: true, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', fontSize: 9.8 } },
        { text: '% Part.', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.8 } }
      ],
      [
        { text: 'Materiales Directos (Procura e Insumos)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$782', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$9.704', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$38.108', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$50.489', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$71.709', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$173.833', options: { fontSize: 9.0, align: 'right', bold: true, color: 'B45309', fill: { color: 'FEF3C7' } } },
        { text: '$344.625', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '14,5%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'Servicios Directos (Fletes, Custodia, Logística)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$48', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$5.105', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$60.101', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$56.907', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$63.106', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$69.056', options: { fontSize: 9.0, align: 'right', bold: true, color: 'B45309', fill: { color: 'FEF3C7' } } },
        { text: '$254.323', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '10,7%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'Mano de Obra Directa (MOD - Campo)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$121.093', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$109.550', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$126.977', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$167.193', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$128.161', options: { fontSize: 9.0, align: 'right', bold: true, color: 'B45309', fill: { color: 'FEF3C7' } } },
        { text: '$652.974', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '27,4%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'Horas Máquina (Equipos Propios TIMACA)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
        { text: '$1.837', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$1.416', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$684', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$4.753', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$53.269', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$61.309', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$63.126', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$89.789', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$55.578', options: { fontSize: 9.0, align: 'right', bold: true, color: 'B45309', fill: { color: 'FEF3C7' } } },
        { text: '$331.761', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '13,9%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'Costos Indirectos (CIF - Asignación Taller Central)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$116.390', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$135.147', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$107.485', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$204.561', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$236.688', options: { fontSize: 9.0, align: 'right', bold: true, color: 'B45309', fill: { color: 'FEF3C7' } } },
        { text: '$800.271', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '33,6%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'TOTAL MENSUAL PELLAS LÍNEA 1', options: { bold: true, fontSize: 9.8, color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$1.837', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$1.416', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$684', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$5.583', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$305.561', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$404.215', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$404.984', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$596.358', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } },
        { text: '$663.316', options: { bold: true, fontSize: 9.8, align: 'right', color: '92400E', fill: { color: 'FDE68A' } } },
        { text: '$2.383.954', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'BFDBFE' } } },
        { text: '100,0%', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'DBEAFE' } } }
      ]
    ];

    slide.addTable(pellasMonthlyTable, {
      x: 0.6,
      y: 2.56,
      w: 12.13,
      colW: [2.23, 0.75, 0.75, 0.75, 0.80, 0.95, 0.95, 0.95, 1.05, 1.05, 1.15, 0.75],
      border: { pt: 0.5, color: C_BORDER }
    });

    // Two Strategic Summary Callouts
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.15,
      w: 5.95,
      h: 1.70,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(
      'DINÁMICA DE CRECIMIENTO Y FRENTES OPERATIVOS:\n' +
      '• Fase Preliminar (Ene - Abr): Costo inicial de $9.520 USD en movilización y pruebas de izaje. La mano de obra directa de campo arrancó formalmente en mayo con el montaje estructural e instalación de calderería en sitio.\n' +
      '• Rampa de Montaje (May - Ago): Despegue con 145 a 238 operarios en campo; el gasto mensual creció de $305K en mayo a $596K en agosto con fuerte carga de nómina directa ($167K en agosto).\n' +
      '• Pico Operativo en Septiembre ($663.316 USD): Máximo mensual con 254 trabajadores adscritos y salto en procura de materiales ($173.833 USD) para tolvas, ductos y calderería.',
      {
        x: 0.75,
        y: 5.23,
        w: 5.65,
        h: 1.54,
        fontSize: 8.8,
        color: '1E3A8A',
        lineSpacingMultiple: 1.12
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 5.15,
      w: 5.95,
      h: 1.70,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(
      'AVANCE CONTRACTUAL Y ABSORCIÓN CORPORATIVA:\n' +
      '• Avance Contractual: Con $2.383.954 USD acumulados a septiembre, el proyecto alcanza el 8,02% de ejecución de costo del contrato marco de $29,72M USD (saldo remanente: $27.336.046 USD).\n' +
      '• Asignación Corporativa CIF: Pellas absorbe $236.688 USD en septiembre y $800.271 USD acumulados (33,6% del costo total del frente), soportando ingeniería y talleres centrales bajo la Matriz Corporativa de Distribución CIF.\n' +
      '• Maquinaria Activa en Obra: En septiembre la flota asignada a Pellas totalizó $55.578 USD (811,7 h), desglosada en 5 grúas principales ($46.178 USD: Demag AC200, Grove 75T/60T, Link Belt y Titán 20T) y 11 equipos auxiliares de soporte ($9.400 USD). Los restantes frentes operaron con grúas de patio facilitadas por el cliente (VISCO ORINOCO).',
      {
        x: 6.93,
        y: 5.23,
        w: 5.65,
        h: 1.54,
        fontSize: 8.8,
        color: '14532D',
        lineSpacingMultiple: 1.12
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 7: HORAS MÁQUINA Y SERVICIOS DIRECTOS PELLAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      7,
      '7. Pellas Línea 1 · Servicios Directos y Horas Máquina',
      'Flota de 16 equipos productivos (811,7 h · $55.578 USD) y logística especializada ($69.056 USD) · Exclusión de 12 equipos en stand-by'
    );

    // Left Table: Horas Máquina Top Equipos
    const hmRows: any[][] = [
      [
        { text: 'Equipo / Maquinaria', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10 } },
        { text: 'Horas', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } },
        { text: 'Tarifa/h', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } },
        { text: 'Total (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } }
      ],
      [
        { text: 'Grúa Demag AC200 (200 Ton)', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '130,6', options: { fontSize: 10, align: 'right' } },
        { text: '$190,21', options: { fontSize: 10, align: 'right' } },
        { text: '$24.841', options: { bold: true, fontSize: 10, align: 'right', color: C_NAVY } }
      ],
      [
        { text: 'Grúa Grove RT875 (75 Ton)', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '75,5', options: { fontSize: 10, align: 'right' } },
        { text: '$95,10', options: { fontSize: 10, align: 'right' } },
        { text: '$7.180', options: { bold: true, fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Grúa Grove RT760 (60 Ton)', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '74,5', options: { fontSize: 10, align: 'right' } },
        { text: '$95,10', options: { fontSize: 10, align: 'right' } },
        { text: '$7.085', options: { bold: true, fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Grúa Link Belt (50 Ton)', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '69,5', options: { fontSize: 10, align: 'right' } },
        { text: '$57,09', options: { fontSize: 10, align: 'right' } },
        { text: '$3.968', options: { bold: true, fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Grúa Titán 20 Ton', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '65,3', options: { fontSize: 10, align: 'right' } },
        { text: '$47,53', options: { fontSize: 10, align: 'right' } },
        { text: '$3.104', options: { bold: true, fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Otros 11 Equipos Menores (Camiones, Montacargas, Compresores)', options: { fontSize: 10, color: '64748B' } },
        { text: '396,3', options: { fontSize: 10, align: 'right' } },
        { text: 'Varios', options: { fontSize: 10, align: 'right' } },
        { text: '$9.400', options: { bold: true, fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'TOTAL 16 EQUIPOS ACTIVOS', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_NAVY } } },
        { text: '811,7 h', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_NAVY }, align: 'right' } },
        { text: '-', options: { color: C_WHITE, fill: { color: C_NAVY }, align: 'right' } },
        { text: '$55.578 USD', options: { bold: true, fontSize: 11, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right' } }
      ]
    ];

    slide.addTable(hmRows, {
      x: 0.6,
      y: 1.35,
      w: 6.0,
      colW: [3.2, 0.8, 0.9, 1.1],
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Table: Servicios Directos Pellas
    const servRows: any[][] = [
      [
        { text: 'Subcategoría de Servicio', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10 } },
        { text: 'Sep (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } },
        { text: '% Mes', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } },
        { text: 'Acumulado 2026', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } }
      ],
      [
        { text: 'Traslado Diario de Personal (Autobuses)', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '$45.878', options: { bold: true, fontSize: 10, align: 'right', color: C_NAVY } },
        { text: '66,4%', options: { fontSize: 10, align: 'right' } },
        { text: '$168.840', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Vigilancia y Seguridad Integral', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '$13.182', options: { fontSize: 10, align: 'right' } },
        { text: '19,1%', options: { fontSize: 10, align: 'right' } },
        { text: '$48.550', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Alquiler de Equipos Especiales', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '$8.400', options: { fontSize: 10, align: 'right' } },
        { text: '12,2%', options: { fontSize: 10, align: 'right' } },
        { text: '$30.933', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Otros Servicios Operativos Menores', options: { fontSize: 10, color: '64748B' } },
        { text: '$1.596', options: { fontSize: 10, align: 'right' } },
        { text: '2,3%', options: { fontSize: 10, align: 'right' } },
        { text: '$6.000', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'TOTAL SERVICIOS DIRECTOS PELLAS', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_DARK } } },
        { text: '$69.056 USD', options: { bold: true, fontSize: 11, color: 'FCD34D', fill: { color: C_DARK }, align: 'right' } },
        { text: '100,0%', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_DARK }, align: 'right' } },
        { text: '$254.323 USD', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_DARK }, align: 'right' } }
      ]
    ];

    slide.addTable(servRows, {
      x: 6.8,
      y: 1.35,
      w: 5.93,
      colW: [2.83, 1.1, 0.8, 1.2],
      border: { pt: 0.5, color: C_BORDER }
    });

    // 3 Cards Metric Strip filling middle whitespace
    const hmCards = [
      { label: 'TARIFA PROMEDIO EFECTIVA', val: '$68,47 USD/h', note: '811,7 Horas de Operación Total en el Mes' },
      { label: 'LOGÍSTICA DIARIA DE TRANSPORTE', val: '$45.878 USD', note: 'Traslado Continuo de Cuadrilla en 3 Turnos' },
      { label: 'FLOTA PESADA PROPIA DE IZAJE', val: '5 Grúas TIMACA', note: 'Concentradas al 100% en Calderería Pellas' }
    ];

    hmCards.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 4.11);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 3.90,
        w: 3.91,
        h: 0.92,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.08
      });

      slide.addText(c.label, {
        x: xPos + 0.15,
        y: 3.96,
        w: 3.61,
        h: 0.20,
        fontSize: 9.2,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.15,
        y: 4.18,
        w: 3.61,
        h: 0.32,
        fontSize: 14,
        bold: true,
        color: C_DARK
      });

      slide.addText(c.note, {
        x: xPos + 0.15,
        y: 4.52,
        w: 3.61,
        h: 0.22,
        fontSize: 8.8,
        color: C_BLUE
      });
    });

    // Notes Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.95,
      w: 12.13,
      h: 1.85,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      'NOTAS OPERATIVAS Y DE AUDITORÍA TÉCNICA (SEPTIEMBRE 2026):\n' +
      '1. Flota Productiva vs Equipos en Stand-By: Se depuraron 12 equipos sin asignación de horas en el mes, reflejando los 16 equipos activos (811,7 h · $55.578 USD). Las grúas Grove RT875 (75T) y Grove RT760 (60T) aplican la tarifa corporativa unificada de $95,10 USD/h estipulada para grúas hidráulicas de terreno difícil.\n' +
      '2. Concentración de Flota de Izaje Propia: La Grúa Demag AC200 ejecutó 130,6 h ($24.841 USD · 44,7% del renglón) en montaje pesado de calderería de Pellas Línea 1. Las 5 grúas de TIMACA (Demag 200T, Grove 75T/60T, Link Belt 50T y Titán 20T) se concentraron en Pellas por demanda crítica de calderería, mientras que los restantes frentes operaron con grúas de patio facilitadas por el cliente (VISCO ORINOCO).\n' +
      '3. Roster de Personal y Horas Hombre: Plantilla contratada de 254 trabajadores adscritos a Pellas Línea 1, con un promedio diario en campo de 195 a 205 operarios activos en turnos rotativos continuos (descontando descansos y permisos), totalizando 35.059 HH computadas en las 4 semanas del ciclo de nómina de septiembre (~178 h por operario en el ciclo de 4 semanas, equivalente a una jornada regular de ~44,5 h semanales).\n' +
      '4. Servicios Directos Pellas: Costo ejecutado de $69.056 USD en el mes y $254.323 USD acumulado, conciliado con la matriz de costos de la Lámina 6.',
      {
        x: 0.8,
        y: 5.03,
        w: 11.73,
        h: 1.70,
        fontSize: 9.3,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 8: FRENTE DE DESPACHO PMH · SEGUNDA LÍNEA (TTE-C-0671) & RED DE TRANSPORTE
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      8,
      '8. Planta PMH · Segunda Línea (TTE-C-0671) y Red de Transporte',
      'Análisis de costo mensual en Septiembre ($307.436 USD) · Suministro de acero ASTM A36, apoyos elastoméricos y concreto'
    );

    const pmhCards = [
      { label: 'COSTO EN SEPTIEMBRE (TTE-C-0671)', val: '$307.436 USD', note: '+55,3% vs Agosto ($197.962 USD · +$109.474 USD)' },
      { label: 'ACUMULADO ANUAL 2026', val: '$1.158.704 USD', note: '2do en el mes / 3er mayor acumulado anual' },
      { label: 'MATERIALES DIRECTOS SEP', val: '$249.494 USD', note: '81,2% del costo del proyecto en el mes' },
      { label: 'RED DE FRENTES PLANTA PMH', val: '$421.326 USD', note: '26,1% del total de la empresa en el mes' }
    ];

    pmhCards.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.25,
        w: 2.92,
        h: 1.15,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(c.label, {
        x: xPos + 0.12,
        y: 1.32,
        w: 2.68,
        h: 0.20,
        fontSize: 9.2,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.12,
        y: 1.54,
        w: 2.68,
        h: 0.35,
        fontSize: 15,
        bold: true,
        color: C_DARK
      });

      slide.addText(c.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.32,
        fontSize: 8.8,
        color: C_BLUE
      });
    });

    const tableMatPMH = [
      [
        { text: 'Insumo / Material Crítico Despachado', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9.0, margin: [1, 2, 1, 2] } },
        { text: 'Cantidad / UM', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9.0, align: 'center', margin: [1, 2, 1, 2] } },
        { text: 'Monto ($)', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9.0, align: 'right', margin: [1, 2, 1, 2] } },
        { text: 'Función en Obra', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9.0, margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Perfiles Estructurales y Planchas ASTM A36', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: '78.500 KG', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$129.160', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: 'Vigas maestras de soporte de cintas de mineral (51,8% Mat.)', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Apoyos Estructurales Elastómero Neopreno Shore A 60', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: '48 UND', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$67.000', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: 'Amortiguamiento sísmico y térmico de galerías', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Concreto Premezclado Estructural 250 kg/cm²', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: '180 M3', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$25.488', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: 'Pedestales y zapatas de torres de transferencia', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Tubería Conduit PVC Alto Impacto 5" Pesada', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: '1.240 MTR', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$27.846', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: 'Canalizaciones subterráneas de fuerza y control', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } }
      ]
    ];

    slide.addText('1. MATERIALES CRÍTICOS DESPACHADOS EN SEPTIEMBRE (TTE-C-0671)', {
      x: 0.6,
      y: 2.50,
      w: 6.0,
      h: 0.24,
      fontSize: 10,
      bold: true,
      color: C_NAVY
    });

    slide.addTable(tableMatPMH, {
      x: 0.6,
      y: 2.78,
      w: 5.95,
      colW: [2.35, 0.9, 0.9, 1.8],
      border: { pt: 0.5, color: C_BORDER }
    });

    const tableObrasPMH = [
      [
        { text: 'Frente de Trabajo / Proyecto PMH', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 9.0, margin: [1, 2, 1, 2] } },
        { text: 'Cuenta', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 9.0, align: 'center', margin: [1, 2, 1, 2] } },
        { text: 'Septiembre', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 9.0, align: 'right', margin: [1, 2, 1, 2] } },
        { text: 'Acumulado 2026', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 9.0, align: 'right', margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Segunda Línea PMH (Incremento Capacidad)', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: 'TTE-C-0671', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$307.436', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: '$1.158.704', options: { fontSize: 8.5, align: 'right', margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Rehabilitación Bandas Torre #3 a JD-8012', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: 'TTE-C-0656', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$68.164', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: '$1.211.440', options: { fontSize: 8.5, align: 'right', margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Proyecto Pila HA y HB (Suministro Apilador)', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: 'TTE-C-0678', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$38.572', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: '$320.656', options: { fontSize: 8.5, align: 'right', margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'Interconexión Tolva Multipropósito PMH', options: { fontSize: 8.5, margin: [1, 2, 1, 2] } },
        { text: 'TTE-C-0655', options: { fontSize: 8.5, align: 'center', margin: [1, 2, 1, 2] } },
        { text: '$7.154', options: { fontSize: 8.5, align: 'right', bold: true, margin: [1, 2, 1, 2] } },
        { text: '$295.777', options: { fontSize: 8.5, align: 'right', margin: [1, 2, 1, 2] } }
      ],
      [
        { text: 'TOTAL COMPLEJO PMH (4 FRENTES ACTIVOS)', options: { fontSize: 8.5, bold: true, fill: { color: 'E2E8F0' }, margin: [1, 2, 1, 2] } },
        { text: '4 CTAS', options: { fontSize: 8.5, align: 'center', bold: true, fill: { color: 'E2E8F0' }, margin: [1, 2, 1, 2] } },
        { text: '$421.326', options: { fontSize: 8.5, align: 'right', bold: true, fill: { color: 'E2E8F0' }, margin: [1, 2, 1, 2] } },
        { text: '$2.986.577', options: { fontSize: 8.5, align: 'right', bold: true, fill: { color: 'E2E8F0' }, margin: [1, 2, 1, 2] } }
      ]
    ];

    slide.addText('2. RED DE FRENTES DE MANEJO DE MINERAL EN PLANTA PMH (VISCO ORINOCO)', {
      x: 6.75,
      y: 2.50,
      w: 6.0,
      h: 0.24,
      fontSize: 10,
      bold: true,
      color: C_DARK
    });

    slide.addTable(tableObrasPMH, {
      x: 6.75,
      y: 2.78,
      w: 5.95,
      colW: [2.55, 0.9, 1.1, 1.4],
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.60,
      w: 12.13,
      h: 2.15,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      'DICTAMEN TÉCNICO Y CONTROL DE COSTOS EN PLANTA PMH:\n' +
      '• Estructura del Gasto en Segunda Línea (TTE-C-0671): El salto de $197.962 a $307.436 USD (+55,3% · +$109.474 USD) estuvo impulsado principalmente por el suministro de Acero Estructural ASTM A36 ($129.160 USD · 51,8% de materiales) para vigas maestras, complementado por apoyos elastoméricos de neopreno ($67.000 USD) y vaciado de concreto estructural ($25.488 USD) para pedestales de transferencia.\n' +
      '• Delimitación Operativa Planta PMH: Las 4 obras de manejo terrestre de mineral en planta cerrada (TTE-C-0671, 0656, 0678 y 0655) sumaron $421.326 USD en septiembre (26,1% del total TIMACA) y $2.986.577 USD acumulados en 2026. Los frentes de Muelle Fluvial y la Rueda DRAVO PA-9020 (TTE-C-0653 · $199.356 USD) poseen imputación e informes de auditoría independientes (Lámina 9).',
      {
        x: 0.8,
        y: 4.68,
        w: 11.73,
        h: 2.00,
        fontSize: 9.8,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 9: REPOTENCIACIÓN RUEDA DE CANGILONES DRAVO PA-9020 (TTE-C-0653)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      9,
      '9. Repotenciación Rueda de Cangilones DRAVO PA-9020 (TTE-C-0653)',
      'Auditoría del salto presupuestario (+760,6% en Septiembre) · Reacondicionamiento integral, blindajes de desgaste y aceros especiales'
    );

    const dravoCards = [
      { label: 'COSTO EN SEPTIEMBRE', val: '$199.356 USD', note: 'Salto neto de +$176.190 USD vs Agosto ($23.166 USD)' },
      { label: 'VARIACIÓN MENSUAL', val: '+760,6%', note: 'Mayor aceleración presupuestaria de la empresa' },
      { label: 'ACUMULADO ANUAL 2026', val: '$553.269 USD', note: '36,0% del total anual se ejecutó en Septiembre' },
      { label: 'MATERIALES DIRECTOS SEP', val: '$182.885 USD', note: '91,7% del costo imputado en el mes' }
    ];

    dravoCards.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.35,
        w: 2.92,
        h: 1.45,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(c.label, {
        x: xPos + 0.12,
        y: 1.48,
        w: 2.68,
        h: 0.22,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.12,
        y: 1.75,
        w: 2.68,
        h: 0.45,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(c.note, {
        x: xPos + 0.12,
        y: 2.25,
        w: 2.68,
        h: 0.35,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    const dravoChartData = [
      {
        name: 'Gasto Mensual Rueda DRAVO TTE-C-0653 (USD)',
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'],
        values: [767, 14687, 60627, 34885, 154916, 37829, 27036, 23166, 199356]
      }
    ];

    slide.addChart(pptx.ChartType.bar, dravoChartData, {
      x: 0.6,
      y: 2.95,
      w: 6.2,
      h: 2.35,
      chartColors: ['0284C7'],
      showLegend: false,
      showValue: true,
      dataLabelColor: '000000',
      dataLabelFontSize: 7.5
    });

    const tableDravo = [
      [
        { text: 'Componente / Partida Imputada', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5 } },
        { text: 'Monto ($)', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5, align: 'right' } },
        { text: 'Participación', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5, align: 'center' } }
      ],
      [
        { text: 'Planchas de Desgaste Antiabrasivas Hardox 450/500', options: { fontSize: 10 } },
        { text: '$112.450', options: { fontSize: 10, align: 'right', bold: true } },
        { text: '56,4%', options: { fontSize: 10, align: 'center' } }
      ],
      [
        { text: 'Pernos A325 / Grado 8 y Tuercas Pavonadas', options: { fontSize: 10 } },
        { text: '$34.120', options: { fontSize: 10, align: 'right', bold: true } },
        { text: '17,1%', options: { fontSize: 10, align: 'center' } }
      ],
      [
        { text: 'Rodamientos, Sellos y Transmisiones Mecánicas', options: { fontSize: 10 } },
        { text: '$36.315', options: { fontSize: 10, align: 'right', bold: true } },
        { text: '18,2%', options: { fontSize: 10, align: 'center' } }
      ],
      [
        { text: 'Costos Indirectos (CIF Asignados) - Soporte Taller Central', options: { fontSize: 9.5 } },
        { text: '$16.471', options: { fontSize: 10, align: 'right' } },
        { text: '8,3%', options: { fontSize: 10, align: 'center' } }
      ],
      [
        { text: 'TOTAL IMPUTADO SEPTIEMBRE (TTE-C-0653)', options: { fontSize: 10, bold: true, fill: { color: 'E2E8F0' } } },
        { text: '$199.356', options: { fontSize: 10, align: 'right', bold: true, fill: { color: 'E2E8F0' } } },
        { text: '100,0%', options: { fontSize: 10, align: 'center', bold: true, fill: { color: 'E2E8F0' } } }
      ]
    ];

    slide.addText('ESTRUCTURA DEL GASTO EN SEPTIEMBRE (TTE-C-0653)', {
      x: 7.0,
      y: 2.95,
      w: 5.7,
      h: 0.25,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addTable(tableDravo, {
      x: 7.0,
      y: 3.25,
      w: 5.73,
      h: 2.05,
      colW: [3.33, 1.2, 1.2],
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.4,
      w: 12.13,
      h: 1.45,
      fill: { color: 'FFFBEB' },
      line: { color: 'FCD34D', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      'AUDITORÍA Y JUSTIFICACIÓN TÉCNICA DEL SALTO OPERATIVO (+760,6%):\n' +
      '• Ventana Programada de Mantenimiento Mayor VISCO ORINOCO: Tras ingeniería y habilitación previa, en septiembre se ejecutó la ventana programada de mantenimiento mayor de la Rueda de Cangilones PA-9020. Para asegurar continuidad operativa en la transferencia de mineral, se ejecutó en taller el suministro, corte y mecanizado de precisión de planchas antiabrasivas Hardox 450/500 para los 10 cangilones y tolva receptora ($112.450 USD). El montaje electromecánico en planta fue realizado por cuadrillas del cliente (VISCO ORINOCO) con supervisión técnica de TIMACA (imputada a CIF).\n' +
      '• Análisis de Costo Anual ($553.269 USD): El pico previo en mayo ($154.916 USD) correspondió a la procura y nacionalización de transmisiones mecánicas, ejes de giro y coronas de importación. Todos los insumos de septiembre poseen trazabilidad física de almacén (ej. vale DP0038612) e inspección de control de calidad.',
      {
        x: 0.8,
        y: 5.5,
        w: 11.73,
        h: 1.25,
        fontSize: 9.7,
        color: '78350F',
        lineSpacingMultiple: 1.15
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 10: COSTOS INDIRECTOS Y PRORRATEO POR ÁREA (TABLA OFICIAL AUDITADA)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      10,
      '10. Costos Indirectos y Prorrateo por Área (Septiembre 2026)',
      'Estructura de $393.375 USD · Matriz Corporativa de Distribución CIF'
    );

    // Left: Native Donut Chart for Prorrateo
    const pellasCIF = 236688;
    const restoCIF = 156687;
    const cifDonutData = [
      {
        name: 'Prorrateo CIF',
        labels: ['Pellas Línea 1 (60,17%)', 'Resto de Proyectos (39,83%)'],
        values: [pellasCIF, restoCIF]
      }
    ];

    slide.addChart(pptx.ChartType.doughnut, cifDonutData, {
      x: 0.6,
      y: 1.35,
      w: 5.2,
      h: 3.2,
      chartColors: [C_NAVY, C_AMBER],
      dataLabelColor: 'FFFFFF',
      showPercent: false,
      showLegend: true,
      legendPos: 'b'
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.70,
      w: 5.2,
      h: 2.10,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText('MATRIZ CORPORATIVA DE DISTRIBUCIÓN CIF', {
      x: 0.8,
      y: 4.80,
      w: 4.8,
      h: 0.25,
      fontSize: 11,
      bold: true,
      color: C_DARK
    });

    slide.addText(
      'TIMACA asigna los costos indirectos ($393.375 USD) mediante la Matriz Corporativa de Distribución CIF de Capacidad Instalada y Taller Central:\n' +
      '• Pellas Línea 1 absorbe el 60,17% ($236.688 USD) por su alta demanda de talleres centrales, ingeniería residente y supervisión (concentra además el 65,2% de la nómina directa de obra).\n' +
      '• Resto de proyectos (24 cuentas activas) absorbe el 39,83% ($156.687 USD) ponderado según requerimientos de soporte técnico y taller.\n' +
      '• Estructura de Costos Indirectos: La nómina administrativa ($125.000 USD) y de talleres centrales ($122.000 USD) constituyen asignaciones mensuales presupuestadas de estructura ($247.000 USD · 62,8% del CIF); los restantes $146.375 USD (37,2%) corresponden a los rubros operativos variables (gestión sindical, combustible, consumibles, bonos y custodia).\n' +
      '• Conciliación Contable: Cierre de $393.375 USD registrado en los libros mayores corporativos.',
      {
        x: 0.8,
        y: 5.08,
        w: 4.8,
        h: 1.62,
        fontSize: 8.8,
        color: C_SLATE,
        lineSpacingMultiple: 1.12
      }
    );

    // Right: Subconceptos Breakdown Table (Whole dollars summing exactly to $393.375 USD)
    const subTable: any[][] = [
      [
        { text: 'Subconcepto de Soporte e Indirectos', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10 } },
        { text: 'Monto (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } },
        { text: '% Total', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10 } },
        { text: 'Alcance Operativo', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10 } }
      ],
      [
        { text: '1. Nómina TIMACA (Administrativa / Técnica)', options: { bold: true, fontSize: 9.5, color: C_DARK } },
        { text: '$125.000', options: { bold: true, fontSize: 9.5, align: 'right' } },
        { text: '31,8%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Cuota mensual presupuestada de nómina indirecta (ingeniería de proyectos, seguridad y costos).', options: { fontSize: 8.8, color: C_SLATE } }
      ],
      [
        { text: '2. Nómina Talleres Centrales TIMACA', options: { bold: true, fontSize: 9.5, color: C_DARK } },
        { text: '$122.000', options: { bold: true, fontSize: 9.5, align: 'right' } },
        { text: '31,0%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Cuota mensual presupuestada de maestranza, tornería y mantenimiento de talleres centrales.', options: { fontSize: 8.8, color: C_SLATE } }
      ],
      [
        { text: '3. Aporte y Gestión Sindical Colectivo', options: { bold: true, fontSize: 9.5, color: C_DARK } },
        { text: '$58.952', options: { bold: true, fontSize: 9.5, align: 'right' } },
        { text: '15,0%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Convención colectiva, bienestar laboral y dotaciones.', options: { fontSize: 9.0, color: C_SLATE } }
      ],
      [
        { text: '4. Combustible y Lubricantes de Soporte', options: { bold: true, fontSize: 9.5, color: C_DARK } },
        { text: '$50.413', options: { bold: true, fontSize: 9.5, align: 'right' } },
        { text: '12,8%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Abastecimiento de gasoil para vehículos de apoyo y logística.', options: { fontSize: 9.0, color: C_SLATE } }
      ],
      [
        { text: '5. Otros Costos Indirectos y Operativos', options: { fontSize: 9.5, color: C_DARK } },
        { text: '$25.235', options: { fontSize: 9.5, align: 'right' } },
        { text: '6,4%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Mantenimiento menor de campamentos, consumibles y logística.', options: { fontSize: 9.0, color: C_SLATE } }
      ],
      [
        { text: '6. Bonificaciones de Productividad y Campo', options: { fontSize: 9.5, color: C_DARK } },
        { text: '$6.700', options: { fontSize: 9.5, align: 'right' } },
        { text: '1,7%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Incentivos extraordinarios por cumplimiento de hitos críticos.', options: { fontSize: 9.0, color: C_SLATE } }
      ],
      [
        { text: '7. Seguridad y Vigilancia Perimetral', options: { fontSize: 9.5, color: C_DARK } },
        { text: '$5.075', options: { fontSize: 9.5, align: 'right' } },
        { text: '1,3%', options: { fontSize: 9.5, align: 'right' } },
        { text: 'Custodia perimetral 24/7 en instalaciones centrales y talleres.', options: { fontSize: 9.0, color: C_SLATE } }
      ],
      [
        { text: '8. Servicios Públicos (Electricidad / Agua)', options: { fontSize: 9.5, color: '64748B' } },
        { text: '$0', options: { fontSize: 9.5, align: 'right', color: '64748B' } },
        { text: '0,0%', options: { fontSize: 9.5, align: 'right', color: '64748B' } },
        { text: 'En obra: provistos por el cliente (VISCO ORINOCO). En taller central y sede: absorbidos en Gastos Generales (G&A) corporativos sin submedición ni recargo a proyectos.', options: { fontSize: 8.5, color: '64748B' } }
      ],
      [
        { text: 'TOTAL COSTOS INDIRECTOS (CIF)', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY } } },
        { text: '$393.375 USD', options: { bold: true, fontSize: 10.5, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right' } },
        { text: '100,0%', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY }, align: 'right' } },
        { text: 'Total de costos indirectos conciliado con libros mayores corporativos.', options: { color: C_WHITE, fill: { color: C_NAVY }, fontSize: 9.5 } }
      ]
    ];

    slide.addTable(subTable, {
      x: 6.0,
      y: 1.35,
      w: 6.73,
      colW: [2.6, 1.2, 0.8, 2.13],
      border: { pt: 0.5, color: C_BORDER }
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 11: CONCLUSIONES DE CONTROL & MATRIZ SEMÁFORO
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      11,
      '11. Conclusiones de Control de Gestión y Acciones Directivas (Septiembre 2026)',
      'Evaluación estratégica y recomendaciones directivas presentadas a Dirección General y Presidencia · TIMACA'
    );

    const quadrants = [
      {
        num: '1',
        title: 'Fortalezas Operativas & Cumplimiento',
        color: C_EMERALD,
        badge: 'CUMPLIMIENTO OPERATIVO',
        items: [
          'Mano de Obra Directa al día: $196.665 USD devengados en 10 proyectos sin pasivos atrasados ni contingencias, liderada por Pellas Línea 1 ($128.161 USD · 65,2%) y Segunda Línea PMH ($30.305 USD · 15,4%).',
          'Proyecto Pellas Línea 1 con avance sostenido: Consumo presupuestario acumulado de $2.383.954 USD (8,02% sobre contrato marco de $29,72M USD), con 254 trabajadores adscritos y 811,7 horas máquina efectivas.',
          'Aceleración Operativa Oficial: Cierre de septiembre en $1.613.225 USD (+34,7% vs agosto $1.197.600 USD), impulsado por el incremento en materiales directos ($868.067 USD).'
        ]
      },
      {
        num: '2',
        title: 'Alertas de Costo & Atención Prioritaria',
        color: C_AMBER,
        badge: 'ATENCIÓN PRIORITARIA',
        items: [
          'Repunte Rueda DRAVO (+760,6%): Cierre en $199.356 USD (vs $23.166 USD en agosto) por mantenimiento mayor y blindajes Hardox 450/500 con saldo neto de +$176.190 USD.',
          'Segunda Línea PMH (+55,3%): Cierre en $307.436 USD (vs $197.962 USD en agosto · +$109.474 USD), segundo frente de mayor costo de TIMACA en el mes (19,1%).',
          'Techo Presupuestario Bandas PMH (TTE-C-0656): Acumula $1.211.440 USD sobre presupuesto contractual de $1.500.000 USD (80,8% de ejecución), restando un margen operativo de $288.560 USD.'
        ]
      },
      {
        num: '3',
        title: 'Productividad y Gestión de Obras',
        color: C_BLUE,
        badge: 'PRODUCTIVIDAD OPERATIVA',
        items: [
          'Acelerar Valuaciones de Obra: Tramitar y conciliar oportunamente las valuaciones de avance físico con la inspección del cliente (VISCO ORINOCO), garantizando el flujo de caja operativo y la amortización regular de los recursos aplicados en obra.',
          'Mantenimiento y Disponibilidad de Grúas: Garantizar el plan de mantenimiento preventivo y abastecimiento de combustible de las 5 grúas propias activas en Pellas Línea 1 (Demag AC200, Grove RT875, Grove RT760, Link Belt y Titán), asegurando cero paradas no programadas en el montaje de ductos, tolvas y calderería pesada.',
          'Control de Jornada Laboral en Obras: Monitorear el cumplimiento de turnos y control de asistencia en los 10 frentes con cuadrilla activa (55.277 HH totales @ $3,56 USD/HH), asegurando que las horas devengadas respalden el avance físico de obra según cronograma.'
        ]
      },
      {
        num: '4',
        title: 'Decisiones Directoriales Inmediatas',
        color: C_NAVY,
        badge: 'DECISIÓN DIRECTIVA',
        items: [
          'Aprobación Técnica Previa: Formalizar la validación técnica y operativa de materiales directos ($868.067 USD) y servicios ($99.540 USD) por cada gerente de proyecto previo a cualquier compromiso o desembolso.',
          'Mesa de Control Frentes Prioritarios: Convocar reuniones quincenales de seguimiento directivo para los 3 proyectos principales (Pellas Línea 1, Segunda Línea PMH y Rueda DRAVO), que concentran el 72,5% del gasto mensual ($1.170.108 USD).',
          'Control de Costos Indirectos (CIF): Supervisar la absorción de los $393.375 USD bajo la Matriz Corporativa de Distribución CIF (60,17% Pellas = $236.688 USD / 39,83% Resto = $156.687 USD) y auditar mensualmente los libros mayores.'
        ]
      }
    ];

    quadrants.forEach((q, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = 0.6 + (col * 6.2);
      const yPos = 1.35 + (row * 2.7);

      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: yPos,
        w: 5.93,
        h: 2.58,
        fill: { color: C_WHITE },
        line: { color: q.color, width: 1.2 },
        rectRadius: 0.1
      });

      slide.addText(`${q.num}. ${q.title.toUpperCase()}`, {
        x: xPos + 0.15,
        y: yPos + 0.1,
        w: 3.5,
        h: 0.25,
        fontSize: 10.8,
        bold: true,
        color: C_DARK
      });

      slide.addShape(pptx.ShapeType.ellipse, {
        x: xPos + 3.75,
        y: yPos + 0.14,
        w: 0.11,
        h: 0.11,
        fill: { color: q.color },
        line: { color: q.color }
      });

      slide.addText(q.badge, {
        x: xPos + 3.90,
        y: yPos + 0.08,
        w: 1.88,
        h: 0.22,
        fontSize: 8.2,
        bold: true,
        color: q.color,
        align: 'right'
      });

      slide.addShape(pptx.ShapeType.line, {
        x: xPos + 0.15,
        y: yPos + 0.35,
        w: 5.63,
        h: 0,
        line: { color: C_BORDER, width: 0.5 }
      });

      const bullets = q.items.map(it => `• ${it}`).join('\n\n');
      slide.addText(bullets, {
        x: xPos + 0.15,
        y: yPos + 0.42,
        w: 5.63,
        h: 2.05,
        fontSize: 9.6,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      });
    });

    addSlideFooter(slide);
  }

    // Browser download with OpenXML localization
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
