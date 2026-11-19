import json

with open('src/data/realCursosData.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

trabajadores = d.get('trabajadores', [])
names = ['LEGLANIS', 'KEYSERLING', 'HERNANDO', 'ASTRID', 'MANUEL', 'JORDI', 'RODOLFO', 'WUILLIANS', 'AMUNDARAIN', 'HERNAN', 'JESSICA']

for t in trabajadores:
    nom = (t.get('nombre') or t.get('trabajador') or '').upper()
    for n in names:
        if n in nom:
            print(f"Nombre: {nom} | Cargo: {t.get('cargo')} | Dpto: {t.get('departamento')}")
