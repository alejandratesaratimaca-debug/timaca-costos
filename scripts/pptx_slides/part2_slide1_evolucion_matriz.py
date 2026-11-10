def get_code():
    return """
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
      '• Servicios Especializados (+241,1%): Principal impulsor ($956.835 USD) por contratos en Pellas L1 (Yokogawa DCS $686K y Henan Front $40K).\\n' +
      '• Mano de Obra Directa (+23,6%): $257.750 USD y 69.635 HH con 399 trabajadores auditados tras regularizar nómina de Boca Grande II ($13,7K).\\n' +
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
      '• Conciliación 100% Proyectos Externos: Los 18 contratos auxiliares TTE-C absorben exactamente $2.063.059 USD, habiéndose depurado gastos no imputables a contratos externos (flota interna y soporte central corporativo).\\n' +
      '• Ejes Principales de Inversión: Pellas Línea 1 ($1.219.527 USD · 59,1%) y Segunda Línea PMH ($434.469 USD · 21,1%) concentran el 80,2% de la ejecución técnica de octubre.\\n' +
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
"""
