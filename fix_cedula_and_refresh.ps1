param()

Write-Host "=========================================================="
Write-Host "TIMACA - CORRECCION POWER QUERY (CEDULA TYPE ANY) & REFRESH"
Write-Host "Fecha/Hora: $(Get-Date)"
Write-Host "=========================================================="

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

function Patch-MasterFile($filePath) {
    Write-Host "`n>>> Verificando y parchando: $filePath"
    if (-not (Test-Path $filePath)) {
        Write-Error "No se encuentra el archivo: $filePath"
        return $false
    }

    $wb = $excel.Workbooks.Open($filePath, 0, $false)
    $modified = $false

    # 1. Parche _3_Mano_de_obra
    try {
        $q = $wb.Queries.Item("_3_Mano_de_obra")
        $f = $q.Formula
        if ($f.Contains('{"Cedula", Int64.Type}')) {
            Write-Host "  Actualizando _3_Mano_de_obra: reemplazando Int64.Type por type any..."
            $newF = $f.Replace('{"Cedula", Int64.Type}', '{"Cedula", type any}')
            $q.Formula = $newF
            $modified = $true
            Write-Host "  [OK] _3_Mano_de_obra actualizada."
        } else {
            Write-Host "  _3_Mano_de_obra ya no tiene Int64.Type o ya fue modificada."
        }
    } catch {
        Write-Warning "  No se pudo procesar _3_Mano_de_obra: $($_.Exception.Message)"
    }

    # 2. Parche _4_Horas_Maquina
    try {
        $qHM = $wb.Queries.Item("_4_Horas_Maquina")
        $fHM = $qHM.Formula
        if ($fHM.Contains('{"# CEDULA", Int64.Type}')) {
            Write-Host "  Actualizando _4_Horas_Maquina: reemplazando Int64.Type por type any..."
            $newFHM = $fHM.Replace('{"# CEDULA", Int64.Type}', '{"# CEDULA", type any}')
            $qHM.Formula = $newFHM
            $modified = $true
            Write-Host "  [OK] _4_Horas_Maquina actualizada."
        } else {
            Write-Host "  _4_Horas_Maquina ya no tiene Int64.Type."
        }
    } catch {
        Write-Warning "  No se pudo procesar _4_Horas_Maquina: $($_.Exception.Message)"
    }

    # 3. Eliminar consultas residuales de error si existen
    $queriesToDelete = @()
    foreach ($item in $wb.Queries) {
        if ($item.Name -like "*Error*") {
            $queriesToDelete += $item.Name
        }
    }
    foreach ($errName in $queriesToDelete) {
        Write-Host "  Eliminando consulta de error residual: $errName"
        try {
            $wb.Queries.Item($errName).Delete()
            $modified = $true
        } catch {}
    }

    if ($modified) {
        $wb.Save()
        Write-Host "  [GUARDADO] Libro guardado con los parches aplicados."
    }

    $wb.Close($false)
    return $true
}

function Refresh-File($filePath, $refreshPivotTables = $false) {
    Write-Host "`n>>> Iniciando RefreshAll en: $filePath"
    if (-not (Test-Path $filePath)) {
        Write-Error "Archivo no encontrado: $filePath"
        return
    }

    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $wb = $excel.Workbooks.Open($filePath, 0, $false)

    foreach ($conn in $wb.Connections) {
        if ($conn.OLEDBConnection) {
            $conn.OLEDBConnection.BackgroundQuery = $false
        }
    }

    try {
        Write-Host "Ejecutando RefreshAll()..."
        $wb.RefreshAll()
        $excel.CalculateUntilAsyncQueriesDone()

        if ($refreshPivotTables) {
            Write-Host "Refrescando Tablas Dinamicas..."
            $count = 0
            foreach ($ws in $wb.Worksheets) {
                foreach ($pt in $ws.PivotTables()) {
                    try {
                        $null = $pt.Update()
                        $null = $pt.RefreshTable()
                        $count++
                    } catch {}
                }
            }
            Write-Host "Refrescadas $count tablas dinamicas."
        }

        $wb.Save()
        $sw.Stop()
        Write-Host "[OK] Refresco completado y guardado en $($sw.Elapsed.TotalSeconds) seg: $filePath"
    } catch {
        Write-Error "Error en refresco de $filePath : $_"
    }

    $wb.Close($false)
}

# 1. PARCHAR
Patch-MasterFile "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"
Patch-MasterFile "Y:\Costos Master\1 Informe\4 Master Unificado.xlsx"

# 2. REFRESCAR 4 Master Unificado local
Refresh-File "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx"

# 3. REFRESCAR Nuevas Tablas Informesssssssssssss.xlsx
Refresh-File "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\Nuevas Tablas Informesssssssssssss.xlsx" $true

$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null

Write-Host "`n=========================================================="
Write-Host "PROCESO FINALIZADO CON EXITO"
Write-Host "=========================================================="
