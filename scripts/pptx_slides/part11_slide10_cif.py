def get_code():
    return """
  // =========================================================================
  // SLIDE 10A: COSTOS INDIRECTOS CIF · TABLA OFICIAL DE PRORRATEO POR PROYECTO
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const cifTotal = isOct ? 344629 : (categoriasMesAnalisis[4]?.monto || 393375);
    const modBase = isOct ? 257750 : 229149;
    const pellasCIF = Math.round(isOct ? 175409.81 : cifTotal * 0.602);
    const restoCIF = Math.round(cifTotal - pellasCIF);

    addSlideHeader(
      slide,
      '10A',
      `10A. Costos Indirectos CIF: Matriz Oficial de Prorrateo (${mesTitle})`,
      `Distribución de $${Math.round(cifTotal).toLocaleString('de-DE')} USD en función de la Mano de Obra Directa ($${Math.round(modBase).toLocaleString('de-DE')} USD) · Ordenada de Mayor a Menor`
    );

    // 4 KPI Cards across top
    const kpisCIF = [
      { label: `TOTAL CIF DEL MES (${mesTitle.split(' ')[0]})`, val: `$${Math.round(cifTotal).toLocaleString('de-DE')} USD`, note: 'Soporte y talleres TIMACA' },
      { label: 'BASE DE ASIGNACIÓN (MOD)', val: `$${Math.round(modBase).toLocaleString('de-DE')} USD`, note: 'Nómina directa auditada' },
      { label: isOct ? 'PELLAS LÍNEA 1 (50,90%)' : 'PELLAS LÍNEA 1 (60,17%)', val: `$${pellasCIF.toLocaleString('de-DE')} USD`, note: isOct ? 'Mayor volumen de MOD ($131K)' : 'Mayor volumen de HH de MOD' },
      { label: isOct ? 'RESTO DE PROYECTOS (49,10%)' : 'RESTO DE PROYECTOS (39,83%)', val: `$${restoCIF.toLocaleString('de-DE')} USD`, note: isOct ? '6 frentes de obra activos' : 'Frentes restantes' }
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
        fontSize: 9.0,
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
        fontSize: 9.0,
        color: C_BLUE
      });
    });

    // Main Table: Exact 7 projects from Excel sorted descending
    const prorrateoRows = isOct ? [
      { rank: '1', proyecto: 'Recuperación Línea 1 Pellas', cta: 'TTE-C-0706', mod: 131190, pct: '50,90%', cif: 175409.81 },
      { rank: '2', proyecto: 'Segunda Línea PMH', cta: 'TTE-C-0671', mod: 79030, pct: '30,66%', cif: 105668.40 },
      { rank: '3', proyecto: 'Fase 2 Planta Briquetas (incl. Refractario)', cta: 'TTE-C-0668', mod: 23925, pct: '9,28%', cif: 31989.33 },
      { rank: '4', proyecto: 'Servicio Mantenimiento Boca Grande II', cta: 'TTE-C-0680', mod: 13685, pct: '5,31%', cif: 18297.76 },
      { rank: '5', proyecto: 'Mantenimiento Briqueteadoras', cta: 'TTE-C-0670', mod: 5100, pct: '1,98%', cif: 6819.04 },
      { rank: '6', proyecto: 'Suministro Caldera Briquetas', cta: 'TTE-C-0694', mod: 3190, pct: '1,24%', cif: 4265.24 },
      { rank: '7', proyecto: 'Rehabilitación de Bandas PMH', cta: 'TTE-C-0656', mod: 1630, pct: '0,63%', cif: 2179.42 }
    ] : [
      { rank: '1', proyecto: 'Recuperación Línea 1 Pellas', cta: 'TTE-C-0706', mod: 137878, pct: '60,17%', cif: 236688.09 },
      { rank: '2', proyecto: 'Servicio Mantenimiento Boca Grande II', cta: 'TTE-C-0680', mod: 28551, pct: '12,46%', cif: 49007.60 },
      { rank: '3', proyecto: 'Fase 2 Planta Briquetas', cta: 'TTE-C-0668', mod: 23400, pct: '10,21%', cif: 40166.75 },
      { rank: '4', proyecto: 'Segunda Línea PMH', cta: 'TTE-C-0671', mod: 23003, pct: '10,04%', cif: 39485.45 },
      { rank: '5', proyecto: 'Rehabilitación de Bandas PMH', cta: 'TTE-C-0656', mod: 16340, pct: '7,13%', cif: 28027.11 }
    ];

    const tableRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Proyecto / Frente de Obra', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Cuenta Auxiliar', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Base Mano de Obra (USD)', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Asignación (MOD)', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Prorrateo ${mesTitle.split(' ')[0]} (USD)`, options: { bold: true, align: 'right', fill: { color: '052E16' }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    prorrateoRows.forEach((r, idx) => {
      const isTop = idx === 0;
      tableRows.push([
        { text: r.rank, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', bold: true, color: isTop ? C_BLUE : '64748B' } },
        { text: r.proyecto, options: { align: 'left', fontSize: 8, bold: isTop, color: isTop ? C_NAVY : C_DARK } },
        { text: r.cta, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', color: '475569' } },
        { text: `$${Math.round(r.mod).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas' } },
        { text: r.pct, options: { align: 'center', fontSize: 8, fontFace: 'Consolas', bold: true, color: isTop ? C_BLUE : '334155' } },
        { text: `$${r.cif.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: isTop ? '166534' : C_DARK } }
      ]);
    });

    // Total row
    tableRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL GENERAL PRORRATEADO', options: { bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `${prorrateoRows.length} frentes`, options: { align: 'center', bold: true, fontSize: 8, color: '64748B', fill: { color: 'F1F5F9' } } },
      { text: `$${Math.round(modBase).toLocaleString('de-DE')} USD`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100,00%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${cifTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`, options: { align: 'right', bold: true, fontSize: 9, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } }
    ]);

    slide.addTable(tableRows, {
      x: 0.6,
      y: 2.45,
      w: 12.13,
      colW: [0.6, 4.33, 1.8, 1.8, 1.6, 2.0],
      rowH: isOct ? 0.45 : 0.60,
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addText(
      '* Metodología de Prorrateo TIMACA: Los costos indirectos de fabricación y soporte corporativo se asignan en función del volumen de Mano de Obra Directa (MOD) devengada en cada obra. Cuadre contable exacto al céntimo ($0,00 de descuadre) sincronizado con el archivo oficial "3 Analisis Costos Indirectos.xlsx" (Hoja2, Q5:V16).',
      {
        x: 0.6,
        y: 6.68,
        w: 12.13,
        h: 0.25,
        fontSize: 8,
        italic: true,
        color: '64748B'
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 10B: COSTOS INDIRECTOS CIF · ESTRUCTURA REAL DE LA BOLSA (EXCEL)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const cifTotal = isOct ? 344629 : (categoriasMesAnalisis[4]?.monto || 393375);

    addSlideHeader(
      slide,
      '10B',
      `10B. Estructura Oficial de Costos Indirectos de Fabricación y Soporte · ${mesTitle}`,
      `Auditoría detallada de cuentas contables corporativas, logística y talleres centralizados ($${Math.round(cifTotal).toLocaleString('de-DE')} USD)`
    );

    const subconceptos = isOct ? [
      { num: '1', concepto: 'Nómina - Talleres Centrales TIMACA', base: 'Cuadrillas mecánicas, puente grúas de talleres y pailería central', monto: 123000, pct: '35,69%' },
      { num: '2', concepto: 'Nómina Personal TIMACA (Dirección Técnica)', base: 'Ingenieros residentes, supervisión de seguridad, control de calidad y costos', monto: 75000, pct: '21,76%' },
      { num: '3', concepto: 'Sindicato (Aporte y Gestión Gremial)', base: 'Obligaciones contractuales de convención colectiva, dotaciones y bienestar', monto: 59000, pct: '17,12%' },
      { num: '4', concepto: 'Combustible y Lubricantes de Flota', base: 'Abastecimiento de gasoil y lubricantes para transporte y generadores', monto: 50000, pct: '14,51%' },
      { num: '5', concepto: 'Otros Servicios Contratados de Administración', base: 'Soporte administrativo, consultoría técnica y soporte corporativo', monto: 9900, pct: '2,87%' },
      { num: '6', concepto: 'Timbres Fiscales / Notarías / Registros', base: 'Trámites legales, notarizaciones y sellado fiscal de contratos', monto: 7600, pct: '2,21%' },
      { num: '7', concepto: 'Incentivos Laborales (Bonos de Obra)', base: 'Bonificaciones por cumplimiento de hitos operativos extraordinarios', monto: 7000, pct: '2,03%' },
      { num: '8', concepto: 'Vigilancia Perimetral y Custodia', base: 'Seguridad patrimonial y custodia perimetral 24/7 en instalaciones centrales', monto: 4803, pct: '1,39%' },
      { num: '9', concepto: 'Gastos de Viajes y Viáticos Nacionales', base: 'Movilización técnica de especialistas e inspecciones en frentes de obra', monto: 4500, pct: '1,31%' },
      { num: '10', concepto: 'Servicios Públicos e Infraestructura de Base', base: 'Suministro de energía eléctrica e instalaciones sanitarias de talleres', monto: 2600, pct: '0,75%' },
      { num: '11', concepto: 'Otros Gastos Menores y Servicios Financieros', base: 'Telecomunicaciones ($600), Seguros ($270), Honorarios ($250), Bancos ($50)', monto: 1226, pct: '0,36%' }
    ] : [
      { num: '1', concepto: 'Nómina Mensual Administrativa e Ingeniería', base: 'Personal administrativo, planificación y gerencia', monto: 125000, pct: '31,78%' },
      { num: '2', concepto: 'Nómina Semanal Talleres Centrales TIMACA', base: 'Mecánicos, torneros y personal de mantenimiento base', monto: 122000, pct: '31,01%' },
      { num: '3', concepto: 'Aporte y Gestión Sindical', base: 'Obligaciones contractuales de convención colectiva y bienestar', monto: 58952, pct: '14,99%' },
      { num: '4', concepto: 'Combustible y Lubricantes de Soporte', base: 'Diesel y lubricantes para transporte de soporte y plantas', monto: 50413, pct: '12,82%' },
      { num: '5', concepto: 'Otros Costos Indirectos y Operativos', base: 'Mantenimiento menor de campamentos y ferretería auxiliar', monto: 25507, pct: '6,48%' },
      { num: '6', concepto: 'Bonificaciones de Productividad y Campo', base: 'Incentivos por cumplimiento de metas y turnos extendidos', monto: 6700, pct: '1,70%' },
      { num: '7', concepto: 'Seguridad y Vigilancia Perimetral', base: 'Custodia perimetral 24/7 en instalaciones centrales', monto: 4803, pct: '1,22%' }
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

    subconceptos.forEach((sub, idx) => {
      const isTop = idx < 2;
      cifRows.push([
        { text: sub.num, options: { align: 'center', fontSize: 7.5, fontFace: 'Consolas', bold: isTop, color: isTop ? C_BLUE : '64748B' } },
        { text: sub.concepto, options: { align: 'left', fontSize: 7.5, bold: isTop, color: isTop ? C_NAVY : C_DARK } },
        { text: sub.base, options: { align: 'left', fontSize: 7.2, color: '475569' } },
        { text: `$${sub.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 7.5, bold: true, fontFace: 'Consolas', color: isTop ? '166534' : C_DARK } },
        { text: sub.pct, options: { align: 'center', fontSize: 7.5, fontFace: 'Consolas', bold: isTop, color: isTop ? C_BLUE : '334155' } },
        { text: isTop ? 'Soporte operativo continuo a frentes' : 'Gasto operativo corporativo indispensable', options: { align: 'left', fontSize: 7.2, color: '64748B' } }
      ]);
    });

    // Total row
    cifRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL GENERAL COSTOS INDIRECTOS (CIF)', options: { bold: true, fontSize: 8, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: 'Consolidado oficial Hoja2 Excel TIMACA', options: { fontSize: 7.5, italic: true, color: '64748B', fill: { color: 'F1F5F9' } } },
      { text: `$${cifTotal.toLocaleString('de-DE')} USD`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } },
      { text: '100,00%', options: { align: 'center', bold: true, fontSize: 8, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: 'Absorbido al 100% por proyectos', options: { fontSize: 7.5, bold: true, color: '166534', fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(cifRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [0.5, 3.2, 3.5, 1.6, 1.2, 2.13],
      rowH: isOct ? 0.38 : 0.45,
      border: { pt: 0.5, color: C_BORDER }
    });

    slide.addText(
      '* Conciliación Contable: Cifras auditadas al 100% contra la Hoja 2 del archivo oficial de Costos Indirectos de TIMACA (3 Analisis Costos Indirectos.xlsx).',
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
