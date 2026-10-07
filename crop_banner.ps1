Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\alejandratesara\.gemini\antigravity\brain\2b1226cc-db43-4a25-b6a0-2d139c02cb7c\scratch\slides_export\slide_1.png"
$dstPath = "C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer\public\ppt-assets\portada-banner-industrial.png"

$srcBmp = [System.Drawing.Image]::FromFile($srcPath)
# The banner photos span y = 768 to 995 (height ~ 227)
$cropRect = New-Object System.Drawing.Rectangle(0, 768, 1920, 227)
$targetBmp = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height)

$g = [System.Drawing.Graphics]::FromImage($targetBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropRect.Width, $cropRect.Height)
$g.DrawImage($srcBmp, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$targetBmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$targetBmp.Dispose()
$srcBmp.Dispose()

Write-Output "Tight banner successfully saved"
