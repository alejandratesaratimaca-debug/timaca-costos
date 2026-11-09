import re

with open('src/data/realManoObraOctubre2026.ts', 'r', encoding='utf-8') as f:
    content = f.read()

cedulas = set(re.findall(r'"cedula":\s*"([^"]+)"', content))
trabajadores = set(t.strip().upper() for t in re.findall(r'"trabajador":\s*"([^"]+)"', content))

print("Total unique cedulas in realManoObraOctubre2026.ts:", len(cedulas))
print("Total unique trabajador names in realManoObraOctubre2026.ts:", len(trabajadores))

# Check Boca Grande records
bg_workers = set(re.findall(r'"trabajador":\s*"([^"]+)".*?"proyectoCorto":\s*"Mantenimiento BG II"', content, re.DOTALL))
print("Boca Grande unique workers:", len(bg_workers))
