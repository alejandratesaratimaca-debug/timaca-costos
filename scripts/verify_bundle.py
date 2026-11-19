import urllib.request
import re

url_prod = 'https://timaca-costos.vercel.app/'
html = urllib.request.urlopen(url_prod).read().decode()
main_js = re.findall(r'/assets/index-[^"\'\s]+\.js', html)[0]
index_content = urllib.request.urlopen('https://timaca-costos.vercel.app' + main_js).read().decode()
chunks = re.findall(r'MasterUnificadoSipView-[^"\'\s]+\.js', index_content)
chunk_url = 'https://timaca-costos.vercel.app/assets/' + chunks[0]

js = urllib.request.urlopen(chunk_url).read().decode()
found = 'Estado RC (Finiquito)' in js or 'Solo Sin RC' in js
print('Production MasterUnificado chunk:', chunk_url)
print('Production has RC filter:', found)
