# 🚀 SISTEMA DE GESTIÓN Y AUDITORÍA DE COSTOS TIMACA 2026
## DOCUMENTO DE TRASPASO Y CONTINUACIÓN DE SESIÓN (HANDOVER DOCUMENT)

> **Instrucción para el nuevo Agente Antigravity:**  
> Lee este documento por completo antes de realizar cualquier cambio. Contiene la ubicación exacta del código fuente, el entorno de ejecución, las reglas de negocio contables oficiales y el estado actual del desarrollo para continuar trabajando con Alejandra Tesara sin perder nada de contexto.

---

## 1. Identificación del Proyecto y Usuario

* **Empresa:** Taller Industrial Metalúrgico Antonio, C.A. (TIMACA) - Ciudad Guayana, Venezuela.
* **Usuaria:** **Alejandra Tesara** (Analista Principal de Costos / Administradora del Sistema).
* **Equipo de Trabajo (Roles y Accesos):**
  * **Alejandra Tesara** (`atesara` / Administradora): Única con permisos de edición, importación de datos y configuración. Contraseña: `timaca2026`
  * **Daniela Riveros** (`drivero` / Observadora): Permiso de solo lectura. Contraseña: `timaca2026`
  * **Jessica Navarro** (`jnavarro` / Observadora): Permiso de solo lectura. Contraseña: `timaca2026`
  * **José Galavis** (`jgalavis` / Observador): Permiso de solo lectura. Contraseña: `timaca2026`
  *(Portada de bienvenida y login corporativo disponible en la entrada del sistema con accesos rápidos de 1 clic)*.

---

## 2. Ubicación del Código y Entorno Técnico

* **Directorio del Proyecto en Disco:**  
  `C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer`
* **Directorio de Archivos Fuente de Alejandra (Inputs y Excel):**  
  `C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\`
  * Subcarpeta con archivos de modelos y presupuestos:  
    `C:\Users\alejandratesara\Desktop\Alejandra T\Costos Alejandra\Modelo_Estrella_Costos_TIMACA\`
* **Ruta de Node.js en Windows:**  
  `C:\Users\alejandratesara\nodejs`
* **Tecnologías:**  
  * **Lenguaje:** TypeScript (`.ts`, `.tsx`) con tipado estricto.
  * **Framework Frontend:** React 19 (Single Page Application - SPA ultra rápida).
  * **Diseño:** Tailwind CSS v4.
  * **Empaquetador:** Vite v8.
  * **Procesamiento de Excel:** SheetJS (`xlsx`).
  * **Iconografía:** Lucide React.
* **Comando para levantar la aplicación (en PowerShell):**
  ```powershell
  $env:Path = "C:\Users\alejandratesara\nodejs;" + $env:Path
  cd "C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer"
  npx vite --port 3000 --host
  ```
  *(La aplicación se abrirá en `http://localhost:3000`)*.
* **Comando para verificar compilación sin errores:**
  ```powershell
  $env:Path = "C:\Users\alejandratesara\nodejs;" + $env:Path
  npm run build
  ```

---

## 3. Modelo Contable y Reglas Oficiales TIMACA

El sistema refleja con precisión del 100% las cifras de las presentaciones ejecutivas oficiales de TIMACA (Presentación Oficial Agosto 2026 de Alejandra Tesara):

### A. Las 5 Categorías Oficiales de Costo:
1. **Materiales Directos** (Badge Azul): Despachos físicos de almacén SIP + Compras en tránsito.
2. **Servicios** (Badge Naranja): Servicios especializados directos a obra y maquinados.
3. **Mano de Obra Directa - MOD** (Badge Esmeralda): Nómina auditada por cuadrillas y cargos operativos.
4. **Horas Máquina - HM** (Badge Púrpura): Equipos y maquinaria pesada asignada a obras.
5. **Costos Indirectos** (Badge Ámbar): 15 Rubros oficiales prorrateados por proyectos.

### B. Cifras Clave Oficiales Cuadradas:
* **Total Oficial Proyectos Externos Agosto 2026:** **$1.290.177,00 USD**
  * Materiales Directos: **$506.689,00 USD** ($495.913,23 despachos SIP + $10.775,77 compras en tránsito).
  * Mano de Obra Directa: **$221.353,00 USD** (31 cuentas auxiliares de nómina operativa).
  * Costos Indirectos: **$336.208,00 USD** (15 rubros oficiales prorrateados).
  * Servicios: **$117.970,00 USD** (17 partidas de servicios de obra + servicios mayores).
  * Horas Máquina: **$89.789,00 USD** (18 líneas de equipos + disponibilidad).
