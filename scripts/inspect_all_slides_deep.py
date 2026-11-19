import pptx

prs = pptx.Presentation(r'C:\Users\alejandratesara\Desktop\Proyectos externos_FINAL_PULIDO.pptx')

with open(r'scripts/pptx_dump.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total slides: {len(prs.slides)}\n")
    for s_num, slide in enumerate(prs.slides):
        f.write(f"\n==================== SLIDE {s_num} ====================\n")
        for sh_idx, shape in enumerate(slide.shapes):
            if shape.has_text_frame:
                full_txt = shape.text_frame.text.strip()
                if full_txt:
                    f.write(f"\n--- Shape {sh_idx} ({shape.name}) [Paragraphs: {len(shape.text_frame.paragraphs)}] ---\n")
                    for p_idx, p in enumerate(shape.text_frame.paragraphs):
                        f.write(f"  P{p_idx}: {p.text}\n")
            elif shape.has_table:
                t = shape.table
                f.write(f"\n--- Table {sh_idx} ({shape.name}) [{len(t.rows)} rows x {len(t.columns)} cols] ---\n")
                for r_idx, row in enumerate(t.rows):
                    vals = [c.text.strip().replace('\n', ' ') for c in row.cells]
                    f.write(f"  R{r_idx}: {vals}\n")
