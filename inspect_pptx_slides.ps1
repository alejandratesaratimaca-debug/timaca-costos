Add-Type -AssemblyName System.IO.Compression.FileSystem

$file = "C:\Users\alejandratesara\Desktop\Alejandra T\Informe_Costos_corregido.pptx"
Write-Host "Opening: $file"

$zip = [System.IO.Compression.ZipFile]::OpenRead($file)
$slides = $zip.Entries | Where-Object { $_.FullName -like "ppt/slides/slide*.xml" } | Sort-Object { [int]($_.Name -replace '\D') }

foreach ($entry in $slides) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    
    $xml = [xml]$content
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
    
    $textNodes = $xml.SelectNodes("//a:t", $ns)
    $allText = ($textNodes | ForEach-Object { $_.InnerText.Trim() }) -join " "
    
    Write-Host "--- Slide: $($entry.Name) ---"
    Write-Host ($allText.Substring(0, [Math]::Min(250, $allText.Length)))
}
$zip.Dispose()
