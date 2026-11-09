import { exportInformeToPPTX } from '../src/utils/exportInformeToPPTX';
import { resolveInformeMesData } from '../src/data/informeMesResolver';

async function main() {
  console.log('Starting export test...');
  const t0 = Date.now();
  try {
    await exportInformeToPPTX({
      selectedMesNum: 10,
      mesLabel: 'Octubre 2026',
      totalMes: 1444345.28,
      cuentasAuxiliaresMes: [
        { codigo: 'TTE-C-0706', proyecto: 'Línea 1 Pellas', total: 867861, porcentaje: 60.1 },
        { codigo: 'TTE-C-0653', proyecto: 'Rueda Dravo', total: 106812, porcentaje: 7.4 }
      ],
      categoriasMesAnalisis: [
        { categoria: 'Materiales Directos', monto: 524340, montoPrev: 552880, varPct: -5.2, varText: '-5,2%' },
        { categoria: 'Mano de Obra Directa', monto: 235066, montoPrev: 196665, varPct: 19.5, varText: '+19,5%' },
        { categoria: 'Horas Máquina', monto: 0, montoPrev: 55578, varPct: -100, varText: '-100,0%' },
        { categoria: 'Servicios Directos', monto: 778363, montoPrev: 69056, varPct: 1027.1, varText: '+1027,1%' },
        { categoria: 'Costos Indirectos', monto: 393375, montoPrev: 378300, varPct: 4.0, varText: '+4,0%' }
      ],
      pellasMesData: {
        montoMes: 867861,
        porcentajeMes: 60.1,
        acumulado2026: 3256839,
        cuadrilla: 254,
        nominaMes: 131238,
        horasMaquina: 0
      },
      notasGestion: 'Test notas'
    });
    console.log(`Success in ${Date.now() - t0}ms!`);
  } catch (err) {
    console.error('Error during export:', err);
  }
}

main();
