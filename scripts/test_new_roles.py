import json
import re

COMPRADORES_SET = {
    'KEYSERLING GÓMEZ', 'KEYSERLING GOMEZ', 'HERNANDO LOPEZ', 'HERNANDO LÓPEZ',
    'JORDI MEJIAS', 'JORDI MEJÍAS', 'RODOLFO PEREDA', 'ALBERT GONZALEZ', 'ALBERT GONZÁLEZ',
    'CARLOS PEREZ', 'CARLOS PÉREZ', 'MARJORIET LOZADA', 'MARIO LOZADA',
    'RAFAEL MENDEZ', 'RAFAEL MÉNDEZ', 'LEYTON RODRIGO', 'JENNYFER CASANOVA',
    'ANDRES PORRAS', 'ANDRÉS PORRAS', 'YOLIMAR CARVAJAL', 'FERMIN AMAYA',
    'YESSI SUAREZ', 'YESSI SUÁREZ', 'ADMINISTRACION', 'PROCESO ANULADO', 'PROCESO EN STANDBY'
}

def clean_name(n):
    if not n: return ''
    return ' '.join(str(n).strip().split()).upper()

def get_solicitante(row):
    sol_real = clean_name(row.get('solicitante_real'))
    if sol_real and sol_real not in COMPRADORES_SET:
        return sol_real, 'Detectado en Motivo'
    
    # Try regex on motivo
    mot = row.get('motivo') or ''
    m = re.search(r'(?:SOLICITA(?:NTE|DO\s+POR)?|SOLICITA)\s*[:\-]\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s\.]+)', mot, re.IGNORECASE)
    if m:
        extracted = m.group(1).split('–')[0].split('-')[0].split(',')[0].strip().upper()
        extracted = re.sub(r'^(?:ING\.?|SR\.?|SRA\.?)\s*', '', extracted).strip()
        if extracted and len(extracted) > 3 and extracted not in COMPRADORES_SET:
            return extracted, 'Detectado en Motivo'
            
    # If it is direct warehouse material (Vale DP)
    if row.get('tipo') == 'Materiales Directos':
        raw_sol = clean_name(row.get('solicitante'))
        if raw_sol and raw_sol not in COMPRADORES_SET and raw_sol != 'S/D':
            return raw_sol, 'Retiró en Almacén'
            
    # For Compras / Servicios without explicit requester in motivo: LEAVE BLANK!
    return None, None

def get_generador_role(name):
    n = clean_name(name)
    if not n: return ''
    if n in ['ASTRID SILVA', 'MANUEL CHAVEZ', 'HERNAN GARCIA']:
        return 'Planificación Operaciones'
    if n in ['LEGLANIS BRITO', 'JESSICA NAVARRO', 'JOSE AMUNDARAIN']:
        return 'Gestión de Almacén'
    if 'WUILLIANS' in n or 'GUZMAN' in n:
        return 'Ingeniería / Mantto'
    if n in COMPRADORES_SET:
        return 'Analista de Procura'
    if n in ['JOSE ROMERO', 'CARLOS GIRALDO']:
        return 'Almacén'
    return 'Usuario SIP'

with open('public/data/sip/unificada_octubre.json', 'r', encoding='utf-8') as f:
    oct_data = json.load(f)
items = oct_data.get('items', []) if isinstance(oct_data, dict) else oct_data

print('--- PRUEBA EN FILAS DE LA CAPTURA DE ALEJANDRA ---')
for prov in ['VG  CARGO', 'ELECTROTECNICA', 'HIRACA', 'CALZADILLA', 'TEODOSIO']:
    matches = [r for r in items if prov in str(r.get('proveedor', '')).upper()]
    for m in matches[:2]:
        sol, tag_sol = get_solicitante(m)
        gen = m.get('creadaPor')
        tag_gen = get_generador_role(gen)
        comp = m.get('comprador')
        print(f"[{m.get('numero')}] Prov: {m.get('proveedor')[:20]}")
        print(f"  SOLICITANTE:  {sol or '(EN BLANCO)'} ({tag_sol})")
        print(f"  GENERADO POR: {gen} ({tag_gen})")
        print(f"  COMPRADOR:    {comp} (Analista de Procura)")
        print()
