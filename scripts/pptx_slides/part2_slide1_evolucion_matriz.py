def get_code():
    return """
  // =========================================================================
  // SLIDE 1A: DISTRIBUCIÓN MENSUAL (CONSOLIDADO 2026) · GRÁFICA EVOLUTIVA ANUAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '1A',
      '1A. Distribución Mensual (Consolidado 2026) · Gráfica Evolutiva Anual',
      'Evolución histórica Ene-Oct 2026 · Total 10 Meses: $14.753.270 USD'
    );

    // Native Bar Chart of Monthly Totals
    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    const monthValues = TOTALES_MESES_PPT.map(m => m.total);
    const chartData = [
      {
        name: 'Gasto Mensual Consolidado (USD)',
        labels: monthLabels,
        values: monthValues
      }
    ];

    slide.addChart(pptx.ChartType.bar, chartData, {
      x: 0.6,
      y: 1.30,
      w: 12.13,
      h: 2.95,
      chartColors: [C_NAVY],
      showLegend: false,
      dataLabelColor: '000000',
      dataLabelPosition: 'outEnd',
      dataLabelFormatCode: '$#,##0',
      valAxisLabelFormatCode: '$#,##0',
      showValue: true,
      barGapWidthPct: 40
    });

    // 3 Strategic Callout Cards below chart
    const insights1A = isOct ? [
      {
        title: 'Materiales Directos ($476.866 USD · 33,0%)',
        desc: 'Procura sostenida de aceros, planchas antidesgaste, tuberías y suministros directos en taller y campo, acumulando un total anual consolidado de $4.444.281 USD en 2026.'
      },
      {
        title: 'Servicios Especializados ($967.479 USD · 67,0%)',
        desc: 'Salto presupuestario (+872% vs septiembre) por la inyección estratégica en servicios de ingeniería, instrumentación y control en Pellas Línea 1 con Yokogawa ($686K) y Henan Front ($40K).'
      },
      {
        title: 'Total Proyectos Externos ($1.428.905 USD)',
        desc: `Ejecución auditada al centavo en ${cuentasAuxiliaresMes.length} frentes de proyectos externos activos (TTE-C). Cierre oficial de compras con Pellas Línea 1, Segunda Línea PMH y Rueda DRAVO como frentes de mayor inversión.`
      }
    ] : [
      {
        title: 'Materiales Directos ($3.967.416 USD · 32,9%)',
        desc: 'Mayor rubro acumulado del año. En septiembre alcanzó su récord mensual de $868.067 USD (+133,4% vs agosto) por la procura mayor de perfiles estructurales A36, tolvas, planchas antiabrasivas Hardox 450/500 y componentes mecánicos para Segunda Línea PMH, DRAVO y Pellas Línea 1.'
      },
      {
        title: 'Servicios Directos ($2.904.145 USD · 24,1%)',
        desc: 'Concentra el hito extraordinario de junio ($1.639.332 USD · 56,4% del rubro anual) por fletes marítimos internacionales, desaduanamiento y maniobras fluviales para el desembarque de módulos pesados. En septiembre totaliza $99.540 USD (-15,6% vs agosto), con un 69,4% concentrado en Pellas Línea 1 ($69.056 USD) para logística y custodia.'
      },
      {
        title: 'Mano de Obra Directa ($2.218.229 USD · 18,4%)',
        desc: 'Fuerza laboral en 10 proyectos externos con cuadrilla activa. En septiembre cerró en $196.665 USD (-29,2% vs agosto al computar 4 semanas regulares de 55.277 HH @ $3,56 USD/HH sin pasivos laborales), liderada por Pellas Línea 1 ($128.161 USD · 65,2%) y Segunda Línea PMH ($30.305 USD · 15,4%).'
      }
    ];

    insights1A.forEach((ins, idx) => {
      const xPos = 0.6 + (idx * 4.1);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.45,
        w: 3.93,
        h: 2.35,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.1
      });

      slide.addText(ins.title, {
        x: xPos + 0.15,
        y: 4.60,
        w: 3.63,
        h: 0.35,
        fontSize: 11.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(ins.desc, {
        x: xPos + 0.15,
        y: 5.00,
        w: 3.63,
        h: 1.65,
        fontSize: 10,
        color: C_SLATE,
        lineSpacingMultiple: 1.2
      });
    });

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 1B: DISTRIBUCIÓN MENSUAL POR CATEGORÍA DE COSTO · MATRIZ OFICIAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '1B',
      '1B. Distribución Mensual por Categoría de Costo (Consolidado 2026)',
      'Evolución histórica Ene-Oct 2026 · Total 10 Meses: $14.753.270 USD'
    );

    // Native Table (13.333" width)
    const shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
    const varHeader = selectedMesNum > 1 ? `Var. % (${shortMonths[selectedMesNum - 1]} vs ${shortMonths[selectedMesNum - 2]})` : 'Var. %';
    const headers = ['Categoría', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Total 2026', varHeader];
    const tableRows: any[][] = [];

    tableRows.push(
      headers.map((h, i) => ({
        text: h,
        options: {
          bold: true,
          color: C_WHITE,
          fill: { color: i === selectedMesNum ? C_AMBER : C_DARK },
          align: i === 0 ? 'left' : 'right',
          fontSize: 8.5
        }
      }))
    );

    TABLA_PPT_DISTRIBUCION_2026.forEach((row) => {
      const cells: any[] = [
        { text: row.categoria, options: { bold: true, fontSize: 10.0, color: C_DARK, align: 'left' } }
      ];
      row.meses.forEach((val, mIdx) => {
        const isSelected = mIdx === (selectedMesNum - 1);
        cells.push({
          text: val.toLocaleString('de-DE'),
          options: {
            fontSize: 9.0,
            color: isSelected ? C_NAVY : C_SLATE,
            bold: isSelected,
            fill: isSelected ? { color: 'FEF3C7' } : undefined,
            align: 'right'
          }
        });
      });
      cells.push({
        text: row.total2026.toLocaleString('de-DE'),
        options: { bold: true, fontSize: 9.0, color: C_DARK, fill: { color: 'F1F5F9' }, align: 'right' }
      });

      const mIdx = Math.max(0, Math.min(row.meses.length - 1, selectedMesNum - 1));
      const prevIdx = mIdx > 0 ? mIdx - 1 : null;
      const valActivo = row.meses[mIdx] || 0;
      const valAnterior = prevIdx !== null ? (row.meses[prevIdx] || 0) : null;
      let varText = '-';
      let esPositiva = false;

      if (valAnterior !== null && valAnterior > 0) {
        if (row.categoria.toLowerCase().includes('máquina') && valActivo === 0) {
          varText = '0,0%';
        } else {
          const diff = valActivo - valAnterior;
          const varPct = Math.round((diff / valAnterior) * 1000) / 10;
          esPositiva = varPct > 0;
          varText = (varPct > 0 ? '+' : '') + varPct.toFixed(1).replace('.', ',') + '%';
        }
      } else if (valAnterior !== null && valAnterior === 0 && valActivo > 0) {
        varText = '+100%';
        esPositiva = true;
      } else if (valAnterior !== null && valAnterior === 0 && valActivo === 0) {
        varText = '0,0%';
      }

      cells.push({
        text: varText,
        options: {
          bold: true,
          fontSize: 9.0,
          color: esPositiva ? C_EMERALD : 'B45309',
          align: 'center'
        }
      });
      tableRows.push(cells);
    });

    // Total Row
    const totalCells: any[] = [
      { text: 'TOTAL MENSUAL (USD)', options: { bold: true, fontSize: 9.5, color: C_WHITE, fill: { color: C_NAVY }, align: 'left' } }
    ];
    TOTALES_MESES_PPT.forEach((tm, mIdx) => {
      const isSelected = mIdx === (selectedMesNum - 1);
      totalCells.push({
        text: tm.total.toLocaleString('de-DE'),
        options: {
          bold: true,
          fontSize: 9.5,
          color: isSelected ? 'FCD34D' : C_WHITE,
          fill: { color: isSelected ? '1E3A8A' : C_NAVY },
          align: 'right'
        }
      });
    });
    const grandTotal2026 = TOTALES_MESES_PPT.reduce((a, b) => a + b.total, 0);
    totalCells.push({
      text: Math.round(grandTotal2026).toLocaleString('de-DE'),
      options: { bold: true, fontSize: 9.5, color: C_WHITE, fill: { color: '0F172A' }, align: 'right' }
    });

    const mIdx = Math.max(0, Math.min(TOTALES_MESES_PPT.length - 1, selectedMesNum - 1));
    const prevIdx = mIdx > 0 ? mIdx - 1 : null;
    const totActivo = TOTALES_MESES_PPT[mIdx]?.total || 0;
    const totAnterior = prevIdx !== null ? (TOTALES_MESES_PPT[prevIdx]?.total || 0) : null;
    let totVarText = '-';
    let totPositiva = false;

    if (totAnterior !== null && totAnterior > 0) {
      const totDiff = totActivo - totAnterior;
      const totPct = Math.round((totDiff / totAnterior) * 1000) / 10;
      totPositiva = totPct > 0;
      totVarText = (totPct > 0 ? '+' : '') + totPct.toFixed(1).replace('.', ',') + '%';
    }

    totalCells.push({
      text: totVarText,
      options: { bold: true, fontSize: 9.5, color: totPositiva ? '34D399' : 'FCD34D', fill: { color: '0F172A' }, align: 'center' }
    });
    tableRows.push(totalCells);

    slide.addTable(tableRows, {
      x: 0.6,
      y: 1.35,
      w: 12.13,
      colW: [2.13, 0.76, 0.76, 0.76, 0.76, 0.76, 0.76, 0.76, 0.76, 0.82, 0.85, 1.15, 0.95],
      border: { pt: 0.5, color: C_BORDER }
    });

    // 3 Strategic Callout Cards
    const insights1B = isOct ? [
      {
        title: 'Materiales Directos ($476.866 USD · 33,0%)',
        desc: 'Procura sostenida de aceros, planchas antidesgaste, tuberías y suministros directos en taller y campo, acumulando un total anual consolidado de $4.444.281 USD en 2026.'
      },
      {
        title: 'Servicios Especializados ($967.479 USD · 67,0%)',
        desc: 'Salto presupuestario (+872% vs septiembre) por la inyección estratégica en servicios de ingeniería, instrumentación y control en Pellas Línea 1 con Yokogawa ($686K) y Henan Front ($40K).'
      },
      {
        title: 'Total Proyectos Externos ($1.428.905 USD)',
        desc: `Ejecución auditada al centavo en ${cuentasAuxiliaresMes.length} frentes de proyectos externos activos (TTE-C). Cierre oficial de compras con Pellas Línea 1, Segunda Línea PMH y Rueda DRAVO como frentes de mayor inversión.`
      }
    ] : [
      {
        title: 'Materiales Directos ($3.967.416 USD · 32,9%)',
        desc: 'Mayor rubro acumulado del año. En septiembre alcanzó su récord mensual de $868.067 USD (+133,4% vs agosto) por la procura mayor de perfiles estructurales A36, tolvas, planchas antiabrasivas Hardox 450/500 y componentes mecánicos para Segunda Línea PMH, DRAVO y Pellas Línea 1.'
      },
      {
        title: 'Servicios Directos ($2.904.145 USD · 24,1%)',
        desc: 'Concentra el hito extraordinario de junio ($1.639.332 USD · 56,4% del rubro anual) por fletes marítimos internacionales, desaduanamiento y maniobras fluviales para el desembarque de módulos pesados. En septiembre totaliza $99.540 USD (-15,6% vs agosto), con un 69,4% concentrado en Pellas Línea 1 ($69.056 USD) para logística y custodia.'
      },
      {
        title: 'Mano de Obra Directa ($2.218.229 USD · 18,4%)',
        desc: 'Fuerza laboral en 10 proyectos externos con cuadrilla activa. En septiembre cerró en $196.665 USD (-29,2% vs agosto al computar 4 semanas regulares de 55.277 HH @ $3,56 USD/HH sin pasivos laborales), liderada por Pellas Línea 1 ($128.161 USD · 65,2%) y Segunda Línea PMH ($30.305 USD · 15,4%).'
      }
    ];

    insights1B.forEach((ins, idx) => {
      const xPos = 0.6 + (idx * 4.1);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 4.45,
        w: 3.93,
        h: 2.35,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.1
      });

      slide.addText(ins.title, {
        x: xPos + 0.15,
        y: 4.60,
        w: 3.63,
        h: 0.35,
        fontSize: 11.5,
        bold: true,
        color: C_DARK
      });

      slide.addText(ins.desc, {
        x: xPos + 0.15,
        y: 5.00,
        w: 3.63,
        h: 1.65,
        fontSize: 10,
        color: C_SLATE,
        lineSpacingMultiple: 1.2
      });
    });

    addSlideFooter(slide);
  }
"""
