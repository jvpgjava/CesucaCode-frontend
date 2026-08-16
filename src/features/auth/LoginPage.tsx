import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Card } from '@/shared/ui/Card'
import { ApiError } from '@/api/client'
import { useAuth } from './useAuth'
import { loginSchema, type LoginFormValues } from './schemas'

interface LoginErrorBody {
  non_field_errors?: string[]
  identifier?: string[]
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      const user = await login(values.identifier, values.password)
      navigate(user.must_change_password ? '/change-password' : '/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as LoginErrorBody | null
        setFormError(
          body?.non_field_errors?.[0] ?? body?.identifier?.[0] ?? 'Não foi possível entrar.',
        )
      } else {
        setFormError('Não foi possível entrar. Tente novamente.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="border-t-brand-orange w-full max-w-sm border-t-4">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <GraduationCap className="text-brand-navy" size={32} />
          <h1 className="text-lg font-semibold text-neutral-900">Entrar no CesucaCode</h1>
          <p className="text-sm text-neutral-500">Use seu e-mail institucional ou seu RGM.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="E-mail ou RGM"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
