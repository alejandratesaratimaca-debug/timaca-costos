$pathNuevas = 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\Nuevas Tablas Informesssssssssssss.xlsx'

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    Write-Host "Opening Nuevas Tablas Informesssssssssssss.xlsx..."
    $wb = $excel.Workbooks.Open($pathNuevas)
    
    Write-Host "Configuring connections..."
    foreach ($c in $wb.Connections) {
        if ($c.OLEDBConnection) {
            try { $c.OLEDBConnection.BackgroundQuery = $false } catch {}
        }
    }
    
    Write-Host "Refreshing all data connections..."
    $wb.RefreshAll()
    
    Write-Host "Waiting for async queries to finish..."
    try {
        $excel.CalculateUntilAsyncQueriesDone()
    } catch {
        Write-Host "CalculateUntilAsyncQueriesDone note: $($_.Exception.Message)"
        Start-Sleep -Seconds 10
    }
    
    Write-Host "Recalculating formulas..."
    $excel.CalculateFull()
    
    Write-Host "Refreshing PivotTables..."
    $count = 0
    foreach ($ws in $wb.Worksheets) {
        foreach ($pt in $ws.PivotTables()) {
            try { 
                $null = $pt.Update()
                $null = $pt.RefreshTable() 
                $count++
            } catch {}
        }
    }
    Write-Host "Refreshed $count pivot tables."
    
    Write-Host "Saving Nuevas Tablas..."
    $wb.Save()
    $wb.Close($false)
    Write-Host "Nuevas Tablas refreshed and saved successfully!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
