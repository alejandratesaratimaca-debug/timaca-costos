$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$source = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx"
$tempTest = "C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer\temp_Estrella_Update_Test.xlsx"

Copy-Item $source $tempTest -Force

$wb = $excel.Workbooks.Open($tempTest, 0, $false)
$q = $wb.Queries.Item("Fact_ServiciosDirectos_2026")

$oldFormula = $q.Formula

$targetSnippet1 = '    FilasFiltradas = Table.SelectRows(TipoCambiado, each [Categoria] = "SERVICIOS" and [#"Fecha-Rec"] <> null and Date.Year([#"Fecha-Rec"]) = 2026),'
$replacement1 = '    ColFechaBase = Table.AddColumn(TipoCambiado, "FechaBase", each if [#"Fecha-Rec"] <> null then [#"Fecha-Rec"] else [#"Fecha-Sol"], type date),' + "`r`n" + '    FilasFiltradas = Table.SelectRows(ColFechaBase, each [Categoria] = "SERVICIOS" and [FechaBase] <> null and Date.Year([FechaBase]) = 2026),'

$targetSnippet2 = '    ColFechaReal = Table.AddColumn(ColCtaAU, "Fecha Real", each if [Ajuste_Servicios.Fecha Real] = null then [#"Fecha-Rec"] else [Ajuste_Servicios.Fecha Real]),'
$replacement2 = '    ColFechaReal = Table.AddColumn(ColCtaAU, "Fecha Real", each if [#"Ajuste_Servicios.Fecha Real"] <> null then [#"Ajuste_Servicios.Fecha Real"] else [FechaBase], type date),'

if ($oldFormula.Contains($targetSnippet1) -and $oldFormula.Contains($targetSnippet2)) {
    Write-Host "Target snippets found! Updating formula..."
    $newFormula = $oldFormula.Replace($targetSnippet1, $replacement1).Replace($targetSnippet2, $replacement2)
    $q.Formula = $newFormula
    Write-Host "Formula updated successfully!"
    $wb.Save()
    Write-Host "Workbook saved successfully!"
} else {
    Write-Error "Target snippets not found in formula!"
}

$wb.Close($false)

# Re-open and verify persistence
$wbVerify = $excel.Workbooks.Open($tempTest, 0, $true)
$qVerify = $wbVerify.Queries.Item("Fact_ServiciosDirectos_2026")
if ($qVerify.Formula.Contains("ColFechaBase") -and $qVerify.Formula.Contains("FechaBase")) {
    Write-Host "SUCCESS! The updated formula was verified inside the saved workbook!"
} else {
    Write-Error "Verification failed!"
}
$wbVerify.Close($false)

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Remove-Item $tempTest -Force
Write-Host "Temp test cleaned up."
