param()

Write-Host "=========================================================="
Write-Host "TIMACA - REFRESH COMPLETO DE DATOS (REFRESHALL)"
Write-Host "Fecha/Hora: $(Get-Date)"
Write-Host "=========================================================="

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

function Refresh-Workbook($filePath) {
    Write-Host "`n>>> Iniciando RefreshAll en: $filePath"
    if (-not (Test-Path $filePath)) {
        Write-Error "Archivo no encontrado: $filePath"
        return
    }
    
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $wb = $excel.Workbooks.Open($filePath, 0, $false)
    
    # Desactivar refresco en background para garantizar ejecucion secuencial y limpia
    foreach ($conn in $wb.Connections) {
        if ($conn.OLEDBConnection) {
            $conn.OLEDBConnection.BackgroundQuery = $false
        }
    }
    
    try {
        Write-Host "Ejecutando RefreshAll()..."
        $wb.RefreshAll()
        $excel.CalculateUntilAsyncQueriesDone()
        $wb.Save()
        $sw.Stop()
        Write-Host "[OK] Refresco completado y guardado en $($sw.Elapsed.TotalSeconds) seg: $filePath"
    } catch {
        Write-Error "Error en refresco de $filePath : $_"
    }
    
    $wb.Close($false)
}

# 1. LOCAL
Refresh-Workbook "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"
Refresh-Workbook "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx"

# 2. RED
Refresh-Workbook "Y:\Costos Master\1 Informe\4 Master Unificado.xlsx"
Refresh-Workbook "Y:\Costos Master\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx"

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "`n=========================================================="
Write-Host "PROCESO DE ACTUALIZACION DE DATOS FINALIZADO EXITOSAMENTE"
Write-Host "=========================================================="
