def get_code():
    return """
  // =========================================================================
  // SLIDE 7A: PROYECTO PELLAS LÍNEA 1 · SERVICIOS ESPECIALIZADOS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const servData = datosMesInforme.servicios;
    addSlideHeader(
      slide,
      '7A',
      `7A. Proyecto Pellas Línea 1: Servicios Directos y Especializados (${mesTitle})`,
      servData.subtitulo || `Desglose oficial de servicios especializados en frentes de obra y campamento`
    );

    // Left Column: 3 Strategic Impulsores Cards (x: 0.6, y: 1.35, w: 5.6, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 5.6,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PRINCIPALES IMPULSORES DE SERVICIOS EN EL MES', {
      x: 0.8,
      y: 1.48,
      w: 5.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const impulsores = servData.principalesImpulsores || [];
    impulsores.forEach((imp, idx) => {
      const impY = 1.82 + (idx * 1.55);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: impY,
        w: 5.2,
        h: 1.42,
        fill: { color: idx === 0 ? 'EFF6FF' : (idx === 1 ? 'F0FDF4' : 'FFFBEB') },
        line: { color: idx === 0 ? '93C5FD' : (idx === 1 ? '86EFAC' : 'FDE68A'), width: 1.0 },
        rectRadius: 0.06
      });

      slide.addText(imp.titulo, {
        x: 0.95,
        y: impY + 0.12,
        w: 4.9,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: idx === 0 ? C_NAVY : (idx === 1 ? '166534' : '92400E')
      });

      slide.addText(imp.descripcion, {
        x: 0.95,
        y: impY + 0.38,
        w: 4.9,
        h: 0.95,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    // Right Column: Matrix Breakdown of Specialized Services (x: 6.45, y: 1.35, w: 6.28, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.45,
      y: 1.35,
      w: 6.28,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('DESGLOSE DE CONTRATOS Y ASISTENCIA TÉCNICA (USD)', {
      x: 6.65,
      y: 1.48,
      w: 5.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const servRows: any[][] = [
      [
        { text: 'Rubro / Contratista Especializado', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Especialidad Operativa', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Monto (${mesTitle.split(' ')[0]})`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Part.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    const servDetail = isOct ? [
      { name: 'Yokogawa América do Sul', spec: 'Automatización y Sistemas DCS', monto: 686040, pct: '88,1%' },
      { name: 'Henan Front', spec: 'Asistencia Técnica Calcinación', monto: 40000, pct: '5,1%' },
      { name: 'Logística de Cuadrillas', spec: 'Traslado Terrestre 254 trab.', monto: 38600, pct: '5,0%' },
      { name: 'Vigilancia Patrimonial', spec: 'Custodia 24/7 Frentes de Obra', monto: 13723, pct: '1,8%' }
    ] : [
      { name: 'Traslado de Personal', spec: 'Transporte Cuadrillas 254 trab.', monto: 45878, pct: '66,4%' },
      { name: 'Vigilancia Patrimonial', spec: 'Custodia 24/7 Áreas de Obra', monto: 13182, pct: '19,1%' },
      { name: 'Alquiler de Módulos y Baños', spec: 'Infraestructura de Campamento', monto: 8400, pct: '12,2%' },
      { name: 'Servicios Técnicos Menores', spec: 'Certificaciones y Calibraciones', monto: 1596, pct: '2,3%' }
    ];

    let sumServ = 0;
    servDetail.forEach(sd => {
      sumServ += sd.monto;
      servRows.push([
        { text: sd.name, options: { align: 'left', fontSize: 8.5, bold: true, color: C_DARK } },
        { text: sd.spec, options: { align: 'left', fontSize: 8, color: C_SLATE } },
        { text: `$${sd.monto.toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas' } },
        { text: sd.pct, options: { align: 'center', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: C_BLUE } }
      ]);
    });

    servRows.push([
      { text: 'TOTAL SERVICIOS DEL MES', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${sumServ.toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } }
    ]);

    slide.addTable(servRows, {
      x: 6.65,
      y: 1.82,
      w: 5.88,
      colW: [2.3, 1.9, 1.0, 0.68],
      rowH: 0.48,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Technical note at bottom of right column
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.65,
      y: 4.85,
      w: 5.88,
      h: 1.75,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 0.5 },
      rectRadius: 0.06
    });

    slide.addText('DICTAMEN DE AUDITORÍA DE CONTRATOS Y SERVICIOS', {
      x: 6.8,
      y: 4.98,
      w: 5.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      isOct
        ? '• Hito Contractual Yokogawa: El registro de $686.040 USD corresponde al hito de procura e ingeniería del sistema de control distribuido (DCS), validado por la gerencia técnica.\\n' +
          '• Soporte Internacional Henan Front: Facturación por supervisión en frío de hornos de calcinación según cronograma acordado.\\n' +
          '• Continuidad Logística: Los servicios recurrentes de traslado y custodia se liquidan al día sin reclamos de proveedores.'
        : '• Eficiencia en Movilidad: El costo de transporte ($45.878 USD) representa $180,6 USD por trabajador al mes, garantizando 100% de asistencia.\\n' +
          '• Seguridad de Activos: El servicio de vigilancia ha prevenido pérdidas de materiales en áreas de almacenamiento abierto.\\n' +
          '• Saneamiento y Campamentos: Los módulos portátiles cumplen con las normativas sanitarias y estándares laborales.',
      {
        x: 6.8,
        y: 5.22,
        w: 5.5,
        h: 1.3,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 7B: PROYECTO PELLAS LÍNEA 1 · HORAS MÁQUINA Y FLOTA PESADA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const hmData = datosMesInforme.horasMaquina;
    addSlideHeader(
      slide,
      '7B',
      `7B. Proyecto Pellas Línea 1: Horas Máquina y Flota de Izaje (${mesTitle})`,
      hmData.subtituloLámina || `Auditoría y conciliación de maquinaria pesada propia y grúas telescópicas`
    );

    if (hmData.estado === 'retraso') {
      // Alert Box for October (Retraso en Horómetros)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 1.35,
        w: 12.13,
        h: 5.45,
        fill: { color: 'FFFBEB' },
        line: { color: 'F59E0B', width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText('ESTADO DE AUDITORÍA OPERATIVA: HORAS MÁQUINA EN CONCILIACIÓN TÉCNICA', {
        x: 1.0,
        y: 1.60,
        w: 11.3,
        h: 0.30,
        fontSize: 13,
        bold: true,
        color: '92400E',
        align: 'center'
      });

      slide.addText(
        hmData.mensajeAlerta ||
        'Se registra retraso en la recepción de partes de horómetros de maquinaria pesada y grúas de obra. El rubro figura preliminarmente en $0,00 USD en la matriz analítica de costos a la espera de la entrega técnica formal por parte de los supervisores de campo.',
        {
          x: 1.5,
          y: 2.05,
          w: 10.3,
          h: 0.70,
          fontSize: 10.5,
          color: '78350F',
          align: 'center'
        }
      );

      // 2 KPI cards inside alert
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 3.2,
        y: 2.95,
        w: 3.2,
        h: 1.1,
        fill: { color: C_WHITE },
        line: { color: 'FDE68A', width: 1.0 },
        rectRadius: 0.08
      });
      slide.addText('HORAS COMPUTADAS', { x: 3.4, y: 3.05, w: 2.8, h: 0.20, fontSize: 9.5, bold: true, color: '64748B' });
      slide.addText('0,0 H/M', { x: 3.4, y: 3.28, w: 2.8, h: 0.35, fontSize: 18, bold: true, color: C_DARK });
      slide.addText('Partes de horómetros en proceso', { x: 3.4, y: 3.65, w: 2.8, h: 0.22, fontSize: 8.5, color: C_AMBER });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.9,
        y: 2.95,
        w: 3.2,
        h: 1.1,
        fill: { color: C_WHITE },
        line: { color: 'FDE68A', width: 1.0 },
        rectRadius: 0.08
      });
      slide.addText('COSTO IMPUTADO PRELIMINAR', { x: 7.1, y: 3.05, w: 2.8, h: 0.20, fontSize: 9.5, bold: true, color: '64748B' });
      slide.addText('$0,00 USD', { x: 7.1, y: 3.28, w: 2.8, h: 0.35, fontSize: 18, bold: true, color: C_DARK });
      slide.addText('Pendiente regularización contable', { x: 7.1, y: 3.65, w: 2.8, h: 0.22, fontSize: 8.5, color: C_AMBER });

      // Protocol & Action Items
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 2.0,
        y: 4.35,
        w: 9.3,
        h: 2.1,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1.0 },
        rectRadius: 0.08
      });

      slide.addText('PROTOCOLO DE REGULARIZACIÓN Y ACCIÓN DE AUDITORÍA', {
        x: 2.2,
        y: 4.50,
        w: 8.9,
        h: 0.22,
        fontSize: 10.5,
        bold: true,
        color: C_NAVY
      });

      slide.addText(
        '1. Requerimiento Formal: Se ha cursado solicitud formal a la jefatura de equipos pesados para la remisión de los reportes diarios de horómetros correspondientes a las semanas 39 a 43.\\n' +
        '2. Trazabilidad de Combustible: Como validación cruzada, el consumo de combustible diesel registrado en almacén central confirma que la flota estuvo operativa al 100%.\\n' +
        '3. Ajuste en Cierre Definitivo: El costo devengado se computará en la conciliación del próximo corte mensual sin impacto patrimonial negativo para el proyecto.',
        {
          x: 2.2,
          y: 4.78,
          w: 8.9,
          h: 1.5,
          fontSize: 9,
          color: C_SLATE
        }
      );
    } else {
      // Table of 16 Equipos for September / Available months
      const tablaHM = hmData.tablaEquipos || [];
      const totH = hmData.totalHoras || 811.7;
      const totC = hmData.totalCosto || 55578;

      const hmRows: any[][] = [
        [
          { text: 'Cuenta-Aux', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Código', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Equipo / Maquinaria Pesada', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Tarifa USD/h', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Total H/M', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8 } },
          { text: 'Costo Total USD', options: { bold: true, align: 'right', fill: { color: '052E16' }, color: C_WHITE, fontSize: 8 } }
        ]
      ];

      tablaHM.forEach(eq => {
        const isGR20 = eq.codigo === 'GR20';
        const costVal = eq.costoTotalHM ?? eq.costoTotal ?? 0;
        hmRows.push([
          { text: eq.cuentaAux, options: { align: 'left', fontSize: 7.5, fontFace: 'Consolas', color: '64748B' } },
          { text: eq.codigo, options: { align: 'center', fontSize: 7.5, bold: true, fontFace: 'Consolas', color: isGR20 ? C_AMBER : C_BLUE } },
          { text: eq.equipo, options: { align: 'left', fontSize: 7.5, bold: isGR20 } },
          { text: `$${eq.tarifa}`, options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas' } },
          { text: `${eq.totalHM}`, options: { align: 'right', fontSize: 7.5, fontFace: 'Consolas', bold: true } },
          { text: `$${Math.round(costVal).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 7.5, bold: true, fontFace: 'Consolas', color: isGR20 ? '92400E' : C_DARK } }
        ]);
      });

      // Total Row
      hmRows.push([
        { text: 'TOTAL FLOTA PESADA Y EQUIPOS', options: { colspan: 4, bold: true, fontSize: 8, color: C_NAVY, fill: { color: 'F1F5F9' } } },
        { text: `${totH.toLocaleString('de-DE')} H/M`, options: { align: 'right', bold: true, fontSize: 8, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
        { text: `$${Math.round(totC).toLocaleString('de-DE')} USD`, options: { align: 'right', bold: true, fontSize: 8, fontFace: 'Consolas', color: '166534', fill: { color: 'DCFCE7' } } }
      ]);

      slide.addTable(hmRows, {
        x: 0.6,
        y: 1.35,
        w: 12.13,
        colW: [1.6, 1.1, 4.83, 1.4, 1.4, 1.8],
        rowH: 0.28,
        border: { pt: 0.5, color: C_BORDER }
      });

      slide.addText(
        '* La Grúa Telescópica Link-Belt 60T (GR20) concentró el 58,4% del costo de horas máquina del proyecto, siendo indispensable en los izajes pesados del edificio de molienda y calcinación.',
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
    }

    addSlideFooter(slide);
  }
"""
