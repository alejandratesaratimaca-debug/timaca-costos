const fs = require('fs');
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  HeadingLevel, 
  AlignmentType,
  ShadingType
} = require('docx');

console.log('--- GENERANDO INFORME EDITABLE .DOCX PARA OPERACIONES Y COMPRAS ---');

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Segoe UI',
          size: 20 // 10pt
        }
      }
    }
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1000,
          right: 1000,
          bottom: 1000,
          left: 1000
        }
      }
    },
    children: [
      // Encabezado
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'TIMACA · C.A. TALLERES INDUSTRIALES METALÚRGICOS ALTAGRACIA',
            bold: true,
            size: 22,
            color: '0B2545'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'UNIDAD DE CONTROL TOTAL DE COSTOS Y GESTIÓN OPERATIVA',
            bold: true,
            size: 18,
            color: '1E40AF'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'INFORME TÉCNICO DE AUDITORÍA: OMISIÓN DE FECHAS (CELDAS NULL) Y DESFASE TEMPORAL SIP',
            bold: true,
            size: 24,
            color: '0B2545'
          })
        ],
        spacing: { after: 200, before: 100 }
      }),

      // Tabla de Metadatos
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'DESTINATARIO:', bold: true })] })]
              }),
              new TableCell({
                width: { size: 80, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: 'Departamento de Operaciones & Coordinación de Compras y Procura' })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'EMITIDO POR:', bold: true })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Ing. Alejandra Tesara — Analista de Costos y Control Total TIMACA', bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'FECHA & CORTE:', bold: true })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: '08 de Octubre de 2026 | Corte Auditado: Septiembre 2026 | Doc: DOC-INF-CST-2026-09' })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: 'ASUNTO:', bold: true })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: 'Auditoría de Omisión de Fechas en Compras y Servicios (Celdas NULL), Desfase Temporal en Registros SIP y Regularización del Cierre de Septiembre 2026' })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 200 } }),

      // 1. RESUMEN EJECUTIVO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '1. RESUMEN EJECUTIVO (IMPACTO FINANCIERO Y OPERATIVO)', bold: true, color: '0B2545' })]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Durante la conciliación del cierre de Septiembre 2026, la Unidad de Costos identificó un total de 94 órdenes de compras y servicios con celdas de Fecha, Año y Mes vacías (NULL) en la matriz maestra consolidada (4 Master Unificado.xlsx). Este problema dejó invisibles para los reportes mensuales un monto total de $150.908,27 USD repartidos en 10 proyectos.'
          })
        ],
        spacing: { after: 150 }
      }),

      // Tabla de Resumen
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ shading: { fill: '0B2545' }, children: [new Paragraph({ children: [new TextRun({ text: 'Concepto Auditado', bold: true, color: 'FFFFFF' })] })] }),
              new TableCell({ shading: { fill: '0B2545' }, children: [new Paragraph({ children: [new TextRun({ text: 'Órdenes', bold: true, color: 'FFFFFF' })] })] }),
              new TableCell({ shading: { fill: '0B2545' }, children: [new Paragraph({ children: [new TextRun({ text: 'Monto Omitido USD', bold: true, color: 'FFFFFF' })] })] }),
              new TableCell({ shading: { fill: '0B2545' }, children: [new Paragraph({ children: [new TextRun({ text: 'Estado en Portal Web', bold: true, color: 'FFFFFF' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Servicios Externos (Transporte, Baños, Maquinaria, etc.)' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '49' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '$88.467,34 USD', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '100% Regularizado e Inyectado' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Materiales Directos / Fletes Internacionales y Compras' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '45' })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '$62.440,93 USD', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '100% Regularizado e Inyectado' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ shading: { fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL GENERAL CONSOLIDADO', bold: true })] })] }),
              new TableCell({ shading: { fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: '94', bold: true })] })] }),
              new TableCell({ shading: { fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: '$150.908,27 USD', bold: true, color: 'B91C1C' })] })] }),
              new TableCell({ shading: { fill: 'E2E8F0' }, children: [new Paragraph({ children: [new TextRun({ text: 'Actualizado en versión V130', bold: true })] })] })
            ]
          })
        ]
      }),

      new Paragraph({ text: '', spacing: { after: 200 } }),

      // 2. ¿CUÁL ES LA CAUSA DE LOS ERRORES? ¿QUIÉN ES EL RESPONSABLE?
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '2. ¿CUÁL ES LA CAUSA DE LOS ERRORES Y QUIÉN INTERVIENE EN EL PROCESO?', bold: true, color: '0B2545' })]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Para dar respuesta precisa a la inquietud gerencial de ¿quién causa estos errores?, se desglosa la cadena de custodia documental y las responsabilidades operativas en cada etapa del flujo:'
          })
        ],
        spacing: { after: 150 }
      }),

      // A. OPERACIONES
      new Paragraph({
        children: [
          new TextRun({ text: 'A. DEPARTAMENTO DE OPERACIONES / RESIDENCIA DE CAMPO (Causa del Desfase Temporal):', bold: true, color: 'B91C1C' })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '• Error detectado: Retraso severo en la emisión de Solicitudes de Compra (SC). El caso emblemático es la orden SC25773 ($21.800 USD) para el traslado de personal de Pellas: el servicio físico fue prestado el 17 de agosto de 2026, pero Operaciones tardó 29 días en generar la solicitud en el SIP, creándola el 15 de septiembre de 2026.\n• Consecuencia: Provoca una acumulación de compras vencidas y distorsiona la facturación quincenal de los contratistas.'
          })
        ],
        spacing: { after: 150 }
      }),

      // B. COMPRAS Y PROCURA
      new Paragraph({
        children: [
          new TextRun({ text: 'B. COORDINACIÓN DE COMPRAS Y PROCURA (Causa de la Falta de Validación de Período):', bold: true, color: 'B91C1C' })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '• Error detectado: Emisión mecánica de Órdenes de Compra (OC) sin validar la fecha real del servicio. Cuando Compras recibe la SC rezagada de Operaciones, genera la OC asignando automáticamente la fecha del sistema del día en que se procesa, sin exigir que se especifique el mes al que devenga el gasto.\n• Consecuencia: En el sistema SIP la orden figura como si fuera de septiembre, cuando el servicio corresponde a agosto.'
          })
        ],
        spacing: { after: 150 }
      }),

      // C. CONSOLIDACIÓN EXCEL
      new Paragraph({
        children: [
          new TextRun({ text: 'C. RESPONSABLE DE LA CONSOLIDACIÓN EXCEL (Causa Técnica de las Celdas NULL):', bold: true, color: 'B91C1C' })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '• Error detectado: Omisión de fórmulas al pegar registros en 4 Master Unificado.xlsx. Al exportar las órdenes nuevas del SIP de finales de septiembre (series SC25800 a SC26350), copiaron los datos descriptivos pero NO ARRASTRARON LAS FÓRMULAS de las columnas Fecha (Col C), Año (Col AM) y Nombre del mes (Col AN).\n• Consecuencia: Al quedar esas 3 celdas vacías (NULL), los registros se volvieron invisibles para cualquier tabla dinámica o filtro de Septiembre 2026, ocultando $150.908,27 USD.'
          })
        ],
        spacing: { after: 150 }
      }),

      // D. COSTOS
      new Paragraph({
        children: [
          new TextRun({ text: 'D. UNIDAD DE CONTROL TOTAL DE COSTOS (Rol de Detección y Principio de Devengado):', bold: true, color: '047857' })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '• Criterio aplicado: Principio Contable de Devengado. Costos detectó que el mes de Pellas aparecía incompleto con solo una quincena ($23.157,50 USD). Costos imputó la SC25773 ($21.800 USD) al cierre oficial de Agosto para no inflar Septiembre con tres quincenas ($67k USD), y rescató la SC26299 ($22.720 USD) para que Septiembre reflejara sus dos quincenas exactas ($45.877,50 USD).'
          })
        ],
        spacing: { after: 200 }
      }),

      // 3. CASOS EMBLEMÁTICOS
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '3. CASOS EMBLEMÁTICOS AUDITADOS', bold: true, color: '0B2545' })]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Caso 1: Traslado de Personal Pellas (TTE-C-0706)\n', bold: true }),
          new TextRun({ text: '• SC25774 (OC22576): $23.157,50 USD · Servicio 02/09/2026 · Tenía fecha 15/09/2026 en Excel (1ra quincena septiembre cargada OK).\n' }),
          new TextRun({ text: '• SC26299 (OC23120): $22.720,00 USD · Servicio 17/09/2026 · Fila 97655 con Fecha y Mes NULL en Excel (2da quincena septiembre omitida).\n' }),
          new TextRun({ text: '• SC25773 (OC22575): $21.800,00 USD · Servicio 17/08/2026 · Cargada tardíamente en SIP el 15/09/2026. Imputada contablemente a Agosto por devengado ($44.270 total agosto).\n' }),
          new TextRun({ text: 'Total Septiembre Consolidado: $45.877,50 USD (2 quincenas completas).\n\n' }),

          new TextRun({ text: 'Caso 2: Baños Portátiles y Maquinaria en 2da Línea PMH Palúa (TTE-C-0671)\n', bold: true }),
          new TextRun({ text: '• SC25795 (OC22626): $2.450,00 USD · Alquiler mensual de baños portátiles (01/09 al 30/09/26) · Fila 5681 con Fecha y Mes NULL. Omitido.\n' }),
          new TextRun({ text: '• SC25847 (OC22692): $3.700,00 USD · Alquiler de Jumbo y Cargador acarreo Cerro Bonito · Filas 5684 y 5685 con Fecha y Mes NULL. Omitido.\n' }),
          new TextRun({ text: '• SC25847 (OC22692): $4.000,00 USD · Flete acarreo de tierra a Cerro Bonito · Fila 51335 con Fecha y Mes NULL. Omitido.\n' }),
          new TextRun({ text: '• SC26294 (OC23099): $9.532,19 USD · Agenciamiento aduanal cable Helukabel · Fila 96707 con Fecha y Mes NULL. Omitido.\n' }),
          new TextRun({ text: 'Total omitido en PMH Palúa: $29.901,83 USD (8 órdenes).\n' })
        ],
        spacing: { after: 200 }
      }),

      // 4. PROTOCOLO Y ACUERDOS OBLIGATORIOS
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: '4. ACUERDOS Y PROTOCOLO DE OBLIGATORIO CUMPLIMIENTO', bold: true, color: '0B2545' })]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '1. Cero Celdas Vacías en Excel: ', bold: true }),
          new TextRun({ text: 'No se aceptará el archivo 4 Master Unificado.xlsx con celdas de fecha, año o mes en blanco en ninguna fila con monto asignado.\n' }),
          new TextRun({ text: '2. Corte Quincenal Estricto: ', bold: true }),
          new TextRun({ text: 'Las SC de la 1ra quincena deben cargarse en el SIP a más tardar el día 5 del mes. Las de la 2da quincena a más tardar el día 20 del mes.\n' }),
          new TextRun({ text: '3. Fecha de Servicio en el Motivo: ', bold: true }),
          new TextRun({ text: 'Todo solicitante debe especificar en la primera línea del motivo de la SC el rango de fechas en que se ejecutó el servicio.\n' }),
          new TextRun({ text: '4. Mesa de Conciliación Mensual: ', bold: true }),
          new TextRun({ text: 'Reunión los días 28 de cada mes entre Costos, Operaciones y Compras para validar órdenes flotantes antes del cierre definitivo.\n' })
        ],
        spacing: { after: 300 }
      }),

      // Firmas
      new Paragraph({
        children: [
          new TextRun({ text: '__________________________________                __________________________________\n', bold: true }),
          new TextRun({ text: '        Ing. Alejandra Tesara                               Gerencia de Operaciones / Compras\n', bold: true }),
          new TextRun({ text: '  Analista de Costos y Control Total                                  TIMACA C.A.\n' })
        ],
        alignment: AlignmentType.CENTER
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const destDesktop = 'C:/Users/alejandratesara/Desktop/Alejandra T/TIMACA_Informe_Auditoria_Operaciones_y_Compras_Septiembre_2026.docx';
  const destDownloads = 'C:/Users/alejandratesara/Downloads/TIMACA_Informe_Auditoria_Operaciones_y_Compras_Septiembre_2026.docx';
  fs.writeFileSync(destDesktop, buffer);
  fs.writeFileSync(destDownloads, buffer);
  console.log('Archivo .DOCX generado con éxito en Escritorio y Descargas!');
});
