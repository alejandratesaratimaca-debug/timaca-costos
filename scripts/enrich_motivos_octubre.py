import json

unificada_path = 'public/data/sip/unificada_octubre.json'
with open(unificada_path, 'r', encoding='utf-8') as f:
    unificada = json.load(f)

with open('public/data/sip/compras.json', 'r', encoding='utf-8') as f:
    compras = json.load(f).get('items', [])

compras_map = {}
for c in compras:
    sc = (c.get('solicitudCompra') or '').strip().upper()
    oc = (c.get('ordenCompra') or '').strip().upper()
    mot = (c.get('motivo') or '').strip()
    if sc and mot:
        compras_map[(sc, oc)] = mot
        compras_map[sc] = mot

updated = 0
for u in unificada['items']:
    sc = (u.get('numero') or '').strip().upper()
    oc = (u.get('pedido') or '').strip().upper()
    real_mot = compras_map.get((sc, oc)) or compras_map.get(sc)
    if real_mot and real_mot != u.get('motivo'):
        u['motivo'] = real_mot
        updated += 1

with open(unificada_path, 'w', encoding='utf-8') as f:
    json.dump(unificada, f, ensure_ascii=False, indent=2)

print(f'Successfully updated {updated} motives in {unificada_path}')
