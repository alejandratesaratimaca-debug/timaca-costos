Add-Type -AssemblyName System.IO.Compression.FileSystem
$file = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*.pptx" | Where-Object { $_.Name -notlike "*backup*" } | Select-Object -First 1
Write-Host "Verificando archivo: $($file.Name)"
$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
$entry = $zip.Entries | Where-Object { $_.FullName -eq "ppt/slides/slide3.xml" }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
[System.IO.File]::WriteAllText("slide3_raw.xml", $content, [System.Text.Encoding]::UTF8)
Write-Host "slide3_raw.xml written successfully, length: $($content.Length)"
