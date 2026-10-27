Add-Type -AssemblyName System.IO.Compression.FileSystem

$file = "C:\Users\alejandratesara\Desktop\Alejandra T\Informe_Costos_corregido.pptx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($file)

foreach ($slideName in @("slide9.xml", "slide10.xml")) {
    $entry = $zip.Entries | Where-Object { $_.Name -eq $slideName }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    $xml = [xml]$content
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
    
    Write-Host "================== $slideName =================="
    $tables = $xml.SelectNodes("//a:tbl", $ns)
    if ($tables) {
        foreach ($tbl in $tables) {
            Write-Host "--- Table Found ---"
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
    
    $textNodes = $xml.SelectNodes("//a:t", $ns)
    $allText = ($textNodes | ForEach-Object { $_.InnerText.Trim() }) -join " "
    Write-Host "`nAll text:"
    Write-Host $allText
}
$zip.Dispose()
