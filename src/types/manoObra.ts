export interface RegistroManoObraDiaria {
  id: string;
  fecha: string; // YYYY-MM-DD
  mes?: number; // 1 to 8
  diaSemana: string; // e.g. "Lunes", "Martes"
  semana: number; // e.g. 1 to 34
  cedula: string;
  trabajador: string;
  cargo: string;
  cuentaAuxiliar: string;
  proyectoCorto: string;
  horasNormales: number;
  horasExtras: number;
  totalHoras: number;
  tarifaHoraUsd: number;
  montoNormalUsd: number;
  montoExtraUsd: number;
  totalPagarUsd: number;
  sourceFile: string;
}
