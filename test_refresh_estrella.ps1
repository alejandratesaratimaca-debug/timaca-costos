$f = 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx'
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    Write-Host "Opening Modelo Estrella..."
    $wb = $excel.Workbooks.Open($f)
    Write-Host "Configuring connections..."
    foreach ($c in $wb.Connections) {
        if ($c.OLEDBConnection) {
            try { $c.OLEDBConnection.BackgroundQuery = $false } catch {}
        }
    }
    Write-Host "Running RefreshAll()..."
    $wb.RefreshAll()
    try {
        $excel.CalculateUntilAsyncQueriesDone()
    } catch {}
    Start-Sleep -Seconds 15
    $excel.CalculateFull()
    
    # Update pivot tables
    foreach ($ws in $wb.Worksheets) {
        foreach ($pt in $ws.PivotTables()) {
            try {
                $null = $pt.Update()
                $null = $pt.RefreshTable()
            } catch {}
        }
    }
    
    Write-Host "Saving..."
    $wb.Save()
    Write-Host "Refresh complete!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    if ($wb) { $wb.Close($false) }
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
