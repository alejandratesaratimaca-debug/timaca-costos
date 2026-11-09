import re

with open('src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\"cuentaAuxiliar\":\s*\"(TTE-C-[^\"]+)\".*?\"descripcion\":\s*\"([^\"]+)\".*?\"meses\":\s*\[(.*?)\]'
matches = re.findall(pattern, text, re.DOTALL)

items = []
for cta, desc, meses_str in matches:
    vals = [float(x.strip()) for x in meses_str.split(',') if x.strip()]
    if len(vals) >= 10 and vals[9] > 0:
        items.append((cta, desc, vals[9]))

items.sort(key=lambda x: -x[2])
print(f'Total active external projects in October: {len(items)}')
total_oct = sum(x[2] for x in items)
print(f'Total October across all {len(items)} projects: {total_oct:,.2f}')
for idx, (cta, desc, val) in enumerate(items, 1):
    pct = (val / total_oct) * 100
    print(f'{idx:2}. {cta}: {desc[:35]:35} = ${val:,.2f} ({pct:4.1f}%)')
