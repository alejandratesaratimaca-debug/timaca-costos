import sys, os
import pptx

def update_pptx(file_path):
    prs = pptx.Presentation(file_path)

    # 1. SLIDE 0: Portada
    slide0 = prs.slides[0]
    sh15 = slide0.shapes[15]
    for p in sh15.text_frame.paragraphs:
        if '344.629' in p.text:
            for r in p.runs:
                if '344.629' in r.text:
                    r.text = r.text.replace('344.629', '314.914')
                    print('[Slide 0] Updated CIF in shape 15 to $314.914 USD')

    # 2. SLIDE 1: Visión General
    slide1 = prs.slides[1]
    sh31 = slide1.shapes[31]
    for p in sh31.text_frame.paragraphs:
        for r in p.runs:
            if '1.234.651' in r.text:
                r.text = r.text.replace('1.234.651', '1.219.527').replace('59,0%', '59,1%')
                print('[Slide 1] Updated Pellas Línea 1 in shape 31')
            if '443.580' in r.text:
                r.text = r.text.replace('443.580', '434.469').replace('21,2%', '21,1%')
                print('[Slide 1] Updated PMH in shape 31')
            if '2.093' in r.text:
                r.text = r.text.replace('+22,6%', '+20,8%').replace('2.093', '2.063')
                print('[Slide 1] Updated curve % in shape 31')

    # 3. SLIDE 2: Matriz Auxiliares
    slide2 = prs.slides[2]
    sh7 = slide2.shapes[7]
    for p in sh7.text_frame.paragraphs:
        for r in p.runs:
            if '1.850.654' in r.text:
                r.text = r.text.replace('1.850.654', '1.850.655')
                print('[Slide 2] Updated Top 4 sum to 1.850.655')
            if '1.957.527' in r.text:
                r.text = r.text.replace('1.957.527', '1.957.528')
                print('[Slide 2] Updated Top 7 sum to 1.957.528')

    # 4. SLIDE 4: CIF
    slide4 = prs.slides[4]
    sh29 = slide4.shapes[29]
    for p in sh29.text_frame.paragraphs:
        for r in p.runs:
            if 'con fuerza laboral directa' in r.text:
                r.text = r.text.replace('con fuerza laboral directa', 'devengada en campo')
                print('[Slide 4] Cleaned repeated phrase in shape 29 bullet 1')
            if '175.410' in r.text or '105.668' in r.text:
                r.text = r.text.replace('175.410', '160.285').replace('105.668', '96.557')
                if 'bolsa indirecta' in r.text and '($256.843 USD)' not in r.text:
                    r.text = r.text.replace('bolsa indirecta.', 'bolsa indirecta ($256.843 USD).')
                print('[Slide 4] Updated Pellas & PMH CIF in shape 29')

    # 5. SLIDE 5: Pellas Línea 1 Table
    slide5 = prs.slides[5]
    t14 = slide5.shapes[14].table
    # Row updates: (row_idx, monto, pct, acum)
    row_updates = {
        5: ('$305.561', '1,0%', '$315.081'),
        6: ('$404.215', '1,4%', '$719.296'),
        7: ('$404.984', '1,4%', '$1.124.280'),
        8: ('$596.358', '2,0%', '$1.720.638'),
        9: ('$663.316', '2,2%', '$2.383.954'),
        10: ('$1.219.527', '4,1%', '$3.603.481')
    }
    for r_idx, (monto, pct, acum) in row_updates.items():
        row = t14.rows[r_idx]
        if len(row.cells[1].text_frame.paragraphs[0].runs) > 0:
            row.cells[1].text_frame.paragraphs[0].runs[0].text = monto
        else:
            row.cells[1].text = monto

        if len(row.cells[2].text_frame.paragraphs[0].runs) > 0:
            row.cells[2].text_frame.paragraphs[0].runs[0].text = pct
        else:
            row.cells[2].text = pct

        if len(row.cells[3].text_frame.paragraphs[0].runs) > 0:
            row.cells[3].text_frame.paragraphs[0].runs[0].text = acum
        else:
            row.cells[3].text = acum
        print(f'[Slide 5] Updated Row {r_idx}: Monto {monto}, % {pct}, Acum {acum}')

    # 6. SLIDE 7: Complejo PMH Typo fix
    slide7 = prs.slides[7]
    sh19 = slide7.shapes[19]
    # Replace runs in sh19
    for idx, r in enumerate(sh19.text_frame.paragraphs[0].runs):
        if idx == 0:
            r.text = 'TOTAL COMPLEJO PMH (4 CUENTAS)'
        else:
            r.text = ''
    print('[Slide 7] Corrected typo TOTACUENTASL to TOTAL COMPLEJO PMH (4 CUENTAS)')

    # Save modified presentation
    prs.save(file_path)
    print(f'Successfully updated: {file_path}')

if __name__ == '__main__':
    target = r'C:\Users\alejandratesara\Desktop\Proyectos externos_FINAL_PULIDO.pptx'
    update_pptx(target)
