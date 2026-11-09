import re

fpath = r'src/data/realProyectosMensual2026.ts'
with open(fpath, 'r', encoding='utf-8') as f:
    content = f.read()

# New CIF values for October (index 9)
new_cif = {
    'TTE-C-0706': 175409.81,
    'TTE-C-0671': 105668.40,
    'TTE-C-0668': 31989.33,
    'TTE-C-0680': 18297.76,
    'TTE-C-0670': 6819.04,
    'TTE-C-0694': 4265.24,
    'TTE-C-0656': 2179.42
}

# Update each project block
for cta, cif_val in new_cif.items():
    # Find project block
    pattern = rf'("{cta}":\s*\{{[\s\S]*?"meses":\s*\[)([\s\S]*?)(\][\s\S]*?"byCategoriaMes":\s*\[)([\s\S]*?)(\][\s\S]*?"totalAnual":\s*)([\d\.]+)'
    m = re.search(pattern, content)
    if not m:
        print(f"Warning: pattern not found for {cta}")
        continue
    
    pre_meses = m.group(1)
    meses_str = m.group(2)
    mid = m.group(3)
    cats_str = m.group(4)
    post = m.group(5)
    tot_anual = float(m.group(6))
    
    # Parse meses
    meses = [float(x.strip()) for x in meses_str.split(',')]
    
    # Parse category objects
    cat_objs = re.findall(r'\{[\s\S]*?\}', cats_str)
    if len(cat_objs) < 10:
        print(f"Warning: less than 10 category objects for {cta}")
        continue
    
    # In 10th category object, update "Costos Indirectos"
    oct_obj = cat_objs[9]
    old_cif_m = re.search(r'"Costos Indirectos":\s*([\d\.]+)', oct_obj)
    old_cif = float(old_cif_m.group(1)) if old_cif_m else 0.0
    
    new_oct_obj = re.sub(r'"Costos Indirectos":\s*[\d\.]+', f'"Costos Indirectos": {cif_val}', oct_obj)
    cat_objs[9] = new_oct_obj
    new_cats_str = ',\n      '.join(cat_objs)
    
    # Recalculate month 10 total
    # Extract categories from new_oct_obj
    cats_dict = {}
    for line in new_oct_obj.split('\n'):
        line_m = re.search(r'"([^"]+)":\s*([\d\.]+)', line)
        if line_m:
            cats_dict[line_m.group(1)] = float(line_m.group(2))
    
    new_oct_total = round(sum(cats_dict.values()), 2)
    meses[9] = new_oct_total
    new_meses_str = '\n      ' + ',\n      '.join(str(v) for v in meses) + '\n    '
    
    # Recalculate totalAnual
    new_tot_anual = round(sum(meses), 2)
    
    # Replace in content
    old_block = m.group(0)
    new_block = f'{pre_meses}{new_meses_str}{mid}\n      {new_cats_str}\n    {post}{new_tot_anual}'
    content = content.replace(old_block, new_block, 1)
    print(f"Updated {cta}: Old CIF={old_cif} -> New CIF={cif_val} | Old Oct={meses[9]} -> New Oct={new_oct_total} | New Total={new_tot_anual}")

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully updated {fpath}!")
