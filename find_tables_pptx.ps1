Add-Type -AssemblyName System.IO.Compression.FileSystem

$file = "C:\Users\alejandratesara\Desktop\Alejandra T\Informe_Costos_corregido.pptx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($file)

for ($i = 1; $i -le 8; $i++) {
    $entry = $zip.Entries | Where-Object { $_.Name -eq "slide$i.xml" }
    if (!$entry) { continue }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    $xml = [xml]$content
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
    
    $tables = $xml.SelectNodes("//a:tbl", $ns)
    if ($tables.Count -gt 0) {
        Write-Host "=== SLIDE $i HAS $($tables.Count) TABLE(S) ==="
        foreach ($tbl in $tables) {
            $rows = $tbl.SelectNodes(".//a:tr", $ns)
            foreach ($row in $rows) {
                $cells = $row.SelectNodes(".//a:tc", $ns)
                $cellTexts = @()
                foreach ($cell in $cells) {
                    $txtNodes = $cell.SelectNodes(".//a:t", $ns)
                    $cellTexts += ($txtNodes | ForEach-Object { $_.InnerText.Trim() }) -join " "
                }
                Write-Host ($cellTexts -join " | ")
            }
        }
    }
}
$zip.Dispose()
