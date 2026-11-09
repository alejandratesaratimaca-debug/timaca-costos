def get_code():
    return """
  // =========================================================================
  // SLIDE 0: PORTADA OFICIAL EJECUTIVA (IDÉNTICA A LA VISTA WEB)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Outer card container with clean slate border
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 0.4,
      w: 12.333,
      h: 6.7,
      fill: { color: 'FFFFFF' },
      line: { color: C_BORDER, width: 1.2 },
      rectRadius: 0.12
    });

    // Brand section
    const getAssetPath = (assetUrl: string) => {
      if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}${assetUrl}`;
      }
      return `./public${assetUrl.startsWith('/') ? assetUrl : '/' + assetUrl}`;
    };
    try {
      slide.addImage({
        path: getAssetPath('/timaca-logo.png'),
        x: 0.8,
        y: 0.65,
        w: 1.8,
        h: 0.55,
        altText: 'Logotipo Corporativo TIMACA'
      });
    } catch (e) {}

    slide.addText('TIMACA · MODELO ESTRELLA', {
      x: 2.7,
      y: 0.65,
      w: 5.5,
      h: 0.25,
      fontSize: 13,
      bold: true,
      color: C_NAVY
    });

    slide.addText('Taller Industrial Metalúrgico Antonio C.A.', {
      x: 2.7,
      y: 0.90,
      w: 5.5,
      h: 0.22,
      fontSize: 11,
      color: '64748B'
    });

    // Pill Badge on Right
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.8,
      y: 0.65,
      w: 2.7,
      h: 0.42,
      fill: { color: 'F1F5F9' },
      line: { color: C_BORDER, width: 0.8 },
      rectRadius: 0.2
    });

    slide.addText('Presentación Ejecutiva Oficial', {
      x: 9.8,
      y: 0.73,
      w: 2.7,
      h: 0.26,
      fontSize: 11,
      bold: true,
      color: C_NAVY,
      align: 'center'
    });

    // Divider line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.30,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    // Period Chip
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.66,
      y: 1.45,
      w: 4.0,
      h: 0.35,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText(`PERÍODO OPERATIVO: ${mesUpper}`, {
      x: 4.66,
      y: 1.50,
      w: 4.0,
      h: 0.25,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY,
      align: 'center'
    });

    // Main Title
    slide.addText('INFORME GESTIÓN DE COSTOS', {
      x: 0.8,
      y: 1.88,
      w: 11.733,
      h: 0.55,
      fontSize: 34,
      bold: true,
      color: '0F172A',
      align: 'center'
    });

    // Subtitle
    slide.addText('Modelo de Gestión y Control Integral de Proyectos Externos · TIMACA 2026', {
      x: 0.8,
      y: 2.45,
      w: 11.733,
      h: 0.35,
      fontSize: 14,
      color: '475569',
      align: 'center'
    });

    // 3 Executive Cards
    const kpiCards = [
      {
        tag: `GASTO TOTAL ${mesUpper}`,
        val: `$${Math.round(datosMesInforme.totalMonto).toLocaleString('de-DE')} USD`,
        desc: `${datosMesInforme.variacionTotalPct > 0 ? '+' : ''}${datosMesInforme.variacionTotalPct}% vs ${datosMesInforme.mesAnteriorLabel?.split(' ')[0] || 'mes anterior'} (${datosMesInforme.totalMonto >= datosMesInforme.totalMontoPrev ? '+' : '-'}$${Math.abs(Math.round(datosMesInforme.totalMonto - datosMesInforme.totalMontoPrev)).toLocaleString('de-DE')} USD)`,
        color: C_NAVY
      },
      {
        tag: 'TOTAL PROYECTOS EXTERNOS',
        val: isOct ? '$1.428.905 USD' : '$1.219.850 USD',
        desc: isOct 
          ? `18 Cuentas Auxiliares Activas (TTE-C) · Procura, MOD y Servicios` 
          : '25 Cuentas Auxiliares Activas (75,6% del costo del mes)',
        color: C_EMERALD
      },
      {
        tag: 'PROYECTO TRACTOR PELLAS 1',
        val: isOct ? '$867.861 USD' : '$668.340 USD',
        desc: isOct 
          ? '60,7% de proyectos externos · $3,25M acumulado (10,96% contrato)' 
          : '54,8% del total proyectos · $2,38M acumulado 2026',
        color: C_AMBER
      }
    ];

    kpiCards.forEach((kpi, idx) => {
      const xPos = 0.8 + (idx * 4.04);
      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos,
        y: 2.95,
        w: 3.65,
        h: 1.45,
        fill: { color: 'F8FAFC' },
        line: { color: C_BORDER, width: 0.8 },
        rectRadius: 0.1
      });

      slide.addText(kpi.tag, {
        x: xPos + 0.15,
        y: 3.08,
        w: 3.35,
        h: 0.22,
        fontSize: 10,
        bold: true,
        color: '64748B'
      });

      slide.addText(kpi.val, {
        x: xPos + 0.15,
        y: 3.32,
        w: 3.35,
        h: 0.45,
        fontSize: 20,
        bold: true,
        color: kpi.color
      });

      slide.addText(kpi.desc, {
        x: xPos + 0.15,
        y: 3.82,
        w: 3.35,
        h: 0.45,
        fontSize: 9.5,
        color: C_SLATE
      });
    });

    // Methodology Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.60,
      w: 11.733,
      h: 1.45,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText('FUNDAMENTO TÉCNICO Y MODELO DE CONTROL DE COSTOS', {
      x: 1.05,
      y: 4.75,
      w: 11.233,
      h: 0.25,
      fontSize: 11,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Conciliación 100% Analítica: Base de datos oficial unificada cruzando los módulos de Materiales SIP, Nómina Directa (MOD), Horas Máquina de Flota Pesada y Costos Indirectos CIF.\\n' +
      '• Estructura de Proyectos Externos: Análisis auditado al centavo de los frentes de obra TTE-C ejecutados para VISCO ORINOCO (CVG Ferrominera Orinoco, Planta de Pellas, Complejo PMH y Briqueteras).\\n' +
      '• Prorrateo Riguroso CIF: Distribución corporativa oficial anclada a la intensidad de Mano de Obra Directa (60,2% Pellas Línea 1 / 39,8% Resto de Proyectos).',
      {
        x: 1.05,
        y: 5.05,
        w: 11.233,
        h: 0.90,
        fontSize: 10,
        color: '1E3A8A',
        lineSpacingMultiple: 1.15
      }
    );

    // Signatures Line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 6.25,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    slide.addText('Elaborado por: Ing. Civil Alejandra Tesara (Analista de Costos)', {
      x: 0.8,
      y: 6.45,
      w: 4.5,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: '334155'
    });

    slide.addText('Destinatario: Dirección General y Presidencia · TIMACA', {
      x: 5.3,
      y: 6.45,
      w: 5.0,
      h: 0.25,
      fontSize: 10.5,
      color: '475569',
      align: 'center'
    });

    slide.addText('Puerto Ordaz, Venezuela', {
      x: 10.3,
      y: 6.45,
      w: 2.233,
      h: 0.25,
      fontSize: 10.5,
      color: '64748B',
      align: 'right'
    });
  }
"""
