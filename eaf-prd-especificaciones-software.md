# Especificación de Requerimientos de Software (PRD)
## Plataforma SaaS: EAF — Evergreen de Alta Frecuencia
**Documento Técnico de Arquitectura, Flujos y Pantallas**

Este documento detalla las especificaciones técnicas de diseño, backend, base de datos, flujos de datos e interfaz de usuario (UI/UX) para el desarrollo del software de **EAF — Evergreen De Alta Frecuencia** [860]. El objetivo del software es automatizar al 100% el **Sistema de Distribución de Contenido (SDC)** [860] y la orquestación de pauta publicitaria en Meta Ads, aplicando la metodología de alta frecuencia a embudos continuos de venta high-ticket [100, 859].

---

## 💻 1. Arquitectura del Sistema y Motor de Video (SDC Engine)

El core técnico de EAF consiste en automatizar el ciclo de vida de los activos de video vertical corto (Reels/TikTok) del creador [95, 110, 531, 601]. El software actúa como un middleware entre las redes sociales del cliente, su cuenta publicitaria de Meta Ads y su GoHighLevel (GHL) [852, 859].

```text
  [ Instagram / TikTok API ] 
              │ (Descarga de orgánicos de alto engagement)
              ▼
    [ EAF Video Processor ] ➔ (Generación de 5 variaciones automáticas por ffmpeg)
              │
              ▼
 [ Meta Ads API Campaign Manager ] ➔ (Inyección de Campañas ABO con Exclusiones de 10s)
```

### 1.1 Motor de Validación Orgánica (Validation Monitor)
*   **Funcionalidad:** El sistema monitorea de forma continua (vía Webhooks o consultas periódicas a la API de Instagram Graph y TikTok Business) las métricas de engagement orgánico de las publicaciones del usuario [3].
*   **Lógica de Selección:** El software identifica automáticamente las piezas ganadoras ("Winner Reels") utilizando un score de performance relativa basado en la tasa de interacción (likes + comentarios + guardados / alcance) en comparación con la media histórica de la cuenta [3, 8].
*   **Disparador (Trigger):** Cuando un Reel orgánico supera un desvío estándar (+1σ) por encima de la media de engagement de la cuenta en las primeras 24 horas, el sistema marca el video en el Dashboard como `"Validado — Listo para Exprimir"` y envía una notificación push/email al usuario [2, 3].

### 1.2 Motor de Variación Creativa Automatizada (Programmatic Creative Squeeze)
Para maximizar la distribución sin volver a grabar (exprimir una idea ganadora en 5 o 10 variaciones nativas para el algoritmo), el backend procesa el archivo de video crudo utilizando scripts automatizados de procesamiento de video (vía `ffmpeg` o bibliotecas de renderizado en la nube) [1, 5]:
*   **Lógica de Variaciones Automatizadas [5]:**
    1.  **Variación 1 (Splicing / Corte de Inicio):** Recorta programáticamente los primeros 0.8 a 1.2 segundos del video para forzar un arranque alternativo directo a la primera frase hablada [5].
    2.  **Variación 2 (Dynamic Hook Text):** El backend extrae el hook transcrito por Whisper/IA y superpone 3 plantillas de texto de hook de mayoría en la parte superior/media de la pantalla en los primeros 3 segundos con diferentes ganchos visuales redactados [5, 411, 415, 539].
    3.  **Variación 3 (Audio Track Swap):** Extrae la pista de voz (aislando el diálogo mediante IA) y reemplaza la música de fondo por pistas con licencia comercial (audio libre de copyright apto para pauta de Meta Ads) seleccionadas algorítmicamente de una biblioteca integrada [5, 118].
    4.  **Variación 4 (Visual Frame / Zoom In-Out):** Aplica un escalado de imagen (zoom del 10% al 15% alternado programáticamente en las pausas del diálogo) y aplica filtros sutiles de color para que Meta identifique el archivo como un hash de video completamente nuevo [5].
    5.  **Variación 5 (CTA Ending Crop):** Modifica los últimos 3 segundos del video reemplazando el final original por cortes o animaciones de llamado a la acción seleccionables por el usuario (ej. "Clic abajo", "Comentá FÁBRICA", "Link en bio") [5, 401].

