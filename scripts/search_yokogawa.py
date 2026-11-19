import pandas as pd

excel_path = r'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\MAESTRO COMPRAS TIMACA.xlsx'
df = pd.read_excel(excel_path)
print(f'Total rows in Maestro Compras: {len(df)}')

m = df['Nro-OC'].astype(str).str.contains('23629', na=False) | df['Nro-Sol'].astype(str).str.contains('22334', na=False) | df['Proveedor'].astype(str).str.contains('YOKOGAWA', case=False, na=False)
found = df[m]
print(f'Matches found: {len(found)}')
for idx, r in found.iterrows():
    print('Sol:', r.get('Nro-Sol'), '| OC:', r.get('Nro-OC'), '| Fecha-Aprob:', r.get('Fecha-Aprob'), '| Total:', r.get('Total$'), '| Recepcion:', r.get('Recepcion'), '| Fecha-Rec:', r.get('Fecha-Rec'), '| Cant-Rec:', r.get('Cant-Rec'), '| Cant-PE:', r.get('Cant-PE'), '| Prov:', r.get('Proveedor'))
