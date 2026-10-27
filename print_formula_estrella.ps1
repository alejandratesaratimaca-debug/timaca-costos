$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx"
$wb = $excel.Workbooks.Open($source, 0, $true) # read-only
$q = $wb.Queries.Item("Fact_ServiciosDirectos_2026")
[System.IO.File]::WriteAllText("formula_Estrella_Servicios.txt", $q.Formula)
Write-Host "Estrella Formula saved! Length: $($q.Formula.Length)"
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