---

## 📡 2. Especificación Técnica de los Módulos de Pauta de EAF

El software automatiza la creación, exclusión y rotación de audiencias mediante la API de Meta Ads de forma transparente para el usuario [610, 859].

### 2.1 Módulo 1: Sintonizador de Entrada (La Fábrica)
Este módulo compra atención calificada por centavos y la deposita en el tanque de retargeting de la marca [592, 593, 600].

*   **Paso 1: Setup Automático de Campaña Base (Cycle Bin 1) [611, 612]:**
    *   Crea una campaña en Meta Ads Manager con objetivo **Engagement (Interacción Post)** [601, 603, 611].
    *   Configura el presupuesto a nivel Ad Set (**ABO**) con un valor predeterminado de **$5 USD diarios** por conjunto de anuncios [531, 601, 603, 611].
    *   Crea un Ad Set individual por cada video seleccionado (ej. si son 9 variaciones, genera 9 ad sets) [601, 603, 612].
    *   **Segmentación unificada:** Todos los ad sets apuntan de manera idéntica al mismo público frío calificado definido en los templates (intereses consolidados o stacks de lookalikes de GHL) [601, 603, 605, 609, 611].
    *   **Creativo:** Vincula el Reel orgánico o la variación autogenerada mediante el parámetro `existing_post_id` (Usar publicación existente) para conservar toda la prueba social (likes y comentarios acumulados) [111, 117, 119, 729].
*   **Paso 2: Campaña Espejo de Thruplays [610, 611]:**
    *   El software duplica automáticamente la campaña del Cycle Bin 1 [610].
    *   Modifica el objetivo de optimización de la campaña espejo a **Video Views (Reproducciones de Video)** y optimiza específicamente para **Thruplays** (visualizaciones de 15 segundos o video completo) [124, 489, 610, 611].
*   **Paso 3: Construcción de la Mega-Audiencia Tibia (Espectro Tibio) [607, 615, 616]:**
    *   El software crea e interactúa diariamente con la API de Meta para actualizar una Custom Audience llamada `[EAF] - Espectro Tibio Consolidado - 365 Días` [607].
    *   **Regla de consolidación de señales:** El software agrupa con operador lógico `OR` los siguientes disparadores de Meta [606, 607, 614, 615, 731]:
        *   Personas que vieron al menos **10 segundos o más** de cualquiera de los videos pautados en las campañas del Cycle Bin 1 [602, 607, 615, 620].
        *   Cualquier persona que haya **visitado el perfil de Instagram o Facebook** de las marcas personales en los últimos 365 días [606, 607, 614, 615, 731].
        *   Personas que hayan interactuado con cualquier post, ad o enviado un **Mensaje Directo (DM)** [606, 607, 614, 615, 731].
        *   Personas que hayan guardado publicaciones de la cuenta [606, 607, 614, 615, 731].

### 2.2 Módulo 2: Filtro de Banda (Blackhole 2.0)
Este módulo automatiza la maduración y el adoctrinamiento progresivo del lead mediante contenido largo [174, 175].

*   **Lógica de progresión (3 Capas de Contenido Largo) [174, 175]:**
    *   **Capa 1 (Frío - Paso 1):** Configura 5 conjuntos ABO que contienen 5 videos largos (10-30 min) sobre autoridad y visión macro [175, 184, 185, 186].
    *   **Capa 2 (Tibio - Paso 2):** Configura un Ad Set que incluye los videos largos #6 al #10 [179, 196]. Targetea automáticamente a la audiencia personalizada de personas que consumieron el **25%** de cualquier video de la Capa 1 en Meta [174, 175, 179, 194]. Excluye automáticamente a quienes ya vieron 10 segundos de los videos de la Capa 2 [179, 187, 195, 197].
    *   **Capa 3 (Caliente - Paso 3):** Configura un Ad Set con los videos largos #11 al #15 [175, 179, 201]. Targetea automáticamente a la audiencia que consumió el **25%** de cualquier video de la Capa 2 [174, 175, 179, 200].
    *   **Paso 4 (Respuesta Directa):** Una campaña de conversiones que muestra anuncios interactivos de agendamiento (VSL) exclusivamente a los leads que alcanzaron el hito de ver el **25%** de cualquier video de la Capa 3 [174, 175, 179, 201, 204].

