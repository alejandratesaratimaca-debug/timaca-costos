Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Inspect-PowerQuery($path, $outName) {
    Write-Host "=== Inspecting Power Query in: $path ==="
    $fs = [System.IO.FileStream]::new($path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    $zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Read)
    
    # 1. xl/connections.xml
    $connEntry = $zip.Entries | Where-Object { $_.FullName -eq 'xl/connections.xml' }
    if ($connEntry) {
        $stream = $connEntry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $connXml = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        [System.IO.File]::WriteAllText("$outName-connections.xml", $connXml)
        Write-Host "Wrote $outName-connections.xml"
    }

    # 2. customXml
    $customEntries = $zip.Entries | Where-Object { $_.FullName -like 'customXml/item*.xml' }
    foreach ($ce in $customEntries) {
        $stream = $ce.Open()
        $ms = New-Object System.IO.MemoryStream
        $stream.CopyTo($ms)
        $bytes = $ms.ToArray()
        $stream.Close()
        [System.IO.File]::WriteAllBytes("$outName-$($ce.Name)", $bytes)
        Write-Host "Wrote $outName-$($ce.Name) ($($bytes.Length) bytes)"
    }
    
    $zip.Dispose()
    $fs.Dispose()
}

Inspect-PowerQuery 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx' 'BaseCentral'
Inspect-PowerQuery 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx' 'MasterUnificado'
Inspect-PowerQuery 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx' 'ModeloEstrella'
