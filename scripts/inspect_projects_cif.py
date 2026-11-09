import re

with open(r'src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

ctas = ['TTE-C-0706', 'TTE-C-0671', 'TTE-C-0668', 'TTE-C-0680', 'TTE-C-0670', 'TTE-C-0694', 'TTE-C-0656']

for c in ctas:
    pos = text.find(f'"{c}":')
    if pos != -1:
        snippet = text[pos:pos+3000]
        bc_match = re.search(r'"byCategoriaMes":\s*\[(.*?)\]\s*,\s*"totalAnual"', snippet, re.DOTALL)
        if bc_match:
            cats = re.findall(r'\{[^\}]+\}', bc_match.group(1))
            if len(cats) >= 10:
                print(f'{c}: {cats[9].strip()}')
