import urllib.request
import json
import re

login_data = json.dumps({'login': 'drivero', 'clave': '070717'}).encode('utf-8')
req = urllib.request.Request(
    'http://sip.timaca.com/api/acceso/entrar',
    data=login_data,
    headers={'Content-Type': 'application/json', 'Host': 'sip.timaca.com'}
)
resp = urllib.request.urlopen(req)
cookie = resp.headers.get('Set-Cookie').split(';')[0]
print('Cookie obtained:', cookie[:35])

req_html = urllib.request.Request('http://sip.timaca.com/', headers={'Host': 'sip.timaca.com', 'Cookie': cookie})
html = urllib.request.urlopen(req_html).read().decode('utf-8')
scripts = re.findall(r'src=["\']([^"\']+\.js)', html)
print('Scripts found:', len(scripts))

all_apis = set()
for s in scripts:
    url = s if s.startswith('http') else 'http://sip.timaca.com/' + s.lstrip('/')
    try:
        req_s = urllib.request.Request(url, headers={'Host': 'sip.timaca.com', 'Cookie': cookie})
        content = urllib.request.urlopen(req_s).read().decode('utf-8')
        apis = re.findall(r'/api/[a-zA-Z0-9\-_/]+', content)
        for a in apis:
            all_apis.add(a)
    except Exception as e:
        print('Error with script:', s, e)

print(f'Total APIs discovered: {len(all_apis)}')
for a in sorted(all_apis):
    if any(k in a.lower() for k in ['compra', 'orden', 'solicitud', 'usuario', 'empleado', 'personal', 'rol', 'perfil', 'movimiento', 'vale', 'pedido']):
        print(' ', a)
