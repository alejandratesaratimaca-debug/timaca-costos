section Section1;

shared _1_Materiales_Directos = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\2 Analisis Consumos - Master.xlsx"), null, true),
    Base_Consumos_Final_Table = Origen{[Item="Base_Consumos_Final",Kind="Table"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(Base_Consumos_Final_Table,{{"Source.Name", type text}, {"Almacen", type text}, {"Fecha", type date}, {"Numero", type text}, {"Pedido", type text}, {"Cuenta-Aux", type text}, {"Ceco", type text}, {"Codigo", type text}, {"Descripcion", type text}, {"Cantidad", Int64.Type}, {"Unidad", type text}, {"solicitante", type text}, {"motivo", type text}, {"Costo-$", type number}, {"Ajuste", type text}, {"2 Compras.Fecha-Rec", Int64.Type}, {"Ultimo Precio de Compra", type number}, {"Precio Promedio Hist", type number}, {"Precio Unitario Final", type number}, {"Fuente Precio", type text}, {"Catalogo.Grupo", type text}, {"Catalogo.Nombre Cuenta", type text}, {"TablaExcepciones.Precio Manual", type number}, {"Precio Final", type number}, {"Total USD", type number}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Almacen", "Fecha", "Numero", "Pedido", "Cuenta-Aux", "Ceco", "Codigo", "Descripcion", "Cantidad", "Unidad", "solicitante", "motivo", "Ajuste", "Catalogo.Nombre Cuenta", "Precio Final", "Total USD"}),
    #"Personalizada agregada" = Table.AddColumn(#"Otras columnas quitadas", "Tipo", each "Materiales Directos"),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Personalizada agregada",{"Tipo", "Almacen", "Fecha", "Numero", "Pedido", "Cuenta-Aux", "Ceco", "Codigo", "Descripcion", "Cantidad", "Unidad", "solicitante", "motivo", "Ajuste", "Catalogo.Nombre Cuenta", "Precio Final", "Total USD"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"Catalogo.Nombre Cuenta", "Categoria"}}),
    #"Valor reemplazado" = Table.ReplaceValue(#"Columnas con nombre cambiado", each [#"Cuenta-Aux"], each if [#"Cuenta-Aux"] = "TTE-C-0676" and Date.Month([Fecha]) = 7 then "TTE-C-0706" else [#"Cuenta-Aux"], Replacer.ReplaceValue, {"Cuenta-Aux"})
,
    #"Limpieza Llave" = Table.ReplaceValue(#"Valor reemplazado", "TTE-C-0706}", "TTE-C-0706", Replacer.ReplaceText, {"Cuenta-Aux"}),
    #"Asignacion Campero" = Table.ReplaceValue(#"Limpieza Llave", each [#"Cuenta-Aux"], each if [Numero] = "DP0038297" or [Numero] = "DP0038275" then "TTE-C-0706" else [#"Cuenta-Aux"], Replacer.ReplaceValue, {"Cuenta-Aux"})
in
    #"Asignacion Campero";

shared _2_Servicios_Directos = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx"), null, true),
    _2_Compras_Table = Origen{[Item="_2_Compras",Kind="Table"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(_2_Compras_Table,{{"Fecha-Sol", type date}}),
    #"Filas filtradas" = Table.SelectRows(#"Tipo cambiado", each ([#"Estatus-SC"] <> "ANULADO") and ([#"Estatus-OC"] <> "ANULADO" and [#"Estatus-OC"] <> "RECHAZADA")),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Filas filtradas",{"Almacen", "Nro-Sol", "Fecha-Sol", "Nro-OC", "Codigo", "Categoria", "Descripcion", "Cant-OC", "Unidad", "Cuenta-Aux", "Desc-Cuenta", "Solicitado-Por", "Precio$", "Total$", "Fecha-Rec", "Motivo"}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Otras columnas quitadas",{{"Fecha-Rec", type date}}),
    #"Columna condicional agregada" = Table.AddColumn(#"Tipo cambiado1", "Tipo", each if [Descripcion] = "SERVICIO DE IMPORTACION" then "Materiales Directos" else if [Descripcion] = "FLETE NACIONAL" then "Materiales Directos" else if [Descripcion] = "FLETE INTERNACIONAL" then "Materiales Directos" else if [Descripcion] = "FLETE LOCAL" then "Materiales Directos" else "Servicios"),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Columna condicional agregada",{"Tipo", "Almacen", "Nro-Sol", "Fecha-Sol", "Nro-OC", "Codigo", "Categoria", "Descripcion", "Cant-OC", "Unidad", "Cuenta-Aux", "Desc-Cuenta", "Solicitado-Por", "Precio$", "Total$", "Fecha-Rec", "Motivo"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"Total$", "Total USD"}, {"Motivo", "motivo"}, {"Nro-Sol", "Numero"}, {"Nro-OC", "Pedido"}, {"Cant-OC", "Cantidad"}, {"Solicitado-Por", "solicitante"}}),
    
    // SOLUCIÓN AQUÍ: Envolvemos el Distinct en un Table.Buffer para congelar la tabla limpia en memoria
    #"Ajustes Sin Duplicados" = Table.Buffer(Table.Distinct(Ajuste_Servicios, {"Nro-OC", "Codigo", "Cant-OC"})),
    
    #"Consultas combinadas" = Table.NestedJoin(#"Columnas con nombre cambiado", {"Pedido", "Codigo", "Cantidad"}, #"Ajustes Sin Duplicados", {"Nro-OC", "Codigo", "Cant-OC"}, "Ajuste_Servicios", JoinKind.LeftOuter),
    #"Se expandió Ajuste_Servicios" = Table.ExpandTableColumn(#"Consultas combinadas", "Ajuste_Servicios", {"Cuenta-Aux", "Fecha Real"}, {"Ajuste_Servicios.Cuenta-Aux", "Ajuste_Servicios.Fecha Real"}),
    #"Columna condicional agregada1" = Table.AddColumn(#"Se expandió Ajuste_Servicios", "Cuenta AU", each if [#"Ajuste_Servicios.Cuenta-Aux"] <> null then [#"Ajuste_Servicios.Cuenta-Aux"] else [#"Cuenta-Aux"]),
    #"Columna condicional agregada2" = Table.AddColumn(#"Columna condicional agregada1", "Fecha Real", each if [Ajuste_Servicios.Fecha Real] = null then [#"Fecha-Rec"] else [Ajuste_Servicios.Fecha Real]),
    #"Tipo cambiado2" = Table.TransformColumnTypes(#"Columna condicional agregada2",{{"Fecha Real", type date}}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Tipo cambiado2",{{"Fecha Real", "Fecha"}}),
    
    #"Otras columnas quitadas1" = Table.SelectColumns(#"Columnas con nombre cambiado2",{"Tipo", "Almacen", "Numero", "Pedido", "Codigo", "Categoria", "Descripcion", "Cantidad", "Unidad", "Desc-Cuenta", "solicitante", "Precio$", "Total USD", "motivo", "Cuenta AU", "Fecha"}),
    #"Filas filtradas1" = Table.SelectRows(#"Otras columnas quitadas1", each ([Categoria] = "SERVICIOS")),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Filas filtradas1",{{"Cuenta AU", "Cuenta-Aux"}}),
    #"Texto en mayúsculas" = Table.TransformColumns(#"Columnas con nombre cambiado1",{{"Cuenta-Aux", Text.Upper, type text}})
in
    #"Texto en mayúsculas";

shared _3_Mano_de_obra = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx"), null, true),
    _3_Mano_de_obra__Table = Origen{[Item="_3_Mano_de_obra_",Kind="Table"]}[Data],
    #"Tipo cambiado1" = Table.TransformColumnTypes(_3_Mano_de_obra__Table,{{"Source.Name", type text}, {"Semana", Int64.Type}, {"Fecha Desde", type date}, {"Fecha Hasta ", type date}, {"Cedula", Int64.Type}, {"Apellidos y Nombres ", type text}, {"Cargo", type text}, {"Area / Ubicación", type text}, {"Supervisor", type any}, {"Cuenta Auxiliar", type text}, {"Paquete semanal", type any}, {"Costo Hora Hombre", type any}, {"Horas trabajadas", type any}, {"Horas extra", type any}, {"Total Horas Hombre", type any}, {"Total a pagar $", type number}}),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Tipo cambiado1",{{"Source.Name", type text}, {"Semana", Int64.Type}, {"Fecha Desde", type date}, {"Fecha Hasta ", type date}, {"Cedula", Int64.Type}, {"Apellidos y Nombres ", type text}, {"Cargo", type text}, {"Area / Ubicación", type text}, {"Cuenta Auxiliar", type text}, {"Paquete semanal", type any}, {"Costo Hora Hombre", type any}, {"Horas trabajadas", type any}, {"Horas extra", type any}, {"Total Horas Hombre", type any}, {"Total a pagar $", type number}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Semana", "Fecha Desde", "Fecha Hasta ", "Apellidos y Nombres ", "Cargo", "Area / Ubicación", "Supervisor", "Cuenta Auxiliar", "Total a pagar $"}),
    #"Personalizada agregada" = Table.AddColumn(#"Otras columnas quitadas", "Tipo", each "Mano de Obra Directa"),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Personalizada agregada",{"Tipo", "Semana", "Fecha Desde", "Fecha Hasta ", "Apellidos y Nombres ", "Cargo", "Area / Ubicación", "Cuenta Auxiliar", "Total a pagar $"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"Cuenta Auxiliar", "Cuenta-Aux"}, {"Fecha Desde", "Fecha"}, {"Total a pagar $", "Total USD"}}),
    #"Texto en mayúsculas" = Table.TransformColumns(#"Columnas con nombre cambiado",{{"Cuenta-Aux", Text.Upper, type text}}),
    #"Texto recortado" = Table.TransformColumns(#"Texto en mayúsculas",{{"Cuenta-Aux", Text.Trim, type text}}),
    #"Texto limpio" = Table.TransformColumns(#"Texto recortado",{{"Cuenta-Aux", Text.Clean, type text}})
in
    #"Texto limpio";

shared _4_Horas_Maquina = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx"), null, true),
    _4_Horas_Maquina_Table = Origen{[Item="_4_Horas_Maquina",Kind="Table"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(_4_Horas_Maquina_Table,{{"ÍTEM", Int64.Type}, {"Fecha", Int64.Type}, {"Descripcion", type text}, {"HORA DE INICIO", type number}, {"HORA FINAL", type number}, {"TIEMPO TOTAL", type number}, {"Cuenta-Aux", type text}, {"Codigo", type text}, {"EQUIPO", type text}, {"HORÓMETRO INICIAL", type number}, {"HORÓMETRO FINAL", type number}, {"Cantidad", type number}, {"OPERADOR", type text}, {"# CEDULA", Int64.Type}, {"POSESIÓN", type text}, {"Tarifa1.Calculo", type number}, {"Tarifa1.Ajuste", Int64.Type}, {"Tarifa", type number}, {"Total USD", type number}, {"Unidad", type text}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Fecha", "Descripcion", "TIEMPO TOTAL", "Cuenta-Aux", "Codigo", "EQUIPO", "Cantidad", "POSESIÓN", "Tarifa", "Total USD"}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Otras columnas quitadas",{{"Fecha", type date}, {"TIEMPO TOTAL", type duration}}),
    #"Personalizada agregada" = Table.AddColumn(#"Tipo cambiado1", "Tipo", each "Horas Maquina"),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Personalizada agregada",{"Tipo", "Fecha", "Descripcion", "TIEMPO TOTAL", "Cuenta-Aux", "Codigo", "EQUIPO", "Cantidad", "POSESIÓN", "Tarifa", "Total USD"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"Descripcion", "Actividad"}}),
    #"Consultas combinadas" = Table.NestedJoin(#"Columnas con nombre cambiado", {"Codigo"}, Datos, {"Codigo Sysman"}, "Datos", JoinKind.LeftOuter),
    #"Se expandió Datos" = Table.ExpandTableColumn(#"Consultas combinadas", "Datos", {"Tipo de Equipo"}, {"Datos.Tipo de Equipo"}),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Se expandió Datos",{{"Datos.Tipo de Equipo", "Tipo de Equipo"}})
in
    #"Columnas con nombre cambiado1";

shared _5_Costos_Indirectos = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\3 Analisis Costos Indirectos.xlsx"), null, true),
    Hoja1_Sheet = Origen{[Item="Hoja1",Kind="Sheet"]}[Data],
    #"Encabezados promovidos" = Table.PromoteHeaders(Hoja1_Sheet, [PromoteAllScalars=true]),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Encabezados promovidos",{{"Tipo", type text}, {"Fecha", type date}, {"Descripcion", type text}, {"Cuenta Auxiliar", type text}, {"Total USD", type number}, {"Column6", type any}, {"Column7", type any}, {"Column8", type any}}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Tipo cambiado",{"Column6", "Column7", "Column8"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas quitadas",{{"Cuenta Auxiliar", "Cuenta-Aux"}})
in
    #"Columnas con nombre cambiado";

shared Historico_2025 = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Historico Consumos 2025.xlsx"), null, true),
    Historico_2025_Table = Origen{[Item="Historico_2025",Kind="Table"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(Historico_2025_Table,{{"Source.Name", type text}, {"Almacen", type text}, {"Fecha", type date}, {"Numero", type text}, {"Pedido", type text}, {"Cuenta-Aux", type text}, {"Ceco", type text}, {"Codigo", type text}, {"Descripcion", type text}, {"Cantidad", type number}, {"Unidad", type text}, {"solicitante", type text}, {"motivo", type text}, {"Costo-$", type number}, {"Ajuste", type any}, {"Auxiliar Precios.2 Compras.Fecha-Rec", Int64.Type}, {"Ultimo Precio de Compra", type number}, {"Precio Promedio Hist", type number}, {"Precio Unitario Final", type number}, {"Fuente Precio", type text}, {"Catalogo.Grupo", type text}, {"Catalogo.Nombre Cuenta", type text}, {"Datos.Descripción", type text}, {"Datos.Tipo Costo", type text}, {"Datos.Tipo de Equipo", type text}, {"Datos.Codigo Sysman", type text}, {"Linea de Producción.Descripción", type text}, {"Agrupador Linea prod.LINEA AGRUPADOR PARA DIAPOSITIVA", type text}, {"Linea de Produccion", type text}, {"Precio Final", type number}, {"Total USD", type number}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Almacen", "Fecha", "Numero", "Pedido", "Cuenta-Aux", "Ceco", "Codigo", "Descripcion", "Cantidad", "Unidad", "solicitante", "motivo", "Ajuste", "Catalogo.Nombre Cuenta", "Linea de Producción.Descripción", "Agrupador Linea prod.LINEA AGRUPADOR PARA DIAPOSITIVA", "Linea de Produccion", "Precio Final", "Total USD"}),
    #"Personalizada agregada" = Table.AddColumn(#"Otras columnas quitadas", "Tipo", each "Materiales Directos"),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Personalizada agregada",{"Tipo", "Almacen", "Fecha", "Numero", "Pedido", "Cuenta-Aux", "Ceco", "Codigo", "Descripcion", "Cantidad", "Unidad", "solicitante", "motivo", "Ajuste", "Catalogo.Nombre Cuenta", "Linea de Producción.Descripción", "Agrupador Linea prod.LINEA AGRUPADOR PARA DIAPOSITIVA", "Linea de Produccion", "Precio Final", "Total USD"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas reordenadas",{{"Catalogo.Nombre Cuenta", "Categoria"}})
in
    #"Columnas con nombre cambiado";

shared Datos = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Base Consultas.xlsx"), null, true),
    Datos_Sheet = Origen{[Item="Datos",Kind="Sheet"]}[Data],
    #"Encabezados promovidos" = Table.PromoteHeaders(Datos_Sheet, [PromoteAllScalars=true]),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Encabezados promovidos",{{"Cta Auxiliar", type text}, {"Descripción", type text}, {"Filial", type text}, {"Tipo", type text}, {"CeCo", type text}, {"CeCo_1", type text}, {"Gerencia", type text}, {"Depto / Area / Cliente", type text}, {"Descripción Trabajo", type text}, {"Tipo Costo", type text}, {"Column11", type any}, {"Tipo de Equipo", type text}, {"Codigo Sysman", type text}, {"Codigo Jefe", type text}, {"Agrupador Linea Produccion", type any}, {"Zona", type any}}),
    
    // PASO 1: Eliminamos filas en blanco o nulas que Excel suele traer de las pestañas en bruto
    #"Filas en blanco eliminadas" = Table.SelectRows(#"Tipo cambiado", each ([Cta Auxiliar] <> null and [Cta Auxiliar] <> "")),
    
    // PASO 2: Sello de unicidad. Garantizamos que cada Cuenta Auxiliar exista UNA sola vez en este catálogo
    #"Duplicados eliminados" = Table.Distinct(#"Filas en blanco eliminadas", {"Cta Auxiliar"})
in
    #"Duplicados eliminados";

shared #"Agrupador Linea prod" = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Base Consultas.xlsx"), null, true),
    #"Agrupador Linea prod_Sheet" = Origen{[Item="Agrupador Linea prod",Kind="Sheet"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Agrupador Linea prod_Sheet",{{"Column1", type any}, {"Column2", type any}, {"Column3", type text}, {"Column4", type text}, {"Column5", type text}, {"Column6", type text}, {"Column7", type text}, {"Column8", type any}, {"Column9", type text}, {"Column10", type text}, {"Column11", type any}, {"Column12", type text}}),
    #"Filas superiores quitadas" = Table.Skip(#"Tipo cambiado",1),
    #"Encabezados promovidos" = Table.PromoteHeaders(#"Filas superiores quitadas", [PromoteAllScalars=true]),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Encabezados promovidos",{{"Column1", type any}, {"Column2", type any}, {"Column3", type text}, {"CUENTA AUX", type text}, {"EQUIPO", type text}, {"LINEA AGRUPADOR PARA DIAPOSITIVA", type text}, {"Codigo Sysman", type text}, {"TIPO DE EQUIPO", type any}, {"SERVICIO", type text}, {"Column10", type text}, {"Column11", type any}, {"Column12", type text}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado1",{"CUENTA AUX", "EQUIPO", "LINEA AGRUPADOR PARA DIAPOSITIVA", "Codigo Sysman", "TIPO DE EQUIPO", "SERVICIO"})
in
    #"Otras columnas quitadas";

shared Unificada = let
    Origen = _1_Materiales_Directos,
    #"Texto en mayúsculas" = Table.TransformColumns(Origen,{{"Cuenta-Aux", Text.Upper, type text}}),
    #"Texto limpio" = Table.TransformColumns(#"Texto en mayúsculas",{{"Cuenta-Aux", Text.Clean, type text}}),
    #"Texto recortado" = Table.TransformColumns(#"Texto limpio",{{"Cuenta-Aux", Text.Trim, type text}}),
    #"Consulta anexada" = Table.Combine({#"Texto recortado", _2_Servicios_Directos, _3_Mano_de_obra, _4_Horas_Maquina, Historico_2025, _5_Costos_Indirectos}),
    #"Consultas combinadas" = Table.NestedJoin(#"Consulta anexada", {"Cuenta-Aux"}, Datos, {"Cta Auxiliar"}, "Datos", JoinKind.LeftOuter),
    #"Se expandió Datos" = Table.ExpandTableColumn(#"Consultas combinadas", "Datos", {"Descripción", "Tipo Costo", "Tipo de Equipo", "Codigo Sysman", "Zona"}, {"Datos.Descripción", "Datos.Tipo Costo", "Datos.Tipo de Equipo", "Datos.Codigo Sysman", "Datos.Zona"}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Se expandió Datos",{"Desc-Cuenta"}),
    #"Columna duplicada" = Table.DuplicateColumn(#"Columnas quitadas", "Fecha", "Fecha - Copia"),
    #"Consulta anexada1" = Table.Combine({#"Columna duplicada", #"_3_Mano_de_obra ECO"}),
    #"Año extraído" = Table.TransformColumns(#"Consulta anexada1",{{"Fecha - Copia", Date.Year, Int64.Type}}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Año extraído",{{"Fecha - Copia", "Año"}}),
    #"Nombre del mes insertado" = Table.AddColumn(#"Columnas con nombre cambiado", "Nombre del mes", each if ([Tipo] = "Mano de Obra Directa" or [Tipo] = "Mano de Obra Directa ECO") and [Semana] = 31 then "agosto" else Date.MonthName([Fecha]), type text),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Nombre del mes insertado",{{"Fecha", type date}, {"Total USD", type number}})
in
    #"Tipo cambiado";

shared Ajuste_Servicios = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Correcciones.xlsx"), null, true),
    Ajuste_Servicios_Table = Origen{[Item="Ajuste_Servicios",Kind="Table"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(Ajuste_Servicios_Table,{{"Fecha-Sol", type date}, {"Nro-OC", type text}, {"Fecha-OC", type date}, {"Codigo", type text}, {"Descripcion", type text}, {"Cant-OC", Int64.Type}, {"Unidad", type text}, {"Cuenta-Aux", type text}, {"Solicitado-Por", type text}, {"Precio$", type number}, {"Proveedor", type text}, {"Fecha-Rec", type date}, {"Motivo", type text}, {"Comprador", type text}, {"Año", type any}, {"Total USD", type number}, {"Fecha Real", type date}})
in
    #"Tipo cambiado";

shared Ajuste_Consumos = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\2 Data Fija\Correcciones.xlsx"), null, true),
    Ajuste_Servicios_Table = Origen{[Item="Ajuste_Consumos", Kind="Table"]}[Data],
    #"Tipo cambiado" = Table.TransformColumnTypes(Ajuste_Servicios_Table,{{"Fecha", type date}, {"Numero", type text}, {"Pedido", type text}, {"Cuenta-Aux", type text}, {"Ceco", type text}, {"Codigo", type text}, {"Descripcion", type text}, {"Cantidad", type any}, {"Unidad", type any}, {"Observaciones", type text}})
in
    #"Tipo cambiado";

shared #"_3_Mano_de_obra ECO" = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\1 Informe\1 Base Central Inputs.xlsx"), null, true),
    Mano_de_Obra_ECO_Table = Origen{[Item="Mano_de_Obra_ECO",Kind="Table"]}[Data],
    #"Columnas quitadas" = Table.RemoveColumns(Mano_de_Obra_ECO_Table,{"Source.Name", "Paquete Semanal", "Horas Trabajadas", "Costo Hora Hombre"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas quitadas",{{"Cuenta Auxiliar", "Cuenta-Aux"}, {"Motivo", "motivo"}, {"Total a Pagar ($)", "Total USD"}, {"Tipo de Costo", "Datos.Tipo Costo"}, {"Tipo de Equipo", "Datos.Tipo de Equipo"}}),
    #"Personalizada agregada" = Table.AddColumn(#"Columnas con nombre cambiado", "Tipo", each "Mano de Obra Directa ECO"),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Personalizada agregada",{"Tipo", "Fecha", "Semana", "Apellidos y Nombres", "Cuenta-Aux", "motivo", "Datos.Descripción", "Datos.Tipo Costo", "Datos.Tipo de Equipo", "Total USD"}),
    #"Columnas quitadas1" = Table.RemoveColumns(#"Columnas reordenadas",{"Apellidos y Nombres"})
in
    #"Columnas quitadas1";