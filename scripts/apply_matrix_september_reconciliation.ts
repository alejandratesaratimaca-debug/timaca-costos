import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/realProyectosMensual2026.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The projects and their official September MOD and resulting meses[8] and totalAnual
// Let's verify each project that changed:

// 1. TTE-C-0706 (Pellas):
// MOD was 133185 -> becomes 128161 (-5024)
// meses[8] was 668340.15 -> becomes 663316.15
// totalAnual was 2388978.27 -> becomes 2383954.27

content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0706"[\s\S]*?"meses":\s*\[[\s\S]*?596358\.2,\s*)668340\.15(\s*\][\s\S]*?"Mano de Obra Directa":\s*)133185/g,
  '$1663316.15$2128161'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0706"[\s\S]*?"totalAnual":\s*)2388978\.27/g,
  '$12383954.27'
);

// 2. TTE-C-0671 (Segunda Línea PMH):
// MOD was 14818 -> becomes 30305 (+15487)
// meses[8] was 291948.5 -> becomes 307435.5
// totalAnual was 1143216.57 -> becomes 1158703.57
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0671"[\s\S]*?"meses":\s*\[[\s\S]*?197962\.39,\s*)291948\.5(\s*\][\s\S]*?"Mano de Obra Directa":\s*)14818/g,
  '$1307435.5$230305'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0671"[\s\S]*?"totalAnual":\s*)1143216\.57/g,
  '$1158703.57'
);

// 3. TTE-C-0668 (Briquetas Fase 2):
// MOD was 15221 -> becomes 8392 (-6829)
// meses[8] was 173502.18 -> becomes 166673.18
// totalAnual was 617578.85 -> becomes 610749.85
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0668"[\s\S]*?"meses":\s*\[[\s\S]*?88917\.99,\s*)173502\.18(\s*\][\s\S]*?"Mano de Obra Directa":\s*)15221/g,
  '$1166673.18$28392'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0668"[\s\S]*?"totalAnual":\s*)617578\.85/g,
  '$1610749.85'
);

// 4. TTE-C-0656 (Bandas PMH):
// MOD was 28142 -> becomes 3762 (-24380)
// meses[8] was 92544.44 -> becomes 68164.44
// totalAnual was 1235820.3 -> becomes 1211440.3
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0656"[\s\S]*?"meses":\s*\[[\s\S]*?109279\.08,\s*)92544\.44(\s*\][\s\S]*?"Mano de Obra Directa":\s*)28142/g,
  '$168164.44$23762'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0656"[\s\S]*?"totalAnual":\s*)1235820\.3/g,
  '$11211440.3'
);

// 5. TTE-C-0694 (Caldera Briquetas):
// MOD was 2514 -> becomes 3420 (+906)
// meses[8] was 68650.65 -> becomes 69556.65
// totalAnual was 1526794.8 -> becomes 1527700.8
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0694"[\s\S]*?"meses":\s*\[[\s\S]*?14200\.42,\s*)68650\.65(\s*\][\s\S]*?"Mano de Obra Directa":\s*)2514/g,
  '$169556.65$23420'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0694"[\s\S]*?"totalAnual":\s*)1526794\.8/g,
  '$11527700.8'
);

// 6. TTE-C-0678 (Pila HA y HB PMH):
// MOD was 9451 -> becomes 350 (-9101)
// meses[8] was 47672.77 -> becomes 38571.77
// totalAnual was 329756.71 -> becomes 320655.71
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0678"[\s\S]*?"meses":\s*\[[\s\S]*?30921\.17,\s*)47672\.77(\s*\][\s\S]*?"Mano de Obra Directa":\s*)9451/g,
  '$138571.77$2350'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0678"[\s\S]*?"totalAnual":\s*)329756\.71/g,
  '$1320655.71'
);

// 7. TTE-C-0680 (Mantenimiento BG II):
// MOD was 9307 -> becomes 11870 (+2563)
// meses[8] was 33890.12 -> becomes 36453.12
// totalAnual was 465707.78 -> becomes 468270.78
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0680"[\s\S]*?"meses":\s*\[[\s\S]*?54364\.83,\s*)33890\.12(\s*\][\s\S]*?"Mano de Obra Directa":\s*)9307/g,
  '$136453.12$211870'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0680"[\s\S]*?"totalAnual":\s*)465707\.78/g,
  '$1468270.78'
);

// 8. TTE-C-0670 (Mtto Briqueteras):
// MOD was 6854 -> becomes 3420 (-3434)
// meses[8] was 19034.5 -> becomes 15600.5
// totalAnual was 101242.26 -> becomes 97808.26
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0670"[\s\S]*?"meses":\s*\[[\s\S]*?16707,\s*)19034\.5(\s*\][\s\S]*?"Mano de Obra Directa":\s*)6854/g,
  '$115600.5$23420'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0670"[\s\S]*?"totalAnual":\s*)101242\.26/g,
  '$197808.26'
);

// 9. TTE-C-0655 (Tolva PMH):
// MOD was 450 -> becomes 1768 (+1318)
// meses[8] was 5836.11 -> becomes 7154.11
// totalAnual was 294458.93 -> becomes 295776.93
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0655"[\s\S]*?"meses":\s*\[[\s\S]*?32878\.82,\s*)5836\.11(\s*\][\s\S]*?"Mano de Obra Directa":\s*)450/g,
  '$17154.11$21768'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0655"[\s\S]*?"totalAnual":\s*)294458\.93/g,
  '$1295776.93'
);

// 10. TTE-C-0669 (Mtto Dravo / PMH):
// MOD was 0 -> becomes 5218 (+5218)
// meses[8] was 7.08 -> becomes 5225.08
// totalAnual was 52480.03 -> becomes 57698.11
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0669"[\s\S]*?"meses":\s*\[[\s\S]*?12727\.79,\s*)7\.08(\s*\][\s\S]*?"Mano de Obra Directa":\s*)0/g,
  '$15225.08$25218'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0669"[\s\S]*?"totalAnual":\s*)52480\.03/g,
  '$157698.11'
);

// 11. TTE-C-0684 (Gamelas FMO-PMH):
// MOD was 1411 -> becomes 0 (-1411)
// meses[8] was 3918.54 -> becomes 2507.54
// totalAnual was 7980.26 -> becomes 6569.26
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0684"[\s\S]*?"meses":\s*\[[\s\S]*?2167,\s*)3918\.54(\s*\][\s\S]*?"Mano de Obra Directa":\s*)1411/g,
  '$12507.54$20'
);
content = content.replace(
  /("cuentaAuxiliar":\s*"TTE-C-0684"[\s\S]*?"totalAnual":\s*)7980\.26/g,
  '$16569.26'
);

// Write back
fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully updated realProyectosMensual2026.ts!");
