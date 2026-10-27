$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"
$tempTest = "C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer\temp_Refresh_Test.xlsx"

Copy-Item $source $tempTest -Force

Write-Host "Opening test workbook..."
$wb = $excel.Workbooks.Open($tempTest, 0, $false)

# Ensure background query is turned off on all connections so refresh is synchronous
foreach ($conn in $wb.Connections) {
    if ($conn.OLEDBConnection) {
        $conn.OLEDBConnection.BackgroundQuery = $false
    }
}

Write-Host "Starting RefreshAll()..."
$startTime = Get-Date
try {
    $wb.RefreshAll()
    $excel.CalculateUntilAsyncQueriesDone()
    Write-Host "RefreshAll() completed successfully in $(((Get-Date) - $startTime).TotalSeconds) seconds!"
    $wb.Save()
    Write-Host "Saved test workbook."
} catch {
    Write-Error "Error during RefreshAll(): $_"
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Item $tempTest -Force
Write-Host "Test finished cleanly."
