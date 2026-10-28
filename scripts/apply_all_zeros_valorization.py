import json
import os
import shutil
import datetime
import statistics
import openpyxl
from collections import defaultdict

print("================================================================================")
print("INICIANDO VALORIZACION MASIVA DE DESPACHOS EN $0.00 - AUDITORIA DE COSTOS")
print("================================================================================")

months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

# ------------------------------------------------------------------------------
# PASO 1: CONSTRUIR CATALOGO DE PRECIOS UNIFICADO (SIP 2026 + HISTORICO 2025)
# ------------------------------------------------------------------------------
print("\n--- PASO 1: Construyendo catalogo unificado de precios ---")
sip_prices = defaultdict(list)
catalog_desc = {}
catalog_unit = {}

for m in months:
    path = f'public/data/sip/unificada_{m}.json'
    if not os.path.exists(path):
        continue
    try:
        with open(path, 'r', encoding='utf-8') as fp:
            d = json.load(fp)
        for r in d.get('items', []):
            tipo = str(r.get('tipo', '')).strip()
            cod = str(r.get('codigo', '')).strip().upper()
            precio = float(r.get('precio_final') or 0)
            tot = float(r.get('total_usd') or 0)
            cant = float(r.get('cantidad') or 0)
            ajuste = str(r.get('ajuste') or '')

            # Only genuine original prices (not previously artificially adjusted)
            if 'MATERIAL' in tipo.upper() and cod and not cod.startswith('SE'):
                if not ajuste.startswith('VALORIZADO'):
                    if precio > 0 and 0.001 < precio < 50000:
                        sip_prices[cod].append(precio)
                    elif cant > 0 and tot > 0:
                        unit_p = round(tot / cant, 4)
                        if 0.001 < unit_p < 50000:
                            sip_prices[cod].append(unit_p)

            if cod and cod not in catalog_desc and r.get('descripcion'):
                catalog_desc[cod] = str(r.get('descripcion')).strip()
            if cod and cod not in catalog_unit and r.get('unidad'):
                catalog_unit[cod] = str(r.get('unidad')).strip()
    except Exception as e:
        print(f"Error leyendo {path}: {e}")

print(f"Precios recolectados de SIP 2026: {len(sip_prices)} codigos.")

# Load Historico 2025
hist_path = r'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Historico Consumos 2025.xlsx'
hist_prices = defaultdict(list)

if os.path.exists(hist_path):
    print(f"Cargando {hist_path}...")
    wb = openpyxl.load_workbook(hist_path, read_only=True)
    sheet = wb['2025']
    for row in sheet.iter_rows(min_row=2, values_only=True):
        cod = str(row[7] or '').strip().upper()
        p_final = row[29]
        u_final = row[18]
        p = None
        if p_final is not None:
            try: p = float(p_final)
            except: pass
        if (p is None or p <= 0) and u_final is not None:
            try: p = float(u_final)
            except: pass
        if cod and p is not None and 0.001 < p < 50000:
            hist_prices[cod].append(p)
            if cod not in catalog_desc and row[8]:
                catalog_desc[cod] = str(row[8]).strip()
            if cod not in catalog_unit and row[10]:
                catalog_unit[cod] = str(row[10]).strip()
    print(f"Precios recolectados de Historico 2025: {len(hist_prices)} codigos.")

# Build final unified catalog:
# If SIP 2026 has >= 2 data points, use SIP median. Otherwise if 2025 has data, use 2025 median (or combine).
unified_catalog = {}
for cod, plist in sip_prices.items():
    unified_catalog[cod] = statistics.median(plist)

for cod, plist in hist_prices.items():
    if cod not in unified_catalog:
        unified_catalog[cod] = statistics.median(plist)

print(f"Catalogo Maestro Unificado: {len(unified_catalog)} codigos indexados.")

# ------------------------------------------------------------------------------
# PASO 2: VALORIZAR TODOS LOS DESPACHOS EN $0.00 EN LOS JSON MENSUALES
# ------------------------------------------------------------------------------
print("\n--- PASO 2: Procesando datasets mensuales ---")
now_iso = datetime.datetime.now().isoformat()
all_new_corrections = []

total_vales_valorizados = 0
total_usd_reintegrado = 0.0
stats_por_mes = {}
stats_por_proyecto = defaultdict(lambda: {'count': 0, 'usd': 0.0, 'nombre': ''})

