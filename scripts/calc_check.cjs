const fs = require('fs');

// Calculate sum of TTE-C-0670:
const m670 = [11199.48, 10487.79, 10813.93, 8036.94, 8495.71, 5350.73, 11116.18, 16707, 15323.5];
const sum670 = m670.reduce((a, b) => a + b, 0);
console.log('TTE-C-0670 sum:', sum670);
console.log('Presupuesto $210.000, % uso:', (sum670 / 210000) * 100);

// Top 10 in Slide 4:
// 1. TTE-C-0706: 663316.03
// 2. TTE-C-0671: 307435.50
// 3. TTE-C-0653: 199356.12
// 4. TTE-C-0668: 167057.43
// 5. TTE-C-0694: 69832.65
// 6. TTE-C-0656: 68164.20
// 7. TTE-C-0678: 38571.95
// 8. TTE-C-0680: 31802.26
// 9. TTE-C-0640: 25052.76
// 10. TTE-C-0670: 15323.50
const top10 = [663316.03, 307435.50, 199356.12, 167057.43, 69832.65, 68164.20, 38571.95, 31802.26, 25052.76, 15323.50];
const top10Sum = top10.reduce((a, b) => a + b, 0);
console.log('Top 10 sum:', top10Sum);
console.log('Top 10 rounded:', Math.round(top10Sum));
console.log('Rest (15 ctws):', 1613224.52 - top10Sum);
