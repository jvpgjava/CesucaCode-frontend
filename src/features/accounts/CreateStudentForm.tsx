import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { useCoursesQuery } from '@/shared/hooks/useCourses'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { useCreateStudentMutation } from './hooks/useAccounts'
import { type CreateStudentFormValues, createStudentSchema } from './schemas'

interface CreateStudentErrorBody {
  email?: string[]
  full_name?: string[]
  rgm?: string[]
  course?: string[]
}

export function CreateStudentForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: courses } = useCoursesQuery()
  const createMutation = useCreateStudentMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<{ emailSent: boolean } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentFormValues>({ resolver: zodResolver(createStudentSchema) })

  const onSubmit = async (values: CreateStudentFormValues) => {
    setFormError(null)
    try {
      const response = await createMutation.mutateAsync(values)
      setResult({ emailSent: response.email_sent })
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as CreateStudentErrorBody | null
        setFormError(
          body?.email?.[0] ??
            body?.rgm?.[0] ??
            body?.full_name?.[0] ??
            body?.course?.[0] ??
            'Não foi possível criar a conta.',
        )
      } else {
        setFormError('Não foi possível criar a conta. Tente novamente.')
      }
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        {result.emailSent ? (
          <CheckCircle2 className="text-green-600" size={32} />
        ) : (
          <XCircle className="text-amber-600" size={32} />
        )}
        <p className="text-neutral-700 text-sm">
          {result.emailSent
            ? 'Conta criada! A senha temporária foi enviada por e-mail.'
            : 'Conta criada, mas o envio do e-mail falhou. Use "Redefinir senha" na lista para tentar reenviar.'}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setResult(null)
              reset()
            }}
          >
            Criar outro
          </Button>
          <Button onClick={onSuccess}>Fechar</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nome completo" error={errors.full_name?.message} {...register('full_name')} />
      <Input label="E-mail" error={errors.email?.message} {...register('email')} />
      <Input
        label="Apelido (opcional)"
        error={errors.nickname?.message}
        {...register('nickname')}
      />
      <Input label="RGM" error={errors.rgm?.message} {...register('rgm')} />
      <Select label="Curso" defaultValue="" error={errors.course?.message} {...register('course')}>
        <option value="" disabled>
          Selecione um curso
        </option>
        {courses?.results.map((course) => (
          <option key={course.id} value={course.code}>
            {course.name}
          </option>
        ))}
      </Select>

      {formError && <p className="text-red-600 text-sm">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? 'Criando...' : 'Criar aluno'}
      </Button>
    </form>
  )
}
