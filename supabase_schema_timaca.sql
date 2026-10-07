-- =========================================================================
-- ESQUEMA OFICIAL SUPABASE · TIMACA SUITE OPERACIONAL 2026
-- (Taller Industrial Metalúrgico Antonio, C.A.)
-- =========================================================================

-- 1. TABLAS DEL SISTEMA DE TRAZABILIDAD DE HERRAMIENTAS, CILINDROS Y EPP
-- (Portado fielmente de TIMACA_Sistema_Trazabilidad.html)

CREATE TABLE IF NOT EXISTS public.herramientas_almacenes (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.herramientas_catalogo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serial VARCHAR(100),
    categoria VARCHAR(100),
    modulo VARCHAR(20) NOT NULL DEFAULT 'HERRAMIENTA', -- 'HERRAMIENTA', 'CILINDRO', 'EPP'
    tipo_a BOOLEAN DEFAULT false,                     -- Requiere aprobación de Gerencia
    calibracion_requerida BOOLEAN DEFAULT false,
    frecuencia_calibracion_meses INT DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.herramientas_existencias (
    id SERIAL PRIMARY KEY,
    almacen_codigo VARCHAR(20) REFERENCES public.herramientas_almacenes(codigo) ON DELETE CASCADE,
    item_id INT REFERENCES public.herramientas_catalogo(id) ON DELETE CASCADE,
    disponible INT DEFAULT 0,
    prestado INT DEFAULT 0,
    asignado INT DEFAULT 0,
    danado INT DEFAULT 0,
    reparacion INT DEFAULT 0,
    extraviado INT DEFAULT 0,
    vacio INT DEFAULT 0,
    entregado INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(almacen_codigo, item_id)
);

CREATE TABLE IF NOT EXISTS public.herramientas_vales (
    numero VARCHAR(50) PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL,                        -- 'PRH' (Préstamo), 'ASI' (Asignación), 'TRF' (Transferencia)
    fecha TIMESTAMPTZ DEFAULT NOW(),
    origen VARCHAR(20),
    destino VARCHAR(50),
    responsable_nombre VARCHAR(150),
    responsable_cedula VARCHAR(30),
    responsable_cargo VARCHAR(100),
    supervisor VARCHAR(150),
    proyecto VARCHAR(100),
    cuenta VARCHAR(50),
    fecha_requerida DATE,
    fecha_devolucion DATE,
    estatus VARCHAR(30) DEFAULT 'VIGENTE',            -- 'VIGENTE', 'CERRADO', 'VENCIDO', 'DEVOLUCIÓN PARCIAL'
    observaciones TEXT,
    lineas JSONB DEFAULT '[]'::jsonb,
    historial JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.herramientas_movimientos (
    id SERIAL PRIMARY KEY,
    numero_mov INT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    usuario VARCHAR(100),
    tipo_documento VARCHAR(20),
    documento_numero VARCHAR(50),
    item_id INT,
    item_codigo VARCHAR(50),
    item_descripcion TEXT,
    cantidad INT DEFAULT 1,
    origen VARCHAR(20),
    destino VARCHAR(50),
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    responsable VARCHAR(150),
    cedula VARCHAR(30),
    observaciones TEXT
);

-- 2. TABLAS DEL SISTEMA DE CERTIFICACIONES Y CURSOS TÉCNICOS
-- (Enlace con Google Sheets gid=1730870257)

CREATE TABLE IF NOT EXISTS public.hse_cursos_trabajadores (
    cedula VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    area_fisica VARCHAR(100),
    cursos JSONB DEFAULT '[]'::jsonb,
    estado_general VARCHAR(30) DEFAULT 'EN REGLA',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hse_certificados (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    trabajador_cedula VARCHAR(30) REFERENCES public.hse_cursos_trabajadores(cedula) ON DELETE SET NULL,
    curso_nombre VARCHAR(150) NOT NULL,
    entidad_emisora VARCHAR(150),
    fecha_emision DATE,
    fecha_vencimiento DATE,
    estado VARCHAR(30) DEFAULT 'VIGENTE',             -- 'VIGENTE', 'POR VENCER', 'VENCIDO'
    drive_url TEXT,
    qr_data TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLAS DEL SISTEMA DE SEGURIDAD INDUSTRIAL & HSE
-- (Enlace con Google Sheets gid=1489434091 / IPER)

CREATE TABLE IF NOT EXISTS public.hse_matriz_iper (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    area VARCHAR(100) NOT NULL,
    proceso_actividad TEXT NOT NULL,
    peligro TEXT NOT NULL,
    riesgo_consecuencia TEXT NOT NULL,
    probabilidad_inicial INT DEFAULT 1,
    severidad_inicial INT DEFAULT 1,
    nivel_riesgo_inicial VARCHAR(30),
    medidas_control_existentes TEXT,
    jerarquia_control VARCHAR(50),
    probabilidad_residual INT DEFAULT 1,
    severidad_residual INT DEFAULT 1,
    nivel_riesgo_residual VARCHAR(30),
    estado VARCHAR(30) DEFAULT 'CONTROLADO',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hse_planes_control (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    peligro_id INT,
    area VARCHAR(100),
    medida_control TEXT NOT NULL,
    jerarquia VARCHAR(50),
    responsable VARCHAR(150),
    fecha_meta DATE,
    estado VARCHAR(30) DEFAULT 'EN PROCESO',          -- 'COMPLETADO', 'EN PROCESO', 'PENDIENTE'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLÍTICAS DE ACCESO PÚBLICO / LECTURA Y ESCRITURA (ROW LEVEL SECURITY)
-- Habilitamos acceso para lectura y escritura desde la aplicación web TIMACA:

ALTER TABLE public.herramientas_almacenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herramientas_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herramientas_existencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herramientas_vales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herramientas_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_cursos_trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_matriz_iper ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_planes_control ENABLE ROW LEVEL SECURITY;

-- Políticas de permiso total para desarrollo/operación (Anon & Authenticated)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir todo herramientas_almacenes" ON public.herramientas_almacenes;
    CREATE POLICY "Permitir todo herramientas_almacenes" ON public.herramientas_almacenes FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo herramientas_catalogo" ON public.herramientas_catalogo;
    CREATE POLICY "Permitir todo herramientas_catalogo" ON public.herramientas_catalogo FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo herramientas_existencias" ON public.herramientas_existencias;
    CREATE POLICY "Permitir todo herramientas_existencias" ON public.herramientas_existencias FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo herramientas_vales" ON public.herramientas_vales;
    CREATE POLICY "Permitir todo herramientas_vales" ON public.herramientas_vales FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo herramientas_movimientos" ON public.herramientas_movimientos;
    CREATE POLICY "Permitir todo herramientas_movimientos" ON public.herramientas_movimientos FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo hse_cursos_trabajadores" ON public.hse_cursos_trabajadores;
    CREATE POLICY "Permitir todo hse_cursos_trabajadores" ON public.hse_cursos_trabajadores FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo hse_certificados" ON public.hse_certificados;
    CREATE POLICY "Permitir todo hse_certificados" ON public.hse_certificados FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo hse_matriz_iper" ON public.hse_matriz_iper;
    CREATE POLICY "Permitir todo hse_matriz_iper" ON public.hse_matriz_iper FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir todo hse_planes_control" ON public.hse_planes_control;
    CREATE POLICY "Permitir todo hse_planes_control" ON public.hse_planes_control FOR ALL USING (true) WITH CHECK (true);
END $$;

-- 5. SEMILLA INICIAL DE ALMACENES TIMACA
INSERT INTO public.herramientas_almacenes (codigo, nombre, descripcion)
VALUES 
    ('TALLER', 'Almacén General de Taller (Planta Matriz)', 'Custodia de herramientas mayores, cajas 01-40 y equipos pesados'),
    ('PALUA', 'Almacén Frente Palúa PMH (Muelle)', 'Operaciones en muelle, grúas y despacho de campo')
ON CONFLICT (codigo) DO NOTHING;
