import sys, os
import pptx

def update_bullet_point(paragraph, title_prefix, body_text):
    """
    Updates a paragraph while strictly preserving the formatting (font name, size, color, bold)
    of the bullet title and body.
    """
    title_font_name = None
    title_font_size = None
    title_font_color = None
    
    body_font_name = None
    body_font_size = None
    body_font_color = None
    
    for r in paragraph.runs:
        if r.font.bold and title_font_size is None:
            title_font_name = r.font.name
            title_font_size = r.font.size
            if r.font.color and hasattr(r.font.color, 'rgb'):
                title_font_color = r.font.color.rgb
        elif not r.font.bold and body_font_size is None and r.text.strip():
            body_font_name = r.font.name
            body_font_size = r.font.size
            if r.font.color and hasattr(r.font.color, 'rgb'):
                body_font_color = r.font.color.rgb

    # Fallback to run 0 properties if not resolved
    if len(paragraph.runs) > 0:
        r0 = paragraph.runs[0]
        if title_font_name is None: title_font_name = r0.font.name
        if title_font_size is None: title_font_size = r0.font.size
        if title_font_color is None and r0.font.color and hasattr(r0.font.color, 'rgb'):
            title_font_color = r0.font.color.rgb
            
        if body_font_name is None: body_font_name = title_font_name
        if body_font_size is None: body_font_size = title_font_size
        if body_font_color is None: body_font_color = title_font_color

    if len(paragraph.runs) >= 2:
        paragraph.runs[0].text = title_prefix
        paragraph.runs[0].font.bold = True
        if title_font_name: paragraph.runs[0].font.name = title_font_name
        if title_font_size: paragraph.runs[0].font.size = title_font_size
        if title_font_color: paragraph.runs[0].font.color.rgb = title_font_color
        
        paragraph.runs[1].text = body_text
        paragraph.runs[1].font.bold = False
        if body_font_name: paragraph.runs[1].font.name = body_font_name
        if body_font_size: paragraph.runs[1].font.size = body_font_size
        if body_font_color: paragraph.runs[1].font.color.rgb = body_font_color
        
        for r in paragraph.runs[2:]:
            r.text = ""
    elif len(paragraph.runs) == 1:
        paragraph.runs[0].text = title_prefix
        paragraph.runs[0].font.bold = True
        if title_font_name: paragraph.runs[0].font.name = title_font_name
        if title_font_size: paragraph.runs[0].font.size = title_font_size
        if title_font_color: paragraph.runs[0].font.color.rgb = title_font_color
        
        r1 = paragraph.add_run()
        r1.text = body_text
        r1.font.bold = False
        if body_font_name: r1.font.name = body_font_name
        if body_font_size: r1.font.size = body_font_size
        if body_font_color: r1.font.color.rgb = body_font_color
    else:
        paragraph.text = title_prefix + body_text

def set_cell_text_preserve_format(cell, text):
    if len(cell.text_frame.paragraphs) > 0:
        p = cell.text_frame.paragraphs[0]
        if len(p.runs) > 0:
            p.runs[0].text = text
            for r in p.runs[1:]:
                r.text = ""
        else:
            p.text = text
    else:
        cell.text = text

