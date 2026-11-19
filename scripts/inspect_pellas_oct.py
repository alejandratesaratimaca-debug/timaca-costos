import re

with open('src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'"cuentaAuxiliar":\s*"TTE-C-0706".*?"byCategoriaMes":\s*\[(.*?)\]\s*,\s*"totalAnual"'
m = re.search(pattern, text, re.DOTALL)
if m:
    objs = re.findall(r'\{[^\}]+\}', m.group(1))
    print("October 0706 categories:")
    for kv in re.findall(r'"([^"]+)":\s*([\d\.]+)', objs[9]):
        print(f"  {kv[0]}: ${float(kv[1]):,.2f}")
