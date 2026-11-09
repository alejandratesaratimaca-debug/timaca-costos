def get_code():
    return """
  // =========================================================================
  // BROWSER DOWNLOAD WITH OPENXML SPANISH LOCALIZATION (es-VE)
  // =========================================================================
  const fileName = `Informe_Ejecutivo_Costos_TIMACA_${mesLabel.replace(/\\s+/g, '_')}.pptx`;
  if (typeof window !== 'undefined') {
    const rawBlob: any = await pptx.write({ outputType: 'blob' });
    const zip = await JSZip.loadAsync(rawBlob);
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      if (relativePath.endsWith('.xml') || relativePath.endsWith('.rels')) {
        let content = await zipEntry.async('string');
        let modified = false;
        if (content.includes('lang="en-US"')) {
          content = content.replace(/lang="en-[A-Z]+"/g, 'lang="es-VE"');
          modified = true;
        }
        if (modified) {
          zip.file(relativePath, content);
        }
      }
    }
    const cleanBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(cleanBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } else {
    await pptx.writeFile({ fileName });
  }
}
"""
