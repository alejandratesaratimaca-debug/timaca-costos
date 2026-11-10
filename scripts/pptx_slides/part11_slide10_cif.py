def get_code():
    return """
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
      { num: '1', concepto: 'Nómina - Talleres Centrales TIMACA', monto: 123000, pct: '35,69%' },
      { num: '2', concepto: 'Nómina Personal TIMACA (Dirección Técnica)', monto: 75000, pct: '21,76%' },
      { num: '3', concepto: 'Sindicato (Aporte y Gestión Gremial)', monto: 59000, pct: '17,12%' },
      { num: '4', concepto: 'Combustible y Lubricantes de Flota', monto: 50000, pct: '14,51%' },
      { num: '5', concepto: 'Otros Servicios Contratados de Administración', monto: 9900, pct: '2,87%' },
      { num: '6', concepto: 'Timbres Fiscales / Notarías / Registros', monto: 7600, pct: '2,21%' },
      { num: '7', concepto: 'Incentivos Laborales (Bonos de Obra)', monto: 7000, pct: '2,03%' },
      { num: '8', concepto: 'Vigilancia Perimetral y Custodia', monto: 4803, pct: '1,39%' },
      { num: '9', concepto: 'Gastos de Viajes y Viáticos Nacionales', monto: 4500, pct: '1,31%' },
      { num: '10', concepto: 'Servicios Públicos e Infraestructura', monto: 2600, pct: '0,75%' },
      { num: '11', concepto: 'Otros Gastos Menores y Financieros', monto: 1226, pct: '0,36%' }
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
      '• Núcleo Operativo (57,5%): Talleres Centrales ($123K) y Dirección Técnica ($75K) proveen pailería, mecanizado y supervisión de ingeniería a todos los contratos.\\n' +
      '• Logística y Bienestar: Sindicato ($59K) y Combustible ($50K) garantizan paz laboral, dotaciones y transporte.',
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
      { rank: '1', proyecto: 'Recuperación Línea 1 Pellas', cta: 'TTE-C-0706', mod: 131190, pct: '50,90%', cif: 175409.81 },
      { rank: '2', proyecto: 'Segunda Línea PMH', cta: 'TTE-C-0671', mod: 79030, pct: '30,66%', cif: 105668.40 },
      { rank: '3', proyecto: 'Fase 2 Planta Briquetas', cta: 'TTE-C-0668', mod: 23925, pct: '9,28%', cif: 31989.33 },
      { rank: '4', proyecto: 'Mantenimiento Boca Grande II', cta: 'TTE-C-0680', mod: 13685, pct: '5,31%', cif: 18297.76 },
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
      '• Cuadre Exacto al Céntimo ($0,00 descuadre): Los $314.913,80 USD se absorben 100% en las 18 cuentas auxiliares, asignando costo a los 7 proyectos con fuerza laboral directa.\\n' +
      '• Concentración en Ejes Clave: Pellas Línea 1 ($160.285 USD · 50,9%) y Segunda Línea PMH ($96.557 USD · 30,7%) absorben el 81,6% de la bolsa indirecta.\\n' +
      '• Soporte Documental: Conciliado contra el archivo oficial "3 Analisis Costos Indirectos.xlsx" (Hoja 2, Q5:V16).',
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
"""
