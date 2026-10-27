Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$backup = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*backup*.pptx" | Select-Object -First 1
$destPath = [System.IO.Path]::Combine($backup.DirectoryName, "SIGMA Sistema Integrado de Gestión TIMACA.pptx")

Write-Host "Copiando desde backup: $($backup.FullName)"
Copy-Item $backup.FullName $destPath -Force

# Abrir el zip con ZipArchive en modo Update
$fs = [System.IO.File]::Open($destPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Update)

$entry = $zip.GetEntry("ppt/slides/slide3.xml")
if ($entry -eq $null) {
    Write-Error "No se encontró ppt/slides/slide3.xml"
    $zip.Dispose()
    $fs.Dispose()
    exit 1
}

# Leer texto
$reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
$xmlText = $reader.ReadToEnd()
$reader.Close()

# Reemplazos exactos:
# 1. Total Agosto: 1.290.177 -> 1.345.010
# 2. Acumulado Enero a Agosto: 11.809.472 -> 11.804.998
# 3. Mano de Obra Directa: 221.353 -> 294.353
$newXmlText = $xmlText.Replace("1.290.177", "1.345.010").Replace("11.809.472", "11.804.998").Replace("221.353", "294.353")

if ($newXmlText -eq $xmlText) {
    Write-Error "No hubo cambios en slide3.xml"
    $zip.Dispose()
    $fs.Dispose()
    exit 1
}

# Borrar y re-crear con forward slash exacto
$entry.Delete()
$newEntry = $zip.CreateEntry("ppt/slides/slide3.xml", [System.IO.Compression.CompressionLevel]::Optimal)
$writer = New-Object System.IO.StreamWriter($newEntry.Open(), [System.Text.Encoding]::UTF8)
$writer.Write($newXmlText)
$writer.Flush()
$writer.Close()

$zip.Dispose()
$fs.Dispose()

Write-Host "¡Presentación SIGMA actualizada con éxito y con formato OPC estándar!"
