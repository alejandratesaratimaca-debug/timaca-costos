param()

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "=========================================================="
Write-Host "TIMACA - APLICACION DE PARCHE POWER QUERY (FALLBACK FECHA)"
Write-Host "Fecha/Hora: $(Get-Date)"
Write-Host "=========================================================="

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

function Update-MasterUnificado($filePath, $backupDir) {
    Write-Host "`n>>> Procesando Master Unificado: $filePath"
    
    if (-not (Test-Path $filePath)) {
        Write-Error "Archivo no encontrado: $filePath"
        return $false
    }
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    $backupPath = Join-Path $backupDir "4 Master Unificado_BACKUP_${timestamp}_PRE_PQ_FALLBACK.xlsx"
    Write-Host "Creando respaldo de seguridad en: $backupPath"
    Copy-Item $filePath $backupPath -Force
    
    Write-Host "Abriendo libro en Excel COM..."
    $wb = $excel.Workbooks.Open($filePath, 0, $false)
    $q = $wb.Queries.Item("_2_Servicios_Directos")
    
    $oldFormula = $q.Formula
    $targetSnippet = '#"Columna condicional agregada2" = Table.AddColumn(#"Columna condicional agregada1", "Fecha Real", each if [Ajuste_Servicios.Fecha Real] = null then [#"Fecha-Rec"] else [Ajuste_Servicios.Fecha Real]),'
    $replacement = '#"Columna condicional agregada2" = Table.AddColumn(#"Columna condicional agregada1", "Fecha Real", each if [#"Ajuste_Servicios.Fecha Real"] <> null then [#"Ajuste_Servicios.Fecha Real"] else if [#"Fecha-Rec"] <> null then [#"Fecha-Rec"] else [#"Fecha-Sol"]),'
    
    if ($oldFormula.Contains($targetSnippet)) {
        Write-Host "Fragmento objetivo encontrado. Aplicando formula con Fallback a Fecha-Sol..."
        $newFormula = $oldFormula.Replace($targetSnippet, $replacement)
        $q.Formula = $newFormula
        $wb.Save()
        Write-Host "Libro guardado exitosamente."
        $res = $true
    } elseif ($oldFormula.Contains($replacement)) {
        Write-Host "El parche ya habia sido aplicado previamente a este archivo."
        $res = $true
    } else {
        Write-Error "No se encontro el fragmento en la formula de _2_Servicios_Directos!"
        $res = $false
    }
    
    $wb.Close($false)
    
    # Verificacion
    $wbCheck = $excel.Workbooks.Open($filePath, 0, $true)
    $qCheck = $wbCheck.Queries.Item("_2_Servicios_Directos")
    if ($qCheck.Formula.Contains("Fecha-Sol")) {
        Write-Host "[VERIFICADO OK] Fallback [Fecha-Sol] confirmado en $filePath"
    } else {
        Write-Error "[ERROR] No se pudo verificar el cambio en $filePath"
        $res = $false
    }
    $wbCheck.Close($false)
    return $res
}

function Update-ModeloEstrella($filePath, $backupDir) {
    Write-Host "`n>>> Procesando Modelo Estrella: $filePath"
    
    if (-not (Test-Path $filePath)) {
        Write-Error "Archivo no encontrado: $filePath"
        return $false
    }
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    $backupPath = Join-Path $backupDir "Modelo_Estrella_Costos_TIMACA_backup_${timestamp}_PRE_PQ_FALLBACK.xlsx"
    Write-Host "Creando respaldo de seguridad en: $backupPath"
    Copy-Item $filePath $backupPath -Force
    
    Write-Host "Abriendo libro en Excel COM..."
    $wb = $excel.Workbooks.Open($filePath, 0, $false)
    $q = $wb.Queries.Item("Fact_ServiciosDirectos_2026")
    
    $oldFormula = $q.Formula
    $targetSnippet1 = '    FilasFiltradas = Table.SelectRows(TipoCambiado, each [Categoria] = "SERVICIOS" and [#"Fecha-Rec"] <> null and Date.Year([#"Fecha-Rec"]) = 2026),'
    $replacement1 = '    ColFechaBase = Table.AddColumn(TipoCambiado, "FechaBase", each if [#"Fecha-Rec"] <> null then [#"Fecha-Rec"] else [#"Fecha-Sol"], type date),' + "`r`n" + '    FilasFiltradas = Table.SelectRows(ColFechaBase, each [Categoria] = "SERVICIOS" and [FechaBase] <> null and Date.Year([FechaBase]) = 2026),'

    $targetSnippet2 = '    ColFechaReal = Table.AddColumn(ColCtaAU, "Fecha Real", each if [Ajuste_Servicios.Fecha Real] = null then [#"Fecha-Rec"] else [Ajuste_Servicios.Fecha Real]),'
    $replacement2 = '    ColFechaReal = Table.AddColumn(ColCtaAU, "Fecha Real", each if [#"Ajuste_Servicios.Fecha Real"] <> null then [#"Ajuste_Servicios.Fecha Real"] else [FechaBase], type date),'

    if ($oldFormula.Contains($targetSnippet1) -and $oldFormula.Contains($targetSnippet2)) {
        Write-Host "Fragmentos objetivos encontrados. Aplicando formula con FechaBase y preservacion de compras..."
        $newFormula = $oldFormula.Replace($targetSnippet1, $replacement1).Replace($targetSnippet2, $replacement2)
        $q.Formula = $newFormula
        $wb.Save()
        Write-Host "Libro guardado exitosamente."
        $res = $true
    } elseif ($oldFormula.Contains("ColFechaBase")) {
        Write-Host "El parche ya habia sido aplicado previamente a este archivo."
        $res = $true
    } else {
        Write-Error "No se encontraron los fragmentos en la formula de Fact_ServiciosDirectos_2026!"
        $res = $false
    }
    
    $wb.Close($false)
    
    # Verificacion
    $wbCheck = $excel.Workbooks.Open($filePath, 0, $true)
    $qCheck = $wbCheck.Queries.Item("Fact_ServiciosDirectos_2026")
    if ($qCheck.Formula.Contains("ColFechaBase") -and $qCheck.Formula.Contains("FechaBase")) {
        Write-Host "[VERIFICADO OK] FechaBase con Fallback confirmada en $filePath"
    } else {
        Write-Error "[ERROR] No se pudo verificar el cambio en $filePath"
        $res = $false
    }
    $wbCheck.Close($false)
    return $res
}

# 1. LOCAL - Alejandra T
Update-MasterUnificado `
    "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx" `
    "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\_Respaldos"

Update-ModeloEstrella `
    "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx" `
    "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\_Respaldos"

# 2. RED - Servidor \\dc01timaca\Costos\Costos Master (Y:)
Update-MasterUnificado `
    "Y:\Costos Master\1 Informe\4 Master Unificado.xlsx" `
    "Y:\Costos Master\Respaldo"

Update-ModeloEstrella `
    "Y:\Costos Master\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx" `
    "Y:\Costos Master\Respaldo"

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null

Write-Host "`n=========================================================="
Write-Host "PROCESO FINALIZADO CON EXITO EN LOCAL Y RED TIMACA"
Write-Host "=========================================================="
