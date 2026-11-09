def get_code():
    return """
  // =========================================================================
  // SLIDE 3: AUDITORÍA Y DESGLOSE DE MANO DE OBRA DIRECTA (NÓMINA)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '3',
      isOct
        ? '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Octubre 2026)'
        : '3. Auditoría y Desglose de Mano de Obra Directa (Nómina Septiembre 2026)',
      isOct
        ? 'Total Nómina Octubre Devengada: $235.066 USD · 64.585 HH · Cuadrillas en Pellas, PMH y Briquetas (BG II en retraso)'
        : 'Total Nómina Septiembre: $196.665 USD · 55.277 Horas-Hombre · Cuadrilla Activa en 10 Proyectos Externos'
    );

    // 4 KPI Cards
    const modCards = isOct
      ? [
          { label: 'TOTAL NÓMINA DIRECTA OCT', val: '$235.066 USD', note: 'Semanas 39 a 43 · Devengo procesado' },
          { label: 'VOLUMEN DE HORAS-HOMBRE', val: '64.585 HH', note: 'Promedio 12.917 HH/semana en campo' },
          { label: 'TARIFA PROMEDIO EFECTIVA', val: '$3,64 USD/HH', note: 'Costo integral de mano de obra' },
          { label: 'FRENTES CON CUADRILLA', val: '5 Frentes Devengados', note: '55,8% Pellas · Boca Grande pendiente' }
        ]
      : [
          { label: 'TOTAL NÓMINA DIRECTA SEP', val: '$196.665 USD', note: 'Semanas 36 a 39 · 4 cortes regulares de nómina' },
          { label: 'VOLUMEN DE HORAS-HOMBRE', val: '55.277 HH', note: 'Promedio 13.819 HH/semana en campo' },
          { label: 'TARIFA PROMEDIO EFECTIVA', val: '$3,56 USD/HH', note: 'Costo integral de mano de obra en obra' },
          { label: 'FRENTES CON CUADRILLA', val: '10 Proyectos', note: '65,2% concentrado en Pellas Línea 1' }
        ];

    modCards.forEach((c, idx) => {
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

      slide.addText(c.label, {
        x: xPos + 0.12,
        y: 1.42,
        w: 2.68,
        h: 0.18,
        fontSize: 9.5,
        bold: true,
        color: '64748B'
      });

      slide.addText(c.val, {
        x: xPos + 0.12,
        y: 1.60,
        w: 2.68,
        h: 0.35,
        fontSize: 16,
        bold: true,
        color: C_DARK
      });

      slide.addText(c.note, {
        x: xPos + 0.12,
        y: 1.95,
        w: 2.68,
        h: 0.25,
        fontSize: 9.5,
        color: C_BLUE
      });
    });

    // Left Box: Explicación del Corte Contable
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 2.50,
      w: 5.6,
      h: 4.25,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.1
    });

    slide.addText('CRITERIO DE CORTE CONTABLE Y AUDITORÍA DE NÓMINA', {
      x: 0.8,
      y: 2.65,
      w: 5.2,
      h: 0.25,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      isOct
        ? '• Ciclo Operativo de Nómina Directa (Octubre 2026):\\n' +
          '  La nómina procesada incorpora 4 cortes semanales regulares (Semanas 40 a 43) en los frentes de Planta de Pellas Línea 1, FMO PMH y Planta de Briquetas.\\n\\n' +
          '• Alerta de Control: Nómina Boca Grande II (TTE-C-0680):\\n' +
          '  Se registra retraso en la entrega de la nómina de cuadrilla de Boca Grande II por parte de Recursos Humanos; actualmente la cuenta solo refleja $5.772,32 USD en insumos de almacén SIP. Se incluirá en la consolidación final tras recibir el soporte de RRHH.\\n\\n' +
          '• Alerta de Maquinaria: Horas Máquina en Conciliación:\\n' +
          '  El renglón de Horas Máquina registra retraso en los partes de horómetros de grúas y flota pesada, figurando preliminarmente en $0,00 USD.'
        : '• Ciclo Operativo de Nómina Directa:\\n' +
          '  La nómina imputada a Septiembre totaliza 4 cortes semanales de pago del período contable (Semanas 36 a 39 de Recursos Humanos):\\n' +
          '    - Semana 36 (Corte 05/09): $54.804 USD (15.433 HH)\\n' +
          '    - Semana 37 (Corte 12/09): $54.173 USD (15.216 HH)\\n' +
          '    - Semana 38 (Corte 19/09): $53.833 USD (15.091 HH)\\n' +
          '    - Semana 39 (Cierre mensual): $33.855 USD (9.537 HH)\\n' +
          '  *Nota operativa Semana 39: El menor volumen de horas (-38%) obedece a la culminación del montaje de virolas en Pellas Línea 1 y al repliegue programado de cuadrillas de montaje previo al cierre del mes.\\n\\n' +
          '• Conciliación Contable de Nómina:\\n' +
          '  La sumatoria de los 4 cortes regulares totaliza $196.665 USD y 55.277 HH, cuadrando con los registros de nómina directa de los libros mayores corporativos ($196.665 USD).\\n\\n' +
          '• Matriz Corporativa de Distribución CIF:\\n' +
          '  La distribución de la nómina directa ($196.665 USD) y el despliegue de personal en campo sustentan la asignación de costos indirectos bajo la Matriz Corporativa de Distribución CIF (Pellas Línea 1 60,17% = $236.688 USD / Resto 39,83% = $156.687 USD).',
      {
        x: 0.8,
        y: 2.95,
        w: 5.2,
        h: 3.70,
        fontSize: 9.0,
        color: '1E3A8A',
        lineSpacingMultiple: 1.14
      }
    );

    // Right Box: Tabla de Nómina por Proyecto
    const modTableRows: any[][] = [
      [
        { text: 'Cuenta', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: 'Proyecto / Frente de Obra', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: 'Monto (USD)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: 'Horas (HH)', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.0, margin: [2, 3, 2, 3] } },
        { text: '% MOD', options: { bold: true, color: C_WHITE, fill: { color: C_DARK }, align: 'right', fontSize: 9.0, margin: [2, 3, 2, 3] } }
      ]
    ];

    const activeNominaProjects = isOct ? DESGLOSE_NOMINA_OCTUBRE_PROYECTOS : DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS;

    activeNominaProjects.forEach((p: any) => {
      modTableRows.push([
        { text: p.cta, options: { bold: true, fontSize: 8.8, color: C_DARK, margin: [2, 3, 2, 3] } },
        { text: p.retraso ? `${p.proyecto} (RETRASO RRHH)` : p.proyecto, options: { fontSize: 8.8, color: p.retraso ? 'DC2626' : C_SLATE, margin: [2, 3, 2, 3] } },
        { text: `$${p.monto.toLocaleString('de-DE')}`, options: { bold: true, align: 'right', fontSize: 8.8, color: C_NAVY, margin: [2, 3, 2, 3] } },
        { text: p.hh.toLocaleString('de-DE'), options: { align: 'right', fontSize: 8.8, color: '64748B', margin: [2, 3, 2, 3] } },
        { text: `${p.pct.toFixed(1).replace('.', ',')}%`, options: { align: 'right', fontSize: 8.8, color: C_DARK, bold: true, margin: [2, 3, 2, 3] } }
      ]);
    });

    modTableRows.push([
      { text: 'TOTAL', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, margin: [2, 3, 2, 3] } },
      { text: isOct ? 'NÓMINA OCTUBRE (DEVENGADA)' : '10 PROYECTOS EXTERNOS ACTIVOS', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, margin: [2, 3, 2, 3] } },
      { text: isOct ? '$235.066 USD' : '$196.665 USD', options: { bold: true, fontSize: 9.0, color: 'FCD34D', fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } },
      { text: isOct ? '64.585 HH' : '55.277 HH', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } },
      { text: '100,0%', options: { bold: true, fontSize: 9.0, color: C_WHITE, fill: { color: C_NAVY }, align: 'right', margin: [2, 3, 2, 3] } }
    ]);

    slide.addTable(modTableRows, {
      x: 6.4,
      y: 2.50,
      w: 6.33,
      colW: [1.2, 2.73, 1.0, 0.8, 0.6],
      border: { pt: 0.5, color: C_BORDER }
    });

    addSlideFooter(slide);
  }
"""
