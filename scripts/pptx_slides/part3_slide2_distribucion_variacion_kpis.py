def get_code():
    return """
  // =========================================================================
  // SLIDE 2A: ANÁLISIS DE COSTOS DEL MES · DISTRIBUCIÓN Y MATRIZ DE CATEGORÍAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '2A',
      `2A. Análisis de Costos del Mes (${mesTitle})`,
      `Gasto Total Oficial: $${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD · Variación vs mes anterior: ${datosMesInforme.variacionTotalPct > 0 ? '+' : ''}${datosMesInforme.variacionTotalPct}% (${datosMesInforme.totalMonto >= datosMesInforme.totalMontoPrev ? '+' : '-'}$${Math.abs(Math.round(datosMesInforme.totalMonto - datosMesInforme.totalMontoPrev)).toLocaleString('de-DE')} USD vs ${datosMesInforme.mesAnteriorLabel || 'mes anterior'})`
    );

    // Left Column: Native Office Donut Chart
    const directCategories = categoriasMesAnalisis.slice(0, 4);
    const directCost = Math.round(directCategories.reduce((s, c) => s + c.monto, 0));
    const indirectCost = Math.round(categoriasMesAnalisis[4]?.monto || 0);
    const totalCalculated = directCost + indirectCost;
    const directPct = totalCalculated > 0 ? ((directCost / totalCalculated) * 100).toFixed(1).replace('.', ',') : '0,0';
    const indirectPct = totalCalculated > 0 ? ((indirectCost / totalCalculated) * 100).toFixed(1).replace('.', ',') : '0,0';

    const donutData = [
      {
        name: 'Distribución de Costo',
        labels: [`Costos Directos (${directPct}%) · $${directCost.toLocaleString('de-DE')} USD`, `Costos Indirectos CIF (${indirectPct}%) · $${indirectCost.toLocaleString('de-DE')} USD`],
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

    slide.addText(`COSTOS DIRECTOS (${directPct}%) · $${directCost.toLocaleString('de-DE')} USD`, {
      x: 6.8,
      y: 1.38,
      w: 5.7,
      h: 0.24,
      fontSize: 12,
      bold: true,
      color: C_BLUE
    });

    slide.addText(
      `Materiales: $${Math.round(categoriasMesAnalisis[0]?.monto || 0).toLocaleString('de-DE')} USD | MOD: $${Math.round(categoriasMesAnalisis[2]?.monto || 0).toLocaleString('de-DE')} USD\\n` +
      `Servicios: $${Math.round(categoriasMesAnalisis[1]?.monto || 0).toLocaleString('de-DE')} USD | Horas Máquina: $${Math.round(categoriasMesAnalisis[3]?.monto || 0).toLocaleString('de-DE')} USD\\n` +
      `→ Costo directo en ${cuentasAuxiliaresMes.length} cuentas activas (con cuadrillas en frentes de obra prioritarios).`,
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

    slide.addText(`COSTOS INDIRECTOS CIF (${indirectPct}%) · $${indirectCost.toLocaleString('de-DE')} USD`, {
      x: 6.8,
      y: 2.56,
      w: 5.7,
      h: 0.24,
      fontSize: 12,
      bold: true,
      color: 'B45309'
    });

    slide.addText(
      isOct
        ? 'Estructura corporativa de administración, talleres centrales, combustible y soporte de flota.\\n' +
          '→ Matriz Corporativa de Distribución CIF: Absorción financiada en 60,2% por Proyecto Tractor Pellas Línea 1.\\n' +
          `→ Conciliación Contable: Cierre de $${indirectCost.toLocaleString('de-DE')} USD registrado en libros mayores corporativos.`
        : 'Nómina TIMACA: $125.000 | Nómina Talleres: $122.000 | Sindicato: $58.952\\n' +
          'Combustible: $50.413 | Otros: $25.235 | Bonos: $6.700 | Vigilancia: $5.075\\n' +
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
        { text: `Monto ${mesTitle} (USD)`, options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: '% Mes', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: `Monto ${datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'Anterior'} (USD)`, options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 10.5, margin: [1, 3, 1, 3] } },
        { text: 'Variación vs Anterior', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'center', fontSize: 10.5, margin: [1, 3, 1, 3] } }
      ]
    ];

    categoriasMesAnalisis.forEach(c => {
      const pctMes = totalCalculated > 0 ? ((c.monto / totalCalculated) * 100).toFixed(1).replace('.', ',') : '0,0';
      const isPos = c.varPct > 0;
      catRows.push([
        { text: c.categoria, options: { bold: true, fontSize: 10, color: C_DARK, margin: [1, 3, 1, 3] } },
        { text: `$${Math.round(c.monto).toLocaleString('de-DE')}`, options: { fontSize: 10, align: 'right', bold: true, margin: [1, 3, 1, 3] } },
        { text: `${pctMes}%`, options: { fontSize: 10, align: 'right', color: C_SLATE, margin: [1, 3, 1, 3] } },
        { text: `$${Math.round(c.montoPrev).toLocaleString('de-DE')}`, options: { fontSize: 10, align: 'right', color: '64748B', margin: [1, 3, 1, 3] } },
        { text: c.varText, options: { fontSize: 10, align: 'center', bold: true, color: isPos ? C_EMERALD : (c.varPct < 0 ? 'B45309' : C_SLATE), margin: [1, 3, 1, 3] } }
      ]);
    });

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
        ? 'NOTAS OPERATIVAS DE CONTROL (JUSTIFICACIÓN DE VARIACIONES - OCTUBRE 2026):\\n' +
          '• Servicios Especializados (+872% vs sep): Inyección estratégica en instrumentación, ingeniería y automatización para Línea 1 Pellas con Yokogawa ($686K) y Henan Front ($40K).\\n' +
          '• Materiales Directos: Procura SIP ($476.866 USD) para calderería y tolvas en Pellas Línea 1 ($174K), Segunda Línea PMH ($258K) y Rueda DRAVO ($106K).\\n' +
          '• Costos Indirectos (CIF): $344.629 USD en estructura corporativa de administración, talleres centrales, combustible y soporte de flota.\\n' +
          '• Mano de Obra Directa (MOD): Devengado consolidado de cuadrillas en 6 frentes activos ($257.751 USD / 69.635 HH), integrando la nómina regularizada de Boca Grande II ($13.685 USD) y Refractario Briquetas ($9.000 USD).\\n' +
          '• Horas Máquina: El rubro se mantiene preliminarmente en $0,00 USD debido a retraso operativo en la consolidación de partes de horómetros y reporte de utilización de maquinaria pesada.'
        : 'NOTAS OPERATIVAS DE CONTROL (JUSTIFICACIÓN DE VARIACIONES):\\n' +
          '• Materiales Directos (+133,4% / +$496.140 USD): Incremento neto mensual de $371.927 USD a $868.067 USD concentrado en tres frentes: Segunda Línea PMH ($249.494 USD en perfiles A36, apoyos, conduit y concreto), Rueda DRAVO ($182.885 USD en planchas Hardox 450/500 y componentes mecánicos) y Pellas Línea 1 ($173.833 USD en calderería y tolvas), sumando entre los tres $606.212 USD (69,8% de los materiales del mes).\\n' +
          '• Costos Indirectos CIF (+15,7% / +$53.397 USD): Variación neta mensual de $339.978 USD a $393.375 USD impulsada por los rubros operativos variables de soporte (combustible de flota auxiliar, compromisos sindicales y consumibles menores), manteniéndose estables las cuotas mensuales de nómina indirecta de estructura ($247.000 USD entre administración y taller central).\\n' +
          '• Servicios Directos (-15,6% / -$18.430 USD): Disminución neta en los restantes proyectos de obra (-$24.380 USD) tras culminar fletes extrapesados y ensayos END en agosto, mientras Pellas Línea 1 incrementó su logística de transporte de personal y vigilancia ($69.056 USD, +$5.950 USD vs agosto).\\n' +
          '• Mano de Obra Directa (-29,2% / -$81.271 USD): Agosto computó 5 semanas con sobretiempo extraordinario por parada de planta, mientras septiembre computó 4 semanas operativas regulares (55.277 HH @ $3,56 USD/HH sin pasivos diferidos).\\n' +
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
  // SLIDE 2B: COMPARATIVA DE VARIACIÓN MENSUAL · ANÁLISIS CASCADA Y DELTAS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const mesPrevName = datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'Mes Anterior';
    const mesCurrName = mesTitle.split(' ')[0];
    const deltaTotal = Math.round(datosMesInforme.totalMonto - datosMesInforme.totalMontoPrev);
    const esPosTotal = deltaTotal >= 0;

    addSlideHeader(
      slide,
      '2B',
      `2B. Comparativa de Variación Mensual (${mesPrevName} vs ${mesCurrName})`,
      `Variación neta del mes: ${esPosTotal ? '+' : ''}$${deltaTotal.toLocaleString('de-DE')} USD (${esPosTotal ? '+' : ''}${datosMesInforme.variacionTotalPct}%) · Explicación detallada por rubro operativo`
    );

    // Top 3 KPI Cards
    const kpiSummary = [
      {
        label: `CIERRE ${mesPrevName.toUpperCase()} (BASE)`,
        val: `$${Math.round(datosMesInforme.totalMontoPrev).toLocaleString('de-DE')} USD`,
        color: '64748B',
        bg: 'F1F5F9',
        border: C_BORDER
      },
      {
        label: `CIERRE ${mesCurrName.toUpperCase()} (MES ACTIVO)`,
        val: `$${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD`,
        color: C_NAVY,
        bg: 'EFF6FF',
        border: '93C5FD'
      },
      {
        label: 'VARIACIÓN NETA MENSUAL',
        val: `${esPosTotal ? '+' : ''}$${deltaTotal.toLocaleString('de-DE')} USD (${esPosTotal ? '+' : ''}${datosMesInforme.variacionTotalPct}%)`,
        color: esPosTotal ? C_EMERALD : C_AMBER,
        bg: esPosTotal ? 'ECFDF5' : 'FFFBEB',
        border: esPosTotal ? 'A7F3D0' : 'FDE68A'
      }
    ];

    kpiSummary.forEach((k, idx) => {
      const xPos = 0.6 + (idx * 4.1);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.30,
        w: 3.93,
        h: 0.95,
        fill: { color: k.bg },
        line: { color: k.border, width: 1 },
        rectRadius: 0.08
      });

      slide.addText(k.label, {
        x: xPos + 0.15,
        y: 1.38,
        w: 3.63,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: '64748B'
      });

      slide.addText(k.val, {
        x: xPos + 0.15,
        y: 1.62,
        w: 3.63,
        h: 0.50,
        fontSize: 16,
        bold: true,
        color: k.color
      });
    });

    // 5 Category Comparison Cards
    const catExplanations: Record<string, string> = isOct ? {
      'Materiales Directos': 'Procura SIP de calderería, tolvas y aceros para Pellas Línea 1 ($174K), Segunda Línea PMH ($258K) y Rueda DRAVO ($106K). Se reduce (-42,1%) tras el pico récord de abastecimiento mayor de Septiembre.',
      'Servicios Directos': 'Crecimiento extraordinario (+872%) impulsado por contratos de instrumentación, automatización y control en Pellas Línea 1 con Yokogawa ($686K) y Henan Front ($40K).',
      'Servicios': 'Crecimiento extraordinario (+872%) impulsado por contratos de instrumentación, automatización y control en Pellas Línea 1 con Yokogawa ($686K) y Henan Front ($40K).',
      'Mano de Obra Directa': 'Consolida nóminas de 6 frentes activos (Semanas 39 a 43: $257.751 USD · 69.635 HH), integrando los 4 cortes semanales de Boca Grande II ($13.685 USD) y Refractario Briquetas ($9.000 USD).',
      'Horas Máquina': '⚠️ En $0,00 USD temporalmente debido a retraso operativo en la consolidación de partes de horómetros y reporte de utilización de maquinaria pesada de campo.',
      'Costos Indirectos': 'Estructura corporativa estable (+1,0%), absorbiendo nómina fija de administración, talleres centrales, combustible y soporte logístico.'
    } : {
      'Materiales Directos': 'Pico récord anual (+133,4% / +$496K): Segunda Línea PMH ($249K en vigas A36 y apoyos), DRAVO ($183K en blindajes Hardox) y Pellas ($174K en tolvas).',
      'Servicios Directos': 'Culminación de fletes marítimos y maniobras mayores en agosto (-15,6%). En septiembre se concentra en logística y vigilancia de Pellas Línea 1 ($69.056 USD).',
      'Servicios': 'Culminación de fletes marítimos y maniobras mayores en agosto (-15,6%). En septiembre se concentra en logística y vigilancia de Pellas Línea 1 ($69.056 USD).',
      'Mano de Obra Directa': 'Agosto incluyó 5 semanas con sobretiempo por parada de planta; septiembre computó 4 semanas regulares en 10 proyectos (55.277 HH @ $3,56 USD/HH).',
      'Horas Máquina': 'Repliegue programado de la grúa Demag AC200 tras izajes mayores de agosto; 16 equipos activos en Pellas sumaron 811,7 h ($55.578 USD).',
      'Costos Indirectos': 'Absorción corporativa bajo Matriz CIF ($393.375 USD), con 60,2% Pellas Línea 1 ($236.688 USD) y 39,8% Resto ($156.687 USD).'
    };

    categoriasMesAnalisis.forEach((c, idx) => {
      const yPos = 2.40 + (idx * 0.88);
      const delta = Math.round(c.monto - c.montoPrev);
      const isPos = delta > 0;
      const expl = catExplanations[c.categoria] || 'Variación mensual conciliada según libros mayores de proyectos externos.';

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: yPos,
        w: 12.13,
        h: 0.78,
        fill: { color: C_WHITE },
        line: { color: isPos ? 'A7F3D0' : C_BORDER, width: 0.8 },
        rectRadius: 0.08
      });

      // Category Name & Status Pill
      slide.addText(c.categoria, {
        x: 0.8,
        y: yPos + 0.08,
        w: 2.8,
        h: 0.25,
        fontSize: 11,
        bold: true,
        color: C_DARK
      });

      // Amounts Before & After
      slide.addText(
        `Base ${mesPrevName}: $${Math.round(c.montoPrev).toLocaleString('de-DE')}  →  ${mesCurrName}: $${Math.round(c.monto).toLocaleString('de-DE')} USD`,
        {
          x: 0.8,
          y: yPos + 0.35,
          w: 3.5,
          h: 0.35,
          fontSize: 9.5,
          color: '64748B'
        }
      );

      // Delta Badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 4.4,
        y: yPos + 0.15,
        w: 1.7,
        h: 0.45,
        fill: { color: isPos ? 'ECFDF5' : 'FFFBEB' },
        line: { color: isPos ? 'A7F3D0' : 'FDE68A', width: 0.8 },
        rectRadius: 0.06
      });

      slide.addText(
        `${isPos ? '+' : ''}$${delta.toLocaleString('de-DE')} (${c.varText})`,
        {
          x: 4.4,
          y: yPos + 0.22,
          w: 1.7,
          h: 0.30,
          fontSize: 9.5,
          bold: true,
          color: isPos ? C_EMERALD : 'B45309',
          align: 'center'
        }
      );

      // Technical Explanation
      slide.addText(expl, {
        x: 6.25,
        y: yPos + 0.10,
        w: 6.3,
        h: 0.58,
        fontSize: 9.2,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 2C: INDICADORES CLAVE DE GESTIÓN (KPIS) Y BANNERS OFICIALES
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '2C',
      `2C. Indicadores Clave de Gestión (KPIs) y Banners Oficiales (${mesTitle})`,
      'Panel de Control Ejecutivo y Monitoreo de Metas · Consolidado TIMACA 2026'
    );

    // 4 Top Official Banners
    const banners = [
      {
        title: `TOTAL ${mesUpper}`,
        val: `$${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')}`,
        sub: 'USD · Conciliado Oficial'
      },
      {
        title: `VARIACIÓN ${mesUpper}`,
        val: `${datosMesInforme.variacionTotalPct > 0 ? '▲ +' : datosMesInforme.variacionTotalPct < 0 ? '▼ ' : ''}${datosMesInforme.variacionTotalPct}%`,
        sub: `vs ${datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'mes ant.'}`
      },
      {
        title: 'Nº PROYECTOS ACTIVOS',
        val: `${cuentasAuxiliaresMes.length}`,
        sub: 'Frentes con ejecución'
      },
      {
        title: 'TOTAL ACUMULADO 2026',
        val: `$${TOTALES_MESES_PPT.filter(m => m.mesNum <= selectedMesNum).reduce((a, b) => a + b.total, 0).toLocaleString('de-DE')}`,
        sub: `Enero a ${mesTitle.split(' ')[0]} 2026`
      }
    ];

    banners.forEach((b, idx) => {
      const xPos = 0.6 + (idx * 3.08);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 1.30,
        w: 2.92,
        h: 1.10,
        fill: { color: C_WHITE },
        line: { color: C_NAVY, width: 1.2 },
        rectRadius: 0.08
      });

      slide.addShape(pptx.ShapeType.rect, {
        x: xPos,
        y: 1.30,
        w: 2.92,
        h: 0.32,
        fill: { color: C_NAVY }
      });

      slide.addText(b.title, {
        x: xPos,
        y: 1.34,
        w: 2.92,
        h: 0.22,
        fontSize: 9.5,
        bold: true,
        color: C_WHITE,
        align: 'center'
      });

      slide.addText(b.val, {
        x: xPos,
        y: 1.66,
        w: 2.92,
        h: 0.40,
        fontSize: 17,
        bold: true,
        color: C_DARK,
        align: 'center'
      });

      slide.addText(b.sub, {
        x: xPos,
        y: 2.06,
        w: 2.92,
        h: 0.25,
        fontSize: 9.0,
        color: '64748B',
        align: 'center'
      });
    });

    // 5 Category Cards
    const catKpiTexts: Record<string, string> = isOct ? {
      'Materiales Directos': 'Despachos de procura SIP ($476.866 USD) concentrados en aceros, tolvas y calderería en Pellas Línea 1, Segunda Línea PMH y Rueda DRAVO.',
      'Servicios Directos': 'Servicios especializados ($967.479 USD) liderados por contratos de ingeniería, instrumentación y control en Pellas con Yokogawa ($686K) y Henan Front ($40K).',
      'Servicios': 'Servicios especializados ($967.479 USD) liderados por contratos de ingeniería, instrumentación y control en Pellas con Yokogawa ($686K) y Henan Front ($40K).',
      'Mano de Obra Directa': 'MOD devengada en 6 frentes activos ($257.751 USD / 69.635 HH), integrando las nóminas de Boca Grande II ($13.685 USD) y Refractario Briquetas ($9.000 USD).',
      'Horas Máquina': 'Pendiente por retraso operativo en el reporte de horómetros y valoración de maquinaria pesada. Temporalmente en $0,00 USD a la espera de conciliación técnica.',
      'Costos Indirectos': 'Costos indirectos y soporte corporativo de operaciones ($344.629 USD), integrando nómina fija de soporte, talleres centrales, combustible y sindicato.'
    } : {
      'Materiales Directos': 'Despachos de procura focalizados en acero estructural, tolvas, cables y componentes para Segunda Línea PMH ($266K), DRAVO ($183K), Pellas ($174K) y Briquetas ($125K).',
      'Servicios Directos': 'Servicios operativos de traslado diario de cuadrillas ($45,9K), vigilancia patrimonial externa ($13,2K) y alquiler de equipos de apoyo ($8,4K), concentrados en Pellas.',
      'Servicios': 'Servicios operativos de traslado diario de cuadrillas ($45,9K), vigilancia patrimonial externa ($13,2K) y alquiler de equipos de apoyo ($8,4K), concentrados en Pellas.',
      'Mano de Obra Directa': 'Nómina devengada en 5 semanas (Sem 35 a 39) en 10 proyectos externos ($196.665 USD), liderada por Pellas Línea 1 ($133.185 USD · 60,2%) y Bandas PMH ($28.142 USD · 12,7%).',
      'Horas Máquina': '811,7 horas de maquinaria pesada propia ($55.578 USD), asignadas 100% a maniobras críticas de izaje y acarreo en Pellas Línea 1 (Grúa Demag AC200).',
      'Costos Indirectos': 'Costos indirectos y soporte corporativo de operaciones ($393.375 USD), integrando Nómina TIMACA ($125K), Talleres ($122K), Sindicato ($59K) y Combustible ($50K).'
    };

    categoriasMesAnalisis.forEach((c, idx) => {
      const xPos = 0.6 + (idx * 2.45);
      const isPos = c.varPct > 0;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.55,
        w: 2.33,
        h: 3.35,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.08
      });

      slide.addText(c.categoria, {
        x: xPos + 0.1,
        y: 2.68,
        w: 2.13,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: C_DARK
      });

      slide.addText(`$${Math.round(c.monto).toLocaleString('de-DE')} USD`, {
        x: xPos + 0.1,
        y: 3.05,
        w: 2.13,
        h: 0.38,
        fontSize: 13.5,
        bold: true,
        color: C_NAVY
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos + 0.1,
        y: 3.48,
        w: 1.3,
        h: 0.28,
        fill: { color: isPos ? 'ECFDF5' : 'FFFBEB' },
        line: { color: isPos ? 'A7F3D0' : 'FDE68A', width: 0.5 },
        rectRadius: 0.04
      });

      slide.addText(c.varText, {
        x: xPos + 0.1,
        y: 3.52,
        w: 1.3,
        h: 0.20,
        fontSize: 8.5,
        bold: true,
        color: isPos ? C_EMERALD : 'B45309',
        align: 'center'
      });

      const txt = catKpiTexts[c.categoria] || 'Cifras oficiales conciliadas con libros contables corporativos.';
      slide.addText(txt, {
        x: xPos + 0.1,
        y: 3.88,
        w: 2.13,
        h: 1.90,
        fontSize: 8.8,
        color: C_SLATE,
        lineSpacingMultiple: 1.15
      });
    });

    // Bottom Global Behavior Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 6.05,
      w: 12.13,
      h: 0.78,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(
      isOct
        ? 'COMPORTAMIENTO GLOBAL DE COSTOS (OCTUBRE 2026): Cierre oficial consolidado con ejecución de $1.788.994 USD (+10,9% vs septiembre), liderado estratégicamente por la inversión en Servicios Especializados ($967.479 USD · 54,1%) para el montaje, instrumentación y control en Pellas Línea 1, compensando la desaceleración planificada en la compra de aceros y tolvas.'
        : 'COMPORTAMIENTO GLOBAL DE COSTOS (SEPTIEMBRE 2026): Cierre consolidado con ejecución de $1.613.225 USD (+36,8% vs agosto de $1.197.600 USD), concentrado un 75,6% ($1.219.850 USD) en costos directos de obra y un 24,4% ($393.375 USD) en soporte corporativo.',
      {
        x: 0.8,
        y: 6.13,
        w: 11.73,
        h: 0.62,
        fontSize: 9.2,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
      }
    );

    addSlideFooter(slide);
  }
"""
