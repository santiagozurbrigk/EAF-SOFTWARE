# EAF Technical Background & Strategic Theory: The Developer's Guide to Evergreen De Alta Frecuencia

Este documento detalla la fundamentación científica, psicológica y matemática de las estrategias que componen el ecosistema de **EAF (Evergreen De Alta Frecuencia)** [860]. Su propósito es servir como el manual de referencia definitivo para que un equipo de desarrollo de software (o un agente de IA como Claude Code) comprenda el **porqué** detrás de cada módulo, panel y flujo del software de EAF, traduciendo los principios de marketing de respuesta directa y optimización de pauta digital en lógica de software [395, 508].

---

## 📡 SECCIÓN 1: Sintonizador de Entrada (La Fábrica)
### La Ciencia de la Subasta en Meta y el SDC (Sistema de Distribución de Contenido)

El **Sintonizador de Entrada** resuelve una ineficiencia matemática crítica en la adquisición de clientes en frío: **la pauta de respuesta directa pura dirigida a tráfico frío es prohibitivamente cara y poco predictiva** [156, 484, 602].

```
[Tráfico Frío de Redes] 
       │ 
       ▼ (CPM Alto: $1.00 - $2.00 por Landing Page View) ➔ [VSL Directo] ➔ Conversión Ineficiente (0.5% - 2%)
```

#### 1.1 La Mecánica de Subasta y las 52.000 Señales de Meta
Meta Ads funciona mediante un sistema de subasta en tiempo real que equilibra el valor para el anunciante con la experiencia del usuario dentro de la plataforma [603]. Meta rastrea más de **52.000 señales de comportamiento** por usuario (historial de clics, tiempo de permanencia en pantalla, interacciones sociales, etc.) [61, 594, 602]. 

Cuando un anunciante intenta forzar a un usuario frío a salir de la plataforma (redirigiéndolo a una landing page externa o VSL tradicional) [79, 148, 477], Meta penaliza la acción cobrando **CPMs (Costo por Mil Impresiones) extremadamente elevados** (promedio de $1.00 USD por clic de salida o visualización de página) [156, 485]. 

**La Fábrica / Sintonizador de Entrada** explota la infraestructura nativa de Meta de la siguiente manera:
*   **La Interacción Nativa es Barata:** Conseguir que un usuario mire un video vertical corto (Reel) o interactúe con una publicación dentro de la plataforma social cuesta entre **$0,01 y $0,0001 USD** [593, 602, 603, 610]. Tu presupuesto rinde entre **100 y 1000 veces más** en volumen de impactos nativos que en pauta de salida directa [472, 477, 485].
*   **El Premio de la Familiaridad en Subasta:** Meta premia la retención nativa [595]. Cuando un usuario ya consumió al menos **10 segundos** de tu contenido de marca, Meta lo registra en su historial de engagement [602, 607, 614]. En la subsiguiente subasta para anuncios de conversión (ventas), Meta asigna una puntuación de relevancia mucho más alta a tu cuenta para ese usuario específico, cobrándote **CPMs hasta un 50% más baratos** [592, 594, 600, 603].

#### 1.2 "Telaraña" (Web) vs. "Secuencia" (Sequence)
El software de EAF debe implementar este módulo bajo el concepto de **telaraña algorítmica**, no de secuencia lineal de adoctrinamiento [612, 613, 627].

*   **La ineficiencia de la secuencia humana:** Un humano no puede adivinar qué pieza de contenido va a resonar con un usuario frío específico en un momento determinado de su día [612]. Forzar una secuencia (ej. "el usuario debe ver el Video 1, luego el Video 2, luego el Video 3") limita el alcance y fatiga rápidamente la pauta [627].
*   **La solución de la telaraña:** El software distribuye de **5 a 12 videos validados** dentro de una única campaña de Interacción ABO ($5 USD/día por conjunto) apuntando exactamente a la misma audiencia fría consolidada [601, 603, 605, 609, 611]. Se le permite a la inteligencia de Meta elegir cuál video mostrarle a cada usuario según sus señales de comportamiento en tiempo real [612]. El objetivo no es que consuman un video específico, sino que **queden atrapados por cualquiera de las 5 a 12 variaciones**, depositándolos automáticamente en el *Espectro Tibio de Retargeting de 365 días* [598, 600, 607, 613].

