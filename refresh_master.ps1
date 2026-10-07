$pathMaster = 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx'

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    Write-Host "Opening 4 Master Unificado.xlsx..."
    $wb = $excel.Workbooks.Open($pathMaster)
    
    Write-Host "Configuring connections for synchronous refresh..."
    foreach ($c in $wb.Connections) {
        if ($c.OLEDBConnection) {
            try { $c.OLEDBConnection.BackgroundQuery = $false } catch {}
        }
    }
    
    Write-Host "Refreshing all queries..."
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
    
    Write-Host "Saving 4 Master Unificado..."
    $wb.Save()
    $wb.Close($false)
    Write-Host "4 Master Unificado refreshed and saved successfully!"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
