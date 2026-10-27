section Section1;

shared #"1 Consumos" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\1 Consumos"),
    #"Archivos ocultos filtrados1" = Table.SelectRows(Origen, each [Attributes]?[Hidden]? <> true),
    #"Invocar función personalizada1" = Table.AddColumn(#"Archivos ocultos filtrados1", "Transformar archivo", each #"Transformar archivo"(Binary.Buffer([Content]))),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Invocar función personalizada1", {"Name", "Source.Name"}),
    #"Otras columnas quitadas1" = Table.SelectColumns(#"Columnas con nombre cambiado1", {"Source.Name", "Transformar archivo"}),
    #"Columna de tabla expandida1" = Table.ExpandTableColumn(#"Otras columnas quitadas1", "Transformar archivo", Table.ColumnNames(#"Transformar archivo"(#"Archivo de ejemplo"))),
    #"Filas filtradas" = Table.SelectRows(#"Columna de tabla expandida1", each ([Almacen] <> null)),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Filas filtradas",{{"Source.Name", type text}, {"Almacen", type text}, {"Fecha", type date}, {"Numero", type text}, {"Pedido", type text}, {"Cuenta-Aux", type text}, {"Ceco", type text}, {"Codigo", type text}, {"Descripcion", type text}, {"Cantidad", type number}, {"Unidad", type text}, {"solicitante", type text}, {"motivo", type text}, {"Costo-Prom", type number}, {"Costo-$", type number}, {"Estatus", type text}, {"ODT", type any}, {"Ajuste", type text}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Source.Name", "Almacen", "Fecha", "Numero", "Pedido", "Cuenta-Aux", "Ceco", "Codigo", "Descripcion", "Cantidad", "Unidad", "solicitante", "motivo", "Costo-$", "Ajuste"}),
    #"Consulta anexada" = Table.Combine({#"Otras columnas quitadas", #"8 Devoluciones"})
in
    #"Consulta anexada";

shared Parámetro1 = #"Archivo de ejemplo" meta [IsParameterQuery=true, BinaryIdentifier=#"Archivo de ejemplo", Type="Binary", IsParameterQueryRequired=true];

shared #"Transformar archivo de ejemplo" = let
    Origen = Excel.Workbook(Parámetro1, null, true),
    Sheet1_Sheet = Origen{0}[Data],
    #"Encabezados promovidos" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])
in
    #"Encabezados promovidos";

shared #"Archivo de ejemplo" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\1 Consumos"),
    Navegación1 = Origen{0}[Content]
in
    Navegación1;

[ FunctionQueryBinding = "{""exemplarFormulaName"":""Transformar archivo de ejemplo""}" ]
shared #"Transformar archivo" = let
    Origen = (Parámetro1 as binary) => let
        Origen = Excel.Workbook(Parámetro1, null, true),
        Sheet1_Sheet = Origen{0}[Data],
        #"Encabezados promovidos" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])
    in
        #"Encabezados promovidos"
in
    Origen;

