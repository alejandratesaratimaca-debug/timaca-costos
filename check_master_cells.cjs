const xlsx = require('./node_modules/xlsx');

console.log('=== VERIFICANDO CONEXIONES Y CONSULTAS EN 4 Master Unificado.xlsx ===');
const wbMaster = xlsx.readFile('C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx');

// Ver si hay hojas ocultas o nombres de tablas
console.log('Hojas en Master Unificado:', wbMaster.SheetNames);

// Verificar la fila 97654 (SC25774) y 97655 (SC26299)
const sheetUnif = wbMaster.Sheets['Unificada'];
// En SheetJS podemos inspeccionar las celdas directamente
// Columna C es la fecha (columna 2 en 0-index)
console.log('Celda C97654 (SC25774):', sheetUnif['C97654']);
console.log('Celda C97655 (SC26299):', sheetUnif['C97655']);
console.log('Celda AM97655 (Año):', sheetUnif['AM97655']);
console.log('Celda AN97655 (Mes):', sheetUnif['AN97655']);