#### 1.3 El Proceso del "Creative Squeeze" (SDC)
La materia prima de esta telaraña de bajo costo proviene del **Sistema de Distribución de Contenido (SDC)** [1, 859]. La mayoría de los creadores de contenido sufren la "rueda de hámster" del orgánico: usan cada idea una sola vez, suben el video, el algoritmo lo sepulta en 24 horas y sienten la presión psicológica de grabar algo nuevo al día siguiente [1].

El SDC de EAF opera bajo la siguiente tesis: **una idea validada es un activo, y un activo se exprime programáticamente** [1].
1.  **Validación Caliente en Feed:** El creador publica su Reel de forma normal en Instagram [3]. Su audiencia caliente (seguidores que ya lo conocen) es el filtro de validación más predictivo y honesto [3, 7]. Validar ideas con desconocidos (trials) es validar con el público incorrecto [3, 7].
2.  **Identificación del Winner:** El software monitorea el feed orgánico y detecta las piezas que superan un desvío estándar (+1σ) de interacción cualificada [1, 2].
3.  **Creative Squeeze (Variaciones de Edición):** La pieza ganadora es multiplicada en **5 a 10 variaciones** sin volver a grabar nada [5]. Las variables de edición que se alteran programáticamente para enganchar de forma fresca al algoritmo de Meta son [5]:
    *   **Corte de Hook:** Ajuste milimétrico del punto de inicio del video [5].
    *   **Superposición de Texto (Hook visual):** El titular sobreimpreso en los primeros 3 segundos (el factor que define si el video vive o muere) [5].
    *   **Pista de Audio:** Cambio de música de fondo (siempre libre de copyright para evitar bloqueos de pauta) [5, 118, 126].
    *   **Encuadres (Splicing):** Alternancia de planos y zooms [5].
    *   **CTA Dinámico:** Variación del llamado a la acción final [5].

---

## 🎛️ SECCIÓN 2: Filtro de Banda (Blackhole 2.0)
### La Indoctrinación Profunda y los Checkpoints de Lealtad

El **Filtro de Banda** resuelve el problema comercial clásico del tráfico evergreen tradicional: **"los leads llegan a la llamada de venta únicamente a educarse"** [176, 178, 181]. 

Cuando un prospecto ve un anuncio en frío, hace clic y cae directo en un VSL corto de respuesta directa [175], el escepticismo está en su pico histórico [124, 715]. El lead no tiene la madurez de creencia necesaria para comprar un servicio high-ticket ($1.000+ USD) [178]. En consecuencia, los closers de venta terminan desgastándose dando "mini-seminarios" educativos en lugar de cerrar acuerdos [176, 178].

```
[Tráfico Frío] ➔ Layer 1 (5 Videos Largos) ➔ (Consumo ≥ 25%) ➔ Layer 2 (5 Videos) ➔ (Consumo ≥ 25%) ➔ Layer 3 (5 Videos) ➔ Conversión
```

#### 2.1 El Funcionamiento de la Madriguera Multicapa (3 Layers)
El Filtro de Banda de EAF es un embudo secuencial programático de contenido de formato largo (10 a 30+ minutos de duración por video) [174, 175, 182] estructurado en 3 capas de exclusión estricta [175, 179]:

1.  **Capa 1 (Establecer la Tesis Macro):** 5 videos largos orientados a la oportunidad del mercado, reencuadrando la perspectiva del lead sobre su dolor de forma drástica [175, 183, 222].
2.  **Capa 2 (Demostrar el Mecanismo Único):** 5 videos largos detallando el "cómo lo hacemos", comparando tu metodología contra las ineficiencias del mercado tradicional [175, 179, 196]. Targetea únicamente a quienes vieron el **25%** de cualquier video de la Capa 1 [175, 179, 194].
3.  **Capa 3 (Manejo de Objeciones y Casos de Éxito):** 5 videos largos enfocados en prueba social hiperespecífica y demolición de objeciones lógicas [175, 179, 201]. Targetea únicamente a quienes vieron el **25%** de cualquier video de la Capa 2 [175, 179, 200].

#### 2.2 La Psicología del Umbral del 25% (Checkpoint de Lealtad)
En el contenido corto (reels), el scroll es incidental. En videos largos de 10 a 60 minutos, **el consumo del 25% es una decisión de inversión de tiempo sumamente activa** [198, 204]. Representa minutos reales de atención enfocada [176].

