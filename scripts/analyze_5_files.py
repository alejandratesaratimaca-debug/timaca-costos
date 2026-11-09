import openpyxl
import os

bg_files = [
    r'C:\Users\alejandratesara\Downloads\2026 - BG sem 40.xlsx',
    r'C:\Users\alejandratesara\Downloads\2026 - BG sem 41.xlsx',
    r'C:\Users\alejandratesara\Downloads\2026 - BG sem 42.xlsx',
    r'C:\Users\alejandratesara\Downloads\2026 - BG sem 43.xlsx'
]

print("=== ANALISIS BOCA GRANDE (TTE-C-0680) ===")
tot_bg_cost = 0
tot_bg_hh = 0
tot_bg_he = 0
tot_bg_hn = 0
bg_workers_unique = set()

for f in bg_files:
    wb = openpyxl.load_workbook(f, data_only=True)
    ws = wb.active
    w_cost = 0
    w_hh = 0
    w_he = 0
    w_hn = 0
    workers = 0
    sem_num = None
    for r in range(4, ws.max_row + 1):
        sem = ws.cell(r, 2).value
        if sem is None: continue
        sem_num = sem
        cedula = ws.cell(r, 5).value
        bg_workers_unique.add(cedula)
        paquete = ws.cell(r, 10).value or 0
        costo_hh = ws.cell(r, 11).value or 0
        hn = ws.cell(r, 12).value or 0
        he = ws.cell(r, 13).value or 0
        thh = ws.cell(r, 14).value or (hn + he)
        
        w_cost += paquete
        w_hh += thh
        w_hn += hn
        w_he += he
        workers += 1
    tot_bg_cost += w_cost
    tot_bg_hh += w_hh
    tot_bg_hn += w_hn
    tot_bg_he += w_he
    print(f"Semana {sem_num}: {workers} filas | HN: {w_hn} | HE: {w_he} | Total HH: {w_hh} | Costo Paquete: ${w_cost}")

print(f"TOTAL BOCA GRANDE: Costo: ${tot_bg_cost} | Total HH: {tot_bg_hh} | HN: {tot_bg_hn} | HE: {tot_bg_he} | Trabajadores Unicos: {len(bg_workers_unique)}")
print()

print("=== ANALISIS BRIQUETAS REFRACTARIO (TTE-C-0668) ===")
refr_file = r'C:\Users\alejandratesara\Downloads\10-2026 Horas Hombre Octubre RRHH Proyecto FMO REFRACTARIO (BRIQUETAS) Sem 39 al 43.xlsx'
wb_r = openpyxl.load_workbook(refr_file, data_only=True)
ws_r = wb_r.active
refr_weeks = {}
tot_refr_cost = 0
tot_refr_hh = 0
tot_refr_hn = 0
tot_refr_he = 0
refr_workers_unique = set()

for r in range(4, ws_r.max_row + 1):
    sem = ws_r.cell(r, 2).value
    if sem is None: continue
    cedula = ws_r.cell(r, 5).value
    refr_workers_unique.add(cedula)
    cta = ws_r.cell(r, 10).value
    paquete = ws_r.cell(r, 11).value or 0
    costo_hh = ws_r.cell(r, 12).value or 0
    hn = ws_r.cell(r, 13).value or 0
    he = ws_r.cell(r, 14).value or 0
    thh = (hn + he)
    
    if sem not in refr_weeks:
        refr_weeks[sem] = {'cost': 0, 'hh': 0, 'hn': 0, 'he': 0, 'count': 0, 'cta': cta}
    refr_weeks[sem]['cost'] += paquete
    refr_weeks[sem]['hh'] += thh
    refr_weeks[sem]['hn'] += hn
    refr_weeks[sem]['he'] += he
    refr_weeks[sem]['count'] += 1
    tot_refr_cost += paquete
    tot_refr_hh += thh
    tot_refr_hn += hn
    tot_refr_he += he

for s in sorted(refr_weeks.keys(), key=lambda x: int(str(x).strip()) if str(x).strip().isdigit() else 999):
    v = refr_weeks[s]
    print(f"Semana {s} ({v['cta']}): {v['count']} filas | HN: {v['hn']} | HE: {v['he']} | Total HH: {v['hh']} | Costo: ${v['cost']}")

print(f"TOTAL REFRACTARIO: Costo: ${tot_refr_cost} | Total HH: {tot_refr_hh} | HN: {tot_refr_hn} | HE: {tot_refr_he} | Trabajadores Unicos: {len(refr_workers_unique)}")
