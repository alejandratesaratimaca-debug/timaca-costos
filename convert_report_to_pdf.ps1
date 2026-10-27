
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = $false
    $doc = $word.Documents.Open('C:\Users\alejandratesara\Desktop\Alejandra T\TIMACA_Informe_Tecnico_Resolucion_Celdas_Null_PowerQuery.docx')
    $doc.SaveAs([ref]'C:\Users\alejandratesara\Desktop\Alejandra T\TIMACA_Informe_Tecnico_Resolucion_Celdas_Null_PowerQuery.pdf', [ref]17)
    $doc.Close()
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  