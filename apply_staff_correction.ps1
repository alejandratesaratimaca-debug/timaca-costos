$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

# 1. Update 1 Base Central Inputs.xlsx
$pathBase = 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx'
try {
    Write-Host "Updating 1 Base Central Inputs.xlsx..."
    $wbBase = $excel.Workbooks.Open($pathBase)
    $wsBase = $wbBase.Worksheets.Item('3 Mano de obra')
    
    # Enero - Abril -> TTE-C-0676
    $wsBase.Range("J27235").Value = "TTE-C-0676" # Ene ($51.000)
    $wsBase.Range("G27235").Value = "STAFF PELLAS LINEA 2"
    
    $wsBase.Range("J27236").Value = "TTE-C-0676" # Feb ($51.700)
    $wsBase.Range("G27236").Value = "STAFF PELLAS LINEA 2"
    
    $wsBase.Range("J27237").Value = "TTE-C-0676" # Mar ($50.000)
    $wsBase.Range("G27237").Value = "STAFF PELLAS LINEA 2"
    
    $wsBase.Range("J27238").Value = "TTE-C-0676" # Abr ($49.000)
    $wsBase.Range("G27238").Value = "STAFF PELLAS LINEA 2"
    
    # Mayo en adelante -> TTE-C-0706
    $wsBase.Range("J27239").Value = "TTE-C-0706" # May ($50.000)
    $wsBase.Range("G27239").Value = "STAFF PELLAS LINEA 1"
    
    $wsBase.Range("J27240").Value = "TTE-C-0706" # Jun ($60.000)
    $wsBase.Range("G27240").Value = "STAFF PELLAS LINEA 1"
    
    $wsBase.Range("J27241").Value = "TTE-C-0706" # Jul ($72.000)
    $wsBase.Range("B27241").Value = 30           # Semana 30 (Julio)
    $wsBase.Range("G27241").Value = "STAFF PELLAS LINEA 1"
    
    $wsBase.Range("J27242").Value = "TTE-C-0706" # Ago ($73.000)
    $wsBase.Range("B27242").Value = 35           # Semana 35 (Agosto)
    $wsBase.Range("G27242").Value = "STAFF PELLAS LINEA 1"
    
    $wbBase.Save()
    $wbBase.Close($false)
    Write-Host "1 Base Central Inputs.xlsx updated successfully!"
} catch {
    Write-Host "Error updating Base Central Inputs: $($_.Exception.Message)"
}

# 2. Update Modelo_Estrella_Costos_TIMACA.xlsx
$pathEstrella = 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx'
try {
    Write-Host "Updating Modelo_Estrella_Costos_TIMACA.xlsx..."
    $wbEstrella = $excel.Workbooks.Open($pathEstrella)
    $wsMDO = $wbEstrella.Worksheets.Item('Detalle_ManoDeObra')
    
    # Enero - Abril -> TTE-C-0676
    $wsMDO.Range("D13528").Value = "TTE-C-0676" # Ene ($51.000)
    $wsMDO.Range("H13528").Value = "STAFF PELLAS LINEA 2"
    
    $wsMDO.Range("D13529").Value = "TTE-C-0676" # Feb ($51.700)
    $wsMDO.Range("H13529").Value = "STAFF PELLAS LINEA 2"
    
    $wsMDO.Range("D13530").Value = "TTE-C-0676" # Mar ($50.000)
    $wsMDO.Range("H13530").Value = "STAFF PELLAS LINEA 2"
    
    $wsMDO.Range("D13531").Value = "TTE-C-0676" # Abr ($49.000)
    $wsMDO.Range("H13531").Value = "STAFF PELLAS LINEA 2"
    
    # Mayo en adelante -> TTE-C-0706
    $wsMDO.Range("D13532").Value = "TTE-C-0706" # May ($50.000)
    $wsMDO.Range("H13532").Value = "STAFF PELLAS LINEA 1"
    
    $wsMDO.Range("D13533").Value = "TTE-C-0706" # Jun ($60.000)
    $wsMDO.Range("H13533").Value = "STAFF PELLAS LINEA 1"
    
    $wsMDO.Range("B13534").Value = "julio"      # Mes Julio (era agosto!)
    $wsMDO.Range("C13534").Value = 30           # Semana 30
    $wsMDO.Range("D13534").Value = "TTE-C-0706" # Jul ($72.000)
    $wsMDO.Range("H13534").Value = "STAFF PELLAS LINEA 1"
    
    $wsMDO.Range("B13535").Value = "agosto"     # Mes Agosto
    $wsMDO.Range("C13535").Value = 35           # Semana 35
    $wsMDO.Range("D13535").Value = "TTE-C-0706" # Ago ($73.000)
    $wsMDO.Range("H13535").Value = "STAFF PELLAS LINEA 1"
    
    Write-Host "Recalculating and refreshing Pivot Tables in Modelo Estrella..."
    $excel.CalculateFull()
    foreach ($ws in $wbEstrella.Worksheets) {
        foreach ($pt in $ws.PivotTables()) {
            try { $pt.Update(); $pt.RefreshTable() } catch {}
        }
    }
    
    $wbEstrella.Save()
    $wbEstrella.Close($false)
    Write-Host "Modelo_Estrella_Costos_TIMACA.xlsx updated and refreshed successfully!"
} catch {
    Write-Host "Error updating Modelo Estrella: $($_.Exception.Message)"
}

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
