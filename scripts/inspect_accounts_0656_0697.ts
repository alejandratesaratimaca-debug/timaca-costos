import { MATRIZ_REAL_PROYECTOS_MENSUAL_2026 } from '../src/data/realProyectosMensual2026';

const c0656 = MATRIZ_REAL_PROYECTOS_MENSUAL_2026['TTE-C-0656'];
const c0697 = MATRIZ_REAL_PROYECTOS_MENSUAL_2026['TTE-C-0697'];

console.log("=== TTE-C-0656 ===");
console.log("Descripcion:", c0656?.descripcion);
console.log("Total Anual:", c0656?.totalAnual);
console.log("Meses:", c0656?.meses);

console.log("\n=== TTE-C-0697 ===");
console.log("Descripcion:", c0697?.descripcion);
console.log("Total Anual:", c0697?.totalAnual);
console.log("Meses:", c0697?.meses);
