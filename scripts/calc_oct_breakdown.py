import json, re

with open('src/data/realManoObraOctubre2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Parse items
# We can find each object {...}
pattern = re.compile(r'\{[^{}]*"totalPagarUsd":\s*([0-9.]+)[^{}]*"proyectoCorto":\s*"([^"]+)"[^{}]*\}', re.DOTALL)
matches = pattern.findall(text)
print("Regex matches found:", len(matches))

from collections import defaultdict
totals = defaultdict(float)
records_count = defaultdict(int)

# Let's do a more robust parse
import ast
lines = text.split('\n')
cur = {}
all_objs = []
for line in lines:
    line = line.strip()
    if line.startswith('{'):
        cur = {}
    elif line.startswith('}'):
        if cur:
            all_objs.append(cur)
            cur = {}
    elif ':' in line:
        k = line.split(':')[0].strip().replace('"', '')
        v = ':'.join(line.split(':')[1:]).strip().rstrip(',')
        if v.startswith('"') and v.endswith('"'):
            v = v[1:-1]
        elif v.replace('.', '', 1).isdigit():
            v = float(v)
        cur[k] = v

print("Parsed objects:", len(all_objs))
for obj in all_objs:
    proj = obj.get('proyectoCorto', 'Desconocido')
    cta = obj.get('cuentaAuxiliar', '')
    amt = float(obj.get('totalPagarUsd', 0))
    totals[proj] += amt
    totals[cta] += amt
    records_count[proj] += 1

print("\n--- Totals by Proyecto Corto ---")
for p, amt in sorted(totals.items(), key=lambda x: -x[1]):
    if p.startswith('TTE'): continue
    print(f"  {p:25s}: ${amt:10.2f} USD ({records_count[p]} records)")

print("\n--- Totals by Cuenta Auxiliar ---")
for c, amt in sorted(totals.items(), key=lambda x: -x[1]):
    if not c.startswith('TTE'): continue
    print(f"  {c:15s}: ${amt:10.2f} USD")
