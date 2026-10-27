$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"
$tempTest = "C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer\temp_Master_Update_Test.xlsx"

Copy-Item $source $tempTest -Force

$wb = $excel.Workbooks.Open($tempTest, 0, $false)
$q = $wb.Queries.Item("_2_Servicios_Directos")

$oldFormula = $q.Formula
$targetSnippet = '#"Columna condicional agregada2" = Table.AddColumn(#"Columna condicional agregada1", "Fecha Real", each if [Ajuste_Servicios.Fecha Real] = null then [#"Fecha-Rec"] else [Ajuste_Servicios.Fecha Real]),'
$replacement = '#"Columna condicional agregada2" = Table.AddColumn(#"Columna condicional agregada1", "Fecha Real", each if [#"Ajuste_Servicios.Fecha Real"] <> null then [#"Ajuste_Servicios.Fecha Real"] else if [#"Fecha-Rec"] <> null then [#"Fecha-Rec"] else [#"Fecha-Sol"]),'

if ($oldFormula.Contains($targetSnippet)) {
    Write-Host "Target snippet found! Updating formula..."
    $newFormula = $oldFormula.Replace($targetSnippet, $replacement)
    $q.Formula = $newFormula
    Write-Host "Formula updated successfully!"
    $wb.Save()
    Write-Host "Workbook saved successfully!"
} else {
    Write-Error "Target snippet not found in formula!"
}

$wb.Close($false)

# Re-open and verify persistence
$wbVerify = $excel.Workbooks.Open($tempTest, 0, $true)
$qVerify = $wbVerify.Queries.Item("_2_Servicios_Directos")
if ($qVerify.Formula.Contains($replacement)) {
    Write-Host "SUCCESS! The updated formula was verified inside the saved workbook!"
} else {
    Write-Error "Verification failed!"
}
$wbVerify.Close($false)

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Item $tempTest -Force
Write-Host "Temp test cleaned up."
