import json

# Check in src/data/usuarios or rrhh or mockRRHHData or db
try:
    with open('src/data/mockRRHHData.ts', 'r', encoding='utf-8') as f:
        print('Found mockRRHHData.ts')
except Exception as e:
    pass

# Search for Leglanis, Keyserling, Hernando, Astrid, Manuel, Jordi, Rodolfo, Wuillians in src/data
names = ['LEGLANIS', 'KEYSERLING', 'HERNANDO', 'ASTRID', 'MANUEL', 'JORDI', 'RODOLFO', 'WUILLIANS', 'PEREDA', 'CHAVEZ', 'SILVA', 'GUZMAN', 'BRITO', 'LOPEZ', 'GOMEZ', 'MEJIAS', 'SAYAGO', 'SABINO', 'DEVERA']

import os
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.json')):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    matches = [n for n in names if n in content.upper()]
                    if len(matches) >= 3:
                        print(f'{p} has matches: {matches[:5]}')
            except:
                pass