shared #"8 Devoluciones" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\8 Devoluciones"),
    #"Archivos ocultos filtrados1" = Table.SelectRows(Origen, each [Attributes]?[Hidden]? <> true),
    #"Invocar función personalizada1" = Table.AddColumn(#"Archivos ocultos filtrados1", "Transformar archivo (2)", each #"Transformar archivo (2)"(Binary.Buffer([Content]))),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Invocar función personalizada1", {"Name", "Source.Name"}),
    #"Otras columnas quitadas1" = Table.SelectColumns(#"Columnas con nombre cambiado1", {"Source.Name", "Transformar archivo (2)"}),
    #"Columna de tabla expandida1" = Table.ExpandTableColumn(#"Otras columnas quitadas1", "Transformar archivo (2)", Table.ColumnNames(#"Transformar archivo (2)"(#"Archivo de ejemplo (2)"))),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columna de tabla expandida1",{{"Source.Name", type text}, {"Almacen", type text}, {"Fecha", type date}, {"Numero", type text}, {"Cuenta-Aux", type text}, {"CECO", type text}, {"Pedido", type text}, {"Codigo", type text}, {"Descripcion", type text}, {"Cantidad", Int64.Type}, {"Unidad", type text}, {"Costo-Prom", type number}, {"Costo-$", type number}, {"Estatus", type text}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Source.Name", "Almacen", "Fecha", "Numero", "Cuenta-Aux", "CECO", "Pedido", "Codigo", "Descripcion", "Cantidad", "Unidad", "Costo-$"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Otras columnas quitadas",{{"CECO", "Ceco"}}),
    #"Personalizada agregada" = Table.AddColumn(#"Columnas con nombre cambiado", "Personalizado", each [Cantidad]*-1),
    #"Columnas quitadas" = Table.RemoveColumns(#"Personalizada agregada",{"Cantidad"}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Columnas quitadas",{{"Personalizado", "Cantidad"}}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Columnas con nombre cambiado2",{{"Cantidad", type number}})
in
    #"Tipo cambiado1";

shared Parámetro2 = #"Archivo de ejemplo (2)" meta [IsParameterQuery=true, BinaryIdentifier=#"Archivo de ejemplo (2)", Type="Binary", IsParameterQueryRequired=true];

shared #"Transformar archivo de ejemplo (2)" = let
    Origen = Excel.Workbook(Parámetro2, null, true),
    Sheet1_Sheet = Origen{[Item="Sheet1",Kind="Sheet"]}[Data],
    #"Encabezados promovidos" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])
in
    #"Encabezados promovidos";

shared #"Archivo de ejemplo (2)" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\8 Devoluciones"),
    Navegación1 = Origen{0}[Content]
in
    Navegación1;

[ FunctionQueryBinding = "{""exemplarFormulaName"":""Transformar archivo de ejemplo (2)""}" ]
shared #"Transformar archivo (2)" = let
    Origen = (Parámetro2 as binary) => let
        Origen = Excel.Workbook(Parámetro2, null, true),
        Sheet1_Sheet = Origen{[Item="Sheet1",Kind="Sheet"]}[Data],
        #"Encabezados promovidos" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])
    in
        #"Encabezados promovidos"
in
    Origen;

shared #"2 Compras" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\2 Compras"),
    #"Archivos ocultos filtrados1" = Table.SelectRows(Origen, each [Attributes]?[Hidden]? <> true),
    #"Invocar función personalizada1" = Table.AddColumn(#"Archivos ocultos filtrados1", "Transformar archivo (3)", each #"Transformar archivo (3)"(Binary.Buffer([Content]))),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Invocar función personalizada1", {"Name", "Source.Name"}),
    #"Otras columnas quitadas1" = Table.SelectColumns(#"Columnas con nombre cambiado1", {"Source.Name", "Transformar archivo (3)"}),
    #"Columna de tabla expandida1" = Table.ExpandTableColumn(#"Otras columnas quitadas1", "Transformar archivo (3)", Table.ColumnNames(#"Transformar archivo (3)"(#"Archivo de ejemplo (3)"))),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columna de tabla expandida1",{{"Source.Name", type text}, {"Almacen", type text}, {"Posicion", Int64.Type}, {"Nro-Sol", type text}, {"Fecha-Sol", type date}, {"Estatus-SC", type text}, {"Fecha-Aprob", type date}, {"Requerida", type date}, {"Posicion_1", Int64.Type}, {"Nro-OC", type text}, {"Cond-OC", type text}, {"Fecha-OC", type date}, {"Estatus-OC", type text}, {"Codigo", type text}, {"Categoria", type text}, {"Descripcion", type text}, {"Cant-SC", type number}, {"Cant-OC", type number}, {"Unidad", type text}, {"Cuenta-Aux", type text}, {"Desc-Cuenta", type text}, {"Solicitado-Por", type text}, {"Precio-Bs", type number}, {"Precio$", type number}, {"Total$", type number}, {"Proveedor", type text}, {"Tipo-Prov", type text}, {"Recepcion", type text}, {"Fecha-Rec", type date}, {"Cant-Rec", type number}, {"Cant-PE", Int64.Type}, {"Motivo", type text}, {"Fecha-Asig", type date}, {"Comprador", type text}}),
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Source.Name", "Almacen", "Nro-Sol", "Fecha-Sol", "Estatus-SC", "Nro-OC", "Estatus-OC", "Codigo", "Categoria", "Descripcion", "Cant-SC", "Cant-OC", "Unidad", "Cuenta-Aux", "Desc-Cuenta", "Solicitado-Por", "Precio$", "Total$", "Proveedor", "Tipo-Prov", "Recepcion", "Fecha-Rec", "Cant-Rec", "Cant-PE", "Motivo", "Comprador"}),
    #"Filas filtradas" = Table.SelectRows(#"Otras columnas quitadas", each ([Almacen] <> ""))
