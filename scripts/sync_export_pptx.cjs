const fs = require('fs');
const path = require('path');

const officialFile = path.resolve(__dirname, 'generate_official_pptx.ts');
const targetFile = path.resolve(__dirname, '../src/utils/exportInformeToPPTX.ts');

let code = fs.readFileSync(officialFile, 'utf8');

// Replace imports
code = code.replace(
  `import pptxgenModule from 'pptxgenjs';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT, 
  CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026,
  TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
  DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS 
} from '../src/data/mockCostosTimaca';`,
  `import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT, 
  CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026,
  TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
  DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS 
} from '../data/mockCostosTimaca';

interface ExportPPTXParams {
  selectedMesNum: number;
  mesLabel: string;
  totalMes: number;
  cuentasAuxiliaresMes: Array<{
    codigo: string;
    proyecto: string;
    total: number;
    porcentaje: number;
    metricas?: {
      tienePresupuesto: boolean;
      totalPresupuesto: number;
      porcentajeUso: number;
      estadoAlerta: string;
    };
  }>;
  categoriasMesAnalisis: Array<{
    categoria: string;
    monto: number;
    montoPrev: number;
    varPct: number;
    varText: string;
  }>;
  pellasMesData: {
    montoMes: number;
    porcentajeMes: number;
    acumulado2026: number;
    cuadrilla: number;
    nominaMes: number;
    horasMaquina: number;
  };
  notasGestion?: string;
}`
);

// Replace function signature
code = code.replace(
  `export async function generateOfficialPresentation(outputPath: string) {
  const PptxConstructor: any = (pptxgenModule as any).default || pptxgenModule;
  const pptx = new PptxConstructor();`,
  `export async function exportInformeToPPTX(params: ExportPPTXParams) {
  const {
    selectedMesNum,
    mesLabel,
    totalMes,
    cuentasAuxiliaresMes,
    categoriasMesAnalisis,
    pellasMesData
  } = params;

  const PptxConstructor: any = (pptxgen as any).default || pptxgen;
  const pptx = new PptxConstructor();`
);

// Replace logo image path logic
code = code.replace(
  `    // Brand section
    const logoImgPath = path.resolve('public/timaca-logo.png');
    try {
      slide.addImage({
        path: logoImgPath,
        x: 0.8,
        y: 0.65,
        w: 1.8,
        h: 0.55,
        altText: 'Logotipo Corporativo TIMACA'
      });
    } catch (e) {}`,
  `    // Brand section
    const getAssetPath = (assetUrl: string) => {
      if (typeof window !== 'undefined' && window.location?.origin) {
        return \`\${window.location.origin}\${assetUrl}\`;
      }
      return assetUrl;
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
    } catch (e) {}`
);

// Replace banner image path logic
code = code.replace(
  `    // Industrial Banner Image
    const bannerImgPath = path.resolve('public/ppt-assets/portada-banner-industrial.png');
    try {
      slide.addImage({
        path: bannerImgPath,
        x: 0.8,
        y: 3.45,
        w: 11.733,
        h: 2.75,
        altText: 'Vista de Operaciones TIMACA'
      });
    } catch (e) {}`,
  `    // Industrial Banner Image
    try {
      slide.addImage({
        path: getAssetPath('/ppt-assets/portada-banner-industrial.png'),
        x: 0.8,
        y: 3.45,
        w: 11.733,
        h: 2.75,
        altText: 'Vista de Operaciones TIMACA'
      });
    } catch (e) {}`
);

// Replace the end writeFile and main execution
const endRegex = /await pptx\.writeFile\(\{ fileName: outputPath \}\);[\s\S]*$/;
const replacementEnd = `  // Browser download with OpenXML localization
  const fileName = \`Informe_Ejecutivo_Costos_TIMACA_\${mesLabel.replace(/\\s+/g, '_')}.pptx\`;
  if (typeof window !== 'undefined') {
    const rawBlob: any = await pptx.write({ outputType: 'blob' });
    const zip = await JSZip.loadAsync(rawBlob);
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      if (relativePath.endsWith('.xml') || relativePath.endsWith('.rels')) {
        let content = await zipEntry.async('string');
        let modified = false;
        if (content.includes('lang="en-US"')) {
          content = content.replace(/lang="en-[A-Z]+"/g, 'lang="es-VE"');
          modified = true;
        }
        if (modified) {
          zip.file(relativePath, content);
        }
      }
    }
    const cleanBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(cleanBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } else {
    await pptx.writeFile({ fileName });
  }
}
`;

code = code.replace(endRegex, replacementEnd);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully synchronized src/utils/exportInformeToPPTX.ts with scripts/generate_official_pptx.ts');
