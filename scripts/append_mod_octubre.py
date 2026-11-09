import openpyxl
import datetime
import json

bg_files = [
    (r'C:\Users\alejandratesara\Downloads\2026 - BG sem 40.xlsx', '2026 - BG sem 40.xlsx'),
    (r'C:\Users\alejandratesara\Downloads\2026 - BG sem 41.xlsx', '2026 - BG sem 41.xlsx'),
    (r'C:\Users\alejandratesara\Downloads\2026 - BG sem 42.xlsx', '2026 - BG sem 42.xlsx'),
    (r'C:\Users\alejandratesara\Downloads\2026 - BG sem 43.xlsx', '2026 - BG sem 43.xlsx')
]

dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

new_records = []
bg_id = 1
for fpath, fname in bg_files:
    wb = openpyxl.load_workbook(fpath, data_only=True)
    ws = wb.active
    for r in range(4, ws.max_row + 1):
        sem = ws.cell(r, 2).value
        if sem is None or not str(sem).strip().isdigit():
            continue
        f_desde = ws.cell(r, 3).value
        cedula = ws.cell(r, 5).value
        trabajador = str(ws.cell(r, 6).value or '').strip()
        cargo = str(ws.cell(r, 7).value or '').strip()
        paquete = float(ws.cell(r, 10).value or 0)
        costo_hh = float(ws.cell(r, 11).value or 0)
        hn = float(ws.cell(r, 12).value or 0)
        he = float(ws.cell(r, 13).value or 0)
        thh = float(ws.cell(r, 14).value or (hn + he))
        
        if isinstance(f_desde, datetime.datetime):
            dt_str = f_desde.strftime('%Y-%m-%d')
            dia_str = dias[f_desde.weekday()]
        else:
            dt_str = str(f_desde)[:10] if f_desde else '2026-10-01'
            dia_str = 'Jueves'
            
        monto_norm = round(hn * costo_hh, 2)
        monto_extra = round(paquete - monto_norm, 2)
        
        new_records.append({
            "id": f"MDO-OCT-BG-{bg_id}",
            "fecha": dt_str,
            "mes": 10,
            "diaSemana": dia_str,
            "semana": int(sem),
            "cedula": f"V-{cedula}",
            "trabajador": trabajador,
            "cargo": cargo,
            "cuentaAuxiliar": "TTE-C-0680",
            "proyectoCorto": "Mantenimiento BG II",
            "horasNormales": hn,
            "horasExtras": he,
            "totalHoras": thh,
            "tarifaHoraUsd": round(costo_hh, 2),
            "montoNormalUsd": monto_norm,
            "montoExtraUsd": monto_extra,
            "totalPagarUsd": paquete,
            "sourceFile": fname
        })
        bg_id += 1

print(f"Generated {len(new_records)} Boca Grande records.")

refr_file = r'C:\Users\alejandratesara\Downloads\10-2026 Horas Hombre Octubre RRHH Proyecto FMO REFRACTARIO (BRIQUETAS) Sem 39 al 43.xlsx'
wb_r = openpyxl.load_workbook(refr_file, data_only=True)
ws_r = wb_r.active
refr_id = 1

for r in range(4, ws_r.max_row + 1):
    sem = ws_r.cell(r, 2).value
    if sem is None or not str(sem).strip().isdigit():
        continue
    f_desde = ws_r.cell(r, 3).value
    cedula = ws_r.cell(r, 5).value
    trabajador = str(ws_r.cell(r, 6).value or '').strip()
    cargo = str(ws_r.cell(r, 7).value or '').strip()
    cta = str(ws_r.cell(r, 10).value or 'TTE-C-0668').strip()
    paquete = float(ws_r.cell(r, 11).value or 0)
    costo_hh = float(ws_r.cell(r, 12).value or 0)
    hn = float(ws_r.cell(r, 13).value or 0)
    he = float(ws_r.cell(r, 14).value or 0)
    thh = hn + he
    
    if isinstance(f_desde, datetime.datetime):
        dt_str = f_desde.strftime('%Y-%m-%d')
        dia_str = dias[f_desde.weekday()]
    else:
        dt_str = str(f_desde)[:10] if f_desde else '2026-10-01'
        dia_str = 'Jueves'
        
    new_records.append({
        "id": f"MDO-OCT-BRIQ-REFR-{refr_id}",
        "fecha": dt_str,
        "mes": 10,
        "diaSemana": dia_str,
        "semana": int(sem),
        "cedula": f"V-{cedula}",
        "trabajador": trabajador,
        "cargo": cargo,
        "cuentaAuxiliar": cta,
        "proyectoCorto": "Briquetas Fase 2",
        "horasNormales": hn,
        "horasExtras": he,
        "totalHoras": thh,
        "tarifaHoraUsd": round(costo_hh, 2),
        "montoNormalUsd": paquete,
        "montoExtraUsd": 0,
        "totalPagarUsd": paquete,
        "sourceFile": "10-2026 Horas Hombre Octubre RRHH Proyecto FMO REFRACTARIO (BRIQUETAS) Sem 39 al 43.xlsx"
    })
    refr_id += 1

print(f"Generated {refr_id - 1} Refractario Briquetas records.")
print(f"Total new records: {len(new_records)}")

# Now read src/data/realManoObraOctubre2026.ts
target_path = r'src/data/realManoObraOctubre2026.ts'
with open(target_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Verify that ]; is near the end
marker = '];\n\nexport const TOTALES_MOD_OCTUBRE_2026 = {'
if marker not in content:
    raise Exception(f"Marker not found in {target_path}")

# Format new records as JSON chunks
formatted_records = []
for rec in new_records:
    json_str = "  " + json.dumps(rec, ensure_ascii=False, indent=2).replace("\n", "\n  ")
    formatted_records.append(json_str)

records_text = ",\n" + ",\n".join(formatted_records) + "\n];"

new_totales = """export const TOTALES_MOD_OCTUBRE_2026 = {
  totalHorasHombre: 69635,
  totalMontoUSD: 257750.81520542324,
  totalRegistros: 1721,
  pmh: {
    horas: 23289,
    montoUSD: 80660.65720542324,
    registros: 585
  },
  briquetas: {
    horas: 7512,
    montoUSD: 32215,
    registros: 197
  },
  pellas: {
    horas: 34888,
    montoUSD: 131190.158,
    registros: 879
  },
  bocaGrande: {
    horas: 3946,
    montoUSD: 13685,
    registros: 60
  }
};"""

# Replace the closing array and totales
updated_content = content.replace(
    content[content.rfind('  }\n];'):],
    '  }' + records_text + '\n\n' + new_totales + '\n'
)

# Also update the header comment
updated_content = updated_content.replace(
    '// Total Auditado: 64.585 Horas Hombre | $235,065.82 USD (1.629 registros)',
    '// Total Auditado: 69.635 Horas Hombre | $257.750,82 USD (1.721 registros)'
)
updated_content = updated_content.replace(
    '// 3) HORAS HOMBRE PELLA SEM 40-2026 .xlsx a SEM 43-2026 .xlsx (4 Semanas de Nómina Pellas)',
    '// 3) HORAS HOMBRE PELLA SEM 40-2026 .xlsx a SEM 43-2026 .xlsx (4 Semanas de Nómina Pellas)\n// 4) 2026 - BG sem 40.xlsx a sem 43.xlsx (4 Semanas Boca Grande II)\n// 5) 10-2026 Horas Hombre Octubre RRHH Proyecto FMO REFRACTARIO (BRIQUETAS) Sem 39 al 43.xlsx'
)

with open(target_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print(f"Successfully updated {target_path}!")
