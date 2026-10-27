try {
    $excel = New-Object -ComObject Excel.Application
    Write-Host "Excel COM successfully initialized!"
    Write-Host "Excel Version: $($excel.Version)"
    Write-Host "Excel Build: $($excel.Build)"
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    Write-Host "Cleaned up Excel COM."
} catch {
    Write-Error $_
}