### 2.3 Módulo 3: Bucle de Resonancia (B-52)
Este módulo ejecuta el "bombardeo táctico de pre-llamada" para aniquilar objeciones previas al Zoom con el closer [99, 100, 101].

*   **Paso 1: Sincronización con el Calendario (CRM Handoff) [99, 121]:**
    *   El software escucha vía webhook de GoHighLevel (GHL) o Calendly cuando un lead agenda una reunión de ventas [121, 582].
    *   El webhook de agendamiento dispara una API call inmediata a Meta Ads para inyectar el ID de email y teléfono del lead en una Custom Audience dinámica de Meta de ventana apretada: `[EAF] - Leads Agendados Activos - Próximas 72 Horas` [120, 121, 124, 128].
*   **Paso 2: Rotación Milimétrica pre-llamada (Ads de Exclusión Estricta de 3 Segundos) [100, 120, 122, 126, 127]:**
    *   El software crea una campaña CBO con un presupuesto agresivo de base (\$50 a \$100 diarios) con 20 a 30 conjuntos de anuncios (Ad Sets) [118, 120, 123, 127, 128].
    *   Cada Ad Set contiene **un solo video corto** enfocado en destruir objeciones, preguntas de segunda capa, expectativas o credibilidad de la marca [109, 120, 125, 127].
    *   **Lógica de rotación algorítmica por exclusión [126, 127]:** El sistema crea dinámicamente un público de exclusión por cada video que mide visualizaciones de más de **3 segundos** en el último año [126, 127]. Cada Ad Set de la campaña excluye activamente el público de 3 segundos de su propio anuncio [127, 128].
    *   *Resultado:* Meta está obligado a rotar al lead hacia un nuevo video en su feed cada vez que se detiene a mirar una pieza por solo 3 segundos [120, 127, 128].
*   **Paso 3: Automatización de Correo de Frecuencia Crítica [121, 140]:**
    *   Sincronizado con GHL Email Services, el software dispara un workflow automatizado de email-marketing que envía **6 correos de ultra-alto valor distribuidos estratégicamente a lo largo de las horas del día previos a la cita**, abordando los 4 pilares psicológicos (Preguntas, 2da Capa, Objeciones, Expectativas) [121, 140, 141].

### 2.4 Módulo 4: Emisor de Pulsos (Lazarus)
*   **Funcionalidad:** Monitorea leads "perdidos", "no-shows", o inactivos de la base de datos de GHL [120, 618].
*   **Lógica:** Dispara secuencias específicas por mensaje directo (DM) y pauta de bajo costo en Meta a esas audiencias muertas, ofreciendo PDFs interactivos de alto valor ("Anzuelos") para reactivar el interés y re-direccionar el flujo hacia una conversación de venta nativa por texto en Instagram [618, 619, 656, 658, 672, 702].

---

## 🖥️ 3. Mapa de Pantallas e Interfaz de Usuario (UI/UX)

La interfaz de usuario de EAF debe ser simple, intuitiva y sumamente orientada a métricas de negocio tangibles (como ROAS y costo por lead/llamada), ocultando la complejidad técnica de Meta Ads Manager [145, 507, 508, 515].

### Pantalla 1: Home Dashboard (Panel de Control Principal)
El centro neurálgico del software. Debe mostrar la "frecuencia e intensidad" del negocio en un golpe de vista de 3 segundos [507, 508, 515, 546].

