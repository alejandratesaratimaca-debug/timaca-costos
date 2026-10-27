section Section1;

[ Description = "Calendario 2026" ]
shared Dim_Calendario = let
    Origen = List.Dates(#date(2026, 1, 1), 365, #duration(1, 0, 0, 0)),
    Convertida = Table.FromList(Origen, Splitter.SplitByNothing(), {"Fecha"}),
    TipoCambiado = Table.TransformColumnTypes(Convertida,{{"Fecha", type date}}),
    AnoInsertado = Table.AddColumn(TipoCambiado, "Ano", each Date.Year([Fecha]), Int64.Type),
    MesInsertado = Table.AddColumn(AnoInsertado, "Mes_Num", each Date.Month([Fecha]), Int64.Type),
    NombreMesInsertado = Table.AddColumn(MesInsertado, "Nombre_Mes", each Date.MonthName([Fecha]), type text),
    SemanaInsertada = Table.AddColumn(NombreMesInsertado, "Semana", each Date.WeekOfYear([Fecha]), Int64.Type),
    TrimestreInsertado = Table.AddColumn(SemanaInsertada, "Trimestre", each "Q" & Text.From(Date.QuarterOfYear([Fecha])), type text)
in
    TrimestreInsertado;

[ Description = "Catalogo Proyectos" ]
shared Dim_Proyectos = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\2 Data Fija\\Base Consultas.xlsx"), null, true),
    Datos_Sheet = Origen{[Item="Datos",Kind="Sheet"]}[Data],
    Encabezados = Table.PromoteHeaders(Datos_Sheet, [PromoteAllScalars=true]),
    FilasFiltradas = Table.SelectRows(Encabezados, each ([Cta Auxiliar] <> null and [Cta Auxiliar] <> "")),
    CtaLimpia = Table.TransformColumns(FilasFiltradas,{{"Cta Auxiliar", Text.Trim, type text}}),
    DuplicadosQuitados = Table.Distinct(CtaLimpia, {"Cta Auxiliar"}),
    ColDesc = Table.ColumnNames(DuplicadosQuitados){1},
    Renombrado = Table.RenameColumns(DuplicadosQuitados, {{ColDesc, "Descripcion_Proyecto"}})
in
    Renombrado;

[ Description = "Rubros" ]
shared Dim_Rubro = let
    Tabla = #table(
        {"Rubro_ID", "Rubro", "Naturaleza"},
        {
            {"RUB-01", "Materiales Directos", "Directo"},
            {"RUB-02", "Servicios Directos", "Directo"},
            {"RUB-03", "Mano de Obra Directa", "Directo"},
            {"RUB-04", "Horas Maquina", "Directo"},
            {"RUB-05", "Costos Indirectos", "Indirecto"}
        }
    )
in
    Tabla;

[ Description = "Ajustes Servicios" ]
shared Ajuste_Servicios = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\2 Data Fija\\Correcciones.xlsx"), null, true),
    Ajuste_Servicios_Table = Origen{[Item="Ajuste_Servicios",Kind="Table"]}[Data],
    TipoCambiado = Table.TransformColumnTypes(Ajuste_Servicios_Table,{{"Nro-OC", type text}, {"Codigo", type text}, {"Cant-OC", Int64.Type}, {"Cuenta-Aux", type text}, {"Fecha Real", type date}})
in
    TipoCambiado;

[ Description = "Materiales 2026" ]
shared Fact_MaterialesDirectos_2026 = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\2 Analisis Consumos - Master.xlsx"), null, true),
    Base_Consumos_Final_Table = Origen{[Item="Base_Consumos_Final",Kind="Table"]}[Data],
    TipoCambiado = Table.TransformColumnTypes(Base_Consumos_Final_Table,{{"Fecha", type date}, {"Total USD", type number}, {"Cuenta-Aux", type text}, {"Ajuste", type text}}),
    Filtrado2026 = Table.SelectRows(TipoCambiado, each [Fecha] <> null and Date.Year([Fecha]) = 2026),
    Mayusc = Table.TransformColumns(Filtrado2026,{{"Cuenta-Aux", Text.Upper, type text}}),
    Trimmed = Table.TransformColumns(Mayusc,{{"Cuenta-Aux", Text.Trim, type text}, {"Ajuste", Text.Trim, type text}}),
    Cleaned = Table.TransformColumns(Trimmed,{{"Cuenta-Aux", Text.Clean, type text}}),
    RubroAgregado = Table.AddColumn(Cleaned, "Rubro", each "Materiales Directos", type text)
in
    RubroAgregado;

