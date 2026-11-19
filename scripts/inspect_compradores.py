import urllib.request
import json

login_data = json.dumps({'login': 'drivero', 'clave': '070717'}).encode('utf-8')
req = urllib.request.Request(
    'http://sip.timaca.com/api/acceso/entrar',
    data=login_data,
    headers={'Content-Type': 'application/json', 'Host': 'sip.timaca.com'}
)
resp = urllib.request.urlopen(req)
cookie = resp.headers.get('Set-Cookie').split(';')[0]

endpoints_to_test = [
    '/api/compradores',
    '/api/asignacion-sc/compradores',
    '/api/compradores/grupos',
    '/api/ordenes-compra/compradores',
    '/api/gestion-solicitudes/compradores'
]

for ep in endpoints_to_test:
    try:
        r = urllib.request.Request('http://sip.timaca.com' + ep, headers={'Host': 'sip.timaca.com', 'Cookie': cookie})
        res = urllib.request.urlopen(r)
        data = json.loads(res.read().decode('utf-8'))
        print(f'=== {ep} === (count: {len(data) if isinstance(data, list) else type(data)})')
        if isinstance(data, list):
            for item in data[:10]:
                print(' ', item)
        elif isinstance(data, dict):
            print('  Keys:', list(data.keys()))
            for k in list(data.keys())[:5]:
                print(f'  {k}:', str(data[k])[:100])
    except Exception as e:
        print(f'=== {ep} === ERROR:', e)
