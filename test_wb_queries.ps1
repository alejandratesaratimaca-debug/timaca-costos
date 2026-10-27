$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"
$tempCopy = "C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer\temp_Master_Test.xlsx"

Write-Host "Copying to temp: $tempCopy"
Copy-Item $source $tempCopy -Force

Write-Host "Opening in Excel COM..."
$wb = $excel.Workbooks.Open($tempCopy, 0, $false)

Write-Host "Queries count: $($wb.Queries.Count)"
for ($i = 1; $i -le $wb.Queries.Count; $i++) {
    $q = $wb.Queries.Item($i)
    Write-Host "Query $i : $($q.Name)"
}

$targetQ = $wb.Queries.Item("_2_Servicios_Directos")
if ($targetQ) {
    Write-Host "Found _2_Servicios_Directos!"
    Write-Host "Length of formula: $($targetQ.Formula.Length)"
}

$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Item $tempCopy -Force
Write-Host "Test completed cleanly!"
