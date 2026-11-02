const sipClient = require('./test_new_sip_client.cjs');
const db = require('./db.cjs');

(async () => {
  try {
    console.log("Iniciando prueba de ingesta directa Nuevo SIP ➔ SIGMA DB...");
    const consumos = await sipClient.getConsumos('01/10/2026', '31/10/2026');
    console.log(`Consumos obtenidos del Nuevo SIP: ${consumos.length}`);
    const statsConsumos = db.ingestConsumos(consumos);
    console.log("Stats Consumos en SIGMA DB:", statsConsumos);

    const compras = await sipClient.getCompras('01/10/2026', '31/10/2026');
    console.log(`Compras obtenidas del Nuevo SIP: ${compras.length}`);
    const statsCompras = db.ingestCompras(compras);
    console.log("Stats Compras en SIGMA DB:", statsCompras);

    console.log("¡Ingesta completada al 100% sin tocar un solo archivo Excel!");
  } catch (e) {
    console.error("Error en prueba de ingesta:", e);
  }
})();
