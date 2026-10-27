# ==============================================================================
# ENRIQUECIMIENTO DE CONSOLIDADO OFICIAL 2026 CON MOTIVO Y SOLICITANTE
# ==============================================================================
$sw = [System.Diagnostics.Stopwatch]::StartNew()
Write-Host "Iniciando enriquecimiento de Consolidado_Oficial_2026_Limpio.xlsx..." -ForegroundColor Cyan

$pathInputs = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx"
$pathConsolDesktop = "C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Consolidado_Oficial_2026_Limpio.xlsx"
$pathConsolDocs = "C:\Users\alejandratesara\Documents\Consolidado_Oficial_2026_Limpio.xlsx"
$pathConsolDownloads = "C:\Users\alejandratesara\Downloads\Consolidado_Oficial_2026_Limpio.xlsx"

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$excel.ScreenUpdating = $false

try {
    # 1. Cargar Mapeos de Motivo y Solicitante desde 1 Base Central Inputs.xlsx
    Write-Host "[1/4] Leyendo 1 Base Central Inputs.xlsx..." -ForegroundColor Yellow
    $wbInputs = $excel.Workbooks.Open($pathInputs, 0, $true)
    
    # 1.A. Consumos
    $wsCons = $wbInputs.Sheets.Item("1 Consumos")
    $rCons = $wsCons.UsedRange.Rows.Count
    Write-Host "   -> Extrayendo $rCons consumos..." -ForegroundColor Gray
    
    $vCons = $wsCons.Range("A2:O$rCons").Value2
    $mapDoc = @{}
    $mapCtaDesc = @{}
    
    for ($i = 1; $i -le ($rCons - 1); $i++) {
        $num = [string]$vCons[$i, 4]
        $cta = [string]$vCons[$i, 6]
        $desc = [string]$vCons[$i, 9]
        $sol = [string]$vCons[$i, 12]
        $mot = [string]$vCons[$i, 13]
        
        if ($num) {
            $numClean = $num.Trim()
            if ($mot -or $sol) {
                if (-not $mapDoc.ContainsKey($numClean)) {
                    $mapDoc[$numClean] = @{ Motivo = $mot; Solicitante = $sol }
                }
            }
        }
        if ($cta -and $desc -and ($mot -or $sol)) {
            $key = ($cta.Trim().ToUpper() + "|" + $desc.Trim().ToUpper())
            if (-not $mapCtaDesc.ContainsKey($key)) {
                $mapCtaDesc[$key] = @{ Motivo = $mot; Solicitante = $sol }
            }
        }
    }
    Write-Host "   -> Mapeo de Consumos listo: $($mapDoc.Count) documentos indexados." -ForegroundColor Green
    
    # 1.B. Compras
    $wsComp = $wbInputs.Sheets.Item("2 Compras")
    $rComp = $wsComp.UsedRange.Rows.Count
    Write-Host "   -> Extrayendo $rComp compras..." -ForegroundColor Gray
    $vComp = $wsComp.Range("A2:Z$rComp").Value2
    
    for ($i = 1; $i -le ($rComp - 1); $i++) {
        $solNum = [string]$vComp[$i, 3] # Nro-Sol
        $ocNum  = [string]$vComp[$i, 6] # Nro-OC
        $cta    = [string]$vComp[$i, 14] # Cuenta-Aux
        $desc   = [string]$vComp[$i, 10] # Descripcion
        $sol    = [string]$vComp[$i, 16] # Solicitado-Por
        $mot    = [string]$vComp[$i, 25] # Motivo
        
        if ($ocNum -and ($mot -or $sol)) {
            $k = $ocNum.Trim()
            if (-not $mapDoc.ContainsKey($k)) { $mapDoc[$k] = @{ Motivo = $mot; Solicitante = $sol } }
        }
        if ($solNum -and ($mot -or $sol)) {
            $k = $solNum.Trim()
            if (-not $mapDoc.ContainsKey($k)) { $mapDoc[$k] = @{ Motivo = $mot; Solicitante = $sol } }
        }
        if ($cta -and $desc -and ($mot -or $sol)) {
            $key = ($cta.Trim().ToUpper() + "|" + $desc.Trim().ToUpper())
            if (-not $mapCtaDesc.ContainsKey($key)) {
                $mapCtaDesc[$key] = @{ Motivo = $mot; Solicitante = $sol }
            }
        }
    }
    Write-Host "   -> Mapeo total listo: $($mapDoc.Count) documentos y $($mapCtaDesc.Count) pares cuenta-descripción." -ForegroundColor Green
    $wbInputs.Close($false)
    
    # 2. Abrir Consolidado_Oficial_2026_Limpio.xlsx y actualizar Detalle Transacciones
    Write-Host "[2/4] Procesando Consolidado_Oficial_2026_Limpio.xlsx..." -ForegroundColor Yellow
    $wbConsol = $excel.Workbooks.Open($pathConsolDesktop, 0, $false)
    $wsDetalle = $wbConsol.Sheets.Item("Detalle Transacciones")
    $rDetalle = $wsDetalle.UsedRange.Rows.Count
    Write-Host "   -> Filas a enriquecer en Detalle Transacciones: $rDetalle" -ForegroundColor Gray
    
    # Leer columnas actuales: Tipo (1), Mes (2), Documento (3), Cuenta_Auxiliar (4), Proyecto (5), Descripcion (6), Monto_USD (7)
    $vDet = $wsDetalle.Range("A2:G$rDetalle").Value2
    
    # Crear arreglo 2D para columnas H (Motivo) e I (Solicitante)
    $rowCount = $rDetalle - 1
    $motivoArr = New-Object 'object[,]' $rowCount, 2
    
    $matchesDoc = 0
    $matchesDesc = 0
    $cifCount = 0
    $modCount = 0
    $hmCount = 0
    $genCount = 0
    
    for ($i = 1; $i -le $rowCount; $i++) {
        $tipo = [string]$vDet[$i, 1]
        $mes  = [string]$vDet[$i, 2]
        $doc  = [string]$vDet[$i, 3]
        $cta  = [string]$vDet[$i, 4]
        $desc = [string]$vDet[$i, 6]
        
        $docClean = if ($doc) { $doc.Trim() } else { "" }
        $ctaClean = if ($cta) { $cta.Trim().ToUpper() } else { "" }
        $descClean = if ($desc) { $desc.Trim().ToUpper() } else { "" }
        $keyCtaDesc = $ctaClean + "|" + $descClean
        
        $mVal = ""
        $sVal = ""
        
        if ($docClean -and $mapDoc.ContainsKey($docClean)) {
            $entry = $mapDoc[$docClean]
            $mVal = $entry.Motivo
            $sVal = $entry.Solicitante
            $matchesDoc++
        } elseif ($mapCtaDesc.ContainsKey($keyCtaDesc)) {
            $entry = $mapCtaDesc[$keyCtaDesc]
            $mVal = $entry.Motivo
            $sVal = $entry.Solicitante
            $matchesDesc++
        } else {
            # Asignación de motivos analíticos estándar por categoría
            if ($tipo -match "Indirecto" -or $docClean -match "CIF") {
                $mVal = "Prorrateo Corporativo CIF - $desc"
                $sVal = "Control de Gestión TIMACA"
                $cifCount++
            } elseif ($tipo -match "Mano de Obra" -or $docClean -match "MOD") {
                $mVal = "Nómina Operativa y Cuadrilla de Obra ($desc)"
                $sVal = "Gerencia de RRHH y Operaciones"
                $modCount++
            } elseif ($tipo -match "Maquina" -or $tipo -match "Máquina" -or $docClean -match "HM") {
                $mVal = "Operación de Maquinaria y Equipos Pesados de Montaje ($desc)"
                $sVal = "Jefatura de Taller y Equipos"
                $hmCount++
            } elseif ($tipo -match "Servicio") {
                $mVal = "Servicio Especializado de Obra / Subcontrato ($desc)"
                $sVal = "Coordinación de Operaciones / Procura"
                $genCount++
            } else {
                $mVal = "Despacho de Materiales para Ejecución de Obra ($desc)"
                $sVal = "Almacén Central SIP"
                $genCount++
            }
        }
        
        # Limpieza final de valores
        if ([string]::IsNullOrWhiteSpace($mVal)) {
            $mVal = "Despacho Operativo ($desc)"
        }
        if ([string]::IsNullOrWhiteSpace($sVal)) {
            $sVal = "Solicitante de Obra"
        }
        
        $idx = $i - 1
        $motivoArr[$idx, 0] = $mVal.Trim()
        $motivoArr[$idx, 1] = $sVal.Trim()
    }
    
    Write-Host "   -> Coincidencias directas por Documento: $matchesDoc" -ForegroundColor Green
    Write-Host "   -> Coincidencias por Cuenta-Descripción: $matchesDesc" -ForegroundColor Green
    Write-Host "   -> CIF catalogados: $cifCount | MOD: $modCount | HM: $hmCount | Materiales/Servicios: $genCount" -ForegroundColor Gray
    
    # 3. Escribir encabezados H1, I1 y rango H2:I$rDetalle
    Write-Host "[3/4] Escribiendo columnas Motivo y Solicitante en Excel..." -ForegroundColor Yellow
    $wsDetalle.Cells.Item(1, 8).Value2 = "Motivo"
    $wsDetalle.Cells.Item(1, 9).Value2 = "Solicitante"
    
    # Formato de cabecera en H1 e I1
    $headerRange = $wsDetalle.Range("H1:I1")
    $headerRange.Font.Bold = $true
    $headerRange.Interior.Color = 14540253 # Gris suave / slate
    
    # Asignación masiva instantánea
    $targetRange = $wsDetalle.Range("H2:I$rDetalle")
    $targetRange.Value2 = $motivoArr
    
    # Activar AutoFilter en toda la tabla (A1:I$rDetalle)
    Write-Host "   -> Habilitando AutoFilter en A1:I$rDetalle..." -ForegroundColor Gray
    $fullTableRange = $wsDetalle.Range("A1:I$rDetalle")
    if ($wsDetalle.AutoFilterMode) {
        $wsDetalle.AutoFilterMode = $false
    }
    $fullTableRange.AutoFilter()
    
    # Ajustar anchos de columnas
    $wsDetalle.Columns.Item(1).ColumnWidth = 22 # Tipo
    $wsDetalle.Columns.Item(2).ColumnWidth = 14 # Mes
    $wsDetalle.Columns.Item(3).ColumnWidth = 18 # Documento
    $wsDetalle.Columns.Item(4).ColumnWidth = 16 # Cuenta_Auxiliar
    $wsDetalle.Columns.Item(5).ColumnWidth = 36 # Proyecto
    $wsDetalle.Columns.Item(6).ColumnWidth = 42 # Descripcion
    $wsDetalle.Columns.Item(7).ColumnWidth = 16 # Monto_USD
    $wsDetalle.Columns.Item(8).ColumnWidth = 55 # Motivo
    $wsDetalle.Columns.Item(9).ColumnWidth = 26 # Solicitante
    
    # Formato numérico en Monto_USD
    $wsDetalle.Range("G2:G$rDetalle").NumberFormat = "$#,##0.00"
    
    # Guardar en Desktop
    Write-Host "[4/4] Guardando archivo actualizado..." -ForegroundColor Yellow
    $wbConsol.Save()
    $wbConsol.Close($true)
    Write-Host "   -> Consolidado en Desktop guardado con éxito!" -ForegroundColor Green
    
    # Replicar a Documents y Downloads para máxima conveniencia
    Copy-Item -Path $pathConsolDesktop -Destination $pathConsolDocs -Force
    Write-Host "   -> Replicado en Documents: $pathConsolDocs" -ForegroundColor Green
    Copy-Item -Path $pathConsolDesktop -Destination $pathConsolDownloads -Force
    Write-Host "   -> Replicado en Downloads: $pathConsolDownloads" -ForegroundColor Green
    
    Write-Host "`nPROCESO COMPLETADO EXITOSAMENTE EN $([Math]::Round($sw.Elapsed.TotalSeconds, 1)) SEGUNDOS!" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR CRITICO en linea $($_.InvocationInfo.ScriptLineNumber): $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
} finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
