import type { DocumentStatus } from '@/api/types/documents'
import { Badge } from '@/shared/ui/Badge'

const statusConfig: Record<
  DocumentStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  ready: { label: 'Pronto', tone: 'success' },
  processing: { label: 'Processando', tone: 'warning' },
  failed: { label: 'Falhou', tone: 'danger' },
}

export function DocumentStatusBadge({
  status,
  waiting = false,
}: {
  status: DocumentStatus
  /** Processamento pausado esperando o limite de uso do serviço externo. */
  waiting?: boolean
}) {
  const config = statusConfig[status]
  return <Badge tone={config.tone}>{waiting ? 'Aguardando serviço' : config.label}</Badge>
}
