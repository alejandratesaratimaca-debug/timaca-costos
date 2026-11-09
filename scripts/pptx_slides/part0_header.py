def get_code():
    return """import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { 
  TABLA_PPT_DISTRIBUCION_2026, 
  TOTALES_MESES_PPT, 
  CUENTAS_AUXILIARES_EXACTAS_SEPTIEMBRE_2026,
  CUENTAS_AUXILIARES_EXACTAS_OCTUBRE_2026,
  TOTALES_NOMINA_SEMANAL_SEPTIEMBRE,
  DESGLOSE_NOMINA_SEPTIEMBRE_PROYECTOS,
  TOTALES_NOMINA_SEMANAL_OCTUBRE,
  DESGLOSE_NOMINA_OCTUBRE_PROYECTOS
} from '../data/mockCostosTimaca';
import { 
  TABLA_SERVICIOS_DIRECTOS_PELLAS_OFICIAL, 
  TOTALES_SERVICIOS_DIRECTOS_PELLAS 
} from '../data/mockServiciosDirectosPellas';
import { resolveInformeMesData } from '../data/informeMesResolver';

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
    esPositiva?: boolean;
    esNegativa?: boolean;
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
}

export async function exportInformeToPPTX(params: ExportPPTXParams) {
  const {
    selectedMesNum,
    mesLabel,
    totalMes,
    cuentasAuxiliaresMes,
    categoriasMesAnalisis,
    pellasMesData,
    notasGestion
  } = params;

  // Motor Central de Datos del Mes (Sincronización Total 100% con Plataforma Web)
  const datosMesInforme = resolveInformeMesData(selectedMesNum);

  const isOct = selectedMesNum === 10;
  const mesTitle = isOct ? 'Octubre 2026' : (selectedMesNum === 8 ? 'Agosto 2026' : 'Septiembre 2026');
  const mesUpper = mesTitle.toUpperCase();

  const PptxConstructor: any = (pptxgen as any).default || pptxgen;
  const pptx = new PptxConstructor();

  // 16:9 Widescreen Standard Layout (13.333\\" x 7.5\\")
  pptx.defineLayout({ name: 'LAYOUT_16_9_HD', width: 13.333, height: 7.5 });
  pptx.layout = 'LAYOUT_16_9_HD';
  pptx.author = 'Ing. Civil Alejandra Tesara';
  pptx.company = 'TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. (TIMACA)';
  pptx.title = `Informe Ejecutivo de Costos - ${mesTitle}`;
  pptx.subject = 'Costos en Proyectos Externos y Cuentas Auxiliares';

  // Palette colors
  const C_NAVY = '002060';
  const C_DARK = '0B2545';
  const C_SLATE = '334155';
  const C_WHITE = 'FFFFFF';
  const C_BG_LIGHT = 'F8FAFC';
  const C_AMBER = 'D97706';
  const C_EMERALD = '059669';
  const C_BLUE = '1D4ED8';
  const C_BORDER = 'CBD5E1';

  // Helper Header for interior slides (13.333\\" width)
  const addSlideHeader = (slide: any, slideNumber: number | string, title: string, subtitle: string) => {
    // Top banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.82,
      fill: { color: C_DARK }
    });

    slide.addText('TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. (TIMACA) · MODELO ESTRELLA DE COSTOS', {
      x: 0.6,
      y: 0.1,
      w: 9.5,
      h: 0.22,
      fontSize: 10.5,
      bold: true,
      color: '93C5FD'
    });

    slide.addText(title.toUpperCase(), {
      x: 0.6,
      y: 0.33,
      w: 9.8,
      h: 0.44,
      fontSize: 18,
      bold: true,
      color: C_WHITE
    });

    slide.addText(`LÁMINA ${slideNumber} · ${mesUpper}`, {
      x: 9.5,
      y: 0.25,
      w: 3.2,
      h: 0.35,
      fontSize: 10.5,
      bold: true,
      color: 'FCD34D',
      align: 'right'
    });

    // Subtitle bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0.82,
      w: 13.333,
      h: 0.38,
      fill: { color: 'F1F5F9' },
      line: { color: C_BORDER, width: 0.5 }
    });

    slide.addText(subtitle, {
      x: 0.6,
      y: 0.88,
      w: 12.13,
      h: 0.26,
      fontSize: 11.5,
      italic: true,
      color: C_SLATE
    });
  };

  // Helper Footer for interior slides (13.333\\" width)
  const addSlideFooter = (slide: any) => {
    slide.addShape(pptx.ShapeType.line, {
      x: 0.6,
      y: 6.95,
      w: 12.13,
      h: 0,
      line: { color: C_BORDER, width: 0.5 }
    });

    slide.addText('TALLER INDUSTRIAL METALÚRGICO ANTONIO C.A. (TIMACA) · RIF: J-09500315-9', {
      x: 0.6,
      y: 7.02,
      w: 6.0,
      h: 0.25,
      fontSize: 10,
      color: '64748B'
    });

    slide.addText('Elaborado por: Ing. Civil Alejandra Tesara (Analista de Costos) | Destinatario: Dirección General y Presidencia · TIMACA', {
      x: 6.6,
      y: 7.02,
      w: 6.13,
      h: 0.25,
      fontSize: 10,
      color: '64748B',
      align: 'right'
    });
  };
"""
