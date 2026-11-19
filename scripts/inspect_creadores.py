import urllib.request
import json

req = urllib.request.Request(
    'http://sip.timaca.com/api/acceso/entrar',
    data=json.dumps({'login': 'drivero', 'clave': '070717'}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Host': 'sip.timaca.com'}
)
cookie = urllib.request.urlopen(req).headers.get('Set-Cookie').split(';')[0]

# Fetch 1 month of solicitud-compras
scRes = urllib.request.Request('http://sip.timaca.com/api/solicitud-compras?desde=2026-10-01&hasta=2026-10-31', headers={'Host': 'sip.timaca.com', 'Cookie': cookie})
scList = json.loads(urllib.request.urlopen(scRes).read().decode('utf-8'))

print(f'Total SCs in October: {len(scList)}')

creadores = {}
compradores = {}
parejas = {}

for s in scList:
    c = s.get('creadaPor') or 'SIN_CREADOR'
    comp = s.get('comprador') or 'SIN_COMPRADOR'
    creadores[c] = creadores.get(c, 0) + 1
    compradores[comp] = compradores.get(comp, 0) + 1
    pair = f'{c} ---> {comp}'
    parejas[pair] = parejas.get(pair, 0) + 1

print('\n--- CreadaPor Frequencies ---')
for k, v in sorted(creadores.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v}')

print('\n--- Comprador Frequencies ---')
for k, v in sorted(compradores.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v}')

print('\n--- Top Creador ---> Comprador pairs ---')
for k, v in sorted(parejas.items(), key=lambda x: -x[1])[:20]:
    print(f'  {k}: {v}')
