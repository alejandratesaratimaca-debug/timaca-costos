import json
import re

names = ['LEGLANIS', 'KEYSERLING', 'HERNANDO', 'ASTRID', 'MANUEL', 'JORDI', 'RODOLFO', 'WUILLIANS', 'AMUNDARAIN', 'HERNAN GARCIA', 'JESSICA NAVARRO']

with open('src/data/realCursosData.json', 'r', encoding='utf-8') as f:
    cursos = json.load(f)

print('--- REAL CURSOS DATA ---')
found = set()
for c in cursos:
    nom = c.get('nombre', '').upper()
    for n in names:
        if n in nom and nom not in found:
            print(f"Nombre: {nom} | Cargo: {c.get('cargo')} | Dpto: {c.get('departamento')} | Empresa: {c.get('empresa')}")
            found.add(nom)

# Also check realCertificadosData.ts
with open('src/data/realCertificadosData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

print('\n--- REAL CERTIFICADOS MATCHES ---')
for n in names:
    m = re.findall(rf'(\{{[^\}}]*?{n}[^\}}]*?\}})', text, re.IGNORECASE | re.DOTALL)
    for match in m[:1]:
        print(f"Match for {n}: {match.strip()[:200]}")