Al configurar el pixel y la API para mover al usuario al siguiente Layer solo cuando cruza el umbral del **25% de reproducción** [174, 175, 192], el software está utilizando el contenido como un **filtro de lealtad automatizado** [176, 182]. El lead que finalmente llega al anuncio de conversión (Capa 4) ya consumió horas de tu marca personal [175]. Ha visto tu expertise, tus casos y tu capacidad de resolver problemas en tiempo real [176]. Llega "adoctrinado" a la llamada [151, 203]. Su mentalidad cambia de *"explicame qué hacés"* a *"quiero tu solución, confirmemos detalles"* [176, 181].

#### 2.3 Lógica del Presupuesto Decreciente
El software debe reflejar en su panel la matemática del embudo que se angosta [179, 191]. El volumen de usuarios disminuye dramáticamente capa por capa, por lo que los presupuestos deben distribuirse de manera decreciente para asegurar eficiencia de caja y prevenir la inanición de los conjuntos avanzados [179, 191, 224]:
*   **Capa 1 (Frío):** ~50% - 60% del budget total para alimentar de forma constante el tanque de agua [191, 222, 224].
*   **Capa 2 (Tibio):** ~25% del budget [222, 224].
*   **Capa 3 (Más Tibio):** ~15% del budget [222, 224].
*   **Capa 4 (Conversión / Respuesta Directa):** ~10% del budget [222, 224].

---

## ⚡ SECCIÓN 3: Bucle de Resonancia (B:52)
### Omnipresencia Crítica en la Ventana de 72 Horas

El **Bucle de Resonancia** resuelve el mayor dolor de conversión de las llamadas agendadas en embudos evergreen: **el "ghosting", los no-shows y el enfriamiento del lead en la ventana pre-llamada** [100, 140].

```
[Llamada Agendada] ➔ [Gatillo de Ventana de 72 Horas] ➔ Programmatic Ads + 6 Emails/Día (Exclusión de 3s por Video) ➔ [Show Rate 80%+]
```

#### 3.1 La Ventana Crítica de 72 Horas
Cuando un lead agenda una llamada, experimenta un pico de motivación e interés [41, 140]. Sin embargo, la brecha de tiempo entre el agendamiento y la llamada real es una zona de peligro psicológico [140]. En esas horas se cuelan dudas, aparece el escepticismo, la vida cotidiana interfiere y el entusiasmo inicial se desploma, resultando en tasas de asistencia (show rate) de apenas el 35% - 40% [140, 667].

#### 3.2 Los Pilares de Mera Exposición y Sesgo de Familiaridad
La familiaridad es el motor psicológico de la confianza [103, 104, 141]. El Bucle de Resonancia utiliza el **Efecto de Mera Exposición** de Jeremy Haynes para bombardear al lead con un volumen masivo de impactos valiosos en la ventana pre-llamada, haciendo que tu marca se vuelva omnipresente en su feed [99, 100, 105].

El software debe estructurar el contenido de retargeting de alta frecuencia bajo **4 pilares críticos de demolición de objeciones** [109]:
1.  **Preguntas Core:** Cómo funciona el sistema, qué hace único a tu mecanismo [109, 110].
2.  **Preguntas de Segunda Capa:** El desglose hiperespecífico y técnico que satisface la curiosidad lógica profunda [109, 111, 112].
3.  **Objeciones Reales:** Precio, escepticismo sobre resultados previos y la inversión de tiempo requerida, atacados de forma directa o indirecta mediante historias [109, 113, 114].
4.  **Expectativas Reales:** Qué nivel de esfuerzo, plazos y compromiso real se le exige al cliente para tener éxito [109, 115, 116].

#### 3.3 El Hack de la Exclusión de 3 Segundos por Video
Para lograr una frecuencia de **15 a 20+ impactos dentro de las 72 horas** sin fatigar ni irritar al usuario, el software debe configurar una lógica de exclusión programática estricta a nivel técnico en la API de Meta Ads [100, 120, 128]:

*   Se crea un conjunto de anuncios (Ad Set) por cada video vertical (arsenal de 30 a 50 Reels) dentro de la campaña de interacción [118, 120, 127].
*   Cada conjunto de anuncios tiene configurado un público de exclusión personalizado que guarda a cualquiera que haya visto **3 segundos o más** de ESE video específico en los últimos 365 días [120, 126, 127].
*   **La Mecánica:** En el momento en que el lead ve 3 segundos del Video 1, entra automáticamente al público de exclusión de ese Ad Set específico [127]. Meta deja de mostrarle el Video 1 de inmediato y lo rota hacia el Video 2, y así sucesivamente [127, 128]. 

