$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"
$wb = $excel.Workbooks.Open($source, 0, $true) # read-only
$q = $wb.Queries.Item("_2_Servicios_Directos")
[System.IO.File]::WriteAllText("formula_Servicios_Directos.txt", $q.Formula)
Write-Host "Formula saved! Length: $($q.Formula.Length)"
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