*   **Métricas Core Destacadas (Header Hero Tiles):**
    *   **ROAS de Journey Completo (Blended ROAS):** Gasto total de ads vs. Facturación real acumulada en GHL + atribución proyectada a 90 días [510, 516, 517, 546, 560].
    *   **Presupuesto Diario de Sintonía:** El spend total actual en el Sintonizador de Entrada (La Fábrica) [600, 601, 622].
    *   **Volumen de la Audiencia Tibia:** Cantidad de personas activas en el bucket de 365 días [607, 615, 622].
    *   **Costo Promedio de Sintonía (CPM / Cost por Thruplay):** Debe mostrar el costo de interacción actual (objetivo: menos de \$0,01 USD) [592, 593, 601].
*   **Gráficos de Visualización Interactivos:**
    *   **El "Tanque de Agua":** Un gráfico acumulativo que muestra el tamaño del público de retargeting de 365 días creciendo en tiempo real como un tanque de agua líquida que se llena [172, 180, 224].
    *   **Embudo de Flujo de Frecuencias:** Gráfico de cascada que representa el recorrido del lead cruzando por las etapas del software:
        `Sintonizador de Entrada (Frio) ➔ Espectro Tibio Consolidado ➔ Filtro de Banda (Consumo 25%) ➔ Conversión Activa (VSL/Llamada) ➔ Bucle de Resonancia (72 hs pre-llamada) ➔ Venta Cerrada (CRM)` [121, 175, 179, 605, 620, 653, 692]

### Pantalla 2: SDC Multiplier Screen (Fábrica de Variaciones)
La pantalla donde ocurre la magia de la optimización creativa automatizada del SDC [1, 5, 852].

*   **Tabla de Monitoreo de Reels Orgánicos:**
    *   Columnas: ID de publicación, miniatura del Reel, fecha de posteo, alcance orgánico, reproducciones completas, tasa de engagement y estado de validación (Status: `"WINNER 🌟"` o `"Regular"`) [3].
    *   Botón de acción rápida: Al lado de cada Winner Reel, un botón con el label: `"Multiplicar en SDC"` [1, 5, 8].
*   **Área de Configuración de Variaciones (Variations Builder):**
    *   Al hacer clic en "Multiplicar", se abre un editor interactivo que procesa el video en segundo plano [5].
    *   **Panel de edición visual:** Muestra el Reel crudo de un lado y las 5 opciones de variaciones seleccionables del otro [5]:
        *   *Checkbox "Corte Automático de Hook":* Opción para cortar el inicio en milisegundos [5].
        *   *Selector "Títulos de Hook Alternativos":* Un campo de texto donde la IA de EAF sugiere 3 hooks persuasivos basados en la biblioteca in-market del nicho de coaches/agencias (con inputs editables por el usuario) [5, 411, 415, 539].
        *   *Música de Fondo (Background Audio Library):* Un buscador de pistas musicales libres de copyright con categorización por vibe (ej. "Hype", "Lo-Fi", "Professional", "Minimalist") [5, 118].
        *   *Generador de CTA Final:* Selector de animaciones de salida (ej. superposición de botón virtual que apunta al link o texto con flecha indicadora) [5, 401].
    *   **Botón de Publicación:** `"Aprobar y Mandar a Sintonizar"` [852]. Al presionarlo, el software procesa el video en la nube, genera los 5 archivos independientes de video renderizado, y los inyecta en Meta Ads de forma automática [5, 610, 859].

### Pantalla 3: Meta Campaign Manager (Sintonizador de Pauta)
Control simplificado para crear las campañas en la API de Meta Ads de forma nativa desde la app [610, 859].