in
    #"Filas filtradas";

shared Parámetro3 = #"Archivo de ejemplo (3)" meta [IsParameterQuery=true, BinaryIdentifier=#"Archivo de ejemplo (3)", Type="Binary", IsParameterQueryRequired=true];

shared #"Transformar archivo de ejemplo (3)" = let
    Origen = Excel.Workbook(Parámetro3, null, true),
    Sheet1_Sheet = Origen{[Item="Sheet1",Kind="Sheet"]}[Data],
    #"Encabezados promovidos" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])
in
    #"Encabezados promovidos";

shared #"Archivo de ejemplo (3)" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\2 Compras"),
    Navegación1 = Origen{0}[Content]
in
    Navegación1;

[ FunctionQueryBinding = "{""exemplarFormulaName"":""Transformar archivo de ejemplo (3)""}" ]
shared #"Transformar archivo (3)" = let
    Origen = (Parámetro3 as binary) => let
        Origen = Excel.Workbook(Parámetro3, null, true),
        Sheet1_Sheet = Origen{[Item="Sheet1",Kind="Sheet"]}[Data],
        #"Encabezados promovidos" = Table.PromoteHeaders(Sheet1_Sheet, [PromoteAllScalars=true])
    in
        #"Encabezados promovidos"
in
    Origen;

shared Parámetro5 = #"Archivo de ejemplo (5)" meta [IsParameterQuery=true, BinaryIdentifier=#"Archivo de ejemplo (5)", Type="Binary", IsParameterQueryRequired=true];

shared #"Transformar archivo de ejemplo (5)" = let
    Origen = Excel.Workbook(Parámetro5, null, true),
    Tarifa_Table = Origen{[Item="Tarifa",Kind="Table"]}[Data]
in
    Tarifa_Table;

shared #"Archivo de ejemplo (5)" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\4 Horas Maquina"),
    Navegación1 = Origen{0}[Content]
in
    Navegación1;

[ FunctionQueryBinding = "{""exemplarFormulaName"":""Transformar archivo de ejemplo (5)""}" ]
shared #"Transformar archivo (5)" = let
    Origen = (Parámetro5 as binary) => let
        Origen = Excel.Workbook(Parámetro5, null, true),
        Tarifa_Table = Origen{[Item="Tarifa",Kind="Table"]}[Data]
    in
        Tarifa_Table
in
    Origen;

