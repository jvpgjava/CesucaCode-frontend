import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { useCoursesQuery } from '@/shared/hooks/useCourses'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useCreateCoordinatorMutation } from './hooks/useAccounts'
import { type CreateCoordinatorFormValues, createCoordinatorSchema } from './schemas'

interface CreateCoordinatorErrorBody {
  email?: string[]
  full_name?: string[]
  coordinated_courses?: string[]
}

export function CreateCoordinatorForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: courses } = useCoursesQuery()
  const createMutation = useCreateCoordinatorMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<{ emailSent: boolean } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCoordinatorFormValues>({
    resolver: zodResolver(createCoordinatorSchema),
    defaultValues: { coordinated_courses: [] },
  })

  const onSubmit = async (values: CreateCoordinatorFormValues) => {
    setFormError(null)
    try {
      const response = await createMutation.mutateAsync(values)
      setResult({ emailSent: response.email_sent })
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as CreateCoordinatorErrorBody | null
        setFormError(
          body?.email?.[0] ??
            body?.full_name?.[0] ??
            body?.coordinated_courses?.[0] ??
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

      <div className="flex flex-col gap-1">
        <span className="font-medium text-neutral-700 text-sm">Cursos coordenados</span>
        <Controller
          control={control}
          name="coordinated_courses"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {courses?.results.map((course) => (
                <label key={course.id} className="flex items-center gap-2 text-neutral-700 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value.includes(course.code)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...field.value, course.code]
                        : field.value.filter((code) => code !== course.code)
                      field.onChange(next)
                    }}
                  />
                  {course.name}
                </label>
              ))}
            </div>
          )}
        />
        {errors.coordinated_courses && (
          <span className="text-red-600 text-xs">{errors.coordinated_courses.message}</span>
        )}
      </div>

      {formError && <p className="text-red-600 text-sm">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? 'Criando...' : 'Criar coordenador'}
      </Button>
    </form>
  )
}
