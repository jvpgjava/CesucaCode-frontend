import { useState } from 'react'
import { ApiError } from '@/api/client'
import type { Document } from '@/api/types/documents'
import { useCoursesQuery } from '@/shared/hooks/useCourses'
import { Button } from '@/shared/ui/Button'
import { CourseCheckboxGroup } from '@/shared/ui/CourseCheckboxGroup'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { useUpdateDocumentMutation } from './hooks/useDocuments'
import { useLockedCourseCodes } from './hooks/useLockedCourseCodes'

interface UpdateErrorBody {
  title?: string[]
  courses?: string[]
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
  const lockedCodes = useLockedCourseCodes()
  const updateMutation = useUpdateDocumentMutation(document.id)
  const documentCourseCodes = document.courses.map((c) => c.code)
  const [title, setTitle] = useState(document.title)
  const [selectedCourses, setSelectedCourses] = useState(documentCourseCodes)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(document.title)
      setSelectedCourses(documentCourseCodes)
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (selectedCourses.length === 0) {
      setError('Selecione ao menos um curso.')
      return
    }
    try {
      await updateMutation.mutateAsync({ title, courses: selectedCourses })
      onOpenChange(false)
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as UpdateErrorBody | null
        setError(body?.title?.[0] ?? body?.courses?.[0] ?? 'Não foi possível salvar.')
      } else {
        setError('Não foi possível salvar. Tente novamente.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        title="Editar material"
        description="Só título e cursos — o arquivo em si não é reenviado aqui."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Título"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <CourseCheckboxGroup
            label="Cursos"
            courses={courses?.results ?? []}
            value={selectedCourses}
            onChange={setSelectedCourses}
            lockedCodes={lockedCodes}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" disabled={updateMutation.isPending} className="mt-2 w-full">
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