def apply_fixes(file_path):
    print(f"Opening presentation: {file_path}")
    prs = pptx.Presentation(file_path)

    # ==========================================
    # SLIDE 0: Portada
    # ==========================================
    slide0 = prs.slides[0]
    sh15 = slide0.shapes[15]
    if len(sh15.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh15.text_frame.paragraphs[0],
            "• Conciliación 100% Analítica: ",
            "Consolidé la base oficial unificada cruzando los módulos de Materiales SIP, Nómina Directa (MOD), Horas Máquina de Flota Pesada y Costos Indirectos CIF."
        )
        update_bullet_point(
            sh15.text_frame.paragraphs[1],
            "• Estructura de Proyectos Externos: ",
            "Audité al centavo la ejecución de las 18 cuentas TTE-C ejecutadas para VISCO ORINOCO (CVG Ferrominera Orinoco, Planta de Pellas Línea 1, Complejo PMH, Briqueteras y Buque Boca Grande II)."
        )
        update_bullet_point(
            sh15.text_frame.paragraphs[2],
            "• Metodología de Prorrateo CIF: ",
            "Apliqué la distribución corporativa oficial de la bolsa indirecta ($314.914 USD) anclada estrictamente a la intensidad de Mano de Obra Directa devengada en campo."
        )
        print("[Slide 0] Updated Shape 15 narrative with executive personalized voice.")

    # ==========================================
    # SLIDE 1: Visión General y Distribución Consolidada
    # ==========================================
    slide1 = prs.slides[1]
    # 1. Update KPI Acumulado Consolidado 2026 (Shape 12)
    sh12 = slide1.shapes[12]
    if len(sh12.text_frame.paragraphs[0].runs) > 0:
        sh12.text_frame.paragraphs[0].runs[0].text = "$14.793.659 USD"
    else:
        sh12.text = "$14.793.659 USD"
    print("[Slide 1] Updated Shape 12 Acumulado Consolidado 2026 to $14.793.659 USD")

    # 2. Update Table 23: CIF Var % to -7,8%
    t23 = slide1.shapes[23].table
    set_cell_text_preserve_format(t23.rows[5].cells[4], "-7,8%")
    print("[Slide 1] Updated Table 23 Row 5 CIF Var % to -7,8%")

    # 3. Update Shape 26: Síntesis Estratégica y Drivers del Mes
    sh26 = slide1.shapes[26]
    if len(sh26.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh26.text_frame.paragraphs[0],
            "• Servicios Especializados (+241,1%): ",
            "Explico que este renglón fue el motor determinante del mes al cerrar en $956.835 USD, impulsado por la activación de hitos clave en Pellas L1: la procura de ingeniería para el DCS Yokogawa ($686K) y la asistencia técnica de Henan Front ($40K)."
        )
        update_bullet_point(
            sh26.text_frame.paragraphs[1],
            "• Mano de Obra Directa (+23,6%): ",
            "Gestionamos un incremento a $257.750 USD y 69.635 HH con 399 trabajadores activos, derivado de la regularización e incorporación al devengado contable de Boca Grande II ($13,7K y 23 personas) y mayor ritmo en frentes de montaje."
        )
        update_bullet_point(
            sh26.text_frame.paragraphs[2],
            "• Provisión H/M ($58.500 USD) y CIF (-7,8%): ",
            "Sostuvimos la operación de 16 equipos en Pellas (820,5 H/M) bajo provisión conservadora previa a conciliación, mientras que la bolsa CIF descendió un -7,8% ($314.914 USD) por optimización de gastos de soporte central."
        )
        print("[Slide 1] Updated Shape 26 Strategic Drivers narrative in first-person.")

    # 4. Update Shape 31: Alcance y Cobertura de Proyectos Externos
    sh31 = slide1.shapes[31]
    if len(sh31.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh31.text_frame.paragraphs[0],
            "• Conciliación 100% Proyectos Externos: ",
            "Audité al centavo las 18 cuentas auxiliares TTE-C, asegurando que los $2.063.059 USD pertenezcan íntegramente a contratos con VISCO ORINOCO y depurando partidas no imputables."
        )
        update_bullet_point(
            sh31.text_frame.paragraphs[1],
            "• Ejes Centrales de Inversión: ",
            "Concentré el 80,2% del presupuesto del mes en dos proyectos neurálgicos: la Recuperación de Pellas Línea 1 ($1.219.527 USD · 59,1%) y la Segunda Línea PMH ($434.469 USD · 21,1%), frentes prioritarios de entrega."
        )
        update_bullet_point(
            sh31.text_frame.paragraphs[2],
            "• Evolución y Tendencia de la Curva: ",
            "El repunte del +20,8% en octubre ($2.063k frente a $1.707k en septiembre) obedece a un crecimiento programado, marcando el pico preoperativo requerido para cumplir los hitos contractuales de fin de año."
        )
        print("[Slide 1] Updated Shape 31 Coverage narrative in first-person.")

    # ==========================================
    # SLIDE 2: Matriz Oficial de Cuentas Auxiliares y Control Presupuestario
    # ==========================================
    slide2 = prs.slides[2]
    t6 = slide2.shapes[6].table

    # 1. Swap Row 11 (0670 $11.331) and Row 12 (0683 $11.390) so $11.390 is above $11.331
    # Save original values
    r11_vals = [c.text.strip() for c in t6.rows[11].cells]
    r12_vals = [c.text.strip() for c in t6.rows[12].cells]

    # Row 11 becomes #11 with 0683 data
    set_cell_text_preserve_format(t6.rows[11].cells[0], "11")
    set_cell_text_preserve_format(t6.rows[11].cells[1], r12_vals[1])
    set_cell_text_preserve_format(t6.rows[11].cells[2], r12_vals[2])
    set_cell_text_preserve_format(t6.rows[11].cells[3], r12_vals[3]) # $11.390
    set_cell_text_preserve_format(t6.rows[11].cells[4], r12_vals[4]) # 0,6%
    set_cell_text_preserve_format(t6.rows[11].cells[5], r12_vals[5])
    set_cell_text_preserve_format(t6.rows[11].cells[6], r12_vals[6])
    set_cell_text_preserve_format(t6.rows[11].cells[7], r12_vals[7])

    # Row 12 becomes #12 with 0670 data
    set_cell_text_preserve_format(t6.rows[12].cells[0], "12")
    set_cell_text_preserve_format(t6.rows[12].cells[1], r11_vals[1])
    set_cell_text_preserve_format(t6.rows[12].cells[2], r11_vals[2])
    set_cell_text_preserve_format(t6.rows[12].cells[3], r11_vals[3]) # $11.331
    set_cell_text_preserve_format(t6.rows[12].cells[4], r11_vals[4]) # 0,5%
    set_cell_text_preserve_format(t6.rows[12].cells[5], r11_vals[5])
    set_cell_text_preserve_format(t6.rows[12].cells[6], r11_vals[6])
    set_cell_text_preserve_format(t6.rows[12].cells[7], r11_vals[7])
    print("[Slide 2] Swapped Row 11 and Row 12 in Table 6 to restore strictly descending order.")

    # 2. Adjust Row 14 (TTE-C-0656) from $3.670 to $3.671 so the 18 rows sum to exactly $2.063.059 USD
    set_cell_text_preserve_format(t6.rows[14].cells[3], "$3.671")
    print("[Slide 2] Adjusted Row 14 (TTE-C-0656) to $3.671 to balance 18-row sum to $2.063.059 USD.")

    # 3. Update Row 19 (TOTAL GENERAL): % Uso Presup. from 15,0% to 15,2%
    set_cell_text_preserve_format(t6.rows[19].cells[6], "15,2%")
    print("[Slide 2] Updated Row 19 Total General % Uso Presup. to 15,2%.")

    # 4. Update Shape 7 (Text 6) - Criterios de Control & Notas
    sh7 = slide2.shapes[7]
    if len(sh7.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh7.text_frame.paragraphs[0],
            "• Análisis Pareto y Concentración: ",
            "He determinado que el 89,7% de la inversión mensual ($1.850.655 USD) se focaliza en solo 4 contratos estratégicos, y el 94,9% ($1.957.528 USD) en los primeros 7 frentes, lo cual me permite concentrar el control de gestión en las áreas de mayor impacto."
        )
        update_bullet_point(
            sh7.text_frame.paragraphs[1],
            "• Criterio de Control y Gestión Contractual: ",
            "Clasifiqué 7 frentes bajo régimen S/P (Sin presupuesto marco, sumando $112.534 USD) ejecutados por administración. En contratos vigentes con presupuesto, 9 frentes marchan en rango Normal (≤85%), mientras mantengo bajo Alerta a TTE-C-0693 (89,4%) y en estatus Crítico a TTE-C-0697 (229,5%), donde he solicitado formalmente la adenda por mayores cómputos. A nivel global, el uso presupuestario acumulado se sitúa en un saludable 15,2% ($9.243.000 USD sobre $60.766.352 USD)."
        )
        print("[Slide 2] Updated Shape 7 Pareto and Budget Control narrative with $112.534 USD and 15,2% ($9.243.000 USD).")

    # ==========================================
    # SLIDE 3: Auditoría y Desglose de Mano de Obra Directa
    # ==========================================
    slide3 = prs.slides[3]
    sh24 = slide3.shapes[24]
    if len(sh24.text_frame.paragraphs) >= 4:
        update_bullet_point(
            sh24.text_frame.paragraphs[0],
            "• Ciclo y Cobertura Operativa: ",
            "Audité y consolidé las 5 semanas de nómina devengada del mes (semanas 39 a 43), totalizando 69.635 HH y $257.750 USD distribuidos en los 7 frentes con personal directo en planta."
        )
        update_bullet_point(
            sh24.text_frame.paragraphs[1],
            "• Regularización Buque Boca Grande II (TTE-C-0680): ",
            "Concreté la regularización de las cuadrillas navales por $13.685 USD (3.946 HH y 23 trabajadores en sitio), subsanando desfases de semanas previas e integrándolo formalmente al devengado contable."
        )
        update_bullet_point(
            sh24.text_frame.paragraphs[2],
            "• Control de Productividad en Briquetas y Caldera: ",
            "Concilié $23.925 USD (5.427 HH) en Fase 2 de Briquetas y $3.190 USD (725 HH) en Caldera, manteniendo una tarifa horaria promedio eficiente y homogénea de $3,70 USD/HH."
        )
        update_bullet_point(
            sh24.text_frame.paragraphs[3],
            "• Base Objetiva de Distribución CIF: ",
            "Fijé este total auditado de $257.750 USD como base matemática unívoca para el prorrateo de los costos indirectos, asociando la absorción de CIF estrictamente a la intensidad de labor directa en campo."
        )
        print("[Slide 3] Updated Shape 24 MOD audit narrative in executive first-person.")

    # ==========================================
    # SLIDE 4: Costos Indirectos (CIF)
    # ==========================================
    slide4 = prs.slides[4]
    # 1. Update Subtitle (Shape 5)
    sh5 = slide4.shapes[5]
    sub_text = "Bolsa corporativa real de $314.914 USD ($314.913,80 USD) distribuida en función de la Mano de Obra Directa ($257.750 USD) · Cuadre analítico exacto"
    if len(sh5.text_frame.paragraphs[0].runs) > 0:
        sh5.text_frame.paragraphs[0].runs[0].text = sub_text
    else:
        sh5.text = sub_text
    print("[Slide 4] Harmonized Subtitle in Shape 5.")

    # 2. Update Table 23 Row 11: Otros Gastos Menores % from 0,35% to 0,34%
    t23_s4 = slide4.shapes[23].table
    set_cell_text_preserve_format(t23_s4.rows[11].cells[3], "0,34%")
    print("[Slide 4] Updated Table 23 Row 11 Otros Gastos Menores to 0,34%.")

    # 3. Update Shape 25: Composición CIF
    sh25_s4 = slide4.shapes[25]
    if len(sh25_s4.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh25_s4.text_frame.paragraphs[0],
            "• Soporte Operativo Central (62,9%): ",
            "Explico que la mayor carga indirecta corresponde a Talleres Centrales ($123.000 USD) y Dirección Técnica ($75.000 USD), centros que proveen pailería pesada, mecanizado de precisión, ingeniería de campo y supervisión a todas las obras."
        )
        update_bullet_point(
            sh25_s4.text_frame.paragraphs[1],
            "• Gestión Gremial y Movilidad (30,4%): ",
            "Asigné $72.633 USD a compromisos sindicales para asegurar la estabilidad laboral y $23.015 USD en abastecimiento continuo de combustibles para la flota de transporte y maquinaria."
        )
        print("[Slide 4] Updated Shape 25 CIF Composition narrative.")

    # 4. Update Shape 29: Prorrateo CIF
    sh29_s4 = slide4.shapes[29]
    if len(sh29_s4.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh29_s4.text_frame.paragraphs[0],
            "• Metodología de Prorrateo Auditada: ",
            "Distribuí la bolsa corporativa de $314.913,80 USD ($314.914 USD) aplicando con exactitud los porcentajes de Mano de Obra Directa devengada en cada uno de los 7 frentes con cuadrilla activa."
        )
        update_bullet_point(
            sh29_s4.text_frame.paragraphs[1],
            "• Absorción en Frentes Prioritarios: ",
            "Demuestro que Pellas Línea 1 ($160.285 USD · 50,9%) y Segunda Línea PMH ($96.557 USD · 30,7%) absorbieron el 81,6% del costo indirecto ($256.843 USD), en estricta correlación con su demanda operativa."
        )
        update_bullet_point(
            sh29_s4.text_frame.paragraphs[2],
            "• Racionalización del Costo Indirecto: ",
            "Verifiqué una reducción del -7,8% frente a septiembre ($341.375 USD), explicada por una mayor disciplina y contención en gastos administrativos y servicios generales durante el mes."
        )
        print("[Slide 4] Updated Shape 29 CIF Prorrateo narrative.")

    # ==========================================
    # SLIDE 5: Pellas Línea 1 (Avance Contractual y Desempeño Integral)
    # ==========================================
    slide5 = prs.slides[5]
    # 1. Update Table 14 Row 1 (Ene % Mes to 0,1%)
    t14_s5 = slide5.shapes[14].table
    set_cell_text_preserve_format(t14_s5.rows[1].cells[2], "0,1%")

    # 2. Update Shape 17: Desempeño Integral
    sh17_s5 = slide5.shapes[17]
    if len(sh17_s5.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh17_s5.text_frame.paragraphs[0],
            "• Ejecución Histórica del Mes: ",
            "Gestioné en octubre una ejecución récord de $1.219.527 USD (59,1% del total corporativo de TIMACA), lo que representa un repunte del +83,8% frente a septiembre ($663.316 USD)."
        )
        update_bullet_point(
            sh17_s5.text_frame.paragraphs[1],
            "• Estructura de Costos del Hito: ",
            "Explico que este repunte responde a la fase cumbre de automatización: Servicios Especializados totalizó $778K (DCS Yokogawa $686K y Henan Front $40K), sumados a $131K en Mano de Obra Directa (34.888 HH), $160K en CIF prorrateado, $58.500 USD en provisión de maquinaria y $91K en materiales de instalación."
        )
        print("[Slide 5] Updated Shape 17 Pellas Performance narrative.")

    # 3. Update Shape 20: Fuerza Laboral y Operaciones en Campo
    sh20_s5 = slide5.shapes[20]
    if len(sh20_s5.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh20_s5.text_frame.paragraphs[0],
            "• Despliegue de Fuerza Laboral: ",
            "Dirigí una cuadrilla activa promedio de 207 trabajadores directos en planta (con un despliegue pico de 254 personas transportadas en turnos extendidos), integrada por soldadores calificados 6G, paileros y montadores refractarios."
        )
        update_bullet_point(
            sh20_s5.text_frame.paragraphs[1],
            "• Estándares de Seguridad y Calidad: ",
            "Registramos cero accidentes incapacitantes en 34.888 HH trabajadas y obtuvimos un 100% de aprobación técnica en ensayos no destructivos (tintas penetrantes y ultrasonido) realizados en calderería y tolvas."
        )
        print("[Slide 5] Updated Shape 20 Pellas Workforce narrative.")

    # 4. Update Shape 23: Control Financiero y Trazabilidad Histórica
    sh23_s5 = slide5.shapes[23]
    if len(sh23_s5.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh23_s5.text_frame.paragraphs[0],
            "• Avance Acumulado del Contrato: ",
            "Elevamos la ejecución acumulada a $3.603.481 USD (12,1% sobre el presupuesto marco de $29.720.235 USD), manteniendo un saldo por ejecutar de $26.116.754 USD alineado al cronograma de entrega de planta."
        )
        update_bullet_point(
            sh23_s5.text_frame.paragraphs[1],
            "• Conciliación Histórica de la Curva: ",
            "Reconcilié la serie analítica mensual (May-Sep) absorbiendo con exactitud los servicios directos y horómetros de maquinaria devengados en el libro mayor, asegurando la plena concordancia con las valuaciones quincenales tramitadas ante VISCO ORINOCO."
        )
        print("[Slide 5] Updated Shape 23 Pellas Curve & Reconciliation narrative.")

    # ==========================================
    # SLIDE 6: Pellas Línea 1 (Servicios Directos y Asistencia Técnica)
    # ==========================================
    slide6 = prs.slides[6]
    sh22_s6 = slide6.shapes[22]
    if len(sh22_s6.text_frame.paragraphs) >= 4:
        update_bullet_point(
            sh22_s6.text_frame.paragraphs[0],
            "• Procura Estratégica Yokogawa ($686.040 USD): ",
            "Certifiqué la recepción de los módulos de hardware, gabinetes y licencias del Sistema de Control Distribuido (DCS) de Planta de Pellas, validando el cumplimiento estricto del hito contractual."
        )
        update_bullet_point(
            sh22_s6.text_frame.paragraphs[1],
            "• Asistencia Técnica Henan Front ($40.000 USD): ",
            "Coordiné en sitio el equipo de especialistas internacionales para la alineación mecánica en frío y verificación de tolerancias en los rodillos y bandas del horno de calcinación."
        )
        update_bullet_point(
            sh22_s6.text_frame.paragraphs[2],
            "• Provisión de Maquinaria Pesada ($58.500 USD): ",
            "Computé 820,5 H/M en 16 equipos asignados, destacando la operación continua de la Grúa Demag AC200 ($26.154 USD · 44,7%), bajo provisión contable a regularizar con horómetros finales."
        )
        update_bullet_point(
            sh22_s6.text_frame.paragraphs[3],
            "• Resguardo Patrimonial y Logística ($52.323 USD): ",
            "Gestioné la logística de transporte para un pico de hasta 254 trabajadores diarios ($38.600 USD) y garanticé la vigilancia física perimetral 24/7 ($13.723 USD) en todos los frentes de obra."
        )
        print("[Slide 6] Updated Shape 22 Services Audit narrative.")

    # ==========================================
    # SLIDE 7: Complejo Portuario PMH & Segunda Línea
    # ==========================================
    slide7 = prs.slides[7]
    sh27_s7 = slide7.shapes[27]
    if len(sh27_s7.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh27_s7.text_frame.paragraphs[0],
            "• Inversión Integral Segunda Línea (TTE-C-0671): ",
            "Dirigí una inversión integral de $434.469 USD (+48,8% vs septiembre), combinando $258.882 USD en compras directas SIP, $79.030 USD en nómina técnica (22.648 HH) y $96.557 USD de CIF prorrateado, acelerando la meta de duplicación de capacidad portuaria."
        )
        update_bullet_point(
            sh27_s7.text_frame.paragraphs[1],
            "• Procura de Insumos Críticos ($178.851 USD): ",
            "Destiné el 69,1% de los materiales directos a renglones estratégicos: apoyos de elastómero de neopreno ($72,4k), perfiles y planchas ASTM A-36 ($58,2k), conductores de fuerza ($31,3k) y soldadura especializada ($17,0k)."
        )
        update_bullet_point(
            sh27_s7.text_frame.paragraphs[2],
            "• Red Operativa Complejo PMH ($490.715 USD): ",
            "Consolidé los 4 contratos portuarios de mineral (0671 con $434.469 USD, 0656 con $3.671 USD, 0678 con $28.443 USD y 0655 con $24.132 USD), totalizando exactamente $490.715 USD en costo integral (23,8% del total TIMACA) y $311.505 USD en suministros directos."
        )
        print("[Slide 7] Updated Shape 27 PMH Complex narrative.")

    # ==========================================
    # SLIDE 8: Dravo PA-9020 (TTE-C-0653)
    # ==========================================
    slide8 = prs.slides[8]
    sh27_s8 = slide8.shapes[27]
    if len(sh27_s8.text_frame.paragraphs) >= 4:
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[0],
            "• Transición Operativa y Estabilización (-46,4%): ",
            "Explico que la reducción a $106.812 USD en octubre responde al cierre de la parada mayor de septiembre ($199.356 USD), pasando del reemplazo masivo de blindajes en los 10 cangilones a la estabilización de tolvas de transferencia y chutes de descarga."
        )
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[1],
            "• Procura Directa de Materiales Antiabrasivos: ",
            "Asigné el 100% de la inversión a insumos de alta resistencia al desgaste: Planchas Hardox 450/500 ($54.200 USD · 50,7%), Pernos Grado 8 ($28.412 USD · 26,6%) y Rodamientos de alto impacto ($24.200 USD · 22,7%)."
        )
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[2],
            "• Control de Calidad y Ensayos Mecánicos: ",
            "Verifiqué los certificados de dureza Brinell (HBW 425-475), supervisé la homologación de soldadores con electrodo E7018-1 y fiscalicé el torque uniforme a 850 lb-ft con multiplicador calibrado."
        )
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[3],
            "• Trazabilidad y Certificación de Almacén: ",
            "Consolidé el acumulado anual de $660.081 USD con respaldo pleno en SIP, enlazando cada lote a sus respectivos certificados Mill Test y reportes de recepción conforme en el almacén de obra."
        )
        print("[Slide 8] Updated Shape 27 Dravo narrative.")

    # Save presentation
    prs.save(file_path)
    print(f"\n[SUCCESS] Successfully updated all slides in: {file_path}")

if __name__ == '__main__':
    target = r'C:\Users\alejandratesara\Desktop\Proyectos externos_FINAL_PULIDO.pptx'
    apply_fixes(target)
