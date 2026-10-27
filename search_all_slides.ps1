Add-Type -AssemblyName System.IO.Compression.FileSystem
$file = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*.pptx" | Select-Object -First 1
$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
foreach ($entry in $zip.Entries | Where-Object { $_.FullName -like "ppt/slides/slide*.xml" }) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    if ($content -match "1.290" -or $content -match "11.80" -or $content -match "221.353" -or $content -match "agosto" -or $content -match "US\$") {
        Write-Host "Match in $($entry.FullName)"
    }
}
$zip.Dispose()
