def get_code():
    return """
  // =========================================================================
  // SLIDE 5A: VARIACIONES EN PROYECTOS PRINCIPALES (DIVERGENTE)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '5A',
      `5A. Variaciones Mensuales en Proyectos Principales (${mesTitle})`,
      `Dinámica de obras en campo: Proyectos en aceleración vs desaceleración (${isOct ? 'Octubre vs Septiembre 2026' : 'Septiembre vs Agosto 2026'})`
    );

    const variaciones = datosMesInforme.variaciones || [];
    const acelerados = variaciones.filter(v => v.delta > 0);
    const desacelerados = variaciones.filter(v => v.delta < 0);

    // Left Column: Divergent Variation Matrix (x: 0.6, w: 7.6, y: 1.35)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 7.6,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('MATRIZ DE VARIACIONES MENSUALES Y JUSTIFICACIÓN TÉCNICA', {
      x: 0.8,
      y: 1.48,
      w: 7.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const varRows: any[][] = [
      [
        { text: 'Cuenta', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Proyecto / Frente', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Mes Ant.', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Mes Act.', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Delta ($)', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Var %', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Causa Operativa', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    variaciones.slice(0, 8).forEach(v => {
      const isPos = v.delta >= 0;
      varRows.push([
        { text: v.cta, options: { align: 'left', fontSize: 8, bold: true, fontFace: 'Consolas', color: C_DARK } },
        { text: v.name.length > 22 ? v.name.substring(0, 20) + '...' : v.name, options: { align: 'left', fontSize: 8 } },
        { text: `$${Math.round(v.montoPrev / 1000)}K`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: '64748B' } },
        { text: `$${Math.round(v.montoMes / 1000)}K`, options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas' } },
        {
          text: `${isPos ? '+' : ''}$${Math.round(v.delta)}K`,
          options: {
            align: 'right',
            fontSize: 8,
            bold: true,
            fontFace: 'Consolas',
            color: isPos ? '166534' : '991B1B'
          }
        },
        {
          text: v.pct,
          options: {
            align: 'center',
            fontSize: 8,
            bold: true,
            fontFace: 'Consolas',
            fill: { color: isPos ? 'DCFCE7' : 'FEE2E2' },
            color: isPos ? '166534' : '991B1B'
          }
        },
        { text: v.why.length > 32 ? v.why.substring(0, 30) + '...' : v.why, options: { align: 'left', fontSize: 7.5, color: C_SLATE } }
      ]);
    });

    slide.addTable(varRows, {
      x: 0.8,
      y: 1.82,
      w: 7.2,
      colW: [0.9, 1.8, 0.7, 0.7, 0.8, 0.7, 1.6],
      rowH: 0.45,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: Summary Analysis Boxes (x: 8.4, w: 4.33, y: 1.35)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.4,
      y: 1.35,
      w: 4.33,
      h: 2.65,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PROYECTOS EN ACELERACIÓN (MAYOR INVERSIÓN)', {
      x: 8.6,
      y: 1.48,
      w: 3.9,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: '166534'
    });

    slide.addText(
      acelerados.length > 0
        ? acelerados.map(a => `• ${a.name} (${a.cta}): +$${Math.round(a.delta)}K USD (${a.pct})\\n  ${a.why}`).join('\\n\\n')
        : '• No se registran aceleraciones atípicas en el período evaluado.',
      {
        x: 8.6,
        y: 1.78,
        w: 3.9,
        h: 2.1,
        fontSize: 8.5,
        color: '14532D'
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.4,
      y: 4.15,
      w: 4.33,
      h: 2.65,
      fill: { color: 'FFFBEB' },
      line: { color: 'FDE68A', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('PROYECTOS EN CIERRE O DESACELERACIÓN', {
      x: 8.6,
      y: 4.28,
      w: 3.9,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: '92400E'
    });

    slide.addText(
      desacelerados.length > 0
        ? desacelerados.slice(0, 3).map(d => `• ${d.name} (${d.cta}): ${Math.round(d.delta)}K USD (${d.pct})\\n  ${d.why}`).join('\\n\\n')
        : '• Cierres controlados de acuerdo con la programación contractual.',
      {
        x: 8.6,
        y: 4.58,
        w: 3.9,
        h: 2.1,
        fontSize: 8.5,
        color: '78350F'
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 5B: MIX DE PROCURA DE MATERIALES DIRECTOS POR SECTOR
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    const matTotal = categoriasMesAnalisis[0]?.monto || 524340;
    addSlideHeader(
      slide,
      '5B',
      `5B. Mix de Procura de Materiales Directos por Sector (${mesTitle})`,
      `Composición de compras e insumos directos de almacén ($${Math.round(matTotal).toLocaleString('de-DE')} USD · 50,3% del gasto total)`
    );

    // Top Summary Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 0.70,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('COMPOSICIÓN DE PROCURA Y MATERIALES DIRECTOS POR ESPECIALIDAD INDUSTRIAL', {
      x: 0.8,
      y: 1.42,
      w: 9.0,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      `El 50,1% de los materiales directos se concentra en Acero Estructural y Materiales Eléctricos para los frentes de Pellas Línea 1, PMH y DRAVO.`,
      {
        x: 0.8,
        y: 1.66,
        w: 9.0,
        h: 0.30,
        fontSize: 9.5,
        color: C_SLATE
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 10.0,
      y: 1.42,
      w: 2.5,
      h: 0.55,
      fill: { color: 'DBEAFE' },
      line: { color: '3B82F6', width: 1.0 },
      rectRadius: 0.06
    });

    slide.addText(`TOTAL: $${Math.round(matTotal).toLocaleString('de-DE')} USD`, {
      x: 10.1,
      y: 1.55,
      w: 2.3,
      h: 0.30,
      fontSize: 10,
      bold: true,
      color: '1E40AF',
      align: 'center'
    });

    // 5 Sector Cards horizontally (x: 0.6, w: 2.27 each, gap: 0.19)
    const sectors = [
      {
        rubro: 'Materiales Eléctricos',
        monto: 154000,
        pct: '29,4%',
        desc: 'Cables de potencia, bandejas portacables, transformadores y canalizaciones DRAVO.',
        borderTop: '3B82F6',
        bg: 'EFF6FF'
      },
      {
        rubro: 'Acero Estructural',
        monto: 108700,
        pct: '20,7%',
        desc: 'Planchas ASTM A36, perfiles IPN/UPN y vigas soldadas para Segunda Línea PMH.',
        borderTop: '10B981',
        bg: 'ECFDF5'
      },
      {
        rubro: 'Mecánico / Fluidos',
        monto: 97600,
        pct: '18,6%',
        desc: 'Válvulas de alta presión, actuadores neumáticos, mangueras y sellos Briquetas.',
        borderTop: '8B5CF6',
        bg: 'F5F3FF'
      },
      {
        rubro: 'Soldadura y Gases',
        monto: 78400,
        pct: '15,0%',
        desc: 'Electrodos E7018, argón líquido, alambre tubular AWS y fundentes en talleres.',
        borderTop: 'F97316',
        bg: 'FFF7ED'
      },
      {
        rubro: 'Misceláneos Calderería',
        monto: 85640,
        pct: '16,3%',
        desc: 'Tornillería Grado 8 pavonada, discos abrasivos, pernos de anclaje y consumibles.',
        borderTop: '64748B',
        bg: 'F8FAFC'
      }
    ];

    sectors.forEach((sec, idx) => {
      const cardX = 0.6 + (idx * 2.47);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX,
        y: 2.25,
        w: 2.27,
        h: 3.1,
        fill: { color: sec.bg },
        line: { color: sec.borderTop, width: 1.5 },
        rectRadius: 0.08
      });

      slide.addText(sec.rubro.toUpperCase(), {
        x: cardX + 0.12,
        y: 2.38,
        w: 2.03,
        h: 0.35,
        fontSize: 9.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(`$${sec.monto.toLocaleString('de-DE')} USD`, {
        x: cardX + 0.12,
        y: 2.78,
        w: 2.03,
        h: 0.35,
        fontSize: 15,
        bold: true,
        fontFace: 'Consolas',
        color: C_NAVY
      });

      slide.addText(`Participación: ${sec.pct}`, {
        x: cardX + 0.12,
        y: 3.18,
        w: 2.03,
        h: 0.22,
        fontSize: 9,
        bold: true,
        color: C_BLUE
      });

      slide.addText(sec.desc, {
        x: cardX + 0.12,
        y: 3.48,
        w: 2.03,
        h: 1.75,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    // Bottom Strategy Insight Box (x: 0.6, y: 5.55, w: 12.13, h: 1.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 5.55,
      w: 12.13,
      h: 1.25,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('ESTRATEGIA DE PROCURA Y LOGÍSTICA TIMACA · CONTROL DE GESTIÓN', {
      x: 0.8,
      y: 5.68,
      w: 11.7,
      h: 0.22,
      fontSize: 10,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Concentración Estratégica: El 50,1% del volumen de materiales entre sector Eléctrico ($154K) y Acero Estructural ($108,7K) responde directamente a los hitos de entrega electromecánica para Ferrominera y Briquetera.\\n' +
      '• Optimización Logística: Los convenios marco con proveedores nacionales para entrega directa en talleres de Puerto Ordaz han mitigado costos de flete internacional y almacenamiento prolongado.\\n' +
      '• Control de Calidad: El 100% de los despachos cuenta con certificados de colada (Mill Test Certificates) y control de trazabilidad en almacén central antes de su liberación a campo.',
      {
        x: 0.8,
        y: 5.92,
        w: 11.7,
        h: 0.78,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }
"""
