$dir = 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\8 Devoluciones'
$files = @('7 Julio 2026.xlsx', '8 Agosto 2026.xlsx', '9 Septiembre 2026.xlsx')

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    foreach ($f in $files) {
        $path = Join-Path $dir $f
        if (Test-Path $path) {
            Write-Host "Fixing $f..."
            $wb = $excel.Workbooks.Open($path)
            $ws = $wb.Sheets.Item(1)
            $ws.Name = "Sheet1"
            
            # Check row 1 headers
            for ($col = 1; $col -le 20; $col++) {
                $val = $ws.Cells.Item(1, $col).Value2
                if ($val) {
                    $sVal = [string]$val
                    if ($sVal -like "*Almac*") { $ws.Cells.Item(1, $col).Value2 = "Almacen" }
                    elseif ($sVal -like "*N*mero*") { $ws.Cells.Item(1, $col).Value2 = "Numero" }
                    elseif ($sVal -eq "Material") { $ws.Cells.Item(1, $col).Value2 = "Codigo" }
                    elseif ($sVal -like "*Descripci*") { $ws.Cells.Item(1, $col).Value2 = "Descripcion" }
                    elseif ($sVal -eq "Und") { $ws.Cells.Item(1, $col).Value2 = "Unidad" }
                    elseif ($sVal -like "*Cuenta*aux*") { $ws.Cells.Item(1, $col).Value2 = "Cuenta-Aux" }
                    elseif ($sVal -like "*Centro*costo*") { $ws.Cells.Item(1, $col).Value2 = "CECO" }
                    elseif ($sVal -like "*Costo*prom*") { $ws.Cells.Item(1, $col).Value2 = "Costo-Prom" }
                    elseif ($sVal -like "*Costo*US*") { $ws.Cells.Item(1, $col).Value2 = "Costo-$" }
                }
            }
            $wb.Save()
            $wb.Close($false)
            Write-Host "Successfully fixed $f!"
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
