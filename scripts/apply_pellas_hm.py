import json

# Restore clean HEAD first
import subprocess
subprocess.run(['git', 'checkout', 'src/data/realProyectosMensual2026.ts'], check=True)

with open('src/data/realProyectosMensual2026.ts', 'r', encoding='utf-8') as f:
    text = f.read()

header = text.split('export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = ')[0]
header += 'export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = '

json_str = text.split('export const MATRIZ_REAL_PROYECTOS_MENSUAL_2026: Record<string, ProyectoEvolutivoMensual> = ')[1].strip().rstrip(';')
data = json.loads(json_str)

pellas = data['TTE-C-0706']
pellas['byCategoriaMes'][9]['Horas Maquina'] = 58500.0
# Recalculate month 9 sum
oct_sum = round(sum(pellas['byCategoriaMes'][9].values()), 2)
pellas['meses'][9] = oct_sum
pellas['totalAnual'] = round(sum(pellas['meses']), 2)

print('Updated Pellas October sum:', oct_sum)
print('Updated Pellas totalAnual:', pellas['totalAnual'])
print('Updated byCategoriaMes[9]:', pellas['byCategoriaMes'][9])

new_ts = header + json.dumps(data, indent=2, ensure_ascii=False) + ";\n\nexport const REAL_PROYECTOS_MENSUAL_2026 = MATRIZ_REAL_PROYECTOS_MENSUAL_2026;\n"

with open('src/data/realProyectosMensual2026.ts', 'w', encoding='utf-8') as f:
    f.write(new_ts)

print("Saved updated realProyectosMensual2026.ts with ensure_ascii=False successfully!")
