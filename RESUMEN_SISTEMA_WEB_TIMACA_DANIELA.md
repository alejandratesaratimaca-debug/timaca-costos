# 📊 SISTEMA DE GESTIÓN Y AUDITORÍA DE COSTOS TIMACA 2026
## RESUMEN EJECUTIVO DE LA APLICACIÓN WEB Y GUÍA DE CONTINUIDAD PARA DANIELA RIVEROS

---

### 📌 Información General
* **Empresa:** Taller Industrial Metalúrgico Antonio, C.A. (TIMACA) - Ciudad Guayana, Venezuela.
* **Líder del Proyecto:** **Alejandra Tesara** (Analista Principal de Costos / Administradora).
* **Destinataria y Co-Administradora de Proyectos Internos:** **Daniela Riveros** (Analista de Costos - Gestión Interna / CAPEX y OPEX).
* **Ubicación del Código Fuente (Equipo de Alejandra):**  
  `C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer`
* **Carpeta de Red Compartida de Daniela:**  
  `Y:\Daniela\` (`\\dc01timaca\Costos\Daniela\`)
* **Carpeta de Red Compartida de Alejandra:**  
  `Y:\Alejandra T\` (`\\dc01timaca\Costos\Alejandra T\`)

---

## 1. ¿Qué es la Aplicación Web Interactiva?

Es una plataforma web moderna tipo **SPA (Single Page Application)** diseñada a medida para el departamento de Costos de TIMACA. Sustituye las revisiones manuales y pesadas en hojas de cálculo por una interfaz visual ultra-rápida, interactiva y auditable que consolida:

1. **Despachos de Almacén SIP:** Consumos reales de materiales, repuestos, consumibles y EPP.
2. **Gastos Fuera de SIP:** Compras en tránsito, servicios de terceros e insumos directos.
3. **Mano de Obra Directa (MOD):** Nómina semanal por cuadrillas, centros de costos y categorías operativas.
4. **Horas Máquina (HM):** Equipos propios y alquilados asignados a obras y operaciones.
5. **Costos Indirectos:** Los 15 rubros oficiales prorrateados por proyectos y plantas.
6. **Presupuestos Oficiales:** Control de 77 proyectos con cálculo dinámico del % de ejecución presupuestaria.

---

## 2. Los Dos Grandes Entornos del Sistema

La aplicación cuenta con un **Selector de Entorno** en la barra superior para separar con total claridad las dos realidades operativas de TIMACA:

### A. 🏗️ Proyectos Externos (Obras & Clientes)
* **Objetivo:** Control y facturación de proyectos ejecutados para clientes industriales (Briquetera del Orinoco, Ferrominera, Sidor, clientes privados).
* **Cifras Clave Oficiales Auditadas (Agosto 2026):**
  * **Total Mensual Agosto 2026:** **$1.290.177,00 USD**
    * *Materiales Directos:* $506.689,00 USD ($495.913,23 SIP + $10.775,77 Tránsito)
    * *Mano de Obra Directa:* $221.353,00 USD (31 cuentas auxiliares)
    * *Costos Indirectos:* $336.208,00 USD (15 rubros prorrateados)
    * *Servicios de Obra:* $117.970,00 USD (17 partidas directas)
    * *Horas Máquina:* $89.789,00 USD (18 líneas de equipos)
  * **Acumulado Oficial Enero a Agosto 2026:** **$11.809.472,00 USD**
  * **Cierre de Septiembre 2026:** Integrado con datos reales de nómina y salidas de almacén.

---

### B. 🏭 Proyectos Internos (Planta & Flota / CAPEX y OPEX) — *Área Especializada de Daniela*
* **Objetivo:** Control milimétrico de los gastos y costos de los activos propios de TIMACA.
* **Módulos Principales de Proyectos Internos:**
  1. **Dashboard de Proyectos Internos (`DashboardInternosView`):**
     * **Flota y Equipos Móviles:** Camiones, camionetas, grúas, montacargas, consumo de combustible (gasoil/gasolina), lubricantes, cauchos, baterías, repuestos y talleres mecánicos externos.
     * **Planta e Instalaciones:** Línea I Planta de Pellas, Mantenimiento General de Planta, herramientas menores, consumibles de taller, obras civiles internas y mejoras de infraestructura (CAPEX/OPEX).
  2. **Informe Ejecutivo PPT de Proyectos Internos (`InformeInternosPPTView`):**
     * Modo Diapositivas interactivo (tipo PowerPoint corporativo) listo para juntas directivas y comités de gerencia, navegable con teclado o botones.
  3. **Desglose de Partidas Internas:**
     * Análisis partida por partida con montos acumulados, clasificaciones contables y justificaciones de compras.

---

## 3. Módulos y Pantallas Disponibles en la App

| Módulo | Descripción |
| :--- | :--- |
| **Login Corporativo** | Portada institucional con acceso rápido de 1 clic para cada miembro del equipo y validación por contraseña. |
| **Resumen General (Dashboard)** | KPIs globales, gráficos interactivos de evolución mensual, distribución por categorías y tabla auditable con filtros en vivo. |
| **Proyectos & Presupuestos** | Fichas técnicas individuales de los proyectos con semáforo presupuestario (% de presupuesto consumido vs aprobado). |
| **Auditoría por Categoría** | Matrices comparativas mensuales (Enero a Septiembre) por rubro y partida contable. |
| **Matriz Proyectos vs Categorías** | Vista matricial cruzada de todas las cuentas auxiliares frente a las 5 categorías contables. |
| **Mano de Obra Directa** | Registro semanal y mensual de cuadrillas, supervisores, soldadores y personal operativo. |
| **Validación Gerencial** | Panel para auditar imputaciones y verificar que los materiales no hayan sido cargados por error a una cuenta equivocada. |
| **Gestión de Usuarios** | Configuración de permisos, roles, correos y niveles de acceso corporativos. |

---

## 4. Usuarios, Roles y Credenciales

El sistema cuenta con control de acceso por perfiles:

* 👩‍💼 **Alejandra Tesara** (`atesara`)
  * **Rol:** Administradora / Control Total.
  * **Contraseña:** `timaca2026`
  * **Permisos:** Edición total, importación de Excels, creación de salidas, administración de usuarios.
* 👩‍💼 **Daniela Riveros** (`drivero`)
  * **Rol:** Analista de Costos Internos.
  * **Contraseña:** `timaca2026`
  * **Permisos:** Gestión y edición autorizada en el entorno de **Proyectos Internos (Planta y Flota)**, exportación de reportes a Excel, visualización completa del sistema.
* 👥 **Jessica Navarro** (`jnavarro`) / **José Galavis** (`jgalavis`)
  * **Rol:** Observadores (Lectura corporativa).
  * **Contraseña:** `timaca2026`

---

## 5. Tecnologías y Cómo Ejecutar la Aplicación

* **Frontend:** React 19 + TypeScript + Tailwind CSS v4.
* **Empaquetador:** Vite v8 (arranque instantáneo en < 300 ms).
* **Librerías Clave:** Lucide React (iconos), SheetJS `xlsx` (lectura/escritura de Excel).

### Cómo abrirla en la computadora de Daniela:

#### Opción 1: Abrirla directamente en el navegador por Red Local (Sin instalar nada)
Cuando Alejandra tenga la aplicación levantada en su máquina, Daniela puede simplemente abrir su navegador (Chrome o Edge) e ingresar a:
> **`http://192.168.12.226:3000`**

