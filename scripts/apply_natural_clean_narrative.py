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

def apply_natural_narrative(file_path):
    print(f"Applying clean, natural, professional narrative to: {file_path}")
    prs = pptx.Presentation(file_path)

    # ==========================================
    # SLIDE 0: Portada
    # ==========================================
    slide0 = prs.slides[0]
    sh15 = slide0.shapes[15]
    if len(sh15.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh15.text_frame.paragraphs[0],
            "• Conciliación de Datos: ",
            "Cruce directo entre compras de materiales (SIP), nómina de mano de obra en campo, provisión de equipos y costos indirectos de talleres."
        )
        update_bullet_point(
            sh15.text_frame.paragraphs[1],
            "• Cobertura de Proyectos: ",
            "Registro de los 18 contratos activos para VISCO ORINOCO (CVG Ferrominera, Planta de Pellas, Complejo PMH, Briquetas y Buque Boca Grande II)."
        )
        update_bullet_point(
            sh15.text_frame.paragraphs[2],
            "• Distribución CIF ($314.914 USD): ",
            "Reparto de los costos indirectos entre los proyectos activos según las horas y el personal que tuvo cada uno en el mes."
        )
        print("[Slide 0] Updated Shape 15 with clean, natural text.")

    # ==========================================
    # SLIDE 1: Visión General y Distribución Consolidada
    # ==========================================
    slide1 = prs.slides[1]
    
    # 1. Shape 26: Síntesis y Drivers del Mes
    sh26 = slide1.shapes[26]
    if len(sh26.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh26.text_frame.paragraphs[0],
            "• Servicios Especializados (+241,1%): ",
            "Subió a $956.835 USD por la llegada de los equipos de automatización Yokogawa ($686K) y el soporte técnico de Henan Front ($40K) en Pellas Línea 1."
        )
        update_bullet_point(
            sh26.text_frame.paragraphs[1],
            "• Mano de Obra Directa (+23,6%): ",
            "Aumentó a $257.750 USD (69.635 horas) al sumar al personal del Buque Boca Grande II ($13,7K y 23 trabajadores), alcanzando 399 personas activas."
        )
        update_bullet_point(
            sh26.text_frame.paragraphs[2],
            "• Equipos y CIF (-7,8%): ",
            "Se mantiene la provisión de $58.500 USD para 16 equipos de Pellas a la espera de horómetros finales, mientras que los indirectos bajaron a $314.914 USD por menor gasto en talleres."
        )
        print("[Slide 1] Updated Shape 26 Strategic Drivers.")

    # 2. Shape 31: Alcance y Cobertura de Proyectos Externos
    sh31 = slide1.shapes[31]
    if len(sh31.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh31.text_frame.paragraphs[0],
            "• Cuentas Auxiliares (18 proyectos): ",
            "El total de $2.063.059 USD corresponde únicamente a obras activas con VISCO, sin incluir gastos ajenos a los contratos."
        )
        update_bullet_point(
            sh31.text_frame.paragraphs[1],
            "• Proyectos Principales: ",
            "Pellas Línea 1 ($1.219.527 USD · 59,1%) y Segunda Línea PMH ($434.469 USD · 21,1%) concentran el 80,2% del presupuesto del mes."
        )
        update_bullet_point(
            sh31.text_frame.paragraphs[2],
            "• Evolución del Mes: ",
            "El incremento de +20,8% ($2.063K vs $1.707K en septiembre) responde al mayor ritmo de trabajo y llegada de suministros previa al arranque de planta."
        )
        print("[Slide 1] Updated Shape 31 Coverage.")

    # ==========================================
    # SLIDE 2: Matriz Oficial de Cuentas Auxiliares y Control Presupuestario
    # ==========================================
    slide2 = prs.slides[2]
    sh7 = slide2.shapes[7]
    if len(sh7.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh7.text_frame.paragraphs[0],
            "• Concentración del Gasto: ",
            "4 proyectos concentran el 89,7% ($1.850.655 USD) y los primeros 7 frentes el 94,9% ($1.957.528 USD) de todo el costo de octubre."
        )
        update_bullet_point(
            sh7.text_frame.paragraphs[1],
            "• Control Presupuestario: ",
            "7 cuentas operan bajo modalidad S/P (Sin presupuesto marco, sumando $112.534 USD) por administración directa. En contratos con presupuesto, 9 están en nivel Normal (≤85%), TTE-C-0693 está en Alerta (89,4%) y TTE-C-0697 está Crítico (229,5%) a la espera de aprobación de adenda por mayor alcance. El consumo global de los contratos marco es de 15,2% ($9.244.000 USD de $60.766.352 USD)."
        )
        print("[Slide 2] Updated Shape 7 Pareto and Budget Control.")

    # ==========================================
    # SLIDE 3: Auditoría y Desglose de Mano de Obra Directa
    # ==========================================
    slide3 = prs.slides[3]
    sh24 = slide3.shapes[24]
    if len(sh24.text_frame.paragraphs) >= 4:
        update_bullet_point(
            sh24.text_frame.paragraphs[0],
            "• Corte de Nómina: ",
            "Comprende las 5 semanas de octubre (semanas 39 a 43) en los 7 frentes con cuadrillas en sitio, sumando $257.750 USD y 69.635 horas-hombre."
        )
        update_bullet_point(
            sh24.text_frame.paragraphs[1],
            "• Buque Boca Grande II (TTE-C-0680): ",
            "Se incluyó el pago de las cuadrillas de mantenimiento marino ($13.685 USD, 3.946 HH y 23 personas) que venía pendiente de corte."
        )
        update_bullet_point(
            sh24.text_frame.paragraphs[2],
            "• Briquetas y Caldera: ",
            "La nómina de Fase 2 Briquetas sumó $23.925 USD (5.427 HH) y la de Caldera $3.190 USD (725 HH), con un costo promedio de $3,70 USD por hora en campo."
        )
        update_bullet_point(
            sh24.text_frame.paragraphs[3],
            "• Base para Costos Indirectos: ",
            "Este total de $257.750 USD sirve de base para repartir la bolsa de CIF entre cada obra según su volumen de mano de obra."
        )
        print("[Slide 3] Updated Shape 24 MOD audit narrative.")

    # ==========================================
    # SLIDE 4: Costos Indirectos (CIF)
    # ==========================================
    slide4 = prs.slides[4]
    
    # 1. Subtitle (Shape 5)
    sh5 = slide4.shapes[5]
    sub_text = "Bolsa corporativa de $314.914 USD ($314.913,80 USD) distribuida entre los proyectos según la Mano de Obra Directa ($257.750 USD)"
    if len(sh5.text_frame.paragraphs[0].runs) > 0:
        sh5.text_frame.paragraphs[0].runs[0].text = sub_text
    else:
        sh5.text = sub_text

    # 2. Shape 25: Composición CIF
    sh25 = slide4.shapes[25]
    if len(sh25.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh25.text_frame.paragraphs[0],
            "• Soporte de Talleres (62,9%): ",
            "La mayor parte corresponde a Nómina de Talleres Centrales ($123.000 USD) y Dirección Técnica ($75.000 USD), que dan servicio de corte, soldadura y supervisión a todas las obras."
        )
        update_bullet_point(
            sh25.text_frame.paragraphs[1],
            "• Logística y Personal (30,4%): ",
            "Incluye aportes sindicales y dotaciones ($72.633 USD) y combustible para el transporte del personal y los equipos ($23.015 USD)."
        )
        print("[Slide 4] Updated Shape 25 CIF Composition.")

    # 3. Shape 29: Prorrateo CIF
    sh29 = slide4.shapes[29]
    if len(sh29.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh29.text_frame.paragraphs[0],
            "• Criterio de Reparto: ",
            "Los $314.913,80 USD se distribuyen entre los 7 proyectos con personal propio, según las horas y costo de mano de obra de cada frente."
        )
        update_bullet_point(
            sh29.text_frame.paragraphs[1],
            "• Mayor Asignación: ",
            "Pellas Línea 1 ($160.285 USD · 50,9%) y Segunda Línea PMH ($96.557 USD · 30,7%) absorben el 81,6% de los indirectos por tener la mayor cantidad de trabajadores."
        )
        update_bullet_point(
            sh29.text_frame.paragraphs[2],
            "• Reducción del Mes: ",
            "Los costos indirectos bajaron un -7,8% respecto a septiembre ($341.375 USD) debido a un menor gasto en compras operativas y servicios generales del taller."
        )
        print("[Slide 4] Updated Shape 29 CIF Prorrateo.")

    # ==========================================
    # SLIDE 5: Pellas Línea 1 (Avance Contractual y Desempeño Integral)
    # ==========================================
    slide5 = prs.slides[5]
    
    # 1. Shape 17: Desempeño Integral
    sh17 = slide5.shapes[17]
    if len(sh17.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh17.text_frame.paragraphs[0],
            "• Ejecución del Mes: ",
            "Pellas cerró octubre en $1.219.527 USD (59,1% del total de TIMACA), subiendo +83,8% respecto a septiembre ($663.316 USD)."
        )
        update_bullet_point(
            sh17.text_frame.paragraphs[1],
            "• Causa del Incremento: ",
            "Se debe principalmente a la fase de automatización y servicios ($778K, destacando Yokogawa con $686K y Henan Front con $40K), junto a $131K en mano de obra (34.888 HH), $160K de CIF, $58.500 USD en equipos y $91K en materiales."
        )
        print("[Slide 5] Updated Shape 17 Pellas Performance.")

    # 2. Shape 20: Fuerza Laboral y Operaciones en Campo
    sh20 = slide5.shapes[20]
    if len(sh20.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh20.text_frame.paragraphs[0],
            "• Personal en Planta: ",
            "Hubo un promedio de 207 trabajadores directos en obra (con picos de 254 personas transportadas por turno), entre soldadores 6G, paileros y montadores refractarios."
        )
        update_bullet_point(
            sh20.text_frame.paragraphs[1],
            "• Seguridad y Ensayos: ",
            "El mes cerró sin accidentes con tiempo perdido (34.888 HH) y las pruebas de tintas penetrantes y ultrasonido en calderería y tolvas resultaron 100% conformes."
        )
        print("[Slide 5] Updated Shape 20 Pellas Workforce.")

    # 3. Shape 23: Control Financiero y Trazabilidad Histórica
    sh23 = slide5.shapes[23]
    if len(sh23.text_frame.paragraphs) >= 2:
        update_bullet_point(
            sh23.text_frame.paragraphs[0],
            "• Avance del Contrato: ",
            "El acumulado llegó a $3.603.481 USD (12,1% del contrato marco de $29.720.235 USD), quedando un saldo disponible de $26.116.754 USD para las etapas de montaje."
        )
        update_bullet_point(
            sh23.text_frame.paragraphs[1],
            "• Conciliación Histórica: ",
            "Se ajustaron los meses de mayo a septiembre para incluir servicios y horas de maquinaria que no estaban registrados, dejando la curva alineada con las valuaciones quincenales del cliente."
        )
        print("[Slide 5] Updated Shape 23 Pellas Curve & Reconciliation.")

    # ==========================================
    # SLIDE 6: Pellas Línea 1 (Servicios Directos y Asistencia Técnica)
    # ==========================================
    slide6 = prs.slides[6]
    sh22 = slide6.shapes[22]
    if len(sh22.text_frame.paragraphs) >= 4:
        update_bullet_point(
            sh22.text_frame.paragraphs[0],
            "• Contrato Yokogawa ($686.040 USD): ",
            "Suministro de tableros, equipos de control y licencias de software para el Sistema de Control Distribuido (DCS) de la planta."
        )
        update_bullet_point(
            sh22.text_frame.paragraphs[1],
            "• Asistencia Henan Front ($40.000 USD): ",
            "Supervisión técnica en sitio para alineación en frío y verificación de rodillos en el horno de calcinación."
        )
        update_bullet_point(
            sh22.text_frame.paragraphs[2],
            "• Equipos y Maquinaria ($58.500 USD): ",
            "Provisión de 820,5 horas de uso en 16 equipos, principalmente la Grúa Demag AC200 ($26.154 USD · 44,7%), a la espera de cierre final de horómetros."
        )
        update_bullet_point(
            sh22.text_frame.paragraphs[3],
            "• Transporte y Vigilancia ($52.323 USD): ",
            "Servicio de transporte para cuadrillas con pico de 254 trabajadores diarios ($38.600 USD) y custodia perimetral 24/7 de las áreas de trabajo ($13.723 USD)."
        )
        print("[Slide 6] Updated Shape 22 Services Audit.")

    # ==========================================
    # SLIDE 7: Complejo Portuario PMH & Segunda Línea
    # ==========================================
    slide7 = prs.slides[7]
    sh27 = slide7.shapes[27]
    if len(sh27.text_frame.paragraphs) >= 3:
        update_bullet_point(
            sh27.text_frame.paragraphs[0],
            "• Avance Segunda Línea (TTE-C-0671): ",
            "El proyecto ejecutó $434.469 USD en octubre (+48,8% vs septiembre), repartido en $258.882 USD de materiales SIP, $79.030 USD de nómina (22.648 HH) y $96.557 USD de CIF."
        )
        update_bullet_point(
            sh27.text_frame.paragraphs[1],
            "• Materiales Principales ($178.851 USD): ",
            "El 69,1% de las compras directas se concentró en apoyos de neopreno ($72,4K), acero ASTM A-36 para estructuras ($58,2K), cableado de fuerza ($31,3K) y soldadura ($17,0K)."
        )
        update_bullet_point(
            sh27.text_frame.paragraphs[2],
            "• Total Complejo PMH ($490.715 USD): ",
            "La suma de las 4 obras del complejo (Segunda Línea 0671 con $434.469 USD, Bandas 0656 con $3.671 USD, Apilador 0678 con $28.443 USD e Interconexión 0655 con $24.132 USD) totaliza exactamente $490.715 USD en el mes."
        )
        print("[Slide 7] Updated Shape 27 PMH Complex.")

    # ==========================================
    # SLIDE 8: Dravo PA-9020 (TTE-C-0653)
    # ==========================================
    slide8 = prs.slides[8]
    sh27_s8 = slide8.shapes[27]
    if len(sh27_s8.text_frame.paragraphs) >= 4:
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[0],
            "• Estabilización Post-Parada (-46,4%): ",
            "El costo bajó a $106.812 USD tras culminar la parada mayor de septiembre ($199.356 USD), pasando del cambio masivo de blindajes en los 10 cangilones a trabajos de ajuste en tolvas y chutes de descarga."
        )
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[1],
            "• Compras de Materiales: ",
            "El 100% del gasto correspondió a suministros: Planchas antidesgaste Hardox ($54.200 USD · 50,7%), Pernos Grado 8 ($28.412 USD · 26,6%) y Rodamientos especiales ($24.200 USD · 22,7%)."
        )
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[2],
            "• Pruebas de Calidad: ",
            "Se verificó la dureza Brinell en las planchas (HBW 425-475), la homologación de la soldadura E7018-1 y el ajuste de pernos a 850 lb-ft con llave dinamométrica."
        )
        update_bullet_point(
            sh27_s8.text_frame.paragraphs[3],
            "• Control de Inventario: ",
            "El total acumulado de $660.081 USD en el año cuenta con entradas registradas en almacén y certificados de calidad de fábrica."
        )
        print("[Slide 8] Updated Shape 27 Dravo.")

    # Save presentation
    prs.save(file_path)
    print(f"\n[SUCCESS] Successfully applied clean natural narrative to: {file_path}")

if __name__ == '__main__':
    target = r'C:\Users\alejandratesara\Desktop\Proyectos externos_FINAL_PULIDO.pptx'
    apply_natural_narrative(target)
