Add-Type -AssemblyName System.IO.Compression.FileSystem
$file = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*.pptx" | Select-Object -First 1
$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
foreach ($target in @("ppt/slides/slide5.xml", "ppt/slides/slide13.xml")) {
    $entry = $zip.Entries | Where-Object { $_.FullName -eq $target }
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    Write-Host "================ $target ================"
    $xml = [xml]$content
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
    $textNodes = $xml.SelectNodes("//a:t", $ns)
    $textNodes | ForEach-Object { Write-Host " - $($_.InnerText)" }
}
$zip.Dispose()
