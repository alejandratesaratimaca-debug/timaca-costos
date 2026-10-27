const fs = require('fs');

const excelPath = 'C:/Users/alejandratesara/Desktop/Alejandra T/Costos Alejandra/Consolidado_Oficial_2026_Limpio.xlsx';
try {
  const fd = fs.openSync(excelPath, 'r+');
  fs.closeSync(fd);
  console.log('File is NOT locked. Can be updated directly.');
} catch (e) {
  console.log('File IS locked by Excel:', e.message);
}