for m in months:
    path = f'public/data/sip/unificada_{m}.json'
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as fp:
        d = json.load(fp)

    items = d.get('items', [])
    m_vales = 0
    m_usd = 0.0

    for idx, r in enumerate(items):
        tipo = str(r.get('tipo', '')).strip()
        cod = str(r.get('codigo', '')).strip().upper()
        tot = float(r.get('total_usd') or 0)
        cant = float(r.get('cantidad') or 0)
        num = str(r.get('numero') or r.get('id') or f"MOV-{idx}").strip()
        cta = str(r.get('cuenta_aux') or 'S/A').strip().upper()
        desc_proy = str(r.get('datos_descripcion') or cta).strip()
        ajuste = str(r.get('ajuste') or '')

        # Check if already valorized in previous Pellas run
        is_already_val = ajuste.startswith('VALORIZADO')
        
        # Target: Materiales directos with total_usd == 0 and cantidad > 0 (or already valorized)
        if 'MATERIAL' in tipo.upper() and cant > 0 and (tot == 0.0 or is_already_val):
            if cod in unified_catalog and unified_catalog[cod] > 0:
                unit_p = round(unified_catalog[cod], 4)
                new_tot = round(cant * unit_p, 2)
                
                # If it was already valorized in previous run, we keep track of the difference or reset
                prev_tot = tot if is_already_val else 0.0
                diff_tot = new_tot - prev_tot

                r['precio_final'] = unit_p
                r['total_usd'] = new_tot
                r['ajuste'] = 'VALORIZADO SIP (PRECIO $0)'
                r['esReclasificado'] = True

                corr_id = f"VAL-SIP-{m[:3].upper()}-{num}-{cod}-{idx}"
                desc_item = r.get('descripcion') or catalog_desc.get(cod, 'MATERIAL DE ALMACEN')
                und_item = r.get('unidad') or catalog_unit.get(cod, 'UND')

                corr_entry = {
                    'recordId': corr_id,
                    'tipoItem': 'consumo',
                    'documento': num,
                    'pedido': r.get('pedido') or '',
                    'codigo': cod,
                    'descripcion': desc_item,
                    'cantidad': cant,
                    'unidad': und_item,
                    'costoUnitario': unit_p,
                    'totalUSD': new_tot,
                    'fechaMovimiento': r.get('fecha') or '',
                    'cuentaAnterior': f"{cta} (Sin Costo $0)",
                    'proyectoAnterior': f"{desc_proy} (Despacho sin costo en almacén)",
                    'nuevaCuenta': cta,
                    'nuevoProyecto': desc_proy,
                    'nuevoMes': m,
                    'motivo': f"Valorización Catálogo SIP ({unit_p:.2f} $/u) - Corrección precio $0 almacén",
                    'fecha': now_iso,
                    'usuario': 'Auditoría Costos (Alejandra Tesara)'
                }
                r['infoReclasificacion'] = corr_entry
                all_new_corrections.append(corr_entry)

                m_vales += 1
                m_usd += diff_tot

                stats_por_proyecto[cta]['count'] += 1
                stats_por_proyecto[cta]['usd'] += new_tot
                if desc_proy and not stats_por_proyecto[cta]['nombre']:
                    stats_por_proyecto[cta]['nombre'] = desc_proy

    if m_vales > 0:
        # Recalculate monthly totals accurately
        gran_tot = sum(float(x.get('total_usd') or 0) for x in items)
        mat_tot = sum(float(x.get('total_usd') or 0) for x in items if 'MATERIAL' in str(x.get('tipo', '')).upper())
        ext_tot = sum(float(x.get('total_usd') or 0) for x in items if str(x.get('cuenta_aux', '')).upper().startswith('TTE-C'))

        if 'totales' not in d:
            d['totales'] = {}
        d['totales']['gran_total'] = round(gran_tot, 2)
        d['totales']['mat_total'] = round(mat_tot, 2)
        d['totales']['ext_total'] = round(ext_tot, 2)

        # Save to public and dist
        with open(path, 'w', encoding='utf-8') as fp:
            json.dump(d, fp, ensure_ascii=False)

        dist_path = f'dist/data/sip/unificada_{m}.json'
        if os.path.exists('dist/data/sip'):
            with open(dist_path, 'w', encoding='utf-8') as fp:
                json.dump(d, fp, ensure_ascii=False)

        stats_por_mes[m] = (m_vales, m_usd)
        total_vales_valorizados += m_vales
        total_usd_reintegrado += m_usd
        print(f"  [OK] {m.capitalize():11}: {m_vales:>6} vales valorizados | +USD {m_usd:>12,.2f}")

