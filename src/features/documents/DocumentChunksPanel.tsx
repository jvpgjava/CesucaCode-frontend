import { FileText } from 'lucide-react'
import { Card } from '@/shared/ui/Card'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Spinner } from '@/shared/ui/Spinner'
import { useChunksQuery } from './hooks/useDocuments'

export function DocumentChunksPanel({
  documentId,
  isDocumentProcessing,
}: {
  documentId: number
  isDocumentProcessing?: boolean
}) {
  const { data, isLoading } = useChunksQuery(documentId, isDocumentProcessing)

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
      <h2 className="font-semibold text-neutral-900 text-sm">
        Trechos extraídos ({data?.count ?? 0})
      </h2>
      {chunks.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum trecho extraído ainda." />
      ) : (
        <div className="flex flex-col gap-2">
          {chunks.map((chunk) => (
            <Card key={chunk.id} className="p-4">
              <p className="mb-1 font-medium text-neutral-400 text-xs">#{chunk.index}</p>
              <p className="whitespace-pre-wrap text-neutral-700 text-sm">{chunk.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
