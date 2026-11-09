import openpyxl
import os

src_path = r'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\3 Analisis Costos Indirectos.xlsx'
wb = openpyxl.load_workbook(src_path)
ws = wb['Hoja2']

# Data ordered descending by MOD USD
rows_data = [
    # (Row, Proyecto, Nombre, Cuenta, MOD)
    (6, 'PELLAS 1', 'Recuperación Línea 1 Pellas', 'TTE-C-0706', 131190),
    (7, 'PMH', 'Segunda Línea PMH', 'TTE-C-0671', 79030),
    (8, 'BRIQUETAS', 'Fase 2 Planta Briquetas', 'TTE-C-0668', 23925),
    (9, 'BOCA GRANDE', 'Servicio de mantenimiento de BG II', 'TTE-C-0680', 13685),
    (10, 'BRIQUETAS', 'Mantenimiento Briqueteadoras', 'TTE-C-0670', 5100),
    (11, 'BRIQUETAS', 'Suministro Caldera Briquetas', 'TTE-C-0694', 3190),
    (12, 'PMH', 'Rehabilitación de Bandas PMH', 'TTE-C-0656', 1630),
]

for r_idx, proy, nom, cta, mod in rows_data:
    ws.cell(r_idx, 17).value = proy
    ws.cell(r_idx, 18).value = nom
    ws.cell(r_idx, 19).value = cta
    ws.cell(r_idx, 20).value = mod
    ws.cell(r_idx, 21).value = f'=T{r_idx}/$T$16'
    ws.cell(r_idx, 22).value = f'=$L$22*U{r_idx}'

# Clear empty rows 13 to 15
for r_idx in range(13, 16):
    ws.cell(r_idx, 17).value = None
    ws.cell(r_idx, 18).value = None
    ws.cell(r_idx, 19).value = None
    ws.cell(r_idx, 20).value = None
    ws.cell(r_idx, 21).value = f'=T{r_idx}/$T$16'
    ws.cell(r_idx, 22).value = f'=$L$22*U{r_idx}'

# Total row
ws.cell(16, 17).value = None
ws.cell(16, 18).value = None
ws.cell(16, 19).value = 'Total general'
ws.cell(16, 20).value = '=SUM(T6:T15)'
ws.cell(16, 21).value = '=T16/$T$16'
ws.cell(16, 22).value = '=SUM(V6:V15)'

out_paths = [
    r'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\3 Analisis Costos Indirectos_ACTUALIZADO_OCTUBRE.xlsx',
    r'C:\Users\alejandratesara\Downloads\3 Analisis Costos Indirectos_ACTUALIZADO_OCTUBRE.xlsx'
]

for out_path in out_paths:
    wb.save(out_path)
    print("Saved to:", out_path)

# Try saving to original
try:
    wb.save(src_path)
    print("Successfully saved to original path as well!")
except PermissionError:
    print("Original file is currently open in Excel. Saved updated copy.")