Esto garantiza que el lead reciba un flujo constante de contenido 100% fresco en cada impresión, eliminando el desperdicio de pauta y construyendo autoridad masiva a velocidad récord [127, 128, 129].

#### 3.4 Frecuencia de Email y Sincronización de Mensaje
El bombardeo de pauta se sincroniza en paralelo en la bandeja de entrada del lead enviando hasta **6 emails diarios** en intervalos estratégicos [121, 140, 144]. Estos correos no son recordatorios robóticos de *"tu llamada es a tal hora"*, sino extensiones lógicas de los 4 pilares de contenido del ad manager [140, 141, 143]. Si un lead lee un email sobre el pilar de "Precio", el algoritmo de retargeting en Meta debe priorizar mostrarle Reels de ese mismo pilar para lograr consistencia de marca absoluta [143].

---

## ☄️ SECCIÓN 4: Emisor de Pulsos (Lazarus)
### Activación de Leads Inactivos y la Psicología del Ghosting

El **Emisor de Pulsos** resuelve el problema de la **degradación de la base de datos** y el estancamiento de leads en el pipeline de ventas [678, 705].

```
[Lead Inactivo/Frío] ➔ Pulso de Valor (PDF de Prueba / P&L) ➔ Micro-compromiso ("Te lo paso por acá, dale?") ➔ Handoff
```

#### 4.1 La Psicología de "Life Happens" (Por qué los leads desaparecen)
La enorme mayoría de los vendedores asumen que cuando un lead deja de responder en DMs o WhatsApp, es porque "perdió interés" o "la oferta no le sirve" [660, 699]. Esto es un sesgo de atribución egoísta [659, 698]. 

La realidad psicológica es más simple: **la curiosidad inicial tiene fecha de vencimiento y compite contra el caos de la vida cotidiana del prospecto** [700, 705]. El lead puede estar 100% calificado financieramente, pero la vida interfiere (un problema familiar, urgencias del negocio, cansancio) y tu oferta simplemente desciende en su orden de prioridades diarias [665, 705]. 

El trabajo del Emisor de Pulsos y de la prospección manual en EAF no es "perseguir" con insistencia comercial, sino **reencender sistemáticamente el interés mediante valor sin fricción** [670, 702, 705].

#### 4.2 La Ineficiencia del "Seguimiento Egoísta"
El 99% de las marcas cometen el error de hacer un seguimiento egoísta y unilateral, mandando mensajes que solo buscan el beneficio de la empresa [681, 715]:
*   ❌ *"¿Pudiste ver el VSL?"* [673, 707]
*   ❌ *"¿Seguís interesado?"* [681, 715]
*   ❌ *"Tengo 15 minutos libres hoy para llamarte."* [681, 715]

Estos mensajes disparan las barreras defensivas del lead porque percibe que el vendedor solo quiere su tarjeta de crédito [711].

#### 4.3 Liderar con Valor y la Estructura del "Anzuelo de Conversión"
Para reactivar la señal de compra, EAF lidera con valor e implementa el **Anzuelo de Conversión** [672, 688, 718]:

1.  **Ofrecer Recursos de Valor Crudo:** En lugar de pedir una llamada, le ofrecés de forma manual o automatizada dos recursos tácticos de alto impacto que resuelven una ineficiencia real de su negocio (ej. El Blueprint de SDC y el Manual de La Fábrica) [658, 673, 702].
2.  **Forzar la Elección de Canal:** Le das al usuario el control absoluto de la interacción: *"Decime cuál preferís que te mande y si te queda mejor por acá o por mail"* [664, 673]. Esto remueve el miedo al pitch de ventas telefónico y genera un "sí" temprano de baja fricción [658, 686, 711].
3.  **El Multiplicador de Assets (Caso Amazon):** Cuando el equipo de ventas tiene activos de valor indiscutibles para mandar por texto (como la compilación de estados de resultados financieros - P&L - reales del caso de estudio de Amazon), **la tasa de respuesta de leads fríos sube del 37% al 53%** y el show rate de llamadas agendadas escala de golpe del **40% al 67%** [678, 698, 704, 705]. El valor real desarma el escepticismo de raíz [678, 704].

#### 4.4 El Uso de "Pattern Interrupts" Psicológicos
Cuando el lead entra en ghosting profundo tras haber mostrado interés inicial, el software debe guiar al setter o automatizar el envío de ganchos de interrupción de patrón psicológico [682, 713]:

