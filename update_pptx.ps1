Add-Type -AssemblyName System.IO.Compression.FileSystem

$pptxPath = "C:\Users\alejandratesara\Downloads\SIGMA Sistema Integrado de Gestión TIMACA.pptx"
$backupPath = "C:\Users\alejandratesara\Downloads\SIGMA Sistema Integrado de Gestión TIMACA_original_backup.pptx"

# 1. Crear backup si no existe
if (-not (Test-Path $backupPath)) {
    Copy-Item $pptxPath $backupPath
    Write-Host "Backup creado en: $backupPath"
}

# 2. Abrir el archivo PPTX para lectura y escritura
$zip = [System.IO.Compression.ZipFile]::Open($pptxPath, [System.IO.Compression.ZipArchiveMode]::Update)

# 3. Localizar slide3.xml
$slideEntry = $zip.Entries | Where-Object { $_.FullName -eq "ppt/slides/slide3.xml" }

# Leer contenido original
$stream = $slideEntry.Open()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xmlContent = $reader.ReadToEnd()
$reader.Close()
$stream.Close()

Write-Host "Longitud original de slide3.xml: $($xmlContent.Length)"

# 4. Reemplazar los números para coincidir con la web
# Costo total del mes: 1.290.177 -> 1.345.010
# Acumulado enero a agosto: 11.809.472 -> 11.804.998
# Mano de obra directa: 221.353 -> 294.353
$updatedXml = $xmlContent
$updatedXml = $updatedXml.Replace("1.290.177", "1.345.010")
$updatedXml = $updatedXml.Replace("11.809.472", "11.804.998")
$updatedXml = $updatedXml.Replace("221.353", "294.353")

if ($updatedXml -eq $xmlContent) {
    Write-Error "No se realizaron reemplazos en slide3.xml"
    $zip.Dispose()
    exit 1
}

# 5. Borrar la entrada anterior y crear la nueva con el XML actualizado
$slideEntry.Delete()
$newEntry = $zip.CreateEntry("ppt/slides/slide3.xml", [System.IO.Compression.CompressionLevel]::Optimal)
$writeStream = $newEntry.Open()
$writer = New-Object System.IO.StreamWriter($writeStream, [System.Text.Encoding]::UTF8)
$writer.Write($updatedXml)
$writer.Flush()
$writer.Close()
$writeStream.Close()

$zip.Dispose()
Write-Host "Presentación PPTX actualizada exitosamente con los números de agosto de la página web!"
