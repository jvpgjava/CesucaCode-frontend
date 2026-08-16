import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Download, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import {
  useDeleteDocumentMutation,
  useDocumentQuery,
  useReprocessDocumentMutation,
} from './hooks/useDocuments'
import { DocumentStatusBadge } from './components/DocumentStatusBadge'
import { DocumentChunksPanel } from './DocumentChunksPanel'
import { formatDate } from '@/shared/lib/formatDate'

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const documentId = Number(id)
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: document, isLoading } = useDocumentQuery(documentId)
  const deleteMutation = useDeleteDocumentMutation()
  const reprocessMutation = useReprocessDocumentMutation(documentId)

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(documentId)
    navigate('/materiais', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} />
      </div>
    )
  }

  if (!document) {
    return <p className="text-neutral-500">Material não encontrado.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{document.title}</h1>
          <p className="text-sm text-neutral-500">
            {document.course.name} · Enviado por {document.uploaded_by_name} em{' '}
            {formatDate(document.created_at)}
          </p>
        </div>
        <DocumentStatusBadge status={document.status} />
      </div>

      {document.status === 'failed' && document.processing_error && (
        <Card className="border-red-200 bg-red-50 text-sm text-red-700">
          {document.processing_error}
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <a href={document.file} target="_blank" rel="noreferrer">
          <Button variant="secondary">
            <Download size={16} />
            Baixar arquivo
          </Button>
        </a>
        <Button
          variant="secondary"
          onClick={() => reprocessMutation.mutate()}
          disabled={reprocessMutation.isPending}
        >
          <RefreshCw size={16} />
          {reprocessMutation.isPending ? 'Reprocessando...' : 'Reprocessar'}
        </Button>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={16} />
          Excluir
        </Button>
      </div>

      <DocumentChunksPanel documentId={documentId} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent
          title="Excluir material"
          description={`Tem certeza que quer excluir "${document.title}"? Essa ação não pode ser desfeita.`}
        >
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
