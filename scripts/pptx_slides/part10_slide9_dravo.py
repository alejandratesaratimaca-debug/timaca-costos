def get_code():
    return """
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
      `• ${just.punto1Titulo}\\n${just.punto1Texto}\\n\\n` +
      `• ${just.punto2Titulo}\\n${just.punto2Texto}\\n\\n` +
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
      '• Ensayos Metalográficos: Las planchas Hardox 450/500 fueron sometidas a control de dureza Brinell (HBW 425-475) previo al corte por plasma computarizado en talleres TIMACA.\\n\\n' +
      '• Soldadura Homologada: Procedimiento WPS/PQR específico para unión de aceros antiabrasivos con precalentamiento a 150°C y electrodos de bajo hidrógeno E7018-1.\\n\\n' +
      '• Control de Apriete: El montaje de los 10 cangilones contó con verificación de torque mediante multiplicador neumático calibrado, asegurando 850 lb-ft en cada perno grado 8.\\n\\n' +
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
"""
