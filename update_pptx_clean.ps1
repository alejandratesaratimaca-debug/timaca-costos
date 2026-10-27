Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$file = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*.pptx" | Where-Object { $_.Name -notlike "*backup*" } | Select-Object -First 1
Write-Host "Archivo encontrado: $($file.FullName)"

$backupPath = [System.IO.Path]::Combine($file.DirectoryName, "SIGMA Sistema Integrado de Gestión TIMACA_backup.pptx")
if (-not (Test-Path $backupPath)) {
    Copy-Item $file.FullName $backupPath
    Write-Host "Backup creado: $backupPath"
}

# Crear carpeta temporal para descomprimir
$tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "pptx_sigma_" + [System.Guid]::NewGuid().ToString())
[System.IO.Compression.ZipFile]::ExtractToDirectory($file.FullName, $tempDir)
Write-Host "Extraído en: $tempDir"

# Ruta de slide3.xml
$slide3Path = [System.IO.Path]::Combine($tempDir, "ppt", "slides", "slide3.xml")
if (-not (Test-Path $slide3Path)) {
    Write-Error "No se encontró slide3.xml en $slide3Path"
    exit 1
}

$xmlText = [System.IO.File]::ReadAllText($slide3Path, [System.Text.Encoding]::UTF8)

# Reemplazos de los números oficiales de agosto para que coincidan 100% con la página web:
# 1. Total Agosto: 1.290.177 -> 1.345.010
# 2. Acumulado Enero a Agosto: 11.809.472 -> 11.804.998
# 3. Mano de Obra Directa: 221.353 -> 294.353
$newXmlText = $xmlText.Replace("1.290.177", "1.345.010").Replace("11.809.472", "11.804.998").Replace("221.353", "294.353")

if ($newXmlText -eq $xmlText) {
    Write-Error "No se encontró el texto a reemplazar en slide3.xml"
    Remove-Item $tempDir -Recurse -Force
    exit 1
}

[System.IO.File]::WriteAllText($slide3Path, $newXmlText, [System.Text.Encoding]::UTF8)
Write-Host "slide3.xml modificado con éxito."

# Reempaquetar el PPTX
$tempZip = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.Guid]::NewGuid().ToString() + ".zip")
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $tempZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Reemplazar el archivo original
Copy-Item $tempZip $file.FullName -Force
Remove-Item $tempZip -Force
Remove-Item $tempDir -Recurse -Force

Write-Host "¡El archivo PPTX original fue actualizado con éxito!"
