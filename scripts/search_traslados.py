import json, os

files_to_check = [
    'public/data/sip/unificada_octubre.json',
    'public/data/sip/unificada_septiembre.json',
    'public/data/sip/compras.json',
    'public/data/sip/consumos.json'
]

for fp in files_to_check:
    if not os.path.exists(fp): continue
    print(f"\n=== Searching in {fp} ===")
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        try:
            d = json.load(f)
        except Exception as e:
            print("Error loading json:", e)
            continue
        
        items = d if isinstance(d, list) else d.get('items', [])
        print(f"Total items: {len(items)}")
        for it in items:
            if not isinstance(it, dict): continue
            desc = str(it.get('descripcion') or it.get('concepto') or '').lower()
            cta = str(it.get('cuenta') or it.get('cuentaAuxiliar') or it.get('proyecto') or '')
            prov = str(it.get('proveedor') or it.get('beneficiario') or '').lower()
            monto = float(it.get('monto') or it.get('total') or it.get('montoUSD') or it.get('subtotal') or 0)
            
            # Look for 23k, 25k, traslado, pellas
            if ('traslado' in desc or 'transporte' in desc or 'traslado' in prov or 'transporte' in prov) and ('0706' in cta or 'pellas' in desc or 'pellas' in cta):
                print(f"  FOUND: Cta: {cta} | Prov: {it.get('proveedor')} | Desc: {it.get('descripcion') or it.get('concepto')} | Monto: ${monto}")
            elif ('0706' in cta) and (20000 <= monto <= 30000 or monto == 38600):
                print(f"  AMOUNT MATCH: Cta: {cta} | Prov: {it.get('proveedor')} | Desc: {it.get('descripcion') or it.get('concepto')} | Monto: ${monto}")