shared #"4 Horas Maquina" = let
    // 1. ORIGEN DE LA CARPETA
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\4 Horas Maquina\HM\"),
    #"Archivos ocultos filtrados" = Table.SelectRows(Origen, each [Attributes]?[Hidden]? <> true),
    
    // ====================================================================
    // 2. LECTURA INTELIGENTE (SOLUCIÓN A LA FILA 5)
    // Entramos a cada Excel de la carpeta, saltamos 4 filas y subimos los encabezados
    // ====================================================================
    #"Procesar Excel" = Table.AddColumn(#"Archivos ocultos filtrados", "DatosLimpios", each 
        let
            // Abrimos el archivo en crudo sin asumir dónde están los encabezados
            Archivo = Excel.Workbook(Binary.Buffer([Content]), false),
            // Tomamos la primera hoja del libro de Excel
            Hoja = Table.SelectRows(Archivo, each [Kind] = "Sheet"){0}[Data],
            // EL TRUCO: Saltamos las 4 primeras filas de títulos
            FilasSaltadas = Table.Skip(Hoja, 4),
            // Convertimos la fila 5 en los encabezados reales
            EncabezadosListos = Table.PromoteHeaders(FilasSaltadas, [PromoteAllScalars=true])
        in
            EncabezadosListos
    ),
    
    // Dejamos solo los datos limpios y combinamos todas las tablas
    #"Columnas Seleccionadas" = Table.SelectColumns(#"Procesar Excel", {"Name", "DatosLimpios"}),
    #"Tablas Combinadas" = Table.Combine(#"Columnas Seleccionadas"[DatosLimpios]),
    
    // ====================================================================
    // 3. ASPIRADORA DE ENCABEZADOS (Previene errores por espacios)
    // ====================================================================
    #"Encabezados Limpios" = Table.TransformColumnNames(#"Tablas Combinadas", each Text.Trim(Text.Upper(_))),
    #"Renombrar EQ a COD" = Table.RenameColumns(#"Encabezados Limpios", {{"# EQ.", "COD"}}, MissingField.Ignore),

    // 4. LIMPIEZA DE DATOS Y LLAVES
    // Eliminamos las filas donde no haya un COD (por si hay filas en blanco al final del Excel)
    #"Filtro Nulos" = Table.SelectRows(#"Renombrar EQ a COD", each try [COD] <> null otherwise false),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Filtro Nulos",{
        {"COD", type text}, 
        {"HORAS DE OP TOTAL", type number}
    }),
    #"Texto extraído" = Table.TransformColumns(#"Tipo cambiado", {{"COD", each try Text.BeforeDelimiter(Text.From(_), "-") otherwise _, type text}}),
    #"COD Final" = Table.TransformColumns(#"Texto extraído",{{"COD", each Text.Upper(Text.Trim(_)), type text}}),

    // ====================================================================
    // 5. ESCUDO DE CORTAFUEGOS: TABLA DE TARIFAS (TARIFA1) A MEMORIA RAM
    // ====================================================================
    TablaTarifasSegura = Table.Buffer(Table.TransformColumnTypes(Tarifa1, {{"COD", type text}})),
    
    // ====================================================================
    // 6. CRUCE Y CÁLCULO (CORREGIDO PARA LEER LA COLUMNA 'TARIFA')
    // ====================================================================
    #"Consultas combinadas" = Table.NestedJoin(#"COD Final", {"COD"}, TablaTarifasSegura, {"COD"}, "Tarifa1", JoinKind.LeftOuter),
    
    // CORRECCIÓN AQUÍ: Se cambió "Ajuste 2026" por "Tarifa" porque así se llama en tu consulta Tarifa1
    #"Se expandió Tarifa1" = Table.ExpandTableColumn(#"Consultas combinadas", "Tarifa1", {"Calculo +20%", "Tarifa"}, {"Tarifa1.Calculo", "Tarifa1.Ajuste"}),
    
    #"Nulos Reemplazados" = Table.ReplaceValue(#"Se expandió Tarifa1",null,0,Replacer.ReplaceValue,{"Tarifa1.Ajuste", "Tarifa1.Calculo"}),
    #"Tarifa Asignada" = Table.AddColumn(#"Nulos Reemplazados", "Tarifa", each if [Tarifa1.Ajuste] > 0 then [Tarifa1.Ajuste] else [Tarifa1.Calculo], type number),
    #"Total Calculado" = Table.AddColumn(#"Tarifa Asignada", "Total USD", each [HORAS DE OP TOTAL] * [Tarifa], type number),

    // 7. REEMPLAZO DE EQUIPOS (Tal cual tu archivo original)
    #"Equipo Limpio" = Table.TransformColumns(#"Total Calculado", {{"EQUIPO", each try Text.BeforeDelimiter(Text.From(_), "-") otherwise _, type text}}, null, MissingField.Ignore),
    #"Reemplazo Grua 1" = Table.ReplaceValue(#"Equipo Limpio","Camión Liebherr LTM1140","Grúa Liebherr LTM1140",Replacer.ReplaceText,{"EQUIPO"}),
    #"Reemplazo Grua 2" = Table.ReplaceValue(#"Reemplazo Grua 1","Camión Liebherr LTM1100/1","Grúa Liebherr LTM1100/1",Replacer.ReplaceText,{"EQUIPO"}),

    // 8. MOLDEADO FINAL PARA LA BASE CENTRAL
    #"Unidad Agregada" = Table.AddColumn(#"Reemplazo Grua 2", "Unidad", each "HR", type text),
    #"Columnas Renombradas" = Table.RenameColumns(#"Unidad Agregada", {
        {"FECHA", "Fecha"},
        {"CUENTA AUXILIAR", "Cuenta-Aux"},
        {"COD", "Codigo"},
        {"ACTIVIDAD", "Descripcion"},
        {"HORAS DE OP TOTAL", "Cantidad"},
        {"TARIFA", "Costo-$"}
    }, MissingField.Ignore)

