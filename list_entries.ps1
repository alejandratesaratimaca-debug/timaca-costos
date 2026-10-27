Add-Type -AssemblyName System.IO.Compression.FileSystem
$file = Get-ChildItem -Path "C:\Users\alejandratesara\Downloads" -Filter "*SIGMA*.pptx" | Where-Object { $_.Name -notlike "*backup*" } | Select-Object -First 1
$zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
Write-Host "Total entries: $($zip.Entries.Count)"
$zip.Entries | Select-Object -First 10 | ForEach-Object { Write-Host " - $($_.FullName)" }
$zip.Dispose()
