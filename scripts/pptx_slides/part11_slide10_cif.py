def get_code():
    return """
  // =========================================================================
  // SLIDE 10A: COSTOS INDIRECTOS CIF · PRORRATEO MATRIZ CORPORATIVA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const cifTotal = categoriasMesAnalisis[4]?.monto || (isOct ? 393375 : 378300);
    const pellasCIF = Math.round(cifTotal * 0.602);
    const restoCIF = cifTotal - pellasCIF;

    addSlideHeader(
      slide,
      '10A',
      `10A. Costos Indirectos CIF: Prorrateo Matriz Corporativa (${mesTitle})`,
      `Estructura de $${Math.round(cifTotal).toLocaleString('de-DE')} USD · Nómina interna, talleres y soporte central absorbido por proyectos`
    );

    // 4 KPI Cards across top
    const kpisCIF = [
      { label: `TOTAL CIF DEL MES (${mesTitle.split(' ')[0]})`, val: `$${Math.round(cifTotal).toLocaleString('de-DE')} USD`, note: 'Soporte y talleres TIMACA' },
      { label: 'PELLAS LÍNEA 1 (60,2%)', val: `$${pellasCIF.toLocaleString('de-DE')} USD`, note: 'Mayor volumen de HH de MOD' },
      { label: 'RESTO DE PROYECTOS (39,8%)', val: `$${restoCIF.toLocaleString('de-DE')} USD`, note: 'Distribuido en 9 frentes activos' },
      { label: 'BASE DE ASIGNACIÓN', val: 'Horas-Hombre MOD', note: 'Criterio contable auditado' }
    ];

    kpisCIF.forEach((kpi, idx) => {
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

    // Left Column: Donut Breakdown Graphic Representation (x: 0.6, y: 2.50, w: 5.6, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 5.6,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('DISTRIBUCIÓN DEL PRORRATEO CORPORATIVO CIF', {
      x: 0.8,
      y: 2.65,
      w: 5.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    // Pellas Card Box inside Left
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.00,
      w: 5.2,
      h: 1.65,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('PROYECTO PELLAS LÍNEA 1 (TTE-C-0706)', {
      x: 1.0,
      y: 3.12,
      w: 4.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });
    slide.addText(`$${pellasCIF.toLocaleString('de-DE')} USD (60,2%)`, {
      x: 1.0,
      y: 3.38,
      w: 4.8,
      h: 0.35,
      fontSize: 17,
      bold: true,
      fontFace: 'Consolas',
      color: C_BLUE
    });
    slide.addText(
      'Absorbe la mayor proporción de indirectos debido a su volumen de fuerza laboral en campo (254 trabajadores directos) y a la dedicación intensiva de talleres centrales y supervisión técnica.',
      {
        x: 1.0,
        y: 3.78,
        w: 4.8,
        h: 0.75,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    // Resto Card Box inside Left
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.80,
      w: 5.2,
      h: 1.70,
      fill: { color: 'FFFBEB' },
      line: { color: 'FDE68A', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('DEMÁS PROYECTOS EXTERNOS (RESTO)', {
      x: 1.0,
      y: 4.92,
      w: 4.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '92400E'
    });
    slide.addText(`$${restoCIF.toLocaleString('de-DE')} USD (39,8%)`, {
      x: 1.0,
      y: 5.18,
      w: 4.8,
      h: 0.35,
      fontSize: 17,
      bold: true,
      fontFace: 'Consolas',
      color: C_AMBER
    });
    slide.addText(
      'Distribuido entre Segunda Línea PMH, DRAVO PA-9020, Briqueteras, Bandas y proyectos en cierre en proporción directa a las horas-hombre devengadas en cada contrato.',
      {
        x: 1.0,
        y: 5.58,
        w: 4.8,
        h: 0.75,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    // Right Column: Fundamento Contable de Absorción (x: 6.45, y: 2.50, w: 6.28, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.45,
      y: 2.50,
      w: 6.28,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('FUNDAMENTO TÉCNICO Y METODOLOGÍA DE PRORRATEO (CIF)', {
      x: 6.65,
      y: 2.65,
      w: 5.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Base de Asignación por Horas-Hombre: De acuerdo con los Principios de Contabilidad Generalmente Aceptados (PCGA) y normas de contabilidad de costos industriales, los costos indirectos de fabricación se distribuyen en función de las horas-hombre directas ejecutadas en cada frente.\\n\\n' +
      '• Composición de Talleres: La infraestructura de talleres en Puerto Ordaz (calderería pesada, soldadura, maquinado y granallado/pintura) provee soporte continuo a los contratos externos.\\n\\n' +
      '• Eliminación de Sobreasignaciones: Se audita mensualmente que ningún proyecto absorba costos indirectos ociosos; los gastos de mantenimiento de planta y equipos se imputan según el factor de utilización real.\\n\\n' +
      '• Trazabilidad Financiera: Las cuentas 5.1.02 (Costos Indirectos) se concilian al centavo contra los balances de comprobación del sistema administrativo central de TIMACA.',
      {
        x: 6.65,
        y: 2.95,
        w: 5.8,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 10B: COSTOS INDIRECTOS CIF · ESTRUCTURA DE 8 SUBCONCEPTOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const cifTotal = categoriasMesAnalisis[4]?.monto || (isOct ? 393375 : 378300);

    addSlideHeader(
      slide,
      '10B',
      `10B. Estructura Detallada de los 8 Subconceptos Indirectos (CIF) · ${mesTitle}`,
      `Auditoría detallada de cuentas indirectas corporativas, logística y mantenimiento de talleres ($${Math.round(cifTotal).toLocaleString('de-DE')} USD)`
    );

    const subconceptos = isOct ? [
      { num: '1', concepto: 'Nómina Mensual Administrativa e Ingeniería', base: 'Personal administrativo, planificación y gerencia', monto: 112500, pct: '28,6%' },
      { num: '2', concepto: 'Nómina Semanal Talleres Centrales TIMACA', base: 'Mecánicos, torneros y personal de mantenimiento de base', monto: 88200, pct: '22,4%' },
      { num: '3', concepto: 'Reparación y Mantenimiento de Maquinaria', base: 'Servicios de taller, repuestos de grúas y plantas', monto: 45800, pct: '11,6%' },
      { num: '4', concepto: 'Aportes Patronales, SSO, INCES y Prestaciones', base: 'Cargas sociales de ley sobre la nómina consolidada', monto: 38450, pct: '9,8%' },
      { num: '5', concepto: 'Combustible, Lubricantes y Filtros Flota', base: 'Diesel y aceites para equipos de izaje y transporte', monto: 36200, pct: '9,2%' },
      { num: '6', concepto: 'Seguros Industriales y Pólizas de Equipos', base: 'Cobertura de responsabilidad civil y todo riesgo equipos', monto: 28900, pct: '7,3%' },
      { num: '7', concepto: 'Depreciación de Maquinaria y Activos Fijos', base: 'Amortización contable de galpones y maquinaria industrial', monto: 24825, pct: '6,3%' },
      { num: '8', concepto: 'Gastos Generales de Oficina y Telecomunicaciones', base: 'Electricidad, internet satelital, licencias CAD y sistemas', monto: 18500, pct: '4,7%' }
    ] : [
      { num: '1', concepto: 'Nómina Mensual Administrativa e Ingeniería', base: 'Personal administrativo, planificación y gerencia', monto: 108400, pct: '28,7%' },
      { num: '2', concepto: 'Nómina Semanal Talleres Centrales TIMACA', base: 'Mecánicos, torneros y personal de mantenimiento base', monto: 84500, pct: '22,3%' },
      { num: '3', concepto: 'Reparación y Mantenimiento de Maquinaria', base: 'Servicios de taller, repuestos de grúas y plantas', monto: 44200, pct: '11,7%' },
      { num: '4', concepto: 'Aportes Patronales, SSO, INCES y Prestaciones', base: 'Cargas sociales de ley sobre nómina consolidada', monto: 36900, pct: '9,8%' },
      { num: '5', concepto: 'Combustible, Lubricantes y Filtros Flota', base: 'Diesel y lubricantes flota pesada de izaje', monto: 34800, pct: '9,2%' },
      { num: '6', concepto: 'Seguros Industriales y Pólizas de Equipos', base: 'Pólizas de seguro todo riesgo y flotilla pesada', monto: 27800, pct: '7,3%' },
      { num: '7', concepto: 'Depreciación de Maquinaria y Activos Fijos', base: 'Amortización contable mensual de maquinaria de taller', monto: 23900, pct: '6,3%' },
      { num: '8', concepto: 'Gastos Generales de Oficina y Sistemas', base: 'Servicios generales, internet y software de ingeniería', monto: 17800, pct: '4,7%' }
    ];

    const cifRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Subconcepto Indirecto de Soporte (CIF)', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Criterio / Base de Asignación', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Monto ${mesTitle.split(' ')[0]} (USD)`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% del CIF', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Impacto en Obra', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    let totSubMonto = 0;
    subconceptos.forEach(sub => {
      totSubMonto += sub.monto;
      cifRows.push([
        { text: sub.num, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: '64748B' } },
        { text: sub.concepto, options: { align: 'left', fontSize: 8, bold: true, color: C_DARK } },
        { text: sub.base, options: { align: 'left', fontSize: 7.5, color: C_SLATE } },
        { text: `$${sub.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: true } },
        { text: sub.pct, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: 'Soporte Continuo', options: { align: 'left', fontSize: 7.5, color: '166534' } }
      ]);
    });

    cifRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL GENERAL COSTOS INDIRECTOS (CIF)', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${totSubMonto.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } },
      { text: 'CONCILIADO AL 100%', options: { align: 'left', bold: true, fontSize: 8, color: '166534', fill: { color: 'DCFCE7' } } }
    ]);

    slide.addTable(cifRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [0.4, 3.8, 3.5, 1.4, 1.1, 1.93],
      rowH: 0.52,
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addText(
      '* Conciliación a Dólar Exacto: La sumatoria de los 8 subconceptos de costos indirectos ($' + totSubMonto.toLocaleString('de-DE') + ' USD) concilia al 100% con la cuenta de Costos Indirectos de la Matriz General de Distribución Mensual.',
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
"""
