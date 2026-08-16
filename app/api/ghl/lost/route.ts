import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/ghl/lost
 *
 * Webhook de GoHighLevel — se dispara cuando un contacto
 * es etiquetado como "Fantasmeó" o "No-show" en el pipeline de GHL.
 *
 * Acciona el módulo Lazarus: agenda un pulso de reactivación
 * con delay preventivo de 48 horas.
 */
export async function POST(req: Request) {
  try {
    // Validar webhook secret de GHL
    const signature = req.headers.get('x-ghl-signature')
    const expectedSecret = process.env.GHL_WEBHOOK_SECRET

    if (!expectedSecret || signature !== expectedSecret) {
      return NextResponse.json({ error: 'Firma de webhook inválida' }, { status: 401 })
    }

    const payload = await req.json() as {
      contact_id: string
      email: string
      first_name?: string
      phone?: string
      location_id: string
    }

    const { contact_id, email, first_name, phone, location_id } = payload

    if (!email || !location_id || !contact_id) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes: email, location_id, contact_id' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any

    // 1. Buscar la organización que corresponde a esta subcuenta de GHL
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, status')
      .eq('ghl_location_id', location_id)
      .single() as { data: { id: string; status: string } | null; error: unknown }

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organización no encontrada para este GHL location_id' },
        { status: 404 }
      )
    }

    if (org.status !== 'active') {
      return NextResponse.json(
        { error: 'Organización inactiva — Lazarus no puede operar' },
        { status: 403 }
      )
    }

    // 2. Verificar que el lead no esté ya en un ciclo Lazarus activo
    const { data: activePulse } = await supabase
      .from('lazarus_pulses')
      .select('id')
      .eq('lead_email', email)
      .eq('status', 'queued')
      .maybeSingle() as { data: { id: string } | null }

    if (activePulse) {
      return NextResponse.json({
        message: 'El lead ya está en cola de Lazarus — sin duplicado.',
      })
    }

    // 3. Buscar o crear una campaña Lazarus activa para esta org
    let { data: campaign } = await supabase
      .from('lazarus_campaigns')
      .select('id')
      .eq('organization_id', org.id)
      .eq('status', true)
      .maybeSingle() as { data: { id: string } | null }

    if (!campaign) {
      const { data: newCampaign, error: campaignError } = await supabase
        .from('lazarus_campaigns')
        .insert({ organization_id: org.id, name: 'Campaña Lazarus Principal', status: true })
        .select('id')
        .single() as { data: { id: string } | null; error: unknown }

      if (campaignError) throw campaignError
      campaign = newCampaign
    }

    // 4. Agendar el pulso con delay de 48 horas
    const scheduledFor = new Date()
    scheduledFor.setHours(scheduledFor.getHours() + 48)

    const { error: insertError } = await supabase
      .from('lazarus_pulses')
      .insert({
        campaign_id:   campaign!.id,
        lead_id:       contact_id,
        lead_name:     first_name ?? 'Contacto',
        lead_phone:    phone ?? null,
        lead_email:    email,
        asset_offered: 'pdf_case_study',
        status:        'queued',
        scheduled_for: scheduledFor.toISOString(),
      })

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: `Lead ${email} agendado en Lazarus para ${scheduledFor.toISOString()}.`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno'
    console.error('[/api/ghl/lost] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
