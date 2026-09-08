import { useState } from 'react'
import { ApiError } from '@/api/client'
import type { Document } from '@/api/types/documents'
import { useCoursesQuery } from '@/shared/hooks/useCourses'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { useUpdateDocumentMutation } from './hooks/useDocuments'

interface UpdateErrorBody {
  title?: string[]
  course?: string[]
}

export function DocumentEditDialog({
  document,
  open,
  onOpenChange,
}: {
  document: Document
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: courses } = useCoursesQuery()
  const updateMutation = useUpdateDocumentMutation(document.id)
  const [title, setTitle] = useState(document.title)
  const [course, setCourse] = useState(document.course.code)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(document.title)
      setCourse(document.course.code)
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      await updateMutation.mutateAsync({ title, course })
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as UpdateErrorBody | null
        setError(body?.title?.[0] ?? body?.course?.[0] ?? 'Não foi possível salvar.')
      } else {
        setError('Não foi possível salvar. Tente novamente.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        title="Editar material"
        description="Só título e curso — o arquivo em si não é reenviado aqui."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Título"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Select
            label="Curso"
            name="course"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
          >
            {courses?.results.map((c) => (
              <option key={c.id} value={c.code}>
                {c.name}
              </option>
            ))}
          </Select>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" disabled={updateMutation.isPending} className="mt-2 w-full">
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
