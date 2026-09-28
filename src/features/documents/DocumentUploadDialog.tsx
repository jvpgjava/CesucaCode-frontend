import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { useCoursesQuery } from '@/shared/hooks/useCourses'
import { Button } from '@/shared/ui/Button'
import { CourseCheckboxGroup } from '@/shared/ui/CourseCheckboxGroup'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { useUploadDocumentMutation } from './hooks/useDocuments'
import { useLockedCourseCodes } from './hooks/useLockedCourseCodes'
import {
  type UploadDocumentFormInput,
  type UploadDocumentFormValues,
  uploadDocumentSchema,
} from './schemas'

interface UploadErrorBody {
  title?: string[]
  courses?: string[]
  file?: string[]
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: courses } = useCoursesQuery()
  const lockedCodes = useLockedCourseCodes()
  const uploadMutation = useUploadDocumentMutation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadDocumentFormInput, unknown, UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: { courses: [] },
  })

  const onSubmit = async (values: UploadDocumentFormValues) => {
    setFormError(null)
    try {
      await uploadMutation.mutateAsync(values)
      reset()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as UploadErrorBody | null
        setFormError(
          body?.title?.[0] ??
            body?.courses?.[0] ??
            body?.file?.[0] ??
            'Não foi possível enviar o material.',
        )
      } else {
        setFormError('Não foi possível enviar o material. Tente novamente.')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Enviar material didático"
        description="PDF, DOCX, PPTX, MD ou TXT, até 20MB."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Título" error={errors.title?.message} {...register('title')} />

          <Controller
            control={control}
            name="courses"
            render={({ field }) => (
              <CourseCheckboxGroup
                label="Cursos"
                courses={courses?.results ?? []}
                value={field.value ?? []}
                onChange={field.onChange}
                lockedCodes={lockedCodes}
                error={errors.courses?.message}
              />
            )}
          />

          <Input
            label="Arquivo"
            type="file"
            accept=".pdf,.docx,.pptx,.md,.txt"
            error={errors.file?.message}
            {...register('file')}
          />

          {formError && <p className="text-red-600 text-sm">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
