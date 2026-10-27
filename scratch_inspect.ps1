Add-Type -AssemblyName System.IO.Compression.FileSystem

function Inspect-Zip($path) {
    Write-Host "=== Inspecting: $path ==="
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    
    # Check Power Query custom parts
    $pqEntries = $zip.Entries | Where-Object { $_.FullName -like "*customXml*" -or $_.FullName -like "*connections*" -or $_.FullName -like "*queryTable*" -or $_.FullName -like "*item*" }
    Write-Host "Special / Data Entries found: $($pqEntries.Count)"
    $pqEntries | ForEach-Object { Write-Host "  Entry: $($_.FullName)" }
    
    # Read xl/workbook.xml
    $wbEntry = $zip.Entries | Where-Object { $_.FullName -eq 'xl/workbook.xml' }
    if ($wbEntry) {
        $stream = $wbEntry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        [xml]$wbXml = $xml
        Write-Host "Sheets:"
        $wbXml.workbook.sheets.sheet | ForEach-Object {
            Write-Host "  Name: $($_.name) | SheetId: $($_.sheetId) | rId: $($_.id)"
        }
    }
    $zip.Dispose()
}

Inspect-Zip 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx'
Inspect-Zip 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\4 Master Unificado.xlsx'
Inspect-Zip 'C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\Modelo_Estrella_Costos_TIMACA.xlsx'
