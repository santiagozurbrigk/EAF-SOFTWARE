'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleWinner } from './actions'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WinnerToggleProps {
  videoId:   string
  isWinner:  boolean
}

export function WinnerToggle({ videoId, isWinner }: WinnerToggleProps) {
  const [optimistic, setOptimistic] = useState(isWinner)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggle() {
    const next = !optimistic
    setOptimistic(next)
    startTransition(async () => {
      const result = await toggleWinner(videoId, next)
      if (result.error) {
        setOptimistic(optimistic) // revertir
        console.error('[WinnerToggle] Error:', result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <Button
      size="sm"
      variant={optimistic ? 'sintonizador' : 'outline'}
      className="gap-1.5 text-xs"
      onClick={toggle}
      disabled={isPending}
      title={optimistic ? 'Quitar marca de Winner' : 'Marcar como Winner'}
    >
      <Star className={`h-3 w-3 ${optimistic ? 'fill-current' : ''}`} />
      {optimistic ? 'WINNER' : 'Marcar Winner'}
    </Button>
  )
}
