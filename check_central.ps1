$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx"
$wb = $excel.Workbooks.Open($source, 0, $true)

Write-Host "=== QUERIES EN 1 Base Central Inputs.xlsx ==="
Write-Host "Total queries: $($wb.Queries.Count)"
for ($i = 1; $i -le $wb.Queries.Count; $i++) {
    $q = $wb.Queries.Item($i)
    Write-Host "  $i : $($q.Name)"
}

Write-Host "`n=== HOJAS EN 1 Base Central Inputs.xlsx ==="
foreach ($sh in $wb.Sheets) {
    Write-Host "  $($sh.Name) | cols: $($sh.UsedRange.Columns.Count) rows: $($sh.UsedRange.Rows.Count)"
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
