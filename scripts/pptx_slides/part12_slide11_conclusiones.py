def get_code():
    return """
  // =========================================================================
  // SLIDE 11A: CONCLUSIONES DE CONTROL & MATRIZ SEMÁFORO ESTRATÉGICA
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '11A',
      `11A. Conclusiones de Control & Matriz Semáforo Estratégica (${mesTitle})`,
      `Evaluación integral en 4 dimensiones operativas: Fortalezas, Alertas, Riesgos y Recomendaciones Directivas`
    );

    // 4 Quadrants Matrix (2x2 Grid)
    // Quadrant 1: Fortalezas Operativas (Green) - Top-Left: x: 0.6, y: 1.35, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 5.95,
      h: 2.65,
      fill: { color: 'F0FDF4' },
      line: { color: '86EFAC', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('1. FORTALEZAS OPERATIVAS & CUMPLIMIENTO (VERDE)', {
      x: 0.8,
      y: 1.48,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '166534'
    });

    slide.addText(
      isOct
        ? '• Purificación de Materiales al 100%: Base de datos de $1.444.345,28 USD auditada al centavo sin registros a destiempo ni duplicidades.\\n' +
          '• Tracción Sostenida en Pellas Línea 1: Acumulado anual superó los $3,25M USD (10,96% del contrato marco de $29,72M USD) con 254 trabajadores estables.\\n' +
          '• Continuidad en Segunda Línea PMH: Despacho sostenido de vigas y perfiles ASTM A36 con $205.894 USD acumulados en el año.'
        : '• Mano de Obra Directa al Día: $196.665 USD devengados en 10 proyectos externos sin pasivos atrasados ni contingencias laborales.\\n' +
          '• Avance Sólido en Pellas Línea 1: Acumulado consolidado de $2.388.978 USD (8,0% sobre contrato marco) con 254 trabajadores y 812 horas grúa.\\n' +
          '• Eficiencia en Procura: Costos de flete mitigados mediante convenios de entrega directa en talleres de Puerto Ordaz.',
      {
        x: 0.8,
        y: 1.76,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: '14532D'
      }
    );

    // Quadrant 2: Alertas Contables y Reconciliaciones (Amber) - Top-Right: x: 6.78, y: 1.35, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 1.35,
      w: 5.95,
      h: 2.65,
      fill: { color: 'FFFBEB' },
      line: { color: 'FDE68A', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('2. ALERTAS CONTABLES & CONCILIACIONES EN CURSO (AMARILLO)', {
      x: 6.98,
      y: 1.48,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '92400E'
    });

    slide.addText(
      isOct
        ? '• Conciliación de Horas Máquina (Octubre): Retraso en entrega de partes de horómetros de maquinaria pesada y grúas; rubro figura en $0,00 USD a la espera de regularización técnica.\\n' +
          '• Procesamiento Nómina Boca Grande II: Cuenta TTE-C-0680 registra retraso en nómina devengada por parte de RRHH; actualmente solo computa $5.772 USD en materiales SIP.\\n' +
          '• Auditoría de Vales de Almacén: Seguimiento a vales de salida pendientes de descargo físico en almacenes de obra.'
        : '• Conciliación Horómetros de Equipos Propios: Se requiere mayor celeridad en la entrega de reportes semanales de horómetros para evitar imputaciones tardías.\\n' +
          '• Seguimiento a Cuentas en Cierre: Frentes que alcanzan el 90%+ de ejecución requieren verificación de garantías y finiquitos técnicos.\\n' +
          '• Control de Requisiciones Menores: Monitoreo estricto sobre compras locales de emergencia sin orden previa.',
      {
        x: 6.98,
        y: 1.76,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: '78350F'
      }
    );

    // Quadrant 3: Riesgos Críticos y Desviaciones (Red) - Bottom-Left: x: 0.6, y: 4.15, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 4.15,
      w: 5.95,
      h: 2.65,
      fill: { color: 'FEF2F2' },
      line: { color: 'FCA5A5', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('3. RIESGOS CRÍTICOS & PUNTOS DE CONTROL (ROJO)', {
      x: 0.8,
      y: 4.28,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '991B1B'
    });

    slide.addText(
      '• Agotamiento de Techos Presupuestarios: Identificación de proyectos secundarios con ejecución acumulada superior al 85% de la orden de compra inicial sin adenda aprobada.\\n' +
      '• Volatilidad en Precios de Aceros Especiales: Incrementos en cotizaciones de planchas antiabrasivas Hardox y tuberías sin costura requieren cobertura de inventario estratégico.\\n' +
      '• Dependencia de Grúas Críticas: La paralización por mantenimiento correctivo de la grúa Link-Belt 60T (GR20) generaría cuellos de botella en la ruta crítica de izaje.',
      {
        x: 0.8,
        y: 4.56,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: '7F1D1D'
      }
    );

    // Quadrant 4: Recomendaciones Directivas (Blue) - Bottom-Right: x: 6.78, y: 4.15, w: 5.95, h: 2.65
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.78,
      y: 4.15,
      w: 5.95,
      h: 2.65,
      fill: { color: 'EFF6FF' },
      line: { color: '93C5FD', width: 1.5 },
      rectRadius: 0.08
    });

    slide.addText('4. RECOMENDACIONES DIRECTIVAS DE GESTIÓN (AZUL)', {
      x: 6.98,
      y: 4.28,
      w: 5.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    slide.addText(
      '• Formalización de Adendas: Gestionar de inmediato con los clientes las ampliaciones de alcance y presupuestos de obras con sobreconsumo justificado.\\n' +
      '• Automatización de Partes Diarios: Implementar el módulo digital de horómetros y asistencia en campo para erradicar retrasos en el corte mensual contable.\\n' +
      '• Reconciliación Quincenal de Cubicaciones: Cruzar semanalmente los avances físicos medidos por la inspección con las imputaciones contables de almacén SIP.',
      {
        x: 6.98,
        y: 4.56,
        w: 5.5,
        h: 2.1,
        fontSize: 8.5,
        color: C_SLATE
      }
    );

    addSlideFooter(slide);
  }

  // =========================================================================
  // SLIDE 11B: DOSSIER EJECUTIVO Y DICTAMEN TÉCNICO OFICIAL
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(
      slide,
      '11B',
      `11B. Dossier Ejecutivo y Dictamen Técnico Oficial de Costos (${mesTitle})`,
      'Memorando formal de control de gestión · Conclusiones, dictamen técnico y firmas oficiales'
    );

    // Left Column: Formal Memorandum (x: 0.6, y: 1.35, w: 7.6, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.35,
      w: 7.6,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('MEMORANDO DE CONTROL DE GESTIÓN Y AUDITORÍA DE COSTOS', {
      x: 0.8,
      y: 1.48,
      w: 7.2,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    const dictamenDefault = isOct
      ? `Para el período correspondiente a Octubre 2026, el gasto operativo consolidado en proyectos externos alcanzó $1.444.345,28 USD (ocho proyectos activos con imputación contable purificada al 100%).\\n\\n` +
        `El proyecto con mayor ejecución fue Línea 1 Pellas (TTE-C-0706) con $867.861 USD (60,1% del total mensual), seguido por Planta PMH Segunda Línea (TTE-C-0671) con $73.300 USD y DRAVO PA-9020 con $106.812 USD.\\n\\n` +
        `Se deja constancia formal de que el rubro Horas Máquina figura en $0,00 USD debido a retraso en la recepción de partes de horómetros por parte de la jefatura de equipos pesados, y la Nómina de Boca Grande II se mantiene pendiente de procesamiento por RRHH. Ambos rubros serán reconciliados sin impacto presupuestario adverso en el próximo cierre contable.`
      : `Para el período correspondiente a Septiembre 2026, el gasto operativo consolidado en proyectos externos se situó en $1.613.225 USD, distribuidos en 10 cuentas auxiliares activas.\\n\\n` +
        `El proyecto con mayor ejecución fue Línea 1 Pellas con $668.340 USD (40,8% del total mensual), seguido por DRAVO PA-9020 con $199.356 USD (parada técnica mayor con suministro concentrado de blindajes Hardox).\\n\\n` +
        `La distribución del costo por categorías se mantuvo alineada con las necesidades de procura y fuerza laboral directa (64.585 HH devengadas), orientada a la máxima eficiencia operativa y al estricto cumplimiento de los hitos de entrega con el cliente.`;

    const textoNotas = notasGestion ? notasGestion.replace(/\\n/g, '\\n') : dictamenDefault;

    slide.addText(textoNotas, {
      x: 0.8,
      y: 1.80,
      w: 7.2,
      h: 4.85,
      fontSize: 9,
      color: C_SLATE
    });

    // Right Column: Official Signatures and Endorsements (x: 8.4, y: 1.35, w: 4.33, h: 5.45)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.4,
      y: 1.35,
      w: 4.33,
      h: 5.45,
      fill: { color: C_WHITE },
      line: { color: '93C5FD', width: 1.0 },
      rectRadius: 0.08
    });

    slide.addText('AVAL TÉCNICO Y FIRMAS DIRECTIVAS', {
      x: 8.6,
      y: 1.48,
      w: 3.9,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: C_NAVY
    });

    // Signature 1: Analista de Costos
    slide.addShape(pptx.ShapeType.line, {
      x: 8.8,
      y: 2.75,
      w: 3.5,
      h: 0,
      line: { color: C_BORDER, width: 1.0 }
    });
    slide.addText('ING. CIVIL ALEJANDRA TESARA', {
      x: 8.8,
      y: 2.82,
      w: 3.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_DARK,
      align: 'center'
    });
    slide.addText('Analista de Control de Gestión y Costos\\nTIMACA - Puerto Ordaz', {
      x: 8.8,
      y: 3.02,
      w: 3.5,
      h: 0.35,
      fontSize: 8,
      color: C_SLATE,
      align: 'center'
    });

    // Signature 2: Gerencia de Operaciones
    slide.addShape(pptx.ShapeType.line, {
      x: 8.8,
      y: 4.15,
      w: 3.5,
      h: 0,
      line: { color: C_BORDER, width: 1.0 }
    });
    slide.addText('GERENCIA DE OPERACIONES', {
      x: 8.8,
      y: 4.22,
      w: 3.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_DARK,
      align: 'center'
    });
    slide.addText('Dirección de Montaje y Construcción\\nTIMACA - Puerto Ordaz', {
      x: 8.8,
      y: 4.42,
      w: 3.5,
      h: 0.35,
      fontSize: 8,
      color: C_SLATE,
      align: 'center'
    });

    // Signature 3: Dirección General / Presidencia
    slide.addShape(pptx.ShapeType.line, {
      x: 8.8,
      y: 5.55,
      w: 3.5,
      h: 0,
      line: { color: C_BORDER, width: 1.0 }
    });
    slide.addText('DIRECCIÓN GENERAL Y PRESIDENCIA', {
      x: 8.8,
      y: 5.62,
      w: 3.5,
      h: 0.20,
      fontSize: 9.5,
      bold: true,
      color: C_DARK,
      align: 'center'
    });
    slide.addText('Aprobación Ejecutiva de Control de Gestión\\nTIMACA - Modelo Estrella', {
      x: 8.8,
      y: 5.82,
      w: 3.5,
      h: 0.35,
      fontSize: 8,
      color: C_SLATE,
      align: 'center'
    });

    addSlideFooter(slide);
  }
"""