print(f"\nTOTAL GLOBAL VALORIZADO: {total_vales_valorizados:,} vales | USD ${total_usd_reintegrado:,.2f}")

# ------------------------------------------------------------------------------
# PASO 3: ACTUALIZAR RECLASIFICACIONES.JSON
# ------------------------------------------------------------------------------
print("\n--- PASO 3: Actualizando reclasificaciones.json ---")
rec_path = 'public/data/sip/reclasificaciones.json'
with open(rec_path, 'r', encoding='utf-8') as fp:
    current_reclass = json.load(fp)

# Preserve historical manual/Excel corrections and drivero, remove previous VAL- runs
clean_reclass = [x for x in current_reclass if not str(x.get('recordId', '')).startswith('VAL-')]
print(f"Correcciones base conservadas (Excel historico y drivero): {len(clean_reclass)}")

clean_reclass.extend(all_new_corrections)
print(f"Total nuevo en reclasificaciones.json: {len(clean_reclass)}")

with open(rec_path, 'w', encoding='utf-8') as fp:
    json.dump(clean_reclass, fp, ensure_ascii=False, indent=2)

if os.path.exists('dist/data/sip'):
    shutil.copy(rec_path, 'dist/data/sip/reclasificaciones.json')

# ------------------------------------------------------------------------------
# PASO 4: RECALCULAR MATRIZ.JSON COMPLETA
# ------------------------------------------------------------------------------
print("\n--- PASO 4: Recalculando matriz.json ---")
# Load proyectos metadata
proj_meta = {}
if os.path.exists('public/data/sip/proyectos.json'):
    with open('public/data/sip/proyectos.json', 'r', encoding='utf-8') as fp:
        p_list = json.load(fp)
        for p in p_list:
            cod = str(p.get('codigo', '')).strip().upper()
            if cod:
                proj_meta[cod] = p

# Aggregate by cuenta_aux from all 12 unificada files
proj_aggr = defaultdict(lambda: {
    'materialesDirectos': 0.0,
    'servicios': 0.0,
    'totalItemsConsumos': 0,
    'totalItemsCompras': 0,
    'nombre': '',
    'tipoCosto': '',
    'cliente': ''
})

for m in months:
    path = f'public/data/sip/unificada_{m}.json'
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as fp:
        d = json.load(fp)
    for r in d.get('items', []):
        cta = str(r.get('cuenta_aux') or '').strip().upper()
        if not cta:
            continue
        tipo = str(r.get('tipo') or '').strip().upper()
        tot = float(r.get('total_usd') or 0)
        t_item = str(r.get('tipoItem') or '').strip().lower()
        num = str(r.get('numero') or '')
        if not t_item:
            t_item = 'consumo' if num.startswith('DP') else 'compra'

        p_info = proj_aggr[cta]
        if 'MATERIAL' in tipo:
            p_info['materialesDirectos'] += tot
        elif 'SERVICIO' in tipo:
            p_info['servicios'] += tot

        if t_item == 'consumo':
            p_info['totalItemsConsumos'] += 1
        else:
            p_info['totalItemsCompras'] += 1

        if not p_info['nombre'] and r.get('datos_descripcion'):
            p_info['nombre'] = str(r.get('datos_descripcion')).strip()
        if not p_info['tipoCosto'] and r.get('datos_tipo_costo'):
            p_info['tipoCosto'] = str(r.get('datos_tipo_costo')).strip()

# Build matriz proyectos list
matriz_proyectos = []
for cta, data in proj_aggr.items():
    meta = proj_meta.get(cta, {})
    nombre = meta.get('nombre') or data['nombre'] or cta
    tipo_c = meta.get('tipoCosto') or data['tipoCosto']
    if not tipo_c:
        if cta.startswith('TTE-C'): tipo_c = 'Externo'
        elif cta.startswith('TT-F') or cta.startswith('EE') or cta.startswith('SS'): tipo_c = 'Mantto Flota (OPEX)'
        elif cta.startswith('TT-A') or cta.startswith('AE'): tipo_c = 'Admon'
        elif cta.startswith('TT-S'): tipo_c = 'Socio'
        else: tipo_c = 'Interno'
    cliente = meta.get('cliente') or ('VISCO ORINOCO C.A' if cta.startswith('TTE-C') else 'TIMACA')

    mat_usd = round(data['materialesDirectos'], 2)
    serv_usd = round(data['servicios'], 2)
    tot_usd = round(mat_usd + serv_usd, 2)

    matriz_proyectos.append({
        'codigo': cta,
        'nombre': nombre,
        'tipoCosto': tipo_c,
        'cliente': cliente,
        'materialesDirectos': mat_usd,
        'servicios': serv_usd,
        'manoDeObra': 0,
        'horasMaquina': 0,
        'costosIndirectos': 0,
        'totalUSD': tot_usd,
        'totalItemsConsumos': data['totalItemsConsumos'],
        'totalItemsCompras': data['totalItemsCompras']
    })

