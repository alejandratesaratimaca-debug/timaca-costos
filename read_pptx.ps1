Add-Type -AssemblyName System.IO.Compression.FileSystem
$file = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*.pptx" | Select-Object -First 1
Write-Host "Found file: $($file.FullName)"
$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
$slides = $zip.Entries | Where-Object { $_.FullName -like "ppt/slides/slide*.xml" } | Sort-Object { [int]($_.Name -replace '\D') }
foreach ($entry in $slides) {
    Write-Host "================== $($entry.FullName) =================="
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
    Write-Host $allText
    Write-Host ""
}
$zip.Dispose()
