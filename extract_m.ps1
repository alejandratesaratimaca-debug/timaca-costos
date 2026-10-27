Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Extract-Section1($zipPath, $outM) {
    Write-Host "Extracting M code from $zipPath to $outM"
    $zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $zipPath))
    $entry = $zip.Entries | Where-Object { $_.FullName -like "*Section1.m*" }
    if ($entry) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
        $mCode = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        [System.IO.File]::WriteAllText($outM, $mCode, [System.Text.Encoding]::UTF8)
        Write-Host "Extracted $($mCode.Length) chars to $outM"
    } else {
        Write-Host "Section1.m not found! Entries:"
        $zip.Entries | ForEach-Object { Write-Host "  $($_.FullName)" }
    }
    $zip.Dispose()
}

Extract-Section1 "BaseCentral-mashup.zip" "BaseCentral-Section1.m"
Extract-Section1 "MasterUnificado-mashup.zip" "MasterUnificado-Section1.m"
Extract-Section1 "ModeloEstrella-mashup.zip" "ModeloEstrella-Section1.m"
