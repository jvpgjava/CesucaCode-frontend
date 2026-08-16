import { Badge } from '@/shared/ui/Badge'
import type { DocumentStatus } from '@/api/types/documents'

const statusConfig: Record<
  DocumentStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  ready: { label: 'Pronto', tone: 'success' },
  processing: { label: 'Processando', tone: 'warning' },
  failed: { label: 'Falhou', tone: 'danger' },
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status]
  return <Badge tone={config.tone}>{config.label}</Badge>
}
