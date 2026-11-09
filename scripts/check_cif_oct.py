import re

with open(r'src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\"cuentaAuxiliar\":\s*\"([^\"]+)\".*?\"byCategoriaMes\":\s*\[(.*?)\]\s*,\s*\"totalAnual\"'
matches = re.findall(pattern, text, re.DOTALL)
print(f'Total projects found: {len(matches)}')
cif_oct = {}
for cta, cats_str in matches:
    objs = re.findall(r'\{[^\}]+\}', cats_str)
    if len(objs) >= 10:
        oct_obj = objs[9]
        m = re.search(r'\"Costos Indirectos\":\s*([\d\.]+)', oct_obj)
        if m:
            val = float(m.group(1))
            if val > 0:
                cif_oct[cta] = val

print('Current October CIF in realProyectosMensual2026.ts:')
for cta, val in sorted(cif_oct.items(), key=lambda x: -x[1]):
    print(f'  {cta}: {val}')
print('Total CIF Octobre in projects:', sum(cif_oct.values()))
