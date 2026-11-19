import json

with open('public/data/sip/unificada_octubre.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
items = data if isinstance(data, list) else data.get('items', [])

for prov in ['VG CARGO', 'ELECTROTECNICA', 'HIRACA', 'CALZADILLA', 'TEODOSIO']:
    matches = [r for r in items if prov in str(r.get('proveedor', '')).upper()]
    print(f'=== {prov} ({len(matches)} rows) ===')
    for m in matches[:2]:
        print(f"SC: {m.get('numero')} | OC: {m.get('pedido')}")
        print(f"  Solicitante campo: {m.get('solicitante')}")
        print(f"  solicitante_real:  {m.get('solicitante_real')}")
        print(f"  creadaPor:         {m.get('creadaPor')}")
        print(f"  comprador:         {m.get('comprador')}")
        print(f"  motivo:            {m.get('motivo')}")
