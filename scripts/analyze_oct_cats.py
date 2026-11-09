import re
import json

with open('src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\"cuentaAuxiliar\":\s*\"(TTE-C-[^\"]+)\".*?\"byCategoriaMes\":\s*\[(.*?)\]\s*,\s*\"totalAnual\"'
matches = re.findall(pattern, text, re.DOTALL)

cat_totals = {}
for cta, cats_str in matches:
    objs = re.findall(r'\{[^\}]+\}', cats_str)
    if len(objs) >= 10:
        oct_obj_str = objs[9]
        # parse key-values
        # e.g. "Materiales Directos": 524340.0, "Servicios Directos": 778363.0, ...
        kvs = re.findall(r'\"([^\"]+)\":\s*([\d\.]+)', oct_obj_str)
        for k, v in kvs:
            cat_totals[k] = cat_totals.get(k, 0.0) + float(v)

print('October Category Totals in TTE-C- projects:')
for k, v in sorted(cat_totals.items(), key=lambda x: -x[1]):
    print(f'  {k:25}: {v:,.2f}')
print(f'  {"TOTAL":25}: {sum(cat_totals.values()):,.2f}')
