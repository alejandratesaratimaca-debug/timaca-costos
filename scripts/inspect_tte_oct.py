import re

with open('src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\"cuentaAuxiliar\":\s*\"(TTE-C-[^\"]+)\".*?\"meses\":\s*\[(.*?)\]'
matches = re.findall(pattern, text, re.DOTALL)
print('Found TTE-C- projects:', len(matches))
oct_sum = 0
for cta, meses_str in matches:
    vals = [float(x.strip()) for x in meses_str.split(',') if x.strip()]
    if len(vals) >= 10:
        oct_val = vals[9]
        if oct_val > 0:
            oct_sum += oct_val
            print(f'{cta}: {oct_val:,.2f}')
print(f'Total October TTE-C- sum: {oct_sum:,.2f}')
