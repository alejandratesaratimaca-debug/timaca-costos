$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "Y:\Costos Master\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx"
$wb = $excel.Workbooks.Open($source, 0, $true) # read-only
$q = $wb.Queries.Item("Fact_ServiciosDirectos_2026")
[System.IO.File]::WriteAllText("formula_Y_Estrella_Servicios.txt", $q.Formula)
Write-Host "Y: Estrella Formula saved! Length: $($q.Formula.Length)"
$wb.Close($false)

$sourceMaster = "Y:\Costos Master\1 Informe\4 Master Unificado.xlsx"
$wbMaster = $excel.Workbooks.Open($sourceMaster, 0, $true)
$qMaster = $wbMaster.Queries.Item("_2_Servicios_Directos")
[System.IO.File]::WriteAllText("formula_Y_Master_Servicios.txt", $qMaster.Formula)
Write-Host "Y: Master Formula saved! Length: $($qMaster.Formula.Length)"
$wbMaster.Close($false)

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