# Sort by totalUSD descending
matriz_proyectos.sort(key=lambda x: x['totalUSD'], reverse=True)

mat_total_matriz = round(sum(p['materialesDirectos'] for p in matriz_proyectos), 2)
serv_total_matriz = round(sum(p['servicios'] for p in matriz_proyectos), 2)
gran_total_matriz = round(mat_total_matriz + serv_total_matriz, 2)

matriz_data = {
    'periodo': 'Consolidado Anual SIP 2026 (Enero - Diciembre 2026)',
    'totalMateriales': mat_total_matriz,
    'totalServicios': serv_total_matriz,
    'granTotal': gran_total_matriz,
    'proyectos': matriz_proyectos
}

matriz_path = 'public/data/sip/matriz.json'
with open(matriz_path, 'w', encoding='utf-8') as fp:
    json.dump(matriz_data, fp, ensure_ascii=False, indent=2)

if os.path.exists('dist/data/sip'):
    shutil.copy(matriz_path, 'dist/data/sip/matriz.json')

print(f"Matriz actualizada: {len(matriz_proyectos)} proyectos/cuentas.")
print(f"  Materiales Totales: USD ${mat_total_matriz:,.2f}")
print(f"  Servicios Totales:  USD ${serv_total_matriz:,.2f}")
print(f"  Gran Total:         USD ${gran_total_matriz:,.2f}")

# ------------------------------------------------------------------------------
# PASO 5: ACTUALIZAR STATUS.JSON
# ------------------------------------------------------------------------------
status_path = 'public/data/sip/status.json'
if os.path.exists(status_path):
    with open(status_path, 'r', encoding='utf-8') as fp:
        st = json.load(fp)
    st['totalReclasificaciones'] = len(clean_reclass)
    st['lastSync'] = now_iso
    with open(status_path, 'w', encoding='utf-8') as fp:
        json.dump(st, fp, indent=2)
    if os.path.exists('dist/data/sip'):
        shutil.copy(status_path, 'dist/data/sip/status.json')

# ------------------------------------------------------------------------------
# PASO 6: GUARDAR EN EXCEL CORRECCIONES.XLSX (LOCAL Y RED Y:)
# ------------------------------------------------------------------------------
print("\n--- PASO 6: Guardando registro en libros Excel Correcciones.xlsx ---")
excel_files = [
    r'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Correcciones.xlsx',
    r'Y:\Costos Master\2 Data Fija\Correcciones.xlsx'
]

# Write summary and sample/grouped rows to excel to keep it performant
for ef in excel_files:
    if os.path.exists(ef):
        try:
            wb = openpyxl.load_workbook(ef)
            sheet_name = 'Valoriz_General_SIP'
            if sheet_name in wb.sheetnames:
                del wb[sheet_name]
            ws = wb.create_sheet(title=sheet_name)

            # Header
            ws.append(['RESUMEN AUDITORIA: VALORIZACION INTEGRAL DE DESPACHOS $0 SIP 2026'])
            ws.append([f'Fecha de Ejecucion: {now_iso}', f'Auditor: Alejandra Tesara'])
            ws.append([f'Total Vales Valorizados: {len(all_new_corrections)}', f'Monto Total Reintegrado USD: {total_usd_reintegrado:,.2f}'])
            ws.append([])
            ws.append(['Cuenta Auxiliar', 'Nombre Proyecto', 'Cantidad Vales $0 Corregidos', 'Monto Total Valorizado USD'])

            for cta, data in sorted(stats_por_proyecto.items(), key=lambda x: x[1]['usd'], reverse=True):
                ws.append([cta, data['nombre'], data['count'], round(data['usd'], 2)])

            wb.save(ef)
            print(f"  [OK] Excel actualizado con exito: {ef} (Hoja: {sheet_name})")
        except Exception as ex:
            print(f"  [AVISO] No se pudo escribir en {ef}: {ex}")

print("\n================================================================================")
print("PROCESO DE VALORIZACION MASIVA COMPLETADO CON EXITO")
print("================================================================================")
