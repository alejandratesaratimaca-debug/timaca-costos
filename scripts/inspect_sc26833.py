import urllib.request
import json

req = urllib.request.Request(
    'http://sip.timaca.com/api/acceso/entrar',
    data=json.dumps({'login': 'drivero', 'clave': '070717'}).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Host': 'sip.timaca.com'}
)
cookie = urllib.request.urlopen(req).headers.get('Set-Cookie').split(';')[0]

# Let's inspect /api/gestion-solicitudes
# Let's check query parameters for /api/gestion-solicitudes
# Usually ?desde=2026-10-01&hasta=2026-10-15 or similar
for ep in ['/api/gestion-solicitudes?desde=2026-10-01&hasta=2026-10-15', '/api/movimientos/salidas?desde=2026-10-01&hasta=2026-10-15']:
    try:
        r = urllib.request.Request('http://sip.timaca.com' + ep, headers={'Host': 'sip.timaca.com', 'Cookie': cookie})
        res = urllib.request.urlopen(r)
        data = json.loads(res.read().decode('utf-8'))
        print(f'{ep} count: {len(data) if isinstance(data, list) else type(data)}')
        if isinstance(data, list) and len(data) > 0:
            print(' Sample keys:', list(data[0].keys()))
            # find if SC26833 or 26835 is there
            matches = [d for d in data if any('26833' in str(v) or '26835' in str(v) for v in d.values())]
            print(f' Matches for 26833/26835: {len(matches)}')
            if matches:
                print(' Match sample:', json.dumps(matches[0], indent=2, ensure_ascii=False))
    except Exception as e:
        print(f'{ep} ERROR:', e)
