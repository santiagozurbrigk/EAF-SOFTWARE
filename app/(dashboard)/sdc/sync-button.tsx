'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'

interface SyncResult {
  synced:  number
  winners: number
  message: string
}

export function SyncButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<SyncResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  async function handleSync() {
    setStatus('loading')
    setResult(null)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/sdc/sync', { method: 'POST' })
      const data = await res.json() as SyncResult & { error?: string }

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? 'Error desconocido al sincronizar.')
        setStatus('error')
        return
      }

      setResult(data)
      setStatus('success')
      router.refresh()

      // Resetear a idle después de 4 segundos
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setErrorMsg('Error de red al sincronizar.')
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleSync}
        disabled={status === 'loading'}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} />
        {status === 'loading' ? 'Sincronizando…' : 'Sincronizar desde Instagram'}
      </Button>

      {status === 'success' && result && (
        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
          <Check className="h-3 w-3" />
          {result.message}
        </p>
      )}
      {status === 'error' && errorMsg && (
        <p className="text-[11px] text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </p>
      )}
    </div>
  )
}