*   **Configuración del Sintonizador de Entrada (La Fábrica):**
    *   Selector de Cuenta Publicitaria de Meta Ads (vía token de conexión de Facebook Partner) [610, 859].
    *   Campo de Budget Diario por Ad Set (Predeterminado: \$5 USD) [531, 601, 603, 611].
    *   Módulo de segmentación simplificado (Selector de País, Edad, Intereses Clave del ICP como "Coaches", "Consultores", "Agencias de Marketing") [94, 601, 603, 605, 609].
    *   Área de preview de Ad Sets: Muestra una grilla interactiva que representa los conjuntos de anuncios generados, cada uno con su correspondiente miniatura de video y exclusión de 10s activada [601, 603, 611].
*   **Botón de un solo clic:** `"Activar Sintonizador de Entrada Nivel 1"` [610, 611, 859]. Ejecuta la inyección en lote del Cycle Bin 1 y su campaña espejo de Thruplays mediante la API de Meta [610, 611, 859].

### Pantalla 4: Bucle de Resonancia Panel (Control pre-llamada B-52)
La pantalla para calibrar el bombardeo psicológico y de omnipresencia antes de las llamadas de venta [99, 100, 101, 120].

*   **Sección de Configuración Técnica B-52 en Meta Ads:**
    *   Selector del público caliente activo de la ventana pre-llamada (ej. sincronizar con el pipeline de GHL cuando el estado pasa a "Llamada Agendada") [121, 124, 128].
    *   Lista de videos de la biblioteca asignados al B-52 [99, 100]. Debe permitir arrastrar y soltar de 20 a 50 Reels directamente desde la biblioteca cargada [118, 128, 129].
    *   El software muestra dinámicamente un indicador que confirma que la exclusión de 3 segundos de visualización está activa para cada video cargado [126, 127].
*   **Módulo de Configuración de Email de Frecuencia Crítica (Workflow de 6 Correos):**
    *   Editor de texto enriquecido (Rich Text Editor) para estructurar las 6 plantillas de emails que se enviarán secuencialmente durante el día previo a la llamada agendada [121, 140].
    *   Variables de personalización (Tags de fusión con GHL) integradas: `{{contact.first_name}}`, `{{meeting.time}}`, `{{meeting.day_of_week}}` [144, 582].
*   **Métricas del Bucle pre-llamada:**
    *   Muestra el "Show Rate de Llamadas" histórico y de los últimos 30 días en GHL (Objetivo: superar el 80%) [100, 101, 144, 145].
    *   Muestra la frecuencia promedio de pauta alcanzada por lead agendado activo (Objetivo: 15-20 exposiciones en las 72 hs previas) [100, 120, 128].

### Pantalla 5: Integraciones y Conexiones (Setup y Conexiones)
La pantalla donde el cliente sincroniza las herramientas que hacen viable el ecosistema automatizado de EAF [32, 91, 95, 860].

*   **Tarjeta Meta Ads / Business Manager:** Conexión vía OAuth 2.0. Permite seleccionar el Pixel correspondiente, la Cuenta Publicitaria de Ads y las Páginas de Facebook/Instagram de marca personal asociadas [151, 603, 610, 859].
*   **Tarjeta GoHighLevel (GHL):** Conexión mediante API Key para sincronizar el pipeline de CRM, los estados del contacto, los embudos clonados de GoHighLevel y el envío de emails y SMS [32, 51, 56, 582, 852].
*   **Tarjeta Hyros (Tracking Científico):** Campo para ingresar la API Key de Hyros (Cuenta de Atribución) para alimentar el dashboard de EAF con la métrica de atribución exacta "First Source" y "Last Source" mediante el parámetro `sl` de cada video [66, 67, 71, 73, 80].
*   **Tarjeta de Calendarios:** Integración bidireccional con Calendly o GHL Calendars para mapear de forma transparente el email de aplicación pre-llenado de Typeform y monitorear los bookings en tiempo real [32, 72, 76, 582].

---

## 🔗 4. Flujos de Trabajo (Workflows) y Conexión de Datos

