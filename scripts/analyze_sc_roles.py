import json
import re

with open('public/data/sip/unificada_octubre.json', 'r', encoding='utf-8') as f:
    oct_data = json.load(f)
items = oct_data.get('items', []) if isinstance(oct_data, dict) else oct_data

compras_servicios = [r for r in items if r.get('tipo') in ['Servicios', 'Compras'] or str(r.get('numero', '')).startswith('SC')]

print(f'Total compras y servicios en Octubre: {len(compras_servicios)}')

# Check how many have a solicitante in motivo
sol_regex = re.compile(r'(?:SOLICITA(?:NTE|DO\s+POR)?|PARA|ATN|ATENCION|ING|INGENIERO|SR|SRA)\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s\.]+)', re.IGNORECASE)

found_in_motivo = 0
for r in compras_servicios:
    mot = r.get('motivo') or ''
    m = sol_regex.search(mot)
    if m:
        found_in_motivo += 1

print(f'Compras/Servicios con posible solicitante en motivo: {found_in_motivo} de {len(compras_servicios)}')

# Check unique creadores
creadores = set(r.get('creadaPor') for r in compras_servicios if r.get('creadaPor'))
print('Creadores únicos en compras/servicios Octubre:', creadores)

# Check unique compradores
compradores = set(r.get('comprador') for r in compras_servicios if r.get('comprador'))
print('Compradores únicos en compras/servicios Octubre:', compradores)
