import json

with open('src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Strip export const REAL_PROYECTOS_MENSUAL_2026 = 
json_str = text.split('=', 1)[1].strip().rstrip(';')
data = json.loads(json_str)

pellas = data['TTE-C-0706']
print("Meses:", pellas['meses'])
print("Total Anual:", pellas['totalAnual'])
print("\nSeptiembre byCategoriaMes (idx 8):", pellas['byCategoriaMes'][8])
print("\nOctubre byCategoriaMes (idx 9):", pellas['byCategoriaMes'][9])
