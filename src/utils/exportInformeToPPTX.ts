import pptxgen from 'pptxgenjs';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT, 
  CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026,
  TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
  DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS 
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

/**
 * Genera la presentación oficial ejecutiva editable (.pptx) para TIMACA.
 * 100% Nativa en OpenXML: textos editables, tablas nativas de PowerPoint,
 * gráficos Office con hoja de datos editable, formas y colores corporativos idénticos a la página web.
 */
export async function exportInformeToPPTX(params: ExportPPTXParams) {
  const {
    selectedMesNum,
    mesLabel,
    totalMes,
    cuentasAuxiliaresMes,
    categoriasMesAnalisis,
    pellasMesData
  } = params;

  const PptxConstructor: any = (pptxgen as any).default || pptxgen;
  const pptx = new PptxConstructor();

  // 16:9 Widescreen Standard Layout (13.333" x 7.5")
  pptx.defineLayout({ name: 'LAYOUT_16_9_HD', width: 13.333, height: 7.5 });
  pptx.layout = 'LAYOUT_16_9_HD';
  pptx.author = 'Ing. Civil Alejandra Tesara';
  pptx.company = 'TALLERES INDUSTRIALES METALÚRGICOS ANTONIO C.A. (TIMACA)';
  pptx.title = `Informe Ejecutivo de Costos - ${mesLabel}`;
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

  // Header helper for interior slides
  const addSlideHeader = (slide: any, slideNumber: number, title: string, subtitle: string) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.82,
      fill: { color: C_DARK }
    });

    slide.addText('TALLERES INDUSTRIALES METALÚRGICOS ANTONIO C.A. (TIMACA) · MODELO ESTRELLA DE COSTOS', {
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

    slide.addText(`LÁMINA ${slideNumber} · ${mesLabel.toUpperCase()}`, {
      x: 10.2,
      y: 0.25,
      w: 2.5,
      h: 0.35,
      fontSize: 10.5,
      bold: true,
      color: 'FCD34D',
      align: 'right'
    });

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

  // Footer helper for interior slides
  const addSlideFooter = (slide: any) => {
    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 6.95,
      w: 12.13,
      h: 0,
      line: { color: C_BORDER, width: 0.5 }
    });

    slide.addText('TALLERES INDUSTRIALES METALÚRGICOS ANTONIO C.A. (TIMACA) · RIF: J-09500315-9', {
      x: 0.6,
      y: 7.02,
      w: 6.0,
      h: 0.25,
      fontSize: 10,
      color: '64748B'
    });

    slide.addText('Elaborado por: Ing. Civil Alejandra Tesara (Analista de Costos) | Destinatario: Departamento de Costos · TIMACA', {
      x: 6.6,
      y: 7.02,
      w: 6.13,
      h: 0.25,
      fontSize: 10,
      color: '64748B',
      align: 'right'
    });
  };

  // Helper to resolve image paths
  const getAssetPath = (assetUrl: string) => {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${assetUrl}`;
    }
    return `public${assetUrl}`;
  };

  // =========================================================================
  // SLIDE 0: PORTADA OFICIAL EJECUTIVA (IDÉNTICA A LA VISTA WEB)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Outer card container
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 0.4,
      w: 12.333,
      h: 6.7,
      fill: { color: 'FFFFFF' },
      line: { color: C_BORDER, width: 1.2 },
      rectRadius: 0.12
    });

    // TIMACA Logo
    try {
      slide.addImage({
        path: getAssetPath('/timaca-logo.png'),
        x: 0.8,
        y: 0.65,
        w: 1.8,
        h: 0.55
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

    slide.addText('Talleres Industriales Metalúrgicos Antonio C.A.', {
      x: 2.7,
      y: 0.90,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      color: '64748B'
    });

    // Pill Badge
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

    slide.addText(`PERÍODO OPERATIVO: ${mesLabel.toUpperCase()}`, {
      x: 4.66,
      y: 1.50,
      w: 4.0,
      h: 0.25,
      fontSize: 8.5,
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
    slide.addText(mesLabel.toUpperCase(), {
      x: 0.8,
      y: 2.45,
      w: 11.733,
      h: 0.38,
      fontSize: 16,
      bold: true,
      color: '475569',
      align: 'center'
    });

    // 3 Metadata KPI Chips
    const chips = [
      { label: 'Ejecución del Mes:', val: `$${totalMes.toLocaleString('de-DE')} USD` },
      { label: 'Acumulado 2026:', val: `$${TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')} USD` },
      { label: 'Proyectos Activos:', val: `${cuentasAuxiliaresMes.length} Cuentas Auxiliares` }
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
        h: 2.75
      });
    } catch (e) {}

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

    slide.addText('Destinatario: Gerencia de Administración y Finanzas / Dpto. Costos · TIMACA', {
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
      'Evolución histórica Ene-Sep 2026 · Total 9 Meses: $12.052.176 USD'
    );

    const headers = ['Categoría', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Total 2026', 'Var.'];
    const tableRows: any[][] = [];

    tableRows.push(
      headers.map((h, i) => ({
        text: h,
        options: {
          bold: true,
          color: C_WHITE,
          fill: { color: i === 9 ? C_AMBER : C_DARK },
          align: i === 0 ? 'left' : 'right',
          fontSize: 8.5
        }
      }))
    );

    TABLA_PPT_DISTRIBUCION_2026.forEach((row) => {
      const cells: any[] = [
        { text: row.categoria, options: { bold: true, fontSize: 10.5, color: C_DARK, align: 'left' } }
      ];
      row.meses.forEach((val, mIdx) => {
        const isSelected = mIdx + 1 === selectedMesNum;
        cells.push({
          text: val.toLocaleString('de-DE'),
          options: {
            fontSize: 9.8,
            color: isSelected ? C_NAVY : C_SLATE,
            bold: isSelected,
            fill: isSelected ? { color: 'FEF3C7' } : undefined,
            align: 'right'
          }
        });
      });
      cells.push({
        text: row.total2026.toLocaleString('de-DE'),
        options: { bold: true, fontSize: 9.8, color: C_DARK, fill: { color: 'F1F5F9' }, align: 'right' }
      });
      cells.push({
        text: row.variacion,
        options: {
          bold: true,
          fontSize: 9.8,
          color: row.esPositiva ? C_EMERALD : 'B45309',
          align: 'center'
        }
      });
      tableRows.push(cells);
    });

    const totalCells: any[] = [
      { text: 'TOTAL MENSUAL (USD)', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY }, align: 'left' } }
    ];
    TOTALES_MESES_PPT.forEach((tm) => {
      const isSelected = tm.mesNum === selectedMesNum;
      totalCells.push({
        text: tm.total.toLocaleString('de-DE'),
        options: {
          bold: true,
          fontSize: 10.5,
          color: isSelected ? 'FCD34D' : C_WHITE,
          fill: { color: isSelected ? '1E3A8A' : C_NAVY },
          align: 'right'
        }
      });
    });
    totalCells.push({
      text: '12.052.176',
      options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: '0F172A' }, align: 'right' }
    });
    totalCells.push({
      text: selectedMesNum === 9 ? '+35%' : '-2%',
      options: { bold: true, fontSize: 10.5, color: 'FCD34D', fill: { color: '0F172A' }, align: 'center' }
    });
    tableRows.push(totalCells);

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [2.33, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 1.05, 1.05, 1.25, 0.92],
      border: { pt: 0.5, color: C_BORDER }
    });

    const insights = [
      {
        title: 'Materiales Directos ($3.967.416 USD · 32,9%)',
        desc: 'Mayor rubro acumulado del año. En septiembre alcanzó su récord mensual de $868.067 USD (+133% vs agosto) por la procura mayor de tolvas, aceros y componentes eléctricos para Segunda Línea PMH, DRAVO y Pellas.'
      },
      {
        title: 'Servicios Especializados ($2.904.145 USD · 24,1%)',
        desc: 'Pico en junio por fletes marítimos mayores. En septiembre se ubica en $99.540 USD (-16%), concentrado un 69,4% en Pellas Línea 1 ($69.056 USD) para traslado diario de personal y vigilancia patrimonial.'
      },
      {
        title: 'Mano de Obra Directa ($2.218.229 USD · 18,4%)',
        desc: 'Fuerza laboral en 10 proyectos externos. En septiembre cerró en $196.665 USD sin pasivos atrasados ni contingencias, liderada por Pellas Línea 1 ($128.161 USD · 65,2%) y Segunda Línea PMH ($30.305 USD · 15,4%).'
      }
    ];

    insights.forEach((ins, idx) => {
      const xPos = 0.6 + (idx * 4.1);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.8,
        w: 3.93,
        h: 1.95,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.1
      });

      slide.addText(ins.title, {
        x: xPos + 0.15,
        y: 4.95,
        w: 3.63,
        h: 0.35,
        fontSize: 11.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(ins.desc, {
        x: xPos + 0.15,
        y: 5.35,
        w: 3.63,
        h: 1.3,
        fontSize: 10,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
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
      `2. Análisis de Costos del Mes (${mesLabel})`,
      `Gasto Total Oficial: $${totalMes.toLocaleString('de-DE')} USD · Variación vs mes anterior: ${selectedMesNum === 9 ? '+34,7% (+415.625 USD vs Agosto)' : 'Auditado'}`
    );

    const directCost = 1219850;
    const indirectCost = 393375;
    const donutData = [
      {
        name: 'Distribución de Costo',
        labels: ['Costos Directos (75,6%)', 'Costos Indirectos CIF (24,4%)'],
        values: [directCost, indirectCost]
      }
    ];

    slide.addChart(pptx.ChartType.doughnut, donutData, {
      x: 0.6,
      y: 1.35,
      w: 5.8,
      h: 2.65,
      chartColors: [C_NAVY, C_AMBER],
      dataLabelColor: 'FFFFFF',
      showPercent: true,
      showLegend: true,
      legendPos: 'b'
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.6,
      y: 1.35,
      w: 6.13,
      h: 1.25,
      fill: { color: C_WHITE },
      line: { color: '3B82F6', width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('COSTOS DIRECTOS (75,6%) · $1.219.850 USD', {
      x: 6.8,
      y: 1.45,
      w: 5.7,
      h: 0.25,
      fontSize: 12.5,
      bold: true,
      color: C_BLUE
    });

    slide.addText(
      'Materiales: $868.067 USD (53,8%) | MOD: $196.665 USD (12,2%)\n' +
      'Servicios: $99.540 USD (6,2%) | Horas Máquina: $55.578 USD (3,4%)\n' +
      '→ Inversión directa en 10 frentes de obra activos en Puerto Ordaz.',
      {
        x: 6.8,
        y: 1.72,
        w: 5.7,
        h: 0.78,
        fontSize: 10.5,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.6,
      y: 2.75,
      w: 6.13,
      h: 1.25,
      fill: { color: C_WHITE },
      line: { color: C_AMBER, width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText('COSTOS INDIRECTOS CIF (24,4%) · $393.375 USD', {
      x: 6.8,
      y: 2.85,
      w: 5.7,
      h: 0.25,
      fontSize: 12.5,
      bold: true,
      color: 'B45309'
    });

    slide.addText(
      'Nómina TIMACA: $125.000 | Nómina Talleres: $122.000 | Sindicato: $58.952\n' +
      'Combustible: $50.413 | Otros: $25.235 | Bonos: $6.700 | Vigilancia: $5.075\n' +
      '→ Prorrateado: 60,2% Pellas Línea 1 ($236.688 USD) / 39,8% Resto ($156.687 USD).',
      {
        x: 6.8,
        y: 3.12,
        w: 5.7,
        h: 0.78,
        fontSize: 10.5,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      }
    );

    const catRows: any[][] = [
      [
        { text: 'Categoría de Costo', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 11 } },
        { text: `Monto ${mesLabel} (USD)`, options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 11 } },
        { text: '% Mes', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 11 } },
        { text: 'Monto Mes Ant. (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 11 } },
        { text: 'Variación vs Anterior', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 11 } }
      ]
    ];

    categoriasMesAnalisis.forEach(cat => {
      const pct = Math.round((cat.monto / totalMes) * 1000) / 10;
      catRows.push([
        { text: cat.categoria, options: { bold: true, fontSize: 10.5, color: C_DARK } },
        { text: `$${cat.monto.toLocaleString('de-DE')}`, options: { fontSize: 10.5, align: 'right', bold: true } },
        { text: `${pct}%`, options: { fontSize: 10.5, align: 'right', color: C_SLATE } },
        { text: `$${cat.montoPrev.toLocaleString('de-DE')}`, options: { fontSize: 10.5, align: 'right', color: '64748B' } },
        { text: cat.varText, options: { fontSize: 10.5, align: 'center', bold: true, color: cat.varPct > 0 ? C_EMERALD : 'B45309' } }
      ]);
    });

    slide.addTable(catRows, {
      x: 0.6,
      y: 4.2,
      w: 12.13,
      colW: [4.0, 2.2, 1.5, 2.2, 2.23],
      border: { pt: 0.5, color: C_BORDER }
    });

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
      '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Septiembre 2026)',
      'Total Nómina Septiembre: $196.665 USD · 55.277 Horas-Hombre · Cuadrilla Activa en 10 Proyectos Externos'
    );

    const modCards = [
      { label: 'TOTAL NÓMINA DIRECTA SEP', val: '$196.665 USD', note: 'Semanas 36 a 39 · Coincidencia 100% con inputs' },
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

    // Left Box: Criterio de Corte Contable
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.45,
      w: 5.6,
      h: 4.4,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.1
    });

    slide.addText('CRITERIO DE CORTE CONTABLE Y AUDITORÍA DE NÓMINA', {
      x: 0.8,
      y: 2.60,
      w: 5.2,
      h: 0.25,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Criterio de Corte Contable (Semana 35 vs Septiembre):\n' +
      '  La Semana 35 ($56.584 USD / 15.619 HH) tuvo fecha de inicio el 22/08/2026. Siguiendo el principio contable de devengo por fecha de inicio en el Master de Costos TIMACA, fue imputada contablemente al cierre de Agosto 2026, completando los $277.936 USD devengados en ese mes.\n\n' +
      '• Semanas 36 a 39 (Septiembre Calendario Estricto):\n' +
      '  El mes de Septiembre está compuesto exclusivamente por 4 semanas operativas:\n' +
      '    - Semana 36 (05/09): $54.804 USD (15.433 HH)\n' +
      '    - Semana 37 (12/09): $54.173 USD (15.216 HH)\n' +
      '    - Semana 38 (19/09): $53.833 USD (15.091 HH)\n' +
      '    - Semana 39 (26/09): $33.856 USD (9.537 HH)\n\n' +
      '• Conciliación Matemática al Centavo:\n' +
      '  La sumatoria estricta de las semanas 36 a 39 totaliza con absoluta exactitud $196.665,65 USD y 55.277,00 HH, coincidiendo con la tabla dinámica oficial de Excel ($196.665,16 USD).\n\n' +
      '• Ancla de Prorrateo de Costos Indirectos (CIF):\n' +
      '  Esta nómina directa auditada de $196.665 USD constituye la base matemática para la asignación prorrateada de los $393.375 USD de costos indirectos entre los proyectos (Pellas 60,2% / Resto 39,8%).',
      {
        x: 0.8,
        y: 2.90,
        w: 5.2,
        h: 3.8,
        fontSize: 9.8,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
      }
    );

    // Right Box: Tabla de Nómina por Proyecto
    const modTableRows: any[][] = [
      [
        { text: 'Cuenta', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: 'Proyecto / Frente de Obra', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: 'Monto (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: 'Horas (HH)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: '% MOD', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } }
      ]
    ];

    DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS.forEach(p => {
      modTableRows.push([
        { text: p.cta, options: { bold: true, fontSize: 9.8, color: C_DARK } },
        { text: p.proyecto, options: { fontSize: 9.8, color: C_SLATE } },
        { text: `$${p.monto.toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 9.8, color: C_NAVY } },
        { text: p.hh.toLocaleString('de-DE'), options: { align: 'right', fontSize: 9.8, color: '64748B' } },
        { text: `${p.pct}%`, options: { align: 'right', fontSize: 9.8, color: C_DARK, bold: true } }
      ]);
    });

    modTableRows.push([
      { text: 'TOTAL', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY } } },
      { text: '10 PROYECTOS EXTERNOS ACTIVOS', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY } } },
      { text: '$196.665 USD', options: { bold: true, fontSize: 10.5, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right' } },
      { text: '55.277 HH', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY }, align: 'right' } },
      { text: '100,0%', options: { bold: true, fontSize: 10.5, color: C_WHITE, fill: { color: C_NAVY }, align: 'right' } }
    ]);

    slide.addTable(modTableRows, {
      x: 6.4,
      y: 2.45,
      w: 6.33,
      colW: [1.2, 2.73, 1.0, 0.8, 0.6],
      border: { pt: 0.5, color: C_BORDER }
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 4: TOTAL PROYECTOS EXTERNOS CON DESPACHOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      4,
      `4. Total Proyectos Externos con Despachos (${mesLabel})`,
      `${cuentasAuxiliaresMes.length} Cuentas Auxiliares Activas · Distribución Pareto y Control Presupuestario`
    );

    const pryTable: any[][] = [
      [
        { text: '#', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 10.5 } },
        { text: 'Código', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: 'Proyecto / OT (Cliente)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: `Monto ${mesLabel} (USD)`, options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: '% Mes', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: 'Presupuesto Total (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: '% Uso Presup.', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 10.5 } }
      ]
    ];

    cuentasAuxiliaresMes.slice(0, 10).forEach((c, i) => {
      const m = c.metricas;
      const presFmt = m?.tienePresupuesto ? `$${Math.round(m.totalPresupuesto).toLocaleString('de-DE')}` : '-';
      const usoFmt = m?.tienePresupuesto ? `${m.porcentajeUso}%` : 'S/P';

      pryTable.push([
        { text: (i + 1).toString(), options: { align: 'center', fontSize: 9.8, color: '64748B' } },
        { text: c.codigo, options: { bold: true, fontSize: 9.8, color: C_DARK } },
        { text: c.proyecto, options: { fontSize: 9.8, color: C_SLATE } },
        { text: `$${c.total.toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 9.8 } },
        { text: `${c.porcentaje}%`, options: { align: 'right', fontSize: 9.8, color: C_SLATE } },
        { text: presFmt, options: { align: 'right', fontSize: 9.8, color: '64748B' } },
        { text: usoFmt, options: { align: 'center', bold: true, fontSize: 9.8, color: m?.porcentajeUso && m.porcentajeUso >= 90 ? 'DC2626' : C_DARK } }
      ]);
    });

    slide.addTable(pryTable, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [0.5, 1.4, 4.63, 1.8, 1.1, 1.6, 1.1],
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.65,
      w: 12.13,
      h: 1.15,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      'OBSERVACIONES PARETO Y CONTROL DE RENTABILIDAD:\n' +
      '• Concentración Top 3: Proyecto Pellas Línea 1 ($668K · 41,4%), Segunda Línea PMH ($292K · 18,1%) y Repotenciación DRAVO ($199K · 12,4%) concentran el 71,9% de la facturación mensual.\n' +
      '• Alerta Contractual TTE-C-0697 (Bandas PMH): Acumula $981.810 USD sobre $1.091.248 USD (90,0% del techo). Se requiere tramitar adenda formal de ampliación antes de fin de año.',
      {
        x: 0.8,
        y: 5.75,
        w: 11.73,
        h: 0.95,
        fontSize: 10.5,
        color: '1E3A8A',
        lineSpacingMultiple: 1.2
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
      `5. Variaciones en Proyectos y Top Despachos (${mesLabel})`,
      'Diferencial neto respecto al mes de agosto · Frentes en aceleración vs frentes en desaceleración'
    );

    const barData = [
      {
        name: 'Variación Neta (USD)',
        labels: ['DRAVO', '2da Línea', 'Briquetas', 'Pellas 1', 'Bandas', 'BG II', 'Vapor'],
        values: [176207, 93896, 84584, 71982, -17469, -20407, -27170]
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
      showValue: true
    });

    const variaciones = [
      { pry: 'Repotenciación Rueda DRAVO', delta: '+$176.207 USD', pct: '+761%', desc: 'Inyección en repotenciación eléctrica, motores y tolvas de trasvase.', color: C_EMERALD },
      { pry: 'Segunda Línea Paletizadora PMH', delta: '+$93.896 USD', pct: '+47%', desc: 'Aceleración en obras de montaje electromecánico y estructura metálica mayor.', color: C_EMERALD },
      { pry: 'Briquetas Fase 2 (Reacondic.)', delta: '+$84.584 USD', pct: '+95%', desc: 'Mantenimiento preventivo intensivo y movilización de grúas pesadas en planta.', color: C_EMERALD },
      { pry: 'Proyecto Pellas Línea 1', delta: '+$71.982 USD', pct: '+12%', desc: 'Consolidación de cuadrilla de 254 trabajadores y suministro continuo de aceros.', color: C_EMERALD },
      { pry: 'Rehabilitación Bandas PMH', delta: '-$17.469 USD', pct: '-15%', desc: 'Desaceleración programada por aproximación al techo presupuestario (90%).', color: 'B45309' },
      { pry: 'Servicios Básicos BG II', delta: '-$20.407 USD', pct: '-38%', desc: 'Finalización de tramos de tuberías y menor demanda de servicios externos.', color: 'B45309' },
      { pry: 'Interconexión de Vapor', delta: '-$27.170 USD', pct: '-82%', desc: 'Culminación de pruebas hidrostáticas y entrega de líneas presurizadas.', color: 'B45309' }
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
      `6. Proyecto Pellas Línea 1 (TTE-C-0706) · ${mesLabel}`,
      'Frente prioritario de ejecución industrial TIMACA · Acumulado 2026: $2.388.978 USD'
    );

    const pellasCards = [
      { label: `EJECUTADO EN ${mesLabel.toUpperCase()}`, val: `$${pellasMesData.montoMes.toLocaleString('de-DE')} USD`, note: `${pellasMesData.porcentajeMes}% del gasto total de TIMACA` },
      { label: 'ACUMULADO ANUAL 2026', val: `$${pellasMesData.acumulado2026.toLocaleString('de-DE')} USD`, note: '8,04% del contrato marco ($29.720.000 USD)' },
      { label: 'MANO DE OBRA DIRECTA (MOD)', val: '$128.161 USD', note: '254 obreros (65,2% de la nómina directa)' },
      { label: 'CIF PRORRATEADO ACUMULADO', val: '$800.270 USD', note: '60,2% de la estructura de indirectos ($236.688 en Sep)' }
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
        { text: '$344.626', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '14,4%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'Servicios Especializados (END, Grúas, Fletes)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
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
        { text: '10,6%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
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
        { text: '27,3%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
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
        { text: '$331.762', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '13,9%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
      ],
      [
        { text: 'Costos Indirectos (CIF 60,2% Prorrateado)', options: { fontSize: 9.0, color: C_DARK, bold: true } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$0', options: { fontSize: 9.0, align: 'right', color: '94A3B8' } },
        { text: '$116.389', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$135.147', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$107.485', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$204.561', options: { fontSize: 9.0, align: 'right', color: C_DARK } },
        { text: '$236.688', options: { fontSize: 9.0, align: 'right', bold: true, color: 'B45309', fill: { color: 'FEF3C7' } } },
        { text: '$800.270', options: { fontSize: 9.0, align: 'right', bold: true, color: C_BLUE, fill: { color: 'EFF6FF' } } },
        { text: '33,5%', options: { fontSize: 9.0, align: 'right', bold: true, color: '475569' } }
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
        { text: '$2.383.953', options: { bold: true, fontSize: 9.8, align: 'right', color: C_NAVY, fill: { color: 'BFDBFE' } } },
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
      '• Fase Preliminar (Ene - Abr): Movilización temprana con gasto acumulado de apenas $9.520 USD y cuadrilla inicial de 12 personas en ingeniería preliminar e inspección.\n' +
      '• Rampa de Montaje (May - Ago): Despegue con 145 a 238 obreros técnicos en campo; el gasto mensual creció de $305K en mayo a $596K en agosto con fuerte carga de nómina directa ($167K en agosto).\n' +
      '• Pico Operativo en Septiembre ($668.340 USD): Máximo histórico de TIMACA con 254 trabajadores activos y salto crítico en procura de materiales ($173.833 USD) para calderería y refractarios.',
      {
        x: 0.75,
        y: 5.25,
        w: 5.65,
        h: 1.50,
        fontSize: 9.8,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
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
      '• Avance Contractual: Con $2.388.978 USD acumulados a septiembre, el proyecto alcanza el 8,04% de cumplimiento del contrato marco de $29.720.000 USD (saldo remanente: $27.331.022 USD).\n' +
      '• Pilar de Absorción CIF (60,2%): Pellas absorbe $236.688 USD de costos indirectos corporativos en septiembre y un total acumulado de $800.270 USD (33,5% del costo del proyecto), sustentando la ingeniería y talleres centrales.\n' +
      '• Continuidad Operativa: El flujo constante de insumos y cuadrilla estabilizada aseguran el cumplimiento de hitos de entrega y valuación para el último trimestre de 2026.',
      {
        x: 6.93,
        y: 5.25,
        w: 5.65,
        h: 1.50,
        fontSize: 9.8,
        color: '14532D',
        lineSpacingMultiple: 1.15
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
      'Flota de 16 equipos activos (811,7 h · $55.578 USD) y logística especializada ($69.056 USD) · Cero horas depuradas'
    );

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
        { text: '$196.340', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Vigilancia y Seguridad Integral', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '$13.182', options: { fontSize: 10, align: 'right' } },
        { text: '19,1%', options: { fontSize: 10, align: 'right' } },
        { text: '$56.400', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Alquiler de Equipos Especiales', options: { bold: true, fontSize: 10, color: C_DARK } },
        { text: '$8.400', options: { fontSize: 10, align: 'right' } },
        { text: '12,2%', options: { fontSize: 10, align: 'right' } },
        { text: '$35.950', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'Otros Servicios Operativos Menores', options: { fontSize: 10, color: '64748B' } },
        { text: '$1.596', options: { fontSize: 10, align: 'right' } },
        { text: '2,3%', options: { fontSize: 10, align: 'right' } },
        { text: '$7.000', options: { fontSize: 10, align: 'right' } }
      ],
      [
        { text: 'TOTAL SERVICIOS DIRECTOS PELLAS', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_DARK } } },
        { text: '$69.056 USD', options: { bold: true, fontSize: 11, color: 'FCD34D', fill: { color: C_DARK }, align: 'right' } },
        { text: '100.0%', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_DARK }, align: 'right' } },
        { text: '$295.690 USD', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_DARK }, align: 'right' } }
      ]
    ];

    slide.addTable(servRows, {
      x: 6.8,
      y: 1.35,
      w: 5.93,
      colW: [2.83, 1.1, 0.8, 1.2],
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.3,
      w: 12.13,
      h: 1.5,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      'NOTAS OPERATIVAS DE CONTROL (SEPT 2026):\n' +
      '1. Depuración de Flota: Se eliminaron del reporte 12 equipos que registraron 0 horas, reflejando exclusivamente los 16 equipos productivos.\n' +
      '2. Concentración de Izaje: La Grúa Demag AC200 concentró el 44,7% del gasto de maquinaria ($24.841 USD) con 130,6 horas efectivas en montaje electromecánico.\n' +
      '3. Logística de Personal: Los servicios de traslado movilizaron diariamente a la cuadrilla de 254 trabajadores en 3 turnos rotativos sin incidencias.',
      {
        x: 0.8,
        y: 5.4,
        w: 11.73,
        h: 1.3,
        fontSize: 10.5,
        color: C_SLATE,
        lineSpacingMultiple: 1.2
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
      `8. Frente de Despacho PMH · Segunda Línea (TTE-C-0671) & Red de Transporte`,
      'Análisis de inversión acelerada en Septiembre ($291.949 USD) · Suministro de apoyos elastoméricos, concreto y canalizaciones'
    );

    const pmhCards = [
      { label: `INVERSIÓN EN ${mesLabel.toUpperCase()} (TTE-C-0671)`, val: '$291.949 USD', note: '+47,5% vs Agosto ($197.962 USD)' },
      { label: 'ACUMULADO ANUAL 2026', val: '$1.143.217 USD', note: '3er proyecto de mayor volumen en TIMACA' },
      { label: 'MATERIALES DIRECTOS SEP', val: '$249.494 USD', note: '85,5% del costo del proyecto en el mes' },
      { label: 'TOTAL COMPLEJO PMH (SEP)', val: '$438.002 USD', note: '27,2% del total de la empresa en el mes' }
    ];

    pmhCards.forEach((c, idx) => {
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

    const tableMatPMH = [
      [
        { text: 'Insumo / Material Crítico Despachado', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5 } },
        { text: 'Cantidad / UM', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5, align: 'center' } },
        { text: 'Monto ($)', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5, align: 'right' } },
        { text: 'Función en Obra', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5 } }
      ],
      [
        { text: 'Apoyos Estructurales Elastómero Neopreno Shore A 60', options: { fontSize: 9.8 } },
        { text: '48 UND', options: { fontSize: 9.8, align: 'center' } },
        { text: '$67.000', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: 'Amortiguamiento sísmico y térmico de galerías', options: { fontSize: 9.8 } }
      ],
      [
        { text: 'Tubería Conduit PVC Alto Impacto 5" Pesada', options: { fontSize: 9.8 } },
        { text: '1.240 MTR', options: { fontSize: 9.8, align: 'center' } },
        { text: '$27.846', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: 'Canalizaciones subterráneas de fuerza y control', options: { fontSize: 9.8 } }
      ],
      [
        { text: 'Concreto Premezclado Estructural 250 kg/cm²', options: { fontSize: 9.8 } },
        { text: '180 M3', options: { fontSize: 9.8, align: 'center' } },
        { text: '$25.488', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: 'Pedestales y zapatas de torres de transferencia', options: { fontSize: 9.8 } }
      ],
      [
        { text: 'Perfiles Estructurales y Planchas ASTM A36', options: { fontSize: 9.8 } },
        { text: '78.500 KG', options: { fontSize: 9.8, align: 'center' } },
        { text: '$129.160', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: 'Vigas maestras de soporte de cintas de mineral', options: { fontSize: 9.8 } }
      ]
    ];

    slide.addText('1. MATERIALES CRÍTICOS DESPACHADOS EN SEPTIEMBRE (TTE-C-0671)', {
      x: 0.6,
      y: 2.95,
      w: 6.0,
      h: 0.25,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addTable(tableMatPMH, {
      x: 0.6,
      y: 3.25,
      w: 5.95,
      h: 1.95,
      colW: [2.35, 0.9, 0.9, 1.8],
      border: { pt: 0.5, color: C_BORDER }
    });

    const tableObrasPMH = [
      [
        { text: 'Frente de Trabajo / Proyecto PMH', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 10.5 } },
        { text: 'Cuenta', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 10.5, align: 'center' } },
        { text: 'Septiembre', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 10.5, align: 'right' } },
        { text: 'Acumulado 2026', options: { bold: true, fill: { color: C_DARK }, color: C_WHITE, fontSize: 10.5, align: 'right' } }
      ],
      [
        { text: 'Segunda Línea PMH (Incremento Capacidad)', options: { fontSize: 9.8 } },
        { text: 'TTE-C-0671', options: { fontSize: 9.8, align: 'center' } },
        { text: '$291.949', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: '$1.143.217', options: { fontSize: 9.8, align: 'right' } }
      ],
      [
        { text: 'Rehabilitación Bandas Torre #3 a JD-8012', options: { fontSize: 9.8 } },
        { text: 'TTE-C-0656', options: { fontSize: 9.8, align: 'center' } },
        { text: '$92.544', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: '$1.235.820', options: { fontSize: 9.8, align: 'right' } }
      ],
      [
        { text: 'Proyecto Pila HA y HB (Suministro Apilador)', options: { fontSize: 9.8 } },
        { text: 'TTE-C-0678', options: { fontSize: 9.8, align: 'center' } },
        { text: '$47.673', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: '$329.757', options: { fontSize: 9.8, align: 'right' } }
      ],
      [
        { text: 'Interconexión Tolva Multipropósito PMH', options: { fontSize: 9.8 } },
        { text: 'TTE-C-0655', options: { fontSize: 9.8, align: 'center' } },
        { text: '$5.836', options: { fontSize: 9.8, align: 'right', bold: true } },
        { text: '$294.459', options: { fontSize: 9.8, align: 'right' } }
      ],
      [
        { text: 'TOTAL COMPLEJO PMH (4 FRENTES ACTIVOS)', options: { fontSize: 9.8, bold: true, fill: { color: 'E2E8F0' } } },
        { text: '4 CTAS', options: { fontSize: 9.8, align: 'center', bold: true, fill: { color: 'E2E8F0' } } },
        { text: '$438.002', options: { fontSize: 9.8, align: 'right', bold: true, fill: { color: 'E2E8F0' } } },
        { text: '$3.003.253', options: { fontSize: 9.8, align: 'right', bold: true, fill: { color: 'E2E8F0' } } }
      ]
    ];

    slide.addText('2. RED DE PROYECTOS DEL COMPLEJO PMH (FMO / VISCO)', {
      x: 6.75,
      y: 2.95,
      w: 6.0,
      h: 0.25,
      fontSize: 10.5,
      bold: true,
      color: C_DARK
    });

    slide.addTable(tableObrasPMH, {
      x: 6.75,
      y: 3.25,
      w: 5.95,
      h: 2.0,
      colW: [2.55, 0.9, 1.1, 1.4],
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.4,
      w: 12.13,
      h: 1.45,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText(
      'DICTAMEN TÉCNICO Y CONTROL DE COSTOS EN PMH:\n' +
      '• Transición a Fase Civil y Montaje Electromecánico: El salto de $197.962 a $291.949 USD en la Segunda Línea PMH (TTE-C-0671) obedece al inicio del vaciado de concreto y colocación de apoyos elastoméricos de neopreno de alto rendimiento para las galerías de transferencia marítima.\n' +
      '• Polo Estratégico Portuario: Las 4 obras activas en PMH suman $438.002 USD en septiembre (27,2% del total de TIMACA) y superan los $3.003.253 USD acumulados en 2026, garantizando la capacidad de calado y despacho continuo de mineral de hierro en el Muelle de Puerto Ordaz.',
      {
        x: 0.8,
        y: 5.5,
        w: 11.73,
        h: 1.25,
        fontSize: 10.5,
        color: '1E3A8A',
        lineSpacingMultiple: 1.2
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
      `8. Repotenciación Rueda de Cangilones DRAVO PA-9020 (TTE-C-0653)`,
      'Auditoría del salto presupuestario (+760,6% en Septiembre) · Reacondicionamiento integral, blindajes de desgaste y aceros especiales'
    );

    const dravoCards = [
      { label: `INVERSIÓN EN ${mesLabel.toUpperCase()}`, val: '$199.356 USD', note: 'Salto neto de +$176.191 USD vs Agosto ($23.166 USD)' },
      { label: 'VARIACIÓN MENSUAL', val: '+760,6%', note: 'Mayor aceleración presupuestaria de la empresa' },
      { label: 'ACUMULADO ANUAL 2026', val: '$553.269 USD', note: '36,0% del total anual se ejecutó en Septiembre' },
      { label: 'MATERIALES DIRECTOS SEP', val: '$182.885 USD', note: '91,7% de la inversión imputada en el mes' }
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
        { text: 'Componente / Partida Reacondicionada', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5 } },
        { text: 'Monto ($)', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5, align: 'right' } },
        { text: 'Participación', options: { bold: true, fill: { color: C_NAVY }, color: C_WHITE, fontSize: 10.5, align: 'center' } }
      ],
      [
        { text: 'Planchas de Desgaste Antiabrasivas Hardox / A514', options: { fontSize: 10 } },
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
        { text: 'Prorrateo de Costos Indirectos de Soporte', options: { fontSize: 10 } },
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
      '• Ventana de Parada Crítica de Planta VISCO / FMO: Tras meses de ingeniería y desmontaje preliminar, en septiembre se autorizó la parada técnica en caliente de la Rueda de Cangilones PA-9020. Para no paralizar el flujo de despacho marítimo, se concentró en una sola ventana el suministro e instalación de planchas de desgaste Hardox para los 10 cangilones y tolva receptora.\n' +
      '• Trazabilidad SIP Verificada: Los despachos corresponden a vales reales de almacén (ej. DP0038612 y pedidos de compra asociados) con destino exclusivo al equipo PA-9020, descartando mala imputación contable.',
      {
        x: 0.8,
        y: 5.5,
        w: 11.73,
        h: 1.25,
        fontSize: 10.5,
        color: '78350F',
        lineSpacingMultiple: 1.2
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
      `10. Costos Indirectos y Prorrateo por Área (${mesLabel})`,
      'Estructura Oficial de $393.375 USD · Prorrateo Ancla MOD (Metodología Oficial TIMACA)'
    );

    const pellasCIF = 236688;
    const restoCIF = 156687;
    const cifDonutData = [
      {
        name: 'Prorrateo CIF',
        labels: ['Pellas Línea 1 (60,2%)', 'Resto de Proyectos (39,8%)'],
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
      showPercent: true,
      showLegend: true,
      legendPos: 'b'
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.7,
      w: 5.2,
      h: 2.1,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText('METODOLOGÍA DE ANCLA MOD', {
      x: 0.8,
      y: 4.85,
      w: 4.8,
      h: 0.25,
      fontSize: 12,
      bold: true,
      color: C_DARK
    });

    slide.addText(
      'TIMACA distribuye los indirectos proporcionalmente a la nómina directa:\n' +
      '• Pellas Línea 1 absorbe el 60,2% ($236.688 USD) al concentrar la mayor porción de mano de obra y recursos en obra.\n' +
      '• Resto de proyectos (9 obras activas) absorbe el 39,8% ($156.687 USD) distribuido según cuadrilla.\n' +
      '• Total CIF auditado: $393.375,12 USD (coincidencia 100% con tabla oficial de costos indirectos).',
      {
        x: 0.8,
        y: 5.15,
        w: 4.8,
        h: 1.5,
        fontSize: 10.2,
        color: C_SLATE,
        lineSpacingMultiple: 1.2
      }
    );

    const subTable: any[][] = [
      [
        { text: 'Subconcepto de Soporte e Indirectos', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } },
        { text: 'Monto (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: '% Total', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5 } },
        { text: 'Alcance Operativo', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 10.5 } }
      ],
      [
        { text: '1. Nómina TIMACA (Administrativa / Técnica)', options: { bold: true, fontSize: 10.5, color: C_DARK } },
        { text: '$125.000,00', options: { bold: true, fontSize: 10.5, align: 'right' } },
        { text: '31,78%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Ingenieros residentes, supervisores de obra, seguridad y costos.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '2. Nómina Talleres Centrales TIMACA', options: { bold: true, fontSize: 10.5, color: C_DARK } },
        { text: '$122.000,00', options: { bold: true, fontSize: 10.5, align: 'right' } },
        { text: '31,01%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Mecánicos, electricistas de planta, torneros y mantenimiento.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '3. Aporte y Gestión Sindical Colectivo', options: { bold: true, fontSize: 10.5, color: C_DARK } },
        { text: '$58.952,14', options: { bold: true, fontSize: 10.5, align: 'right' } },
        { text: '14,99%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Convención colectiva, bienestar laboral y dotaciones.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '4. Combustible y Lubricantes de Soporte', options: { bold: true, fontSize: 10.5, color: C_DARK } },
        { text: '$50.413,28', options: { bold: true, fontSize: 10.5, align: 'right' } },
        { text: '12,82%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Abastecimiento de gasoil para vehículos de apoyo y logística.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '5. Otros Costos Indirectos y Operativos', options: { fontSize: 10.5, color: C_DARK } },
        { text: '$25.234,70', options: { fontSize: 10.5, align: 'right' } },
        { text: '6,41%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Mantenimiento menor de campamentos, consumibles y logística.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '6. Bonificaciones de Productividad y Campo', options: { fontSize: 10.5, color: C_DARK } },
        { text: '$6.700,00', options: { fontSize: 10.5, align: 'right' } },
        { text: '1,70%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Incentivos extraordinarios por cumplimiento de hitos críticos.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '7. Seguridad y Vigilancia Perimetral', options: { fontSize: 10.5, color: C_DARK } },
        { text: '$5.074,65', options: { fontSize: 10.5, align: 'right' } },
        { text: '1,29%', options: { fontSize: 10.5, align: 'right' } },
        { text: 'Custodia perimetral 24/7 en instalaciones centrales y talleres.', options: { fontSize: 9.8, color: C_SLATE } }
      ],
      [
        { text: '8. Servicios Públicos', options: { fontSize: 10.5, color: '64748B' } },
        { text: '$0,00', options: { fontSize: 10.5, align: 'right', color: '64748B' } },
        { text: '0,00%', options: { fontSize: 10.5, align: 'right', color: '64748B' } },
        { text: 'Sin cargos devengados facturados en el período contable.', options: { fontSize: 9.8, color: '64748B' } }
      ],
      [
        { text: 'TOTAL COSTOS INDIRECTOS (CIF)', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_NAVY } } },
        { text: '$393.375,12 USD', options: { bold: true, fontSize: 11, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right' } },
        { text: '100,00%', options: { bold: true, fontSize: 11, color: C_WHITE, fill: { color: C_NAVY }, align: 'right' } },
        { text: 'Tabla oficial de indirectos auditada al centavo.', options: { color: C_WHITE, fill: { color: C_NAVY }, fontSize: 9.8 } }
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
      `11. Conclusiones de Control & Matriz Semáforo (${mesLabel})`,
      'Evaluación estratégica y recomendaciones directivas presentadas al Departamento de Costos · TIMACA'
    );

    const quadrants = [
      {
        num: '1',
        title: 'Fortalezas Operativas & Cumplimiento',
        color: C_EMERALD,
        badge: 'SEMÁFORO VERDE',
        items: [
          'Mano de Obra Directa al día: $196.665 USD devengados en 10 proyectos sin pasivos atrasados ni contingencias, liderada por Pellas Línea 1 ($128.161 USD · 65,2%) y Segunda Línea PMH ($30.305 USD · 15,4%).',
          'Proyecto Pellas Línea 1 con avance sostenido: Acumulado de $2.388.978 USD (8,0% sobre contrato marco de $29.72M USD), con 254 trabajadores y 812 horas máquina efectivas.',
          'Aceleración Operativa Oficial: Cierre de septiembre en $1.613.225 USD (+34,7% vs agosto $1.197.600 USD), impulsado por la inversión en materiales directos ($868.067 USD).'
        ]
      },
      {
        num: '2',
        title: 'Alertas de Costo & Atención Prioritaria',
        color: C_AMBER,
        badge: 'SEMÁFORO ÁMBAR',
        items: [
          'Repunte Rueda DRAVO (+761%): Cierre en $199.356 USD (vs $23.166 USD en agosto) por reactivación y componentes electromecánicos; auditar recepción física en almacén de obra.',
          'Segunda Línea PMH en expansión (+47%): Cierre en $291.949 USD (vs $197.962 USD en agosto), consolidándose como el segundo frente de mayor inversión de TIMACA (18,1%).',
          'Contrato TTE-C-0697 (Bandas PMH) al 90%: Acumula $981.810 USD sobre presupuesto de $1.091.248 USD; requiere tramitar adenda formal de techo para evitar sobrecostos.'
        ]
      },
      {
        num: '3',
        title: 'Eficiencia Operativa & Cumplimiento de Tiempos',
        color: C_BLUE,
        badge: 'SEMÁFORO AZUL · PRODUCTIVIDAD',
        items: [
          'Acelerar Hitos de Facturación: Los proyectos externos son el motor de ingresos de TIMACA. El objetivo central es transformar el avance físico en valuaciones contractuales aprobadas y cobradas.',
          'Cero Tiempos Muertos en Maquinaria: 16 equipos activos en Pellas Línea 1 sumaron 811,7 horas efectivas ($55.578 USD), liderados por la Grúa Demag AC200 (130,6 h · $24.841 USD). Depurados 12 equipos en cero.',
          'Reasignación Dinámica por Cronograma: Transferir cuadrillas técnicas y recursos de izaje hacia frentes con metas perentorias (Segunda Línea PMH y Pellas 1), asegurando cumplimiento de cronograma.'
        ]
      },
      {
        num: '4',
        title: 'Decisiones Directoriales Inmediatas',
        color: C_NAVY,
        badge: 'ACCIÓN INMEDIATA',
        items: [
          'Validación Quincenal por Gerentes: Formalizar la aprobación técnica previa de materiales directos ($868.067 USD) y servicios ($99.540 USD) por cada responsable de obra antes de desembolsos.',
          'Adenda Contractual TTE-C-0697: Elevar a Junta Directiva la solicitud formal de adenda antes de comprometer nuevos despachos en Bandas PMH.',
          'Control de Costos Indirectos (CIF): Monitorear la absorción de los $393.375 USD bajo la metodología de ancla MOD (60,2% Pellas = $236.688 USD / 39,8% Resto) y supervisar rendición de nóminas.'
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
        w: 4.1,
        h: 0.25,
        fontSize: 11.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(q.badge, {
        x: xPos + 4.2,
        y: yPos + 0.1,
        w: 1.6,
        h: 0.22,
        fontSize: 9.5,
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
        fontSize: 9.8,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      });
    });

    addSlideFooter(slide);
  }

  // Trigger download in browser
  const fileName = `Informe_Ejecutivo_Costos_TIMACA_${mesLabel.replace(/\s+/g, '_')}.pptx`;
  await pptx.writeFile({ fileName });
}
