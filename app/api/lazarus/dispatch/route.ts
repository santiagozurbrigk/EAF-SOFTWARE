import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendGHLMessage } from '@/lib/ghl/client'

/**
 * POST /api/lazarus/dispatch
 *
 * Despacha un pulso de Lazarus: envía el mensaje de reactivación
 * al lead via GHL SMS y marca el pulso como 'sent' en Supabase.
 *
 * Body: { pulse_id: string, message: string }
 *
 * 🔑 Para probar en flujo real: requiere ghl_access_token guardado en la org.
 *    Conectar en /integrations → botón "Conectar GHL".
 *    El contacto debe existir en GHL con el mismo lead_id (contact_id).
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json() as { pulse_id?: string; message?: string }
  const { pulse_id, message } = body

  if (!pulse_id || !message) {
    return NextResponse.json({ error: 'pulse_id y message son requeridos.' }, { status: 400 })
  }

  const service = createServiceClient()

  // 1. Obtener el pulso y verificar que pertenece a la org del usuario
  const { data: pulse, error: pulseError } = await service
    .from('lazarus_pulses')
    .select('id, lead_id, lead_name, lead_phone, lead_email, status, campaign_id, lazarus_campaigns!inner(organization_id)')
    .eq('id', pulse_id)
    .single()

  if (pulseError || !pulse) {
    return NextResponse.json({ error: 'Pulso no encontrado.' }, { status: 404 })
  }

  if (pulse.status !== 'queued') {
    return NextResponse.json(
      { error: `El pulso ya fue procesado (estado actual: ${pulse.status}).` },
      { status: 409 }
    )
  }

  // 2. Obtener la org del usuario y verificar que coincide con la del pulso
  const { data: org } = await service
    .from('organizations')
    .select('id, ghl_access_token, ghl_location_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  const campaign = pulse.lazarus_campaigns as unknown as { organization_id: string }
  if (!org || org.id !== campaign.organization_id) {
    return NextResponse.json({ error: 'Sin permisos para este pulso.' }, { status: 403 })
  }

  if (!org.ghl_access_token || !org.ghl_location_id) {
    return NextResponse.json(
      { error: 'GHL no conectado — ve a Integraciones para conectar tu cuenta.' },
      { status: 400 }
    )
  }

  // 3. Enviar mensaje via GHL API
  const result = await sendGHLMessage(
    org.id,
    pulse.lead_id,
    org.ghl_location_id,
    message
  )

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  // 4. Actualizar el estado del pulso en Supabase
  const { error: updateError } = await service
    .from('lazarus_pulses')
    .update({
      status:  'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', pulse_id)

  if (updateError) {
    console.error('[/api/lazarus/dispatch] Update error:', updateError.message)
    // El mensaje se envió pero no se pudo actualizar el estado — loguear para revisión manual
    return NextResponse.json(
      { success: true, warning: 'Mensaje enviado pero hubo un error al actualizar el estado en BD.' },
      { status: 200 }
    )
  }

  return NextResponse.json({ success: true, messageId: result.messageId })
}
