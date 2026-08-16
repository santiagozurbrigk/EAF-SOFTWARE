'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react'

interface DispatchButtonProps {
  pulseId:      string
  leadName:     string
  suggestedMsg: string
}

export function DispatchButton({ pulseId, leadName, suggestedMsg }: DispatchButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  async function handleDispatch() {
    setStatus('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/lazarus/dispatch', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pulse_id: pulseId, message: suggestedMsg }),
      })
      const data = await res.json() as { success?: boolean; error?: string; warning?: string }

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? 'Error al despachar el pulso.')
        setStatus('error')
        return
      }

      setStatus('success')
      router.refresh()
    } catch {
      setErrorMsg('Error de red al despachar.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
        <Check className="h-3.5 w-3.5" />
        Enviado a {leadName.split(' ')[0]}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
        onClick={handleDispatch}
        disabled={status === 'loading'}
      >
        {status === 'loading'
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <Send className="h-3.5 w-3.5" />}
        {status === 'loading' ? 'Enviando…' : 'Enviar vía GHL'}
      </Button>
      {status === 'error' && errorMsg && (
        <p className="text-[10px] text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMsg}
        </p>
      )}
    </div>
  )
}
