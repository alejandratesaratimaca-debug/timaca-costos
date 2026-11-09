def get_code():
    return """
  // =========================================================================
  // SLIDE 0: PORTADA EJECUTIVA INSTITUCIONAL LIMPIA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: 'F1F5F9' };

    // Outer decorative border
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

    slide.addText('TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. · RIF J-00000000-0', {
      x: 2.7,
      y: 0.90,
      w: 6.5,
      h: 0.22,
      fontSize: 8.5,
      color: '64748B'
    });

    // Confidentiality Tag (Top Right)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 9.8,
      y: 0.65,
      w: 2.7,
      h: 0.45,
      fill: { color: 'FEF3C7' },
      line: { color: 'F59E0B', width: 0.8 },
      rectRadius: 0.08
    });

    slide.addText('DOCUMENTO OFICIAL AUDITADO', {
      x: 9.8,
      y: 0.72,
      w: 2.7,
      h: 0.16,
      fontSize: 8,
      bold: true,
      color: '92400E',
      align: 'center'
    });

    slide.addText('USO EXCLUSIVO JUNTA DIRECTIVA', {
      x: 9.8,
      y: 0.88,
      w: 2.7,
      h: 0.16,
      fontSize: 7.5,
      color: 'B45309',
      align: 'center'
    });

    // Divider
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.30,
      w: 11.733,
      h: 0,
      line: { color: 'E2E8F0', width: 0.8 }
    });

    // Operational Period Pill
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.66,
      y: 1.48,
      w: 4.0,
      h: 0.36,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText(`PERÍODO OPERATIVO: ${mesUpper}`, {
      x: 4.66,
      y: 1.54,
      w: 4.0,
      h: 0.24,
      fontSize: 11.5,
      bold: true,
      color: C_NAVY,
      align: 'center'
    });

    // Main Title
    slide.addText('INFORME GESTIÓN DE COSTOS', {
      x: 0.8,
      y: 1.95,
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
      y: 2.50,
      w: 11.733,
      h: 0.35,
      fontSize: 14,
      color: '475569',
      align: 'center'
    });

    // Banner Fotográfico Industrial Corporativo (Tira Continua)
    try {
      slide.addImage({
        path: getAssetPath('/ppt-assets/portada-banner-industrial.png'),
        x: 0.8,
        y: 2.95,
        w: 11.733,
        h: 1.65,
        altText: 'Instalaciones Industriales y Operaciones TIMACA'
      });
    } catch (e) {}

    // Methodology & Technical Framework Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 4.75,
      w: 11.733,
      h: 1.35,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', width: 0.8 },
      rectRadius: 0.1
    });

    slide.addText('ALCANCE Y FUNDAMENTO TÉCNICO DEL CONTROL DE GESTIÓN', {
      x: 1.05,
      y: 4.88,
      w: 11.233,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Conciliación 100% Analítica: Base de datos oficial unificada cruzando los módulos de Materiales SIP, Nómina Directa (MOD), Horas Máquina de Flota Pesada y Costos Indirectos CIF.\\n' +
      '• Estructura de Proyectos Externos: Análisis auditado al centavo de los frentes de obra TTE-C ejecutados para VISCO ORINOCO (CVG Ferrominera Orinoco, Planta de Pellas, Complejo PMH, Briqueteras y Buque Boca Grande II).\\n' +
      '• Prorrateo Riguroso CIF: Distribución corporativa oficial de la bolsa indirecta ($344.629 USD) anclada a la intensidad de Mano de Obra Directa devengada en campo.',
      {
        x: 1.05,
        y: 5.14,
        w: 11.233,
        h: 0.85,
        fontSize: 9.5,
        color: '334155',
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
      y: 6.42,
      w: 4.5,
      h: 0.25,
      fontSize: 9.5,
      bold: true,
      color: '334155'
    });

    slide.addText('Destinatario: Dirección General y Presidencia · TIMACA', {
      x: 5.3,
      y: 6.42,
      w: 5.0,
      h: 0.25,
      fontSize: 9.5,
      bold: true,
      color: '334155'
    });

    slide.addText('Puerto Ordaz, Venezuela', {
      x: 10.3,
      y: 6.42,
      w: 2.2,
      h: 0.25,
      fontSize: 9.5,
      color: '64748B',
      align: 'right'
    });
  }
"""
