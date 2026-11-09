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
      `Gasto Total Oficial: $${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD (${datosMesInforme.variacionTotalPct > 0 ? '+' : ''}${datosMesInforme.variacionTotalPct}% vs ${datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'mes anterior'}) · Acumulado 2026: $14.654.524 USD (10 Meses)`
    );

    // 4 KPI Cards (Top Row)
    const topCards = [
      {
        tag: `GASTO TOTAL ${mesUpper}`,
        val: `$${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD`,
        desc: `${datosMesInforme.variacionTotalPct > 0 ? '+' : ''}${datosMesInforme.variacionTotalPct}% vs ${datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'mes anterior'} (+$397.947 USD)`,
        color: C_NAVY
      },
      {
        tag: 'ACUMULADO CONSOLIDADO 2026',
        val: '$14.654.524 USD',
        desc: '10 Meses (Ene - Oct) · Modelo Estrella TIMACA',
        color: C_BLUE
      },
      {
        tag: 'FUERZA LABORAL ACTIVA',
        val: '402 Trabajadores',
        desc: '399 Cédulas Auditadas · 6 Frentes en Planta',
        color: C_EMERALD
      },
      {
        tag: 'PROYECTOS EXTERNOS (99,4%)',
        val: '$2.092.260 USD',
        desc: '18 Cuentas Activas · Remanente: $13K Centrales (0,6%)',
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
        { text: '$476.866', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '22,6%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$823.463', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '-42,1%', options: { fontSize: 8.5, align: 'right', bold: true, color: 'B91C1C' } }
      ],
      [
        { text: 'Servicios Especializados', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$967.479', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '46,0%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$280.541', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '+244,9%', options: { fontSize: 8.5, align: 'right', bold: true, color: '059669' } }
      ],
      [
        { text: 'Mano de Obra Directa (MOD)', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$257.751', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '12,2%', options: { fontSize: 8.5, align: 'right', bold: true } },
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
        { text: 'Costos Indirectos (CIF Bolsa)', options: { fontSize: 8.5, bold: true, color: C_DARK } },
        { text: '$344.629', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right' } },
        { text: '16,4%', options: { fontSize: 8.5, align: 'right', bold: true } },
        { text: '$341.375', options: { fontSize: 8.5, fontFace: 'Consolas', align: 'right', color: '64748B' } },
        { text: '+1,0%', options: { fontSize: 8.5, align: 'right', bold: true, color: '059669' } }
      ],
      [
        { text: 'TOTAL CONSOLIDADO', options: { fontSize: 9.0, bold: true, fill: { color: 'F1F5F9' }, color: C_NAVY } },
        { text: '$2.105.225', options: { fontSize: 9.0, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' }, color: C_NAVY, align: 'right' } },
        { text: '100,0%', options: { fontSize: 9.0, bold: true, fill: { color: 'F1F5F9' }, color: C_NAVY, align: 'right' } },
        { text: '$1.707.278', options: { fontSize: 9.0, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' }, color: '64748B', align: 'right' } },
        { text: '+23,3%', options: { fontSize: 9.0, bold: true, fill: { color: 'F1F5F9' }, color: '059669', align: 'right' } }
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
      '• Servicios Especializados (+244,9%): Principal impulsor del mes por contratos preoperativos en Pellas Línea 1 (Yokogawa $686K en instrumentación y Henan Front $40K).\\n' +
      '• Mano de Obra (+23,6%): 402 obreros activos en campo e incorporación de Boca Grande II ($13,7K), sosteniendo calderería y montaje de virolas.\\n' +
      '• Provisión Horas Máquina ($58.500 USD): Refleja continuidad operativa (+5,3% Pellas) sujeta a conciliación de horómetros definitivos de planta.',
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
    const monthValues = [1028, 1251, 1400, 1009, 874, 2591, 1088, 1781, 1707, 2105];
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

    // Right Column Bottom Callout Box (Explaining 99.4% and $13K central support)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.1,
      y: 5.20,
      w: 5.6,
      h: 1.55,
      fill: { color: 'F8FAFC' },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText('CONCILIACIÓN Y ABSORCIÓN EN PROYECTOS EXTERNOS', {
      x: 7.25,
      y: 5.28,
      w: 5.3,
      h: 0.18,
      fontSize: 8.5,
      bold: true,
      color: C_DARK
    });

    slide.addText(
      '• Conciliación del Total: Los 18 proyectos externos absorben $2.092.260 USD (99,4% del gasto) y los $12.965 USD restantes (0,6%) corresponden a compras y soporte corporativo general, sumando los $2.105.225 USD de la empresa.\\n' +
      '• Ejes Principales de Inversión: Pellas Línea 1 ($1.235K · 59,0%) y Segunda Línea PMH ($444K · 21,2%) concentran el 80,2% de la ejecución técnica.\\n' +
      '• Tendencia de Curva: La trayectoria gráfica refleja el repunte controlado de +23,3% acorde con la fase crítica de comisionamiento preoperativo.',
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
