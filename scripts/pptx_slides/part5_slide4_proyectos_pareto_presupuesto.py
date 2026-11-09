def get_code():
    return """
  // =========================================================================
  // SLIDE 4A: TOTAL PROYECTOS EXTERNOS · DISTRIBUCIÓN PARETO 80/20
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '4A',
      `4A. Total Proyectos Externos: Curva Pareto 80/20 y Concentración (${mesTitle})`,
      `Regla 80/20: Concentración de inversión en los frentes operacionales más intensivos de TIMACA`
    );

    const totalMesCuentas = cuentasAuxiliaresMes.reduce((acc, curr) => acc + curr.total, 0) || totalMes || 1;
    const top4Total = cuentasAuxiliaresMes.slice(0, 4).reduce((acc, curr) => acc + curr.total, 0);
    const top4Pct = Math.round((top4Total / totalMesCuentas) * 1000) / 10;

    // Top Summary Banner
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      h: 0.75,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('RANKING PARETO TOP PROYECTOS EXTERNOS · CONCENTRACIÓN OPERATIVA Y FINANCIERA', {
      x: 0.8,
      y: 1.42,
      w: 8.5,
      h: 0.22,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      `El análisis de Pareto evidencia que los primeros 4 proyectos concentran el ${top4Pct}% del desembolso total del mes ($${Math.round(top4Total).toLocaleString('de-DE')} USD de $${Math.round(totalMesCuentas).toLocaleString('de-DE')} USD).`,
      {
        x: 0.8,
        y: 1.66,
        w: 8.5,
        h: 0.35,
        fontSize: 9.5,
        color: C_SLATE
      }
    );

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.5,
      y: 1.43,
      w: 3.0,
      h: 0.58,
      fill: { color: 'FEF3C7' },
      line: { color: 'F59E0B', width: 1.0 },
      rectRadius: 0.06
    });

    slide.addText(`TOP 4 PROYECTOS = ${top4Pct}%`, {
      x: 9.6,
      y: 1.50,
      w: 2.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '92400E',
      align: 'center'
    });
    slide.addText('Concentración Estratégica', {
      x: 9.6,
      y: 1.72,
      w: 2.8,
      h: 0.20,
      fontSize: 8.5,
      color: 'B45309',
      align: 'center'
    });

    // Left Column: Top 7 Pareto Ranking Table / Cards (x: 0.6, w: 7.2, y: 2.25)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.25,
      w: 7.2,
      h: 4.55,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('TOP 7 PROYECTOS EXTERNOS POR VOLUMEN DE INVERSIÓN', {
      x: 0.8,
      y: 2.38,
      w: 6.8,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const paretoRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: 'Cuenta', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: 'Proyecto / Frente Operativo', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: 'Monto USD', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: '% Mes', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } },
        { text: '% Acum.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 9 } }
      ]
    ];

    let runningSum = 0;
    const top7 = cuentasAuxiliaresMes.slice(0, 7);
    top7.forEach((it, idx) => {
      runningSum += it.total;
      const singlePct = Math.round((it.total / totalMesCuentas) * 1000) / 10;
      const accumPct = Math.round((runningSum / totalMesCuentas) * 1000) / 10;
      const isUnder80 = accumPct <= 82;

      paretoRows.push([
        { text: `${idx + 1}`, options: { align: 'center', fontSize: 8.5, bold: true, color: idx < 3 ? C_AMBER : C_SLATE } },
        { text: it.codigo, options: { align: 'left', fontSize: 8.5, bold: true, fontFace: 'Consolas', color: C_DARK } },
        { text: it.proyecto.length > 34 ? it.proyecto.substring(0, 32) + '...' : it.proyecto, options: { align: 'left', fontSize: 8 } },
        { text: `$${Math.round(it.total).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8.5, bold: true, fontFace: 'Consolas' } },
        { text: `${singlePct}%`, options: { align: 'right', fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE } },
        {
          text: `${accumPct}%`,
          options: {
            align: 'center',
            fontSize: 8.5,
            bold: true,
            fontFace: 'Consolas',
            color: isUnder80 ? '1E40AF' : '475569',
            fill: { color: isUnder80 ? 'DBEAFE' : 'F1F5F9' }
          }
        }
      ]);
    });

    slide.addTable(paretoRows, {
      x: 0.8,
      y: 2.70,
      w: 6.8,
      colW: [0.4, 1.1, 2.6, 1.1, 0.7, 0.9],
      rowH: 0.44,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Right Column: 3 Pareto Strategic Insights Cards (x: 8.05, w: 4.68, y: 2.25)
    const paretoInsights = [
      {
        title: '1. MÁXIMA CONCENTRACIÓN OPERATIVA (80%)',
        desc: `Pellas Línea 1, PMH Segunda Línea y DRAVO PA-9020 absorben la mayor parte del flujo financiero del mes. El control de rendimientos, horas grúa y cubicaciones debe focalizarse diariamente en estos 3 frentes.`,
        bg: 'EFF6FF',
        border: '93C5FD',
        titleColor: C_NAVY
      },
      {
        title: '2. FRENTES COMPLEMENTARIOS Y SECUNDARIOS (20%)',
        desc: `Los frentes de Briquetas, Bandas Transportadoras y Silos operan con presupuestos menores pero críticos para la cadena productiva. Se verifica que sus requisiciones mantengan justificación técnica estricta.`,
        bg: 'F0FDF4',
        border: '86EFAC',
        titleColor: '166534'
      },
      {
        title: '3. DISCIPLINA DE CIERRE Y FINIQUITO',
        desc: `Se requiere certificar oportunamente los hitos de entrega en proyectos que alcanzan el 95%+ de su ejecución presupuestaria para liberar fondos de garantía y evitar desvíos administrativos.`,
        bg: 'FFFBEB',
        border: 'FDE68A',
        titleColor: '92400E'
      }
    ];

    paretoInsights.forEach((card, idx) => {
      const cardY = 2.25 + (idx * 1.54);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.05,
        y: cardY,
        w: 4.68,
        h: 1.44,
        fill: { color: card.bg },
        line: { color: card.border, width: 1.0 },
        rectRadius: 0.08
      });

      slide.addText(card.title, {
        x: 8.25,
        y: cardY + 0.12,
        w: 4.3,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: card.titleColor
      });

      slide.addText(card.desc, {
        x: 8.25,
        y: cardY + 0.38,
        w: 4.3,
        h: 0.95,
        fontSize: 8.5,
        color: C_SLATE
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 4B: TOTAL PROYECTOS EXTERNOS · MATRIZ DE CUENTAS & PRESUPUESTO
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '4B',
      `4B. Matriz Oficial de Cuentas Auxiliares y Control Presupuestario (${mesTitle})`,
      `Consolidado oficial de ${cuentasAuxiliaresMes.length} Cuentas Auxiliares Activas · Monitoreo de desvíos y alertas presupuestarias`
    );

    // Full Table of Cuentas Auxiliares
    const totalMesCuentas = cuentasAuxiliaresMes.reduce((acc, curr) => acc + curr.total, 0) || totalMes || 1;
    let totalPresupuestoConsolidado = 0;

    const cuentasRows: any[][] = [
      [
        { text: '#', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Cuenta Auxiliar', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Proyecto Externo (Cliente / Obra)', options: { bold: true, align: 'left', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: `Monto ${mesTitle.split(' ')[0]} (USD)`, options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Mes', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Presupuesto (USD)', options: { bold: true, align: 'right', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: '% Uso Presup.', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } },
        { text: 'Estado Control', options: { bold: true, align: 'center', fill: { color: C_NAVY }, color: C_WHITE, fontSize: 8.5 } }
      ]
    ];

    cuentasAuxiliaresMes.forEach((c, idx) => {
      const pctMes = Math.round((c.total / totalMesCuentas) * 1000) / 10;
      const m = c.metricas;
      const tieneP = m?.tienePresupuesto;
      const pMonto = tieneP ? m.totalPresupuesto : 0;
      if (tieneP) totalPresupuestoConsolidado += pMonto;
      const pUso = tieneP ? m.porcentajeUso : 0;
      const alerta = m?.estadoAlerta || 'normal';

      let alertaLabel = 'Normal';
      let alertaBg = 'DCFCE7';
      let alertaColor = '166534';
      if (!tieneP) {
        alertaLabel = 'S/P';
        alertaBg = 'F1F5F9';
        alertaColor = '64748B';
      } else if (alerta === 'critico' || alerta === 'excedido') {
        alertaLabel = 'Crítico';
        alertaBg = 'FEE2E2';
        alertaColor = '991B1B';
      } else if (alerta === 'alerta') {
        alertaLabel = 'Alerta';
        alertaBg = 'FEF3C7';
        alertaColor = '92400E';
      }

      cuentasRows.push([
        { text: `${idx + 1}`, options: { align: 'center', fontSize: 8, color: '64748B' } },
        { text: c.codigo, options: { align: 'left', fontSize: 8, bold: true, fontFace: 'Consolas', color: C_DARK } },
        { text: c.proyecto.length > 38 ? c.proyecto.substring(0, 36) + '...' : c.proyecto, options: { align: 'left', fontSize: 8 } },
        { text: `$${Math.round(c.total).toLocaleString('de-DE')}`, options: { align: 'right', fontSize: 8, bold: true, fontFace: 'Consolas' } },
        { text: `${pctMes}%`, options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: C_BLUE } },
        { text: tieneP ? `$${Math.round(pMonto).toLocaleString('de-DE')}` : '-', options: { align: 'right', fontSize: 8, fontFace: 'Consolas', color: tieneP ? C_DARK : '94A3B8' } },
        { text: tieneP ? `${pUso}%` : '-', options: { align: 'center', fontSize: 8, bold: tieneP, fontFace: 'Consolas', color: tieneP ? C_DARK : '94A3B8' } },
        { text: alertaLabel, options: { align: 'center', fontSize: 7.5, bold: true, fill: { color: alertaBg }, color: alertaColor } }
      ]);
    });

    // Total General Row
    const globalUso = totalPresupuestoConsolidado > 0 ? Math.round((totalMesCuentas / totalPresupuestoConsolidado) * 1000) / 10 : 0;
    cuentasRows.push([
      { text: '', options: { fill: { color: 'F1F5F9' } } },
      { text: 'TOTAL GENERAL', options: { colspan: 2, bold: true, fontSize: 8.5, color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `$${Math.round(totalMesCuentas).toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: '100.0%', options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_BLUE, fill: { color: 'F1F5F9' } } },
      { text: `$${Math.round(totalPresupuestoConsolidado).toLocaleString('de-DE')}`, options: { align: 'right', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_NAVY, fill: { color: 'F1F5F9' } } },
      { text: `${globalUso}%`, options: { align: 'center', bold: true, fontSize: 8.5, fontFace: 'Consolas', color: C_DARK, fill: { color: 'F1F5F9' } } },
      { text: 'CONSOLIDADO', options: { align: 'center', bold: true, fontSize: 8, fill: { color: 'DBEAFE' }, color: '1E40AF' } }
    ]);

    slide.addTable(cuentasRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [0.4, 1.3, 3.8, 1.4, 0.9, 1.5, 1.2, 1.63],
      rowH: 0.36,
      border: { pt: 0.5, color: C_BORDER }
    });

    // Footnote
    slide.addText(
      `* Nota de Control Presupuestario: S/P = Cuenta sin presupuesto formal asignado en matriz inicial. Alerta = Ejecución > 80% del presupuesto. Crítico = Ejecución > 100% (requiere addendum contractual).`,
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
