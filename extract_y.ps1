Add-Type -AssemblyName System.IO.Compression.FileSystem

$content = [System.IO.File]::ReadAllText("Y-MasterUnificado-item1.xml")
$b64 = [regex]::Match($content, '(?<=<DataMashup[^>]*>).*?(?=</DataMashup>)').Value
$bytes = [Convert]::FromBase64String($b64)
$pkIndex = -1
for ($i = 0; $i -lt ($bytes.Length - 4); $i++) {
    if ($bytes[$i] -eq 0x50 -and $bytes[$i+1] -eq 0x4B -and $bytes[$i+2] -eq 0x03 -and $bytes[$i+3] -eq 0x04) {
        $pkIndex = $i
        break
    }
}
Write-Host "PK index: $pkIndex"
$zipBytes = New-Object byte[] ($bytes.Length - $pkIndex)
[Array]::Copy($bytes, $pkIndex, $zipBytes, 0, $zipBytes.Length)
[System.IO.File]::WriteAllBytes("Y-MasterUnificado-mashup.zip", $zipBytes)

$mZip = [System.IO.Compression.ZipFile]::OpenRead("Y-MasterUnificado-mashup.zip")
foreach ($me in $mZip.Entries) {
    Write-Host "Mashup entry: $($me.FullName)"
    if ($me.FullName -like "*Section1.m*") {
        $ms = $me.Open()
        $mr = New-Object System.IO.StreamReader($ms)
        $mCode = $mr.ReadToEnd()
        $mr.Dispose()
        $ms.Dispose()
        [System.IO.File]::WriteAllText("Y-MasterUnificado-Section1.m", $mCode)
        Write-Host "Wrote Y-MasterUnificado-Section1.m ($($mCode.Length) chars)"
    }
}
$mZip.Dispose()
