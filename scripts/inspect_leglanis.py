import urllib.request
import json

req = urllib.request.Request(
    'http://sip.timaca.com/api/acceso/entrar',
    data=json.dumps({'login': 'drivero', 'clave': '070717'}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Host': 'sip.timaca.com'}
)
cookie = urllib.request.urlopen(req).headers.get('Set-Cookie').split(';')[0]

scRes = urllib.request.Request('http://sip.timaca.com/api/solicitud-compras?desde=2026-10-01&hasta=2026-10-31', headers={'Host': 'sip.timaca.com', 'Cookie': cookie})
scList = json.loads(urllib.request.urlopen(scRes).read().decode('utf-8'))

leglanis = [s for s in scList if (s.get('creadaPor') or '').upper() == 'LEGLANIS BRITO']
print(f'Total Leglanis SCs: {len(leglanis)}')
for l in leglanis:
    print(f"SC: {l.get('solicitud')} | OC: {l.get('ordenCompra')} | Prov: {l.get('proveedor')} | Mat: {l.get('descripcion')} | Comp: {l.get('comprador')} | Motivo: {l.get('motivo')} | Alm: {l.get('almacen')}")