#### Opción 2: Correr el proyecto localmente en la máquina de Daniela
1. Copiar la carpeta `workspace-explorer` a la máquina de Daniela.
2. Abrir PowerShell en esa carpeta y ejecutar:
   ```powershell
   npm run dev
   # O con Vite directo:
   npx vite --port 3000 --host
   ```
3. Abrir en el navegador: `http://localhost:3000`

---

## 6. PROMPT LISTO PARA PEGAR EN EL ANTIGRAVITY DE DANIELA

Copia el siguiente bloque de texto completo y pégalo directamente en una nueva conversación de Antigravity en la computadora de Daniela:

```markdown
Hola Antigravity. Soy Daniela Riveros, Analista de Costos en TIMACA (Taller Industrial Metalúrgico Antonio, C.A.).
Trabajo en equipo con Alejandra Tesara (Analista Principal de Costos) en el "Sistema de Gestión y Auditoría de Costos TIMACA 2026".

Este sistema es una aplicación web interactiva desarrollada en React 19, TypeScript, Tailwind CSS y Vite.
Mi área de especialización y responsabilidad directa en el sistema son los **Proyectos Internos (Planta & Flota / CAPEX y OPEX)**, que abarcan:
1. Flota y Equipos Móviles (Camiones, camionetas, grúas, montacargas, combustible, lubricantes, repuestos y mantenimiento mecánico).
2. Planta e Instalaciones (Línea I Planta de Pellas, Mantenimiento de Planta, herramientas de almacén e infraestructura interna).

Mis archivos de trabajo en la red de la empresa se encuentran en:
- Mi carpeta personal de red: Y:\Daniela\ (\\dc01timaca\Costos\Daniela\)
  - Archivos clave: Informes de Costos PI, hojas de Control de Asignaciones, Planta de Pellas y Equipos Móviles.
- Carpeta de red de Alejandra: Y:\Alejandra T\ (\\dc01timaca\Costos\Alejandra T\)
- El código fuente original de la aplicación web fue desarrollado en la ruta:
  C:\Users\alejandratesara\.gemini\antigravity\scratch\workspace-explorer
- Para acceder al sistema en vivo desde mi navegador puedo ingresar a:
  http://192.168.12.226:3000 (con mi usuario "drivero" y contraseña "timaca2026").

Por favor, confirma que comprendes mi rol, el contexto del sistema de costos TIMACA y asísteme en la gestión, auditoría y actualización de los costos de Proyectos Internos (Planta y Flota) y la integración con la aplicación web.
```
