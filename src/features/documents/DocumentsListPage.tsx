import { FolderOpen, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { isAdmin, isCoordinator } from '@/shared/auth/roles'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Input } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'
import { DocumentRow } from './components/DocumentRow'
import { DocumentUploadDialog } from './DocumentUploadDialog'
import { useDocumentsQuery } from './hooks/useDocuments'

export function DocumentsListPage() {
  const { user } = useAuth()
  const canManage = isAdmin(user) || isCoordinator(user)
  const { data, isLoading } = useDocumentsQuery()
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const documents = useMemo(() => {
    const results = data?.results ?? []
    if (!search.trim()) return results
    const term = search.trim().toLowerCase()
    return results.filter((doc) => doc.title.toLowerCase().includes(term))
  }, [data, search])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-neutral-900 text-xl">Materiais</h1>
        {canManage && (
          <Button onClick={() => setUploadOpen(true)}>
            <Upload size={16} />
            Enviar material
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Buscar por título..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum material encontrado"
          description={canManage ? 'Envie o primeiro material didático do curso.' : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-neutral-200 border-b bg-neutral-50 font-medium text-neutral-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enviado por</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} canManage={canManage} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage && <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />}
    </div>
  )
}