in
    #"Columnas Renombradas";

shared Parámetro6 = #"Archivo de ejemplo (6)" meta [IsParameterQuery=true, BinaryIdentifier=#"Archivo de ejemplo (6)", Type="Binary", IsParameterQueryRequired=true];

shared #"Transformar archivo de ejemplo (6)" = let
    Origen = Excel.Workbook(Parámetro6, null, true),
    Tabla1_Table = Origen{[Item="Tabla1",Kind="Table"]}[Data]
in
    Tabla1_Table;

shared #"Archivo de ejemplo (6)" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\4 Horas Maquina\HM\"),
    Navegación1 = Origen{0}[Content],
    #"Libro de Excel importado" = Excel.Workbook(Navegación1)
in
    #"Libro de Excel importado";

[ FunctionQueryBinding = "{""exemplarFormulaName"":""Transformar archivo de ejemplo (6)""}" ]
shared #"Transformar archivo (6)" = let
    Origen = (Parámetro6 as binary) => let
        Origen = Excel.Workbook(Parámetro6, null, true),
        Tabla1_Table = Origen{[Item="Tabla1",Kind="Table"]}[Data]
    in
        Tabla1_Table
in
    Origen;

shared Tarifa1 = let
    Origen = Excel.Workbook(File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\4 Horas Maquina\Tarifa x hora Maquinas.xlsx"), null, true),
    Tarifa_Table = Origen{[Item="Tarifa",Kind="Table"]}[Data],
    
    #"Tipo cambiado" = Table.TransformColumnTypes(Tarifa_Table,{{"Nombre", type text}, {"Cuenta Auxiliar", type text}, {"Codigo", type text}, {"COD", type text}, {"TIPO", type text}, {"VU Años Estimada", Int64.Type}, {"VU", type number}, {"VU HM Estimada Fabrica", Int64.Type}, {"Costo Adquisición Usado  USD", type number}, {"Costo Total  Adquisición USD", type number}, {"Costo  HM Adquisición USD/ HM", type number}, {"Costo Revamping USD", type number}, {"Costo Revamping USD/ HM", type any}, {"Columna1", type any}, {"% Equip Comun", type text}, {"Columna2", type any}, {"Calculo Fabrica", type number}, {"Calculo +20%", type number}}),
    
    #"Otras columnas quitadas" = Table.SelectColumns(#"Tipo cambiado",{"Nombre", "Cuenta Auxiliar", "COD", "TIPO", "Calculo +20%", "Ajuste 2026"}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Otras columnas quitadas",{{"Ajuste 2026", type number}}),
    
    // Homologación estricta de códigos para el cruce
    #"Texto recortado" = Table.TransformColumns(#"Tipo cambiado1",{{"COD", Text.Trim, type text}}),
    #"Texto limpio" = Table.TransformColumns(#"Texto recortado",{{"COD", Text.Clean, type text}}),
    #"Texto en mayúsculas" = Table.TransformColumns(#"Texto limpio",{{"COD", Text.Upper, type text}}),
    
    // Renombrado de la columna de dinero para acoplar con Horas Máquina sin romper nada
    #"Columna Renombrada" = Table.RenameColumns(#"Texto en mayúsculas",{{"Ajuste 2026", "Tarifa"}}),
    #"Filas ordenadas" = Table.Sort(#"Columna Renombrada",{{"Tarifa", Order.Descending}}),
    #"Duplicados quitados" = Table.Distinct(#"Filas ordenadas", {"COD"})
in
    #"Duplicados quitados";

shared #"3 Mano de obra" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\3 Mano de obra"),
    #"Archivos ocultos filtrados1" = Table.SelectRows(Origen, each [Attributes]?[Hidden]? <> true),
    #"Invocar función personalizada1" = Table.AddColumn(#"Archivos ocultos filtrados1", "Transformar archivo (4)", each #"Transformar archivo (4)"([Content])),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Invocar función personalizada1", {"Name", "Source.Name"}),
    #"Otras columnas quitadas1" = Table.SelectColumns(#"Columnas con nombre cambiado1", {"Source.Name", "Transformar archivo (4)"}),
    #"Columna de tabla expandida1" = Table.ExpandTableColumn(#"Otras columnas quitadas1", "Transformar archivo (4)", Table.ColumnNames(#"Transformar archivo (4)"(#"Archivo de ejemplo (4)"))),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columna de tabla expandida1",{{"Source.Name", type text}, {"Semana", Int64.Type}, {"Fecha Desde", type date}, {"Fecha Hasta ", type date}, {"Cedula", Int64.Type}, {"Apellidos y Nombres ", type text}, {"Cargo", type text}, {"Area / Ubicación", type text}, {"Cuenta Auxiliar", type text}, {"Paquete semanal", type any}, {"Costo Hora Hombre", type any}, {"Horas trabajadas", type any}, {"Horas extra", type any}, {"Total Horas Hombre", type any}, {"Total a pagar $", type number}})
in
    #"Tipo cambiado";

shared #"Archivo de ejemplo (4)" = File.Contents("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\3 Mano de obra\2026 - Pellas sem 01.xlsx");

shared #"Transformar archivo (4)" = let
    Origen = (Parámetro4) => let
        Origen = Excel.Workbook(Parámetro4, null, true),
        Tabla1_Table = Origen{[Item="Tabla1",Kind="Table"]}[Data]
    in
        Tabla1_Table
in
    Origen;

shared #"Mano de Obra ECO" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\9 Mano de Obra ECO"),
    #"Archivos ocultos filtrados1" = Table.SelectRows(Origen, each [Attributes]?[Hidden]? <> true),
    #"Invocar función personalizada1" = Table.AddColumn(#"Archivos ocultos filtrados1", "Transformar archivo (7)", each #"Transformar archivo (7)"([Content])),
    #"Columnas con nombre cambiado1" = Table.RenameColumns(#"Invocar función personalizada1", {"Name", "Source.Name"}),
    #"Otras columnas quitadas1" = Table.SelectColumns(#"Columnas con nombre cambiado1", {"Source.Name", "Transformar archivo (7)"}),
    #"Columna de tabla expandida1" = Table.ExpandTableColumn(#"Otras columnas quitadas1", "Transformar archivo (7)", Table.ColumnNames(#"Transformar archivo (7)"(#"Archivo de ejemplo (7)"))),
    #"Tipo cambiado" = Table.TransformColumnTypes(#"Columna de tabla expandida1",{{"Source.Name", type text}, {"Fecha", type date}, {"Semana", Int64.Type}, {"Día", type text}, {"Trabajador (unificado)", type text}, {"Cuenta Auxiliar", type text}, {"Tipo de Equipo", type text}, {"Datos.Descripcion", type text}, {"Motivo", type text}, {"Tipo de Costo", type text}, {"Paquete Semanal", Int64.Type}, {"Horas Trabajadas", Int64.Type}, {"Costo Hora Hombre", type number}, {"Total a Pagar ($)", type number}}),
    #"Columnas reordenadas" = Table.ReorderColumns(#"Tipo cambiado",{"Source.Name", "Semana", "Fecha", "Día", "Trabajador (unificado)", "Cuenta Auxiliar", "Tipo de Equipo", "Datos.Descripcion", "Motivo", "Tipo de Costo", "Paquete Semanal", "Horas Trabajadas", "Costo Hora Hombre", "Total a Pagar ($)"}),
    #"Columnas quitadas" = Table.RemoveColumns(#"Columnas reordenadas",{"Día"}),
    #"Columnas con nombre cambiado" = Table.RenameColumns(#"Columnas quitadas",{{"Trabajador (unificado)", "Apellidos y Nombres"}}),
    #"Columnas reordenadas1" = Table.ReorderColumns(#"Columnas con nombre cambiado",{"Source.Name", "Semana", "Fecha", "Apellidos y Nombres", "Cuenta Auxiliar", "Motivo", "Datos.Descripcion", "Tipo de Costo", "Tipo de Equipo", "Paquete Semanal", "Horas Trabajadas", "Costo Hora Hombre", "Total a Pagar ($)"}),
    #"Columnas con nombre cambiado2" = Table.RenameColumns(#"Columnas reordenadas1",{{"Datos.Descripcion", "Datos.Descripción"}}),
    #"Columnas reordenadas2" = Table.ReorderColumns(#"Columnas con nombre cambiado2",{"Source.Name", "Fecha", "Semana", "Apellidos y Nombres", "Cuenta Auxiliar", "Motivo", "Datos.Descripción", "Tipo de Costo", "Tipo de Equipo", "Paquete Semanal", "Horas Trabajadas", "Costo Hora Hombre", "Total a Pagar ($)"}),
    #"Tipo cambiado1" = Table.TransformColumnTypes(#"Columnas reordenadas2",{{"Costo Hora Hombre", Int64.Type}, {"Total a Pagar ($)", Int64.Type}})
in
    #"Tipo cambiado1";

shared Parámetro4 = #"Archivo de ejemplo (7)" meta [IsParameterQuery=true, BinaryIdentifier=#"Archivo de ejemplo (7)", Type="Binary", IsParameterQueryRequired=true];

shared #"Transformar archivo de ejemplo (4)" = let
    Origen = Excel.Workbook(Parámetro4, null, true),
    Hoja1_Sheet = Origen{[Item="Hoja1",Kind="Sheet"]}[Data],
    #"Encabezados promovidos" = Table.PromoteHeaders(Hoja1_Sheet, [PromoteAllScalars=true])
in
    #"Encabezados promovidos";

shared #"Archivo de ejemplo (7)" = let
    Origen = Folder.Files("C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\3 Inputs\9 Mano de Obra ECO"),
    Navegación1 = Origen{0}[Content]
in
    Navegación1;

[ FunctionQueryBinding = "{""exemplarFormulaName"":""Transformar archivo de ejemplo (4)""}" ]
shared #"Transformar archivo (7)" = let
    Origen = (Parámetro4 as binary) => let
        Origen = Excel.Workbook(Parámetro4, null, true),
        Hoja1_Sheet = Origen{[Item="Hoja1",Kind="Sheet"]}[Data],
        #"Encabezados promovidos" = Table.PromoteHeaders(Hoja1_Sheet, [PromoteAllScalars=true])
    in
        #"Encabezados promovidos"
in
    Origen;