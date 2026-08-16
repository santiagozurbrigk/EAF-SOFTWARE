# EAF — Developer's Blueprint & Technical Appendix
**EAF — Evergreen De Alta Frecuencia**

Este documento es un anexo técnico complementario diseñado específicamente para ser procesado por **Claude Code** u otros agentes de desarrollo de software. Traduce los fundamentos estratégicos, la nomenclatura de señales y las pantallas del PRD en especificaciones de bajo nivel, esquemas de bases de datos, payloads de integración y flujos de procesamiento de código.

---

## 1. Modelo de Datos Relacional (PostgreSQL Schema)

Para que el software pueda trackear las campañas, las variaciones de SDC, las audiencias y las integraciones de GHL/Calendly de forma consistente, Claude Code necesita implementar este esquema relacional básico:

```sql
-- Habilitar extensión UUID para identificadores seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios (Dueños de negocio / Clientes de EAF)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Cuentas de Integración (OAuth Tokens de Meta y GHL)
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'meta' o 'gohighlevel'
    account_id VARCHAR(255) NOT NULL, -- ID externo de Meta Ad Account o GHL Subaccount
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Videos Maestro (Materia prima ya validada del Feed)
CREATE TABLE master_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instagram_media_id VARCHAR(255) UNIQUE, -- ID del post orgánico original
    raw_video_url TEXT NOT NULL,
    organic_views INT DEFAULT 0,
    organic_engagement_rate NUMERIC(5, 2),
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Variaciones Programáticas (Generadas por el Multiplier Engine)
CREATE TABLE video_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_video_id UUID REFERENCES master_videos(id) ON DELETE CASCADE,
    variant_number INT NOT NULL, -- 1 a 5
    hook_text TEXT,
    font_style VARCHAR(100),
    audio_track_url TEXT,
    processed_video_url TEXT, -- Archivo final renderizado listo para Meta
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Campañas de EAF (Cycle Bins / Filtros / Bucles)
CREATE TABLE eaf_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meta_campaign_id VARCHAR(255) UNIQUE, -- ID real en Meta Ads
    name VARCHAR(255) NOT NULL,
    system_type VARCHAR(50) NOT NULL, -- 'sintonizador', 'filtro_banda', 'bucle_resonancia', 'emisor_pulsos'
    budget NUMERIC(10, 2) NOT NULL,
    budget_type VARCHAR(10) DEFAULT 'ABO', -- 'ABO' o 'CBO'
    status VARCHAR(50) DEFAULT 'paused',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Conjuntos de Anuncios (Ad Sets con Exclusión de 10s/3s)
CREATE TABLE eaf_ad_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES eaf_campaigns(id) ON DELETE CASCADE,
    meta_adset_id VARCHAR(255) UNIQUE,
    video_variant_id UUID REFERENCES video_variants(id) ON DELETE SET NULL,
    exclusion_audience_id VARCHAR(255), -- ID de Meta Custom Audience (3s o 10s view)
    target_cold_interests JSONB, -- Segmentación fría Broad/Intereses
    status VARCHAR(50) DEFAULT 'paused',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Motor de Edición de Video (FFmpeg Specs para Claude Code)

Para el **Multiplier Engine (Squeeze)**, el backend debe procesar programáticamente el video maestro. Aquí tenés los comandos exactos de **FFmpeg** que Claude Code debe integrar en Node.js, Python o entornos serverless para generar las variaciones sin intervención humana:

### Variación 1: Corte de 1 segundo de inicio (Direct Start) y cambio de velocidad sutil
*   **Comportamiento técnico:** Corta el primer segundo del video original para remover pausas y acelera la imagen un 3% para aumentar la retención inicial.
*   **Comando FFmpeg:**
    ```bash
    ffmpeg -ss 00:00:01 -i input_winner.mp4 -vf "setpts=0.97*PTS" -af "atempo=1.03" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k output_var1.mp4
    ```

### Variación 2: Inyección de Hook de Texto Programático (Dynamic Text Overlay)
*   **Comportamiento técnico:** Superpone un cuadro de texto de alto contraste en los primeros 3 segundos con tipografía grande (tipo Sans-Bold), simulando el gancho in-market.
*   **Comando FFmpeg:**
    ```bash
    ffmpeg -i input_winner.mp4 -vf "drawtext=fontfile=/path/to/sans-bold.ttf:text='ESTA ESTRATEGIA BAJA TU CPM A LA MITAD':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.8:boxborderw=15:x=(w-text_w)/2:y=(h-text_h)/4:enable='between(t,0,3)'" -c:a copy output_var2.mp4
    ```

### Variación 3: Sustitución de Audio de Fondo (Copyright-Free Music Swap)
*   **Comportamiento técnico:** Remueve la pista de audio musical original de fondo, conserva el voiceover (voz del creador) en el canal central y mezcla una pista de música libre de derechos (pautable en Meta) a volumen bajo (-18dB).
*   **Comando FFmpeg:**
    ```bash
    ffmpeg -i input_winner.mp4 -i royalty_free_beat.mp3 -filter_complex "[0:a]volume=1.0[vocal];[1:a]volume=0.12[bg_music];[vocal][bg_music]amix=inputs=2:duration=first[out]" -map 0:v -map "[out]" -c:v copy -c:a aac output_var3.mp4
    ```

---

## 3. Integración con Meta Ads API

Para implementar la **Telaraña de Sintonía** (el sintonizador de entrada y el bucle de resonancia) con exclusiones de video dinámicas, Claude Code debe ejecutar llamadas programáticas estructuradas a la API de Graph de Meta.

### Flujo de Llamadas API de Meta Ads:
1.  **Paso 1: Subir el video procesado como Ad Video:**
    ```http
    POST https://graph.facebook.com/v20.0/act_<AD_ACCOUNT_ID>/advideos
    Headers: Authorization: Bearer <ACCESS_TOKEN>
    Multipart Form Data:
      file: @/path/to/processed_var.mp4
    ```
    *Response:* `{"id": "<META_VIDEO_ID>"}`

2.  **Paso 2: Crear el público de exclusión personalizado (3 segundos o 10 segundos):**
    ```http
    POST https://graph.facebook.com/v20.0/act_<AD_ACCOUNT_ID>/customaudiences
    Headers: Authorization: Bearer <ACCESS_TOKEN>
    Content-Type: application/json
    {
        "name": "[EAF] Exclusión 3s - Variación UUID",
        "subtype": "VIDEO",
        "description": "Exclusión automática EAF para rotación forzada",
        "rule": {
            "inclusions": {
                "operator": "or",
                "rules": [
                    {
                        "event_sources": [{"type": "video", "id": "<META_VIDEO_ID>"}],
                        "retention_seconds": 31536000, -- 365 días
                        "filter": {
                            "operator": "and",
                            "rules": [{
                                "field": "video_view_length",
                                "operator": "greater_than_or_equal",
                                "value": 3 -- 3 segundos (B-52) o 10 segundos (SDC)
                            }]
                        }
                    }
                ]
            }
        }
    }
    ```
    *Response:* `{"id": "<EXCLUSION_AUDIENCE_ID>"}`

3.  **Paso 3: Crear el Ad Set Broad con exclusión aplicada:**
    ```http
    POST https://graph.facebook.com/v20.0/act_<AD_ACCOUNT_ID>/adsets
    Headers: Authorization: Bearer <ACCESS_TOKEN>
    Content-Type: application/json
    {
        "name": "📡 Sintonizador - Ad Set Video UUID",
        "campaign_id": "<META_CAMPAIGN_ID>",
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "THRUPLAY",
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
        "daily_budget": 500, -- $5.00 USD (expresado en centavos: 500)
        "targeting": {
            "geo_locations": {"countries": ["US", "MX", "ES", "AR"]},
            "age_min": 25,
            "age_max": 55,
            "excluded_custom_audiences": [{"id": "<EXCLUSION_AUDIENCE_ID>"}]
        },
        "status": "ACTIVE"
    }
    ```

---

## 4. Webhooks de Sincronización GHL & Calendly (Ingesta de Leads)

Para el **Bucle de Resonancia (B:52)**, el software debe suscribirse a webhooks que detecten agendamientos en tiempo real y muevan inmediatamente el email del lead a la audiencia personalizada de Meta de 72 horas.

### Payload de Entrada de GHL (Webhook Event: `appointment_status_update`)
```json
{
  "type": "AppointmentStatusUpdate",
  "locationId": "ghl_location_uuid_999",
  "event_id": "evt_01jk98as7a",
  "status": "booked",
  "appointment": {
    "id": "appt_38402a7s89",
    "calendarId": "cal_evergreen_sales_777",
    "selectedTimezone": "America/Argentina/Buenos_Aires",
    "startTime": "2026-08-18T14:00:00-03:00",
    "endTime": "2026-08-18T14:45:00-03:00",
    "createdAt": "2026-08-15T20:30:00-03:00"
  },
  "contact": {
    "id": "con_812a39df8a",
    "firstName": "Julián",
    "lastName": "Pérez",
    "email": "julian.perez@coachgrowth.com",
    "phone": "+5491155551234",
    "customFields": [
      {
        "id": "field_calificacion_liquida",
        "field_name": "¿Tenés capital para pauta?",
        "value": "Sí, cuento con $1,000 USD/mes"
      }
    ]
  }
}
```

### Acción del Backend (Node.js/Python Handler):
Al recibir este payload con `status: "booked"`, el software de EAF ejecuta en segundo plano un push por API a la audiencia de retargeting de Meta (`Bucle Resonancia 72 Horas`):

```http
POST https://graph.facebook.com/v20.0/<RESONANCE_AUDIENCE_ID>/users
Headers: Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
{
    "payload": {
        "schema": ["EMAIL", "PHONE", "FN", "LN"],
        "data": [
            [
                "c09b83f3e098ad80f2d93e8e89ad09f3e", -- SHA256 de "julian.perez@coachgrowth.com"
                "a192837f81a3d09a80e817fa9e8a83d0a", -- SHA256 de "+5491155551234"
                "9e102f3a8b09ad80e0a817fa2b0a82d09", -- SHA256 de "julian"
                "89ae0a98f12a3d09a812efaa28d09f3ea"  -- SHA256 de "perez"
            ]
        ]
    }
}
```

---

## 5. Manejo de Limitaciones de API (API Rate Limits & Throttling)

Meta y GHL imponen límites estrictos. Para evitar que la cuenta del cliente quede bloqueada, Claude Code debe implementar la siguiente arquitectura de control:

1.  **Queue Pattern con Redis (BullMQ / Celery):** Nunca hacer llamadas a la API de Meta directamente en el hilo de respuesta de la UI. Encolar los trabajos de creación de ad sets, subida de videos y actualización de audiencias.
2.  **Meta Ads Rate Limit Tracking:** Meta devuelve en los headers el porcentaje de consumo del límite (`x-business-use-case-usage`). El backend debe leer estos headers y ralentizar dinámicamente las llamadas si superan el 85% de capacidad:
    ```javascript
    const usage = response.headers['x-business-use-case-usage'];
    if (usage && JSON.parse(usage).ad_account_rate_limiting_status > 85) {
        await delay(60000); // Esperar 1 minuto antes de procesar el siguiente lote de la cola
    }
    ```
3.  **Meta Token Refresh:** Configurar un Cron Job diario para verificar la validez de los tokens de larga duración de Meta (60 días) y alertar al usuario en el Home Dashboard si requieren re-autenticación.
