def get_code():
    return """
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
      `• ${dPmh.punto1Titulo}\\n${dPmh.punto1Texto}\\n\\n` +
      `• ${dPmh.punto2Titulo}\\n${dPmh.punto2Texto}\\n\\n` +
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
      '• Eje Portuario Ferrominera: La red PMH comprende la infraestructura crítica para el embarque marítimo y fluvial de mineral de hierro hacia el mercado internacional.\\n\\n' +
      '• Correas y Transferencias: El mantenimiento y repotenciación simultánea de los frentes de bandas y Segunda Línea minimiza tiempos muertos y paradas de cargador de barcos.\\n\\n' +
      '• Optimización de Cuadrillas: Equipos de montaje multidisciplinarios rotan entre frentes de acuerdo a las ventanas de operación naval, maximizando la productividad de la mano de obra.\\n\\n' +
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
"""
