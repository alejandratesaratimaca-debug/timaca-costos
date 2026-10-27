import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

const pellas = MATRIZ_REAL_PROYECTOS_MENSUAL_2026['TTE-C-0706'];
console.log("Pellas byCategoriaMes for Servicios:");
let sumServ = 0;
pellas.byCategoriaMes.forEach((c, i) => {
  const s = c["Servicios"] || 0;
  sumServ += s;
  console.log(`Mes ${i+1}: $${s.toFixed(2)} | Running = $${sumServ.toFixed(2)}`);
});
console.log(`\nTotal Servicios Pellas in Matriz: $${sumServ.toFixed(2)}`);