* **Total Global Acumulado Enero a Agosto 2026:** **$11.809.472,00 USD**
* **Total Materiales Directos Ene-Ago (Proyectos Externos):** **$3.917.330,06 USD**
  * Ene: $619.885,03 | Feb: $687.540,58 | Mar: $650.798,32 | Abr: $372.301,51
  * May: $298.495,08 | Jun: $479.381,97 | Jul: $302.238,34 | Ago: $506.689,23

### C. Módulo de Presupuestos Oficiales Integrado:
* Extraído de `Presupuestos.xlsx` ubicado en el directorio de Alejandra.
* Contiene **77 proyectos**, órdenes de compra (OC), montos presupuestados aprobados y cálculo dinámico de **% de uso / ejecución presupuestaria** por proyecto (`montoEjecutado / presupuestoAprobado * 100`).
* Visible en:
  * `InformeMensualView.tsx` (Lámina 3 y Modo Documento).
  * `ProyectosView.tsx` (Ficha técnica de cada proyecto y tabla de auditoría).
  * `MatrizProyectosCategoriasView.tsx`.

---

## 4. Últimos Ajustes y Correcciones Realizadas

1. **Eliminación de la fila "Consumo Mensual Registrado":**
   * En `CategoriaDetalleView.tsx`, se quitó del cuerpo de la tabla la fila redundante de *Consumo Mensual Registrado*, conservando intactos al 100% los valores mensuales de Enero a Agosto en la fila inferior de `TOTAL GENERAL` ($3.917.330,06 USD).
2. **Jerarquía Contable en Resumen General (`DashboardView.tsx`):**
   * En la tabla de despachos y en la ventana modal de auditoría, la columna **`Categoría`** ahora muestra la categoría macro oficial: **`Materiales Directos`** para todos los ítems de almacén (Ferretería, Pinturas, Aceros, etc.), y la columna **`Tipo de Material`** muestra la familia o subpartida específica (*Materiales de Ferretería*, *Tintas, Pinturas y Colorantes*, etc.).
3. **Usuarios y Seguridad:**
   * Eliminados los usuarios de relleno. Configurados exclusivamente Alejandra Tesara (Admin/Editora) y Daniela Riveros, Jessica Navarro y José Galavis (Observadores).

---

## 5. Estructura de Vistas Principales del Sistema

* **Resumen General** (`src/components/DashboardView.tsx`): Dashboard ejecutivo con KPIs, gráficos de evolución, distribución mensual/semanal/categorías y tabla interactiva de despachos auditables.
* **Proyectos & Costos:**
  * Vista de Proyectos (`src/components/ProyectosView.tsx`): Fichas de los 20 proyectos externos y 77 presupuestados, alertas de desviación, desglose de costos y % de uso de presupuesto.
  * Auditoría por Categoría (`src/components/CategoriaDetalleView.tsx`): Matrices mensuales Ene-Ago por partida y conciliación contable.
  * Matriz Proyectos vs Categorías (`src/components/MatrizProyectosCategoriasView.tsx`): Matriz cruzada de cuentas auxiliares y las 5 categorías.
* **Mano de Obra Directa** (`src/components/ManoObraDiariaView.tsx`): Nómina semanal auditada, 31 cuentas auxiliares, cargos y cuadrillas.
* **Evolución & Reportes:**
  * Informe Ejecutivo (`src/components/InformeMensualView.tsx`): Modo Presentación (Diapositivas PPT idénticas a la presentación de Alejandra) y Modo Documento imprimible/PDF.
  * Semana a Semana (`src/components/SemanaSemanaView.tsx`): Auditoría por semanas 31 a 34 de agosto.
  * Mes a Mes (`src/components/MesMesView.tsx`): Análisis comparativo mensual Ene-Ago.
* **Configuración & Usuarios** (`src/components/UsuariosView.tsx`): Gestión de roles, observadores y permisos.

---

## 6. Prompt para Pegar en la Nueva Cuenta de Antigravity

Si abres una nueva ventana o sesión en otra cuenta de Antigravity, **copia y pega exactamente este mensaje:**

```text
Hola Antigravity. Soy Alejandra Tesara, Analista Principal de Costos en TIMACA.
Estamos desarrollando el Sistema de Gestión y Auditoría de Costos TIMACA 2026.
El proyecto ya está completamente creado y estructurado en mi equipo en la ruta:
C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer

Por favor lee el archivo de contexto y traspaso ubicado en:
C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer\PROMPT_CONTINUACION_ANTIGRAVITY_TIMACA.md

Allí tienes todas las reglas de negocio, las cifras oficiales cuadradas ($1.290.177 USD en agosto y $11.809.472 USD acumulado), los presupuestos integrados, los usuarios configurados (yo como Administradora y Daniela Riveros, Jessica Navarro y José Galavis como observadores) y las instrucciones para levantar el servidor local de Vite en el puerto 3000 con Node.js en C:\Users\alejandratesara\nodejs.

Confírmame que leíste el archivo y dime el estado del proyecto para continuar.
```