[ Description = "Servicios 2026" ]
shared Fact_ServiciosDirectos_2026 = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\1 Base Central Inputs.xlsx"), null, true),
    _2_Compras_Table = Origen{[Item="_2_Compras",Kind="Table"]}[Data],
    TipoCambiado = Table.TransformColumnTypes(_2_Compras_Table,{{"Almacen", type text}, {"Nro-Sol", type text}, {"Fecha-Sol", type date}, {"Estatus-SC", type text}, {"Nro-OC", type text}, {"Estatus-OC", type text}, {"Codigo", type text}, {"Categoria", type text}, {"Descripcion", type text}, {"Cant-SC", type number}, {"Cant-OC", Int64.Type}, {"Unidad", type text}, {"Cuenta-Aux", type text}, {"Desc-Cuenta", type text}, {"Solicitado-Por", type text}, {"Precio$", type number}, {"Total$", type number}, {"Proveedor", type text}, {"Tipo-Prov", type text}, {"Recepcion", type text}, {"Fecha-Rec", type date}, {"Cant-Rec", type number}, {"Cant-PE", type number}, {"Motivo", type text}, {"Comprador", type text}}),
    FilasFiltradas = Table.SelectRows(TipoCambiado, each [Categoria] = "SERVICIOS" and [#"Fecha-Rec"] <> null and Date.Year([#"Fecha-Rec"]) = 2026),
    Renombrado = Table.RenameColumns(FilasFiltradas,{{"Total$", "Total USD"}, {"Motivo", "motivo"}, {"Nro-Sol", "Numero"}, {"Nro-OC", "Pedido"}, {"Cant-OC", "Cantidad"}, {"Solicitado-Por", "solicitante"}}),
    AjustesSinDuplicados = Table.Buffer(Table.Distinct(Ajuste_Servicios, {"Nro-OC", "Codigo", "Cant-OC"})),
    ConsultasCombinadas = Table.NestedJoin(Renombrado, {"Pedido", "Codigo", "Cantidad"}, AjustesSinDuplicados, {"Nro-OC", "Codigo", "Cant-OC"}, "Ajuste_Servicios", JoinKind.LeftOuter),
    Expandido = Table.ExpandTableColumn(ConsultasCombinadas, "Ajuste_Servicios", {"Cuenta-Aux", "Fecha Real"}, {"Ajuste_Servicios.Cuenta-Aux", "Ajuste_Servicios.Fecha Real"}),
    ColCtaAU = Table.AddColumn(Expandido, "Cuenta AU", each if [#"Ajuste_Servicios.Cuenta-Aux"] <> null then [#"Ajuste_Servicios.Cuenta-Aux"] else [#"Cuenta-Aux"]),
    ColFechaReal = Table.AddColumn(ColCtaAU, "Fecha Real", each if [Ajuste_Servicios.Fecha Real] = null then [#"Fecha-Rec"] else [Ajuste_Servicios.Fecha Real]),
    TipoCambiado2 = Table.TransformColumnTypes(ColFechaReal,{{"Fecha Real", type date}}),
    RenombradoFecha = Table.RenameColumns(TipoCambiado2,{{"Fecha Real", "Fecha"}}),
    SelectCols = Table.SelectColumns(RenombradoFecha,{"Almacen", "Numero", "Pedido", "Codigo", "Categoria", "Descripcion", "Cantidad", "Unidad", "solicitante", "Precio$", "Total USD", "motivo", "Cuenta AU", "Fecha"}),
    RenombradoCta = Table.RenameColumns(SelectCols,{{"Cuenta AU", "Cuenta-Aux"}}),
    Mayusc = Table.TransformColumns(RenombradoCta,{{"Cuenta-Aux", Text.Upper, type text}}),
    RubroAgregado = Table.AddColumn(Mayusc, "Rubro", each "Servicios Directos", type text)
in
    RubroAgregado;

[ Description = "MOD 2026" ]
shared Fact_ManoDeObra_2026 = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\1 Base Central Inputs.xlsx"), null, true),
    _3_Mano_de_obra__Table = Origen{[Item="_3_Mano_de_obra_",Kind="Table"]}[Data],
    TipoCambiado = Table.TransformColumnTypes(_3_Mano_de_obra__Table,{{"Semana", Int64.Type}, {"Fecha Desde", type date}, {"Cuenta Auxiliar", type text}, {"Total a pagar $", type number}}),
    Filtrado2026 = Table.SelectRows(TipoCambiado, each [Fecha Desde] <> null and Date.Year([Fecha Desde]) = 2026),
    Renombrado = Table.RenameColumns(Filtrado2026,{{"Cuenta Auxiliar", "Cuenta-Aux"}, {"Fecha Desde", "Fecha"}, {"Total a pagar $", "Total USD"}}),
    Mayusc = Table.TransformColumns(Renombrado,{{"Cuenta-Aux", Text.Upper, type text}}),
    Trimmed = Table.TransformColumns(Mayusc,{{"Cuenta-Aux", Text.Trim, type text}}),
    Cleaned = Table.TransformColumns(Trimmed,{{"Cuenta-Aux", Text.Clean, type text}}),
    RubroAgregado = Table.AddColumn(Cleaned, "Rubro", each "Mano de Obra Directa", type text)
in
    RubroAgregado;

[ Description = "MOD ECO 2026" ]
shared Fact_ManoDeObraECO_2026 = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\1 Base Central Inputs.xlsx"), null, true),
    Mano_de_Obra_ECO_Table = Origen{[Item="Mano_de_Obra_ECO",Kind="Table"]}[Data],
    TipoCambiado = Table.TransformColumnTypes(Mano_de_Obra_ECO_Table,{{"Fecha", type date}, {"Total a Pagar ($)", type number}, {"Cuenta Auxiliar", type text}}),
    Filtrado2026 = Table.SelectRows(TipoCambiado, each [Fecha] <> null and Date.Year([Fecha]) = 2026),
    Renombrado = Table.RenameColumns(Filtrado2026,{{"Cuenta Auxiliar", "Cuenta-Aux"}, {"Total a Pagar ($)", "Total USD"}}),
    Mayusc = Table.TransformColumns(Renombrado,{{"Cuenta-Aux", Text.Upper, type text}}),
    Trimmed = Table.TransformColumns(Mayusc,{{"Cuenta-Aux", Text.Trim, type text}}),
    Cleaned = Table.TransformColumns(Trimmed,{{"Cuenta-Aux", Text.Clean, type text}}),
    RubroAgregado = Table.AddColumn(Cleaned, "Rubro", each "Mano de Obra Directa", type text)
in
    RubroAgregado;

[ Description = "HM 2026" ]
shared Fact_HorasMaquina_2026 = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\1 Base Central Inputs.xlsx"), null, true),
    _4_Horas_Maquina_Table = Origen{[Item="_4_Horas_Maquina",Kind="Table"]}[Data],
    TipoCambiado = Table.TransformColumnTypes(_4_Horas_Maquina_Table,{{"Fecha", type date}, {"Cuenta-Aux", type text}, {"Total USD", type number}}),
    Filtrado2026 = Table.SelectRows(TipoCambiado, each [Fecha] <> null and Date.Year([Fecha]) = 2026),
    Mayusc = Table.TransformColumns(Filtrado2026,{{"Cuenta-Aux", Text.Upper, type text}}),
    Trimmed = Table.TransformColumns(Mayusc,{{"Cuenta-Aux", Text.Trim, type text}}),
    Cleaned = Table.TransformColumns(Trimmed,{{"Cuenta-Aux", Text.Clean, type text}}),
    RubroAgregado = Table.AddColumn(Cleaned, "Rubro", each "Horas Maquina", type text)
in
    RubroAgregado;

[ Description = "Indirectos 2026" ]
shared Fact_CostosIndirectos_2026 = let
    Origen = Excel.Workbook(File.Contents("C:\\Users\\alejandratesara\\Desktop\\Alejandra T\\Costos Alejandra\\1 Informe\\3 Analisis Costos Indirectos.xlsx"), null, true),
    Hoja1_Sheet = Origen{[Item="Hoja1",Kind="Sheet"]}[Data],
    Encabezados = Table.PromoteHeaders(Hoja1_Sheet, [PromoteAllScalars=true]),
    TipoCambiado = Table.TransformColumnTypes(Encabezados,{{"Tipo", type text}, {"Fecha", type date}, {"Cuenta Auxiliar", type text}, {"Total USD", type number}}),
    Renombrado = Table.RenameColumns(TipoCambiado,{{"Cuenta Auxiliar", "Cuenta-Aux"}}),
    Filtrado2026 = Table.SelectRows(Renombrado, each [Fecha] <> null and Date.Year([Fecha]) = 2026),
    Mayusc = Table.TransformColumns(Filtrado2026,{{"Cuenta-Aux", Text.Upper, type text}}),
    Trimmed = Table.TransformColumns(Mayusc,{{"Cuenta-Aux", Text.Trim, type text}}),
    Cleaned = Table.TransformColumns(Trimmed,{{"Cuenta-Aux", Text.Clean, type text}}),
    RubroAgregado = Table.AddColumn(Cleaned, "Rubro", each "Costos Indirectos", type text)
in
    RubroAgregado;