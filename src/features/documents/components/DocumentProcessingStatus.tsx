import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Document } from '@/api/types/documents'
import { cn } from '@/shared/lib/cn'

/** Segundos até `resumeAt`, atualizados a cada segundo; `null` fora de uma espera. */
function useSecondsUntil(resumeAt?: string | null) {
  const target = resumeAt ? new Date(resumeAt).getTime() : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (target === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [target])

  if (target === null) return null
  return Math.max(0, Math.ceil((target - now) / 1000))
}

export function isWaitingForQuota(document: Document) {
  return (
    document.status === 'processing' &&
    !!document.processing_resume_at &&
    new Date(document.processing_resume_at).getTime() > Date.now()
  )
}

function ProgressBar({ value, waiting }: { value: number; waiting: boolean }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          waiting ? 'animate-pulse bg-amber-400' : 'bg-primary-600',
        )}
        style={{ width: `${Math.max(value, 3)}%` }}
      />
    </div>
  )
}

/**
 * Acompanhamento do processamento em background: barra de progresso, etapa atual e,
 * durante uma espera pelo limite de uso do serviço externo de indexação, a contagem
 * até a retomada. `compact` é a versão da linha da tabela de materiais.
 */
export function DocumentProcessingStatus({
  document,
  compact = false,
}: {
  document: Document
  compact?: boolean
}) {
  const seconds = useSecondsUntil(document.processing_resume_at)
  if (document.status !== 'processing') return null

  const progress = document.processing_progress ?? 0
  const waiting = seconds !== null && seconds > 0

  if (compact) {
    return (
      <div className="mt-1.5 flex w-32 flex-col gap-1">
        <ProgressBar value={progress} waiting={waiting} />
        <span className="text-neutral-500 text-xs">
          {waiting ? `Aguardando serviço (${seconds}s)` : `${progress}%`}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-neutral-700">
          {document.processing_detail || 'Processando o material…'}
        </span>
        <span className="font-medium text-neutral-500 tabular-nums">{progress}%</span>
      </div>
      <ProgressBar value={progress} waiting={waiting} />
      {waiting && (
        <p className="flex items-center gap-1.5 text-amber-700 text-xs">
          <Clock size={14} />
          Retomando em {seconds}s. Pode sair desta página: o processamento continua no servidor.
        </p>
      )}
    </div>
  )
}
