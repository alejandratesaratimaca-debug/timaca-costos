import sys
import os

# Add scripts/pptx_slides to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
slides_dir = os.path.join(current_dir, 'pptx_slides')
sys.path.insert(0, slides_dir)

import part0_header
import part1_slide0_portada
import part2_slide1_evolucion_matriz
import part3_slide2_distribucion_variacion_kpis
import part4_slide3_nomina
import part5_slide4_proyectos_pareto_presupuesto
import part6_slide5_variaciones_mixprocura
import part7_slide6_pellas
import part8_slide7_servicios_horas_maquina
import part9_slide8_pmh
import part10_slide9_dravo
import part11_slide10_cif
import part12_slide11_conclusiones
import part13_footer

parts = [
    part0_header,
    part1_slide0_portada,
    part2_slide1_evolucion_matriz,
    part3_slide2_distribucion_variacion_kpis,
    part4_slide3_nomina,
    part5_slide4_proyectos_pareto_presupuesto,
    part6_slide5_variaciones_mixprocura,
    part7_slide6_pellas,
    part8_slide7_servicios_horas_maquina,
    part9_slide8_pmh,
    part10_slide9_dravo,
    part11_slide10_cif,
    part12_slide11_conclusiones,
    part13_footer
]

output_path = os.path.join(current_dir, '..', 'src', 'utils', 'exportInformeToPPTX.ts')
output_path = os.path.abspath(output_path)

print(f"Assembling {len(parts)} parts into {output_path}...")
full_code = []
for idx, p in enumerate(parts):
    print(f"Adding part {idx}: {p.__name__}")
    full_code.append(p.get_code())

combined = "\n".join(full_code)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(combined)

print(f"Successfully generated {output_path} ({len(combined)} characters, {combined.count('\n')} lines).")