### 4.1 Flujo de Datos 1: Del Winner Orgánico a la Inyección de Pauta (SDC & La Fábrica)
```text
1. Creador publica Reel en Instagram feed ➔ 
2. EAF Validation Engine detecta engagement por sobre la media (+1σ) en 24 hs ➔ 
3. El sistema activa notificación: "Nuevo Winner detectado" ➔ 
4. Usuario entra a EAF y hace clic en "Multiplicar" ➔ 
5. Backend ejecuta ffmpeg en segundo plano, generando 5 archivos de video alterados (hashes y hooks diferentes) con audio libre de derechos ➔ 
6. EAF realiza API Calls a Meta Ads API:
   a) Sube los 5 nuevos archivos de video a la librería de assets de Meta.
   b) Crea la campaña de Engagement ABO de $5 USD/día con un ad set por video, apuntado a la segmentación del comprador ideal.
   c) Configura de forma transparente la exclusión de 10 segundos para cada video.
   d) Duplica la campaña para optimización de Thruplays (15s).
``` [3, 5, 118, 531, 601, 603, 607, 610, 611, 859]

### 4.2 Flujo de Datos 2: De Lead Agendado a Bucle pre-llamada B-52
```text
1. Lead califica en Typeform y agenda horario en Calendly / GHL Calendar ➔ 
2. El sistema captura la URL original (parámetro de atribución Hyros ?sl=slug) y el email del contacto ➔ 
3. Calendly/GHL calendar ejecuta un webhook inmediato hacia EAF con el payload del contacto (nombre, email, teléfono, hora de llamada) ➔ 
4. El backend de EAF procesa el webhook y realiza dos API Calls inmediatas:
   a) Meta Ads API: Inyecta el email y teléfono del lead agendado en la Custom Audience dinámica de "Leads Agendados Activos - Próximas 72 Horas" (forzando al lead a entrar en la telaraña B-52).
   b) GHL Email API: Agenda los 6 emails diarios hiper-persuasivos previos a la llamada, calculando los intervalos lógicos según la hora agendada.
5. El lead ve entre 15 a 20 videos de objeciones resueltas nativamente en Instagram/FB en las horas previas a la reunión y lee los 6 correos de valor ➔ 
6. El lead se presenta a la llamada (show rate >80%) con su escepticismo destruido; el closer confirma la venta.
``` [71, 72, 76, 99, 100, 101, 107, 120, 121, 128, 140, 582, 649]

---

## 🔒 5. Requerimientos Técnicos No Funcionales

1.  **Seguridad de Token y API de Meta:** Los tokens de acceso de usuario OAuth de Meta Business Suite se almacenarán encriptados bajo protocolo AES-256 en la base de datos (Supabase / Postgres), con tareas Cron de backend dedicadas a refrescar automáticamente los tokens de larga duración de Meta antes de que expiren [94].
2.  **Frecuencia de Actualización de Audiencias de Meta Ads:** La API de Meta limita los lotes de subida a públicos personalizados. El backend de EAF debe consolidar y empujar las subidas de nuevos leads agendados (B-52) de forma síncrona en micro-lotes cada 5 minutos mediante una cola de mensajería (ej. BullMQ o RabbitMQ) para asegurar latencia ultra-baja en el calentamiento de las llamadas [121, 124].
3.  **Handoff de Video Procesing en la Nube:** Debido a que el renderizado de variaciones de video SDC (cambios de hooks, splicing, alteración de música) demanda alta carga de CPU, estas tareas deben delegarse asincrónicamente de forma serverless (ej. AWS Lambda o GCP Cloud Run ejecutando los bins de `ffmpeg`) para no bloquear el hilo de ejecución principal de la API de la plataforma SaaS [5, 81, 94].
4.  **Atribución Robusta de Embudo Continuo (Hyros Connection):** El software debe obligar al usuario a incluir la etiqueta `sl` en todos los links de anuncios y biografías [70, 78]. El script de captura integrado en la app de EAF debe inyectar este parámetro en el Typeform como campo oculto (`data-tf-hidden`) y reenviarlo en el redireccionamiento de la página de confirmación post-agenda de GHL para asegurar una atribución impecable en Hyros sin pérdida de IDs de clics nativos [71, 72, 73, 76].
