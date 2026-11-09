def get_code():
    return """
  // =========================================================================
  // SLIDE 6A: PROYECTO PELLAS LÍNEA 1 (TTE-C-0706) · AVANCE Y BURN-RATE
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const pAcum = pellasMesData.acumulado2026;
    const pTotal = 29720000;
    const pPct = Math.round((pAcum / pTotal) * 1000) / 10;
    const pSaldo = pTotal - pAcum;

    addSlideHeader(
      slide,
      '6A',
      `6A. Proyecto Pellas Línea 1 (TTE-C-0706): Avance Contractual y Burn-Rate (${mesTitle})`,
      `Contrato Insignia TIMACA ($29,72M USD) · Avance acumulado: $${pAcum.toLocaleString('de-DE')} USD (${pPct}% ejecutado)`
    );

    // Top Summary Gauge Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 1.05,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PROGRESO FINANCIERO DEL CONTRATO MARCO ($29.720.000 USD)', {
      x: 0.8,
      y: 1.45,
      w: 6.0,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      `Ejecutado Acumulado: $${pAcum.toLocaleString('de-DE')} USD (${pPct}%) | Saldo por Ejecutar: $${pSaldo.toLocaleString('de-DE')} USD`,
      {
        x: 0.8,
        y: 1.68,
        w: 11.7,
        h: 0.22,
        fontSize: 9.5,
        bold: true,
        color: C_SLATE
      }
    );

    // Visual Progress Bar
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.95,
      w: 11.7,
      h: 0.32,
      fill: { color: 'E2E8F0' },
      line: { color: C_BORDER, width: 0.5 },
      rectRadius: 0.05
    });

    const progressW = Math.max(0.5, (pPct / 100) * 11.7);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.95,
      w: progressW,
      h: 0.32,
      fill: { color: C_NAVY },
      rectRadius: 0.05
    });

    slide.addText(`${pPct}%`, {
      x: 0.8 + progressW - 0.7,
      y: 1.98,
      w: 0.65,
      h: 0.25,
      fontSize: 8.5,
      bold: true,
      color: C_WHITE,
      align: 'right'
    });

    // Middle Left: Burn-Rate Monthly Execution (x: 0.6, y: 2.55, w: 6.8, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.55,
      w: 6.8,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('CURVA DE EJECUCIÓN FINANCIERA MENSUAL (BURN-RATE 2026)', {
      x: 0.8,
      y: 2.68,
      w: 6.4,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: C_NAVY
    });

    const pellasMesesTable: any[][] = [
      [
        { text: 'Mes', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Mes', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Acumulado USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Estado Operativo', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const pCurva = [
      { mes: 'Ene', val: 1837, desc: 'Ingeniería preliminar' },
      { mes: 'Feb', val: 1416, desc: 'Levantamiento topográfico' },
      { mes: 'Mar', val: 684, desc: 'Acondicionamiento taller' },
      { mes: 'Abr', val: 5583, desc: 'Llegada de primeros equipos' },
      { mes: 'May', val: 305565, desc: 'Despliegue cuadrilla 220 trab.' },
      { mes: 'Jun', val: 344115, desc: 'Montaje de refractario' },
      { mes: 'Jul', val: 348507, desc: 'Calderería y tolvas' },
      { mes: 'Ago', val: 596358, desc: 'Rampa de montaje mecánico' },
      { mes: 'Sep', val: 668340, desc: 'Pico histórico operativo' },
      { mes: 'Oct', val: 867861, desc: 'Hito de servicios e instrumentación' }
    ];

    let pRun = 0;
    pCurva.slice(0, selectedMesNum).forEach(pm => {
      pRun += pm.val;
      pellasMesesTable.push([
        { text: pm.mes, options: { align: 'center', fontSize: 8, bold: true, color: C_DARK } },
        { text: `$${pm.val.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', bold: true } },
        { text: `${Math.round((pm.val / pTotal) * 1000) / 10}%`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: `$${pRun.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: '166534' } },
        { text: pm.desc, options: { align: 'left', fontSize: 7.5, color: C_SLATE } }
      ]);
    });

    slide.addTable(pellasMesesTable, {
      x: 0.8,
      y: 3.0,
      w: 6.4,
      colW: [0.7, 1.2, 0.8, 1.3, 2.4],
      rowH: 0.35,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: 3 Strategic Key Metrics Cards (x: 7.65, y: 2.55, w: 5.08, h: 4.25)
    const hitos = [
      {
        title: 'CAPACIDAD INSTALADA Y PROYECCIÓN 2026',
        desc: `El avance acumulado de $${pAcum.toLocaleString('de-DE')} USD (${pPct}% sobre contrato marco) consolida la curva de ejecución. Los frentes de calcinación, tolvas y refractario cumplen con el cronograma crítico.`,
        bg: 'EFF6FF',
        border: '93C5FD',
        titleColor: C_NAVY
      },
      {
        title: 'ESTABILIDAD LABORAL Y CUADRILLAS EN CAMPO',
        desc: `La plantilla promedio se mantiene en 254 trabajadores directos sin accidentes con tiempo perdido. La disponibilidad de módulos de hidratación, comedores y dotaciones EPP garantiza la continuidad de obra.`,
        bg: 'F0FDF4',
        border: '86EFAC',
        titleColor: '166534'
      },
      {
        title: 'CONTROL FINANCIERO Y AUDITORÍA DE VALUACIONES',
        desc: `La conciliación quincenal de valuaciones con la inspección del cliente ha permitido mantener un ciclo de cobranza estable, mitigando desviaciones de flujo de caja y asegurando la procura oportuna.`,
        bg: 'FFFBEB',
        border: 'FDE68A',
        titleColor: '92400E'
      }
    ];

    hitos.forEach((h, idx) => {
      const hY = 2.55 + (idx * 1.44);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 7.65,
        y: hY,
        w: 5.08,
        h: 1.34,
        fill: { color: h.bg },
        line: { color: h.border, width: 1.0 },
        rectRadius: 0.08
      });

      slide.addText(h.title, {
        x: 7.85,
        y: hY + 0.12,
        w: 4.7,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: h.titleColor
      });

      slide.addText(h.desc, {
        x: 7.85,
        y: hY + 0.38,
        w: 4.7,
        h: 0.88,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 6B: PROYECTO PELLAS LÍNEA 1 · FUERZA LABORAL Y OPERACIONES
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '6B',
      `6B. Proyecto Pellas Línea 1 (TTE-C-0706): Fuerza Laboral y Operaciones (${mesTitle})`,
      `Cuadrilla activa de ${pellasMesData.cuadrilla} trabajadores en campo · Nómina devengada: $${pellasMesData.nominaMes.toLocaleString('de-DE')} USD`
    );

    // 4 KPI Cards across top
    const kpisPellas = [
      { label: 'MES OPERATIVO', val: `$${pellasMesData.montoMes.toLocaleString('de-DE')} USD`, note: `${pellasMesData.porcentajeMes}% del total de ${mesTitle.split(' ')[0]}` },
      { label: 'ACUMULADO 2026', val: `$${pellasMesData.acumulado2026.toLocaleString('de-DE')} USD`, note: `${Math.round((pellasMesData.acumulado2026 / 29720000) * 1000) / 10}% sobre contrato marco` },
      { label: 'CUADRILLA EN CAMPO', val: `${pellasMesData.cuadrilla} Trabajadores`, note: 'Promedio activo estabilizado' },
      { label: `NÓMINA ${mesTitle.split(' ')[0].toUpperCase()}`, val: `$${pellasMesData.nominaMes.toLocaleString('de-DE')} USD`, note: 'Fuerza laboral en frentes de obra' }
    ];

    kpisPellas.forEach((kpi, idx) => {
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

    // Two Large Thematic Boxes (Left and Right)
    // Left: Fuerza Laboral y Continuidad Operativa (x: 0.6, y: 2.50, w: 5.95, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 5.95,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('FUERZA LABORAL Y CONTINUIDAD OPERATIVA EN CAMPO', {
      x: 0.8,
      y: 2.65,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      isOct
        ? '• Despliegue de Cuadrillas: Pellas Línea 1 concentró 254 trabajadores directos distribuidos en 5 semanas operativas continuas (Semanas 39 a 43).\\n\\n' +
          '• Especialidades Técnicas: El personal activo incluye soldadores 6G homologados, armadores de calderería pesada, mecánicos montadores y especialistas en revestimiento refractario.\\n\\n' +
          '• Absorción Salarial: La nómina directa devengada en Pellas representa el 55,8% del total de nómina de proyectos externos procesada por TIMACA en el mes.\\n\\n' +
          '• Cumplimiento HSE: Cero incidentes incapacitantes reportados, con cumplimiento del 100% de charlas de seguridad de 5 minutos y dotación de EPP certificado.'
        : '• Despliegue de Cuadrillas: Pellas Línea 1 concentró 254 trabajadores directos distribuidos en 4 semanas operativas regulares (Semanas 36 a 39).\\n\\n' +
          '• Especialidades Técnicas: Cuadrillas altamente capacitadas en alineación micrométrica de transmisiones, montaje de tolvas y soldadura de alta resistencia.\\n\\n' +
          '• Absorción Salarial: La nómina devengada de $133.185 USD representó el 60,2% del total de MOD externa de TIMACA en septiembre.\\n\\n' +
          '• Cumplimiento HSE: Récord operativo sin tiempos perdidos y estricta disciplina en permisos de trabajo en caliente y alturas.',
      {
        x: 0.8,
        y: 2.95,
        w: 5.5,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    // Right: Garantía de Suministro y Despliegue de Talleres (x: 6.78, y: 2.50, w: 5.95, h: 4.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 2.50,
      w: 5.95,
      h: 4.25,
      fill: { color: C_WHITE },
      line: { color: '86EFAC', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('SOPORTE DE TALLERES, FLOTA Y ABSORCIÓN INDIRECTA', {
      x: 6.98,
      y: 2.65,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: '166534'
    });

    slide.addText(
      '• Fabricación Previa en Talleres: La capacidad instalada de talleres TIMACA en Puerto Ordaz ha prefabricado ductos, soportes estructurales y virolas metálicas, reduciendo tiempos de izaje en campo.\\n\\n' +
      '• Soporte de Maquinaria y Grúas: La flota de izaje (grúas telescópicas de 60T a 120T) respalda las maniobras de montaje de componentes de gran tonelaje en el edificio de calcinación.\\n\\n' +
      `• Absorción de Indirectos Corporativos (CIF 60,2%): Por su escala operativa y volumen de horas-hombre, el proyecto absorbe el 60,2% de los costos indirectos corporativos de TIMACA ($${Math.round((categoriasMesAnalisis[4]?.monto || 393375) * 0.602).toLocaleString('de-DE')} USD).\\n\\n` +
      '• Garantía de Calidad: Los ensayos no destructivos (Tintas penetrantes y Ultrasonido) ejecutados en taller y campo garantizan cero rechazos en las uniones soldadas.',
      {
        x: 6.98,
        y: 2.95,
        w: 5.5,
        h: 3.65,
        fontSize: 9,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 6C: PROYECTO PELLAS LÍNEA 1 · MATRIZ OFICIAL DE EVOLUCIÓN MENSUAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '6C',
      `6C. Matriz Oficial de Evolución Mensual: Proyecto Pellas Línea 1 (${mesTitle})`,
      `Desglose financiero consolidado por categoría de costo de Enero a ${mesTitle.split(' ')[0]} 2026 (Valores en USD)`
    );

    // Master Evolution Table matching slide5Tab === 'tabla-evolutivo'
    const pellasMatrixRows: any[][] = [
      [
        { text: 'Categoría / Rubro de Costo', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Ene', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Feb', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Mar', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Abr', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'May', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Jun', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Jul', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Ago', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Sep', options: { bold: true, align: 'right', fill: { color: isOct ? C_NAVY : 'D97706' }, color: C_WHITE, fontSize: 8 } },
        { text: 'Oct', options: { bold: true, align: 'right', fill: { color: isOct ? 'D97706' : C_NAVY }, color: C_WHITE, fontSize: 8 } },
        { text: 'Total 2026', options: { bold: true, align: 'right', fill: { color: '052E16' }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Part.', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } }
      ],
      // Row 1: Materiales Directos
      [
        { text: 'Materiales Directos (Acero, Refractario, Soldadura)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$782', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$9.704', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$38.108', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$50.489', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$71.709', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$173.833', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$89.498', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', bold: isOct } },
        { text: '$434.124', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '13,3%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 2: Servicios Especializados
      [
        { text: 'Servicios Especializados (Yokogawa, Henan Front, Traslados)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$48', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$5.105', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$60.101', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$56.907', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$63.106', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$69.056', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$778.363', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', bold: isOct } },
        { text: '$1.032.686', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '31,7%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 3: Mano de Obra Directa
      [
        { text: 'Mano de Obra Directa (MOD / Cuadrilla en Campo)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$121.093', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$109.550', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$126.977', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$167.193', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$133.185', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: isOct ? 'Pendiente' : '$0', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', italic: isOct, color: isOct ? C_AMBER : '94A3B8' } },
        { text: '$657.998', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '20,2%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 4: Horas Máquina
      [
        { text: 'Horas Máquina (Equipos Propios y Grúas Telescópicas)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$1.837', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$1.416', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$684', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$4.753', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$53.269', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$61.309', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$63.126', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$89.789', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$55.578', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: isOct ? 'Pendiente' : '$0', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', italic: isOct, color: isOct ? C_AMBER : '94A3B8' } },
        { text: '$331.762', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '10,2%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row 5: Costos Indirectos CIF
      [
        { text: 'Costos Indirectos CIF (Absorción Corporativa 60,2%)', options: { fontSize: 8, bold: true, color: C_DARK } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$0', options: { align: 'right', fontSize: 7.5, color: '94A3B8' } },
        { text: '$116.389', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$135.147', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$107.485', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$204.561', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: '$236.688', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
        { text: isOct ? 'Pendiente' : '$0', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', italic: isOct, color: isOct ? C_AMBER : '94A3B8' } },
        { text: '$800.270', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: '166534' } },
        { text: '24,6%', options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', color: C_BLUE } }
      ],
      // Row Total General
      [
        { text: 'TOTAL GENERAL PROYECTO PELLAS LÍNEA 1', options: { fontSize: 8.5, bold: true, color: C_NAVY, fill: { color: 'F1F5F9' } } },
        { text: '$1.837', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$1.416', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$684', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$5.583', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$305.565', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$344.115', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$348.507', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$596.358', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$668.340', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$867.861', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', fill: { color: 'F1F5F9' } } },
        { text: '$3.256.839', options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } },
        { text: '100.0%', options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } }
      ]
    ];

    slide.addTable(pellasMatrixRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [3.43, 0.72, 0.72, 0.72, 0.72, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 1.05, 0.67],
      rowH: 0.65,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Technical note at bottom
    slide.addText(
      '* Conciliación Analítica: Las cifras de Enero a Septiembre reflejan la liquidación contable auditada al 100%. Las partidas marcadas como "Pendiente" en Octubre corresponden a los rubros en proceso de regularización con RRHH (MOD) y Logística de Equipos (Horas Máquina).',
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