*   **El Gancho "Todos estamos ocupados":** Desactiva la culpa de la colgada de forma empática y amigable: *"Sé que andamos todos a mil con mil cosas, así que cero drama por la colgada..."* [672, 680, 714].
*   **El Gancho "Banderas Rojas" (Red Flags):** Usa la psicología inversa para forzar la objeción real de compra [682, 713]. Al poner un estándar de transparencia y profesionalismo en la mesa, el lead calificado se ve obligado a responder para defender su estatus:
    > *"Me preocupa un poco cuando un cliente potencial no responde preguntas simples, se siente como una bandera roja 🚩 Nuestros mejores socios son súper transparentes y nos dan feedback rápido. Si vamos a hacer algo grande juntos, te necesito adentro al 100%. ¿Sigue el interés o lo dejamos para más adelante?"* [674, 682, 713]

Este pulso técnico reactiva la conversación y permite al closer resolver la verdadera traba comercial [683, 713].

---

## 🏗️ SECCIÓN 5: Resumen Arquitectónico para Claude Code

Para guiar el desarrollo de software del equipo o del agente de codificación de Claude, consolidamos el mapa de flujos de datos y la correlación teórica de cada pantalla de la aplicación:

```
                  [ ENGINE DE VIDEO DE SDC ]
                             │ (Monitorea Feed Orgánico e Identifica Ganadores)
                             ▼
               📡 [ SINTONIZADOR DE ENTRADA ] (La Fábrica)
                             │ Configura ABO Campañas de Interacción nativas de Meta
                             │ Acumula audiencias por 365 días en un Megabucket Warm
                             ▼
               🎛️ [ FILTRO DE BANDA ] (Blackhole 2.0)
                             │ Secuencia de 3 Capas de Videos Largos en Meta
                             │ Trigger automático de Layer si visualización ≥ 25%
                             ▼
         [ EMBUDO DE CONVERSIÓN EN GHL CON TRACKING HYROS ]
                             │ Sincroniza agenda en Calendly y pre-llena email
                             ▼
               ⚡ [ BUCLE DE RESONANCIA ] (B:52)
                             │ Gatillo dinámico de Retargeting en Meta pre-llamada
                             │ Exclusión estricta de 3 segundos por video en Ad Sets
                             ▼
                 [ TRANSACCIÓN HIGH-TICKET / EQUITY ]
                             ▲
                             │ (En caso de silencio o base de datos fría)
               ☄️ [ EMISOR DE PULSOS ] (Lazarus)
                               Outreach manual con PDF de P&L, ganchos y setters
```

### Tabla de Equivalencia Técnica: Dashboard vs. Teoría

| Nombre del Panel / Pantalla | Módulo de Estrategia EAF | KPI Teórico de Negocio | Función del Algoritmo en Backend |
| :--- | :--- | :--- | :--- |
| **Multiplier Screen (SDC Engine)** | 📡 Sintonizador de Entrada | CPM Máximo de Entrada [603] / Costo por Sintonía [852] | Lee métricas de la API de Meta; detecta "Winners" orgánicos en Instagram y genera variaciones de Hook/Audio para ABO [1, 5]. |
| **Warm Bucket Manager** | 📡 Sintonizador de Entrada | Tamaño del Espectro de 365 Días [607] / Retención Warm [172] | Consume señales de píxel, formularios y engagement social nativo de Facebook/Instagram para unificarlos en una custom audience [607, 614]. |
| **Bandwidth Gatekeeper** | 🎛️ Filtro de Banda | Costo por Watcher Calificado (25% View) [226] / Tasa de Drop-off [226] | Programa las exclusiones de 10 segundos y gestiona los triggers secuenciales automáticos basados en consumo de video largo [175, 179]. |
| **Resonance Controller** | ⚡ Bucle de Resonancia | Show Rate de Llamadas (>80%) [630] / Frecuencia en vivo en 72hs [100] | Conecta con Calendly y la subcuenta GHL; inyecta leads agendados en la audiencia B-52 de Meta con exclusión programática de 3s [120, 126, 127]. |
| **Pulse Activator (Setter UI)** | ☄️ Emisor de Pulsos | Tasa de Respuesta de Lead Frío (>50%) [678] / Reactivación [682] | Proporciona acceso directo al PDF unificado de prueba del cliente e implementa plantillas de DMs basadas en ganchos psicológicos [678, 682]. |