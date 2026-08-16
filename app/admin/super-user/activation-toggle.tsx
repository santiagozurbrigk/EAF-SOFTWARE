'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { toggleOrgStatus } from './actions'

interface ActivationToggleProps {
  orgId: string
  currentStatus: string
}

export function ActivationToggle({ orgId, currentStatus }: ActivationToggleProps) {
  const isActive = currentStatus === 'active'
  const [optimistic, setOptimistic] = useState(isActive)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function toggle() {
    const newStatus = optimistic ? 'suspended' : 'active'
    setOptimistic(!optimistic)

    startTransition(async () => {
      const result = await toggleOrgStatus(orgId, newStatus)

      if (result.error) {
        // Revertir estado optimista si hubo error
        setOptimistic(optimistic)
        console.error('Error actualizando estado:', result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-xs text-muted-foreground">
        {optimistic ? 'Activa' : 'Inactiva'}
      </span>
      <Switch
        checked={optimistic}
        onCheckedChange={toggle}
        disabled={isPending}
        aria-label="Activar o suspender organización"
      />
    </div>
  )
}
