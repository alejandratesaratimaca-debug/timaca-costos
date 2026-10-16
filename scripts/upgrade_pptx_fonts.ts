import fs from 'fs';
import path from 'path';

function upgradeFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Helper Header & Footer
  content = content.replace(
    /fontSize: 8\.5,\s*bold: true,\s*color: '93C5FD'/g,
    "fontSize: 10.5,\n      bold: true,\n      color: '93C5FD'"
  );
  content = content.replace(
    /fontSize: 13,\s*bold: true,\s*color: C_WHITE/g,
    "fontSize: 18,\n      bold: true,\n      color: C_WHITE"
  );
  content = content.replace(
    /fontSize: 8\.5,\s*bold: true,\s*color: 'FCD34D'/g,
    "fontSize: 10.5,\n      bold: true,\n      color: 'FCD34D'"
  );
  content = content.replace(
    /fontSize: 9,\s*italic: true,\s*color: C_SLATE/g,
    "fontSize: 11.5,\n      italic: true,\n      color: C_SLATE"
  );
  content = content.replace(
    /slide\.addText\('TALLERES INDUSTRIALES METALÚRGICOS ANTONIO C\.A\. \(TIMACA\) · RIF: J-09500315-9'[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10,')
  );
  content = content.replace(
    /slide\.addText\('Elaborado por: Ing\. Civil Alejandra Tesara[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10,')
  );

  // 2. Slide 0: Portada
  content = content.replace(
    /slide\.addText\('TIMACA · MODELO ESTRELLA',[\s\S]*?fontSize: 10,/g,
    (m) => m.replace('fontSize: 10,', 'fontSize: 13,')
  );
  content = content.replace(
    /slide\.addText\('Talleres Industriales Metalúrgicos Antonio C\.A\.',[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11,')
  );
  content = content.replace(
    /slide\.addText\('Presentación Ejecutiva Oficial',[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11,')
  );
  content = content.replace(
    /slide\.addText\('PERÍODO OPERATIVO: SEPTIEMBRE 2026',[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /slide\.addText\('INFORME GESTIÓN DE COSTOS',[\s\S]*?fontSize: 28,/g,
    (m) => m.replace('fontSize: 28,', 'fontSize: 34,')
  );
  content = content.replace(
    /slide\.addText\('SEPTIEMBRE 2026',[\s\S]*?fontSize: 16,/g,
    (m) => m.replace('fontSize: 16,', 'fontSize: 20,')
  );

  // Slide 0: 3 Metadata KPI Chips
  content = content.replace(
    /\{ text: `\$\{ch\.label\} `, options: \{ fontSize: 8, color: '64748B' \} \},\s*\{ text: ch\.val, options: \{ fontSize: 8, bold: true, color: C_NAVY \} \}/g,
    "{ text: `${ch.label} `, options: { fontSize: 11, color: '64748B' } },\n        { text: ch.val, options: { fontSize: 12, bold: true, color: C_NAVY } }"
  );

  // Slide 0: Footer credits
  content = content.replace(
    /slide\.addText\('Elaborado por: Ing\. Civil Alejandra Tesara \(Analista de Costos\)',[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );
  content = content.replace(
    /slide\.addText\('Destinatario: Gerencia de Administración y Finanzas \/ Dpto\. Costos · TIMACA',[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );
  content = content.replace(
    /slide\.addText\('Puerto Ordaz, Venezuela',[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );

  // 3. Slide 1: Table & Callouts
  content = content.replace(
    /TABLA_PPT_DISTRIBUCION_2026\.forEach[\s\S]*?slide\.addTable\(tableRows,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 10.5')
        .replace(/fontSize: 8/g, 'fontSize: 9.8');
    }
  );
  content = content.replace(
    /slide\.addText\(ins\.title,[\s\S]*?fontSize: 9,/g,
    (m) => m.replace('fontSize: 9,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /slide\.addText\(ins\.desc,[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10,')
  );

  // 4. Slide 2: Analysis of Costs
  content = content.replace(
    /slide\.addText\('COSTOS DIRECTOS \(75,6%\) · \$1\.219\.850 USD',[\s\S]*?fontSize: 9,/g,
    (m) => m.replace('fontSize: 9,', 'fontSize: 12.5,')
  );
  content = content.replace(
    /Materiales: \$868\.067 USD \(53,8%\)[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 10.5,')
  );
  content = content.replace(
    /slide\.addText\('COSTOS INDIRECTOS CIF \(24,4%\) · \$393\.375 USD',[\s\S]*?fontSize: 9,/g,
    (m) => m.replace('fontSize: 9,', 'fontSize: 12.5,')
  );
  content = content.replace(
    /Nómina TIMACA: \$125\.000 \| Nómina Talleres: \$122\.000[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 10.5,')
  );
  content = content.replace(
    /const catRows: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(catRows,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 11')
        .replace(/fontSize: 8/g, 'fontSize: 10.5');
    }
  );

  // 5. Slide 3: Nómina MOD
  content = content.replace(
    /const modCards = \[[\s\S]*?modCards\.forEach/g,
    (m) => m
  );
  content = content.replace(
    /slide\.addText\(c\.label,[\s\S]*?fontSize: 7,/g,
    (m) => m.replace('fontSize: 7,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /slide\.addText\(c\.val,[\s\S]*?fontSize: 12\.5,/g,
    (m) => m.replace('fontSize: 12.5,', 'fontSize: 16,')
  );
  content = content.replace(
    /slide\.addText\(c\.note,[\s\S]*?fontSize: 7,/g,
    (m) => m.replace('fontSize: 7,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /slide\.addText\('CRITERIO DE CORTE CONTABLE Y AUDITORÍA DE NÓMINA',[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /La Semana 35 \(\$56\.584 USD[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.8,')
  );
  content = content.replace(
    /const modTableRows: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(modTableRows,/g,
    (m) => {
      return m
        .replace(/fontSize: 7\.5/g, 'fontSize: 10.5')
        .replace(/fontSize: 7\.2/g, 'fontSize: 9.8');
    }
  );

  // 6. Slide 4: Pareto
  content = content.replace(
    /const pryTable: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(pryTable,/g,
    (m) => {
      return m
        .replace(/fontSize: 8/g, 'fontSize: 10.5')
        .replace(/fontSize: 7\.5/g, 'fontSize: 9.8');
    }
  );
  content = content.replace(
    /Concentración Top 3: Proyecto Pellas Línea 1[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );

  // 7. Slide 5: Variaciones
  content = content.replace(
    /slide\.addText\(v\.pry,[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /slide\.addText\(`\$\{v\.delta\} \(\$\{v\.pct\}\)`,[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /slide\.addText\(v\.desc,[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.8,')
  );

  // 8. Slide 6: Pellas Línea 1
  content = content.replace(
    /const pellasCards = \[[\s\S]*?pellasCards\.forEach[\s\S]*?slide\.addText\(c\.label,[\s\S]*?fontSize: 7,/g,
    (m) => m.replace('fontSize: 7,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /pellasCards\.forEach[\s\S]*?slide\.addText\(c\.val,[\s\S]*?fontSize: 12\.5,/g,
    (m) => m.replace('fontSize: 12.5,', 'fontSize: 16,')
  );
  content = content.replace(
    /pellasCards\.forEach[\s\S]*?slide\.addText\(c\.note,[\s\S]*?fontSize: 7,/g,
    (m) => m.replace('fontSize: 7,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /slide\.addText\('MATRIZ DE EVOLUCIÓN MENSUAL PELLAS LÍNEA 1[\s\S]*?fontSize: 9,/g,
    (m) => m.replace('fontSize: 9,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /const pellasMonthlyTable: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(pellasMonthlyTable,/g,
    (m) => {
      return m
        .replace(/fontSize: 7\.5/g, 'fontSize: 9.8')
        .replace(/fontSize: 7\.2/g, 'fontSize: 9.0');
    }
  );
  content = content.replace(
    /Fase Preliminar \(Ene - Abr\):[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.8,')
  );
  content = content.replace(
    /Avance Contractual: Con \$2\.388\.978 USD[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.8,')
  );

  // 9. Slide 7: HM y Servicios
  content = content.replace(
    /const hmRows: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(hmRows,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 11')
        .replace(/fontSize: 8/g, 'fontSize: 10');
    }
  );
  content = content.replace(
    /const servRows: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(servRows,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 11')
        .replace(/fontSize: 8/g, 'fontSize: 10');
    }
  );
  content = content.replace(
    /NOTAS OPERATIVAS DE CONTROL \(SEPT 2026\):[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );

  // 10. Slide 8: PMH
  content = content.replace(
    /const pmhCards = \[[\s\S]*?pmhCards\.forEach[\s\S]*?slide\.addText\(c\.label,[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /pmhCards\.forEach[\s\S]*?slide\.addText\(c\.val,[\s\S]*?fontSize: 13,/g,
    (m) => m.replace('fontSize: 13,', 'fontSize: 16,')
  );
  content = content.replace(
    /pmhCards\.forEach[\s\S]*?slide\.addText\(c\.note,[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /const tableMatPMH = \[[\s\S]*?slide\.addTable\(tableMatPMH,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 10.5')
        .replace(/fontSize: 7\.5/g, 'fontSize: 9.8');
    }
  );
  content = content.replace(
    /const tableObrasPMH = \[[\s\S]*?slide\.addTable\(tableObrasPMH,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 10.5')
        .replace(/fontSize: 7\.5/g, 'fontSize: 9.8');
    }
  );
  content = content.replace(
    /DICTAMEN TÉCNICO Y CONTROL DE COSTOS EN PMH:[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );

  // 11. Slide 9: DRAVO
  content = content.replace(
    /const dravoCards = \[[\s\S]*?dravoCards\.forEach[\s\S]*?slide\.addText\(c\.label,[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /dravoCards\.forEach[\s\S]*?slide\.addText\(c\.val,[\s\S]*?fontSize: 13,/g,
    (m) => m.replace('fontSize: 13,', 'fontSize: 16,')
  );
  content = content.replace(
    /dravoCards\.forEach[\s\S]*?slide\.addText\(c\.note,[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /const tableDravo = \[[\s\S]*?slide\.addTable\(tableDravo,/g,
    (m) => {
      return m
        .replace(/fontSize: 8\.5/g, 'fontSize: 10.5')
        .replace(/fontSize: 7\.5/g, 'fontSize: 10');
    }
  );
  content = content.replace(
    /AUDITORÍA Y JUSTIFICACIÓN TÉCNICA DEL SALTO OPERATIVO[\s\S]*?fontSize: 8,/g,
    (m) => m.replace('fontSize: 8,', 'fontSize: 10.5,')
  );

  // 12. Slide 10: CIF
  content = content.replace(
    /slide\.addText\('METODOLOGÍA DE ANCLA MOD',[\s\S]*?fontSize: 9,/g,
    (m) => m.replace('fontSize: 9,', 'fontSize: 12,')
  );
  content = content.replace(
    /TIMACA distribuye los indirectos proporcionalmente[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 10.2,')
  );
  content = content.replace(
    /const subTable: any\[\]\[\] = \[[\s\S]*?slide\.addTable\(subTable,/g,
    (m) => {
      return m
        .replace(/fontSize: 8/g, 'fontSize: 10.5')
        .replace(/fontSize: 7\.5/g, 'fontSize: 9.8');
    }
  );

  // 13. Slide 11: Semáforo
  content = content.replace(
    /slide\.addText\(`\$\{q\.num\}\. \$\{q\.title\.toUpperCase\(\)\}`,[\s\S]*?fontSize: 8\.5,/g,
    (m) => m.replace('fontSize: 8.5,', 'fontSize: 11.5,')
  );
  content = content.replace(
    /slide\.addText\(q\.badge,[\s\S]*?fontSize: 7,/g,
    (m) => m.replace('fontSize: 7,', 'fontSize: 9.5,')
  );
  content = content.replace(
    /const bullets = q\.items\.map[\s\S]*?fontSize: 7\.5,/g,
    (m) => m.replace('fontSize: 7.5,', 'fontSize: 9.8,')
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully upgraded font sizes in: ${filePath}`);
}

upgradeFile(path.resolve('scripts/generate_official_pptx.ts'));
upgradeFile(path.resolve('src/utils/exportInformeToPPTX.ts'));
