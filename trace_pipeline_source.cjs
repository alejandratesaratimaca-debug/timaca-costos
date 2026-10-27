const path = require('path');
const xlsx = require('./node_modules/xlsx');

console.log('=== RASTREO DE ORIGEN DEL ERROR EN LA CADENA DE EXCEL ===\n');

const files = [
  { name: '1 Base Central Inputs.xlsx', path: 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/1 Base Central Inputs.xlsx' },
  { name: '2 Analisis Consumos - Master.xlsx', path: 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/2 Analisis Consumos - Master.xlsx' },
  { name: '4 Master Unificado.xlsx', path: 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/1 Informe/4 Master Unificado.xlsx' },
  { name: 'Modelo_Estrella_Costos_TIMACA.xlsx', path: 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Modelo_Estrella_Costos_TIMACA/Modelo_Estrella_Costos_TIMACA.xlsx' }
];

const targetCodes = ['SC26299', 'SC25795', 'SC25774', 'SC25773'];

files.forEach(fileInfo => {
  console.log(`\n-------------------------------------------------------------`);
  console.log(`ANALIZANDO ARCHIVO: [${fileInfo.name}]`);
  console.log(`-------------------------------------------------------------`);
  
  try {
    const wb = xlsx.readFile(fileInfo.path, { bookSheets: true });
    console.log(`Hojas disponibles:`, wb.SheetNames);
    
    // Leer cada hoja
    const fullWb = xlsx.readFile(fileInfo.path);
    wb.SheetNames.forEach(sheetName => {
      const sheet = fullWb.Sheets[sheetName];
      if (!sheet) return;
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      if (data.length === 0) return;
      
      const headers = data[0] || [];
      // Buscar si alguna fila contiene targetCodes
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        if (!row) continue;
        const rowStr = JSON.stringify(row);
        for (const code of targetCodes) {
          if (rowStr && rowStr.includes(code)) {
            console.log(`  >>> ENCONTRADO [${code}] en Hoja [${sheetName}], Fila ${r + 1}:`);
            // Mostrar columnas clave
            row.forEach((val, cIdx) => {
              const h = headers[cIdx] || `Col_${cIdx}`;
              const hStr = String(h).toLowerCase();
              if (hStr.includes('fecha') || hStr.includes('mes') || hStr.includes('año') || hStr.includes('ano') || hStr.includes('monto') || hStr.includes('total') || hStr.includes('numero') || hStr.includes('pedido') || hStr.includes('desc')) {
                console.log(`      ${h}: ${val}`);
              }
            });
          }
        }
      }
    });
  } catch (err) {
    console.error(`Error leyendo ${fileInfo.name}:`, err.message);
  }
});
