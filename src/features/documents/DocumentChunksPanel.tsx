import { FileText } from 'lucide-react'
import { Spinner } from '@/shared/ui/Spinner'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Card } from '@/shared/ui/Card'
import { useChunksQuery } from './hooks/useDocuments'

export function DocumentChunksPanel({ documentId }: { documentId: number }) {
  const { data, isLoading } = useChunksQuery(documentId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  const chunks = data?.results ?? []

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-900">
        Trechos extraídos ({data?.count ?? 0})
      </h2>
      {chunks.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum trecho extraído ainda." />
      ) : (
        <div className="flex flex-col gap-2">
          {chunks.map((chunk) => (
            <Card key={chunk.id} className="p-4">
              <p className="mb-1 text-xs font-medium text-neutral-400">#{chunk.index}</p>
              <p className="text-sm whitespace-pre-wrap text-neutral-700">{chunk.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
