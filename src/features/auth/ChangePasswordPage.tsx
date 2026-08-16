import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { changePassword } from '@/api/endpoints/auth'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { type ChangePasswordFormValues, changePasswordSchema } from './schemas'
import { useAuth } from './useAuth'

interface ChangePasswordErrorBody {
  old_password?: string[]
  new_password?: string[]
}

export function ChangePasswordPage() {
  const { refreshUser, logout } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setFormError(null)
    try {
      await changePassword(values.old_password, values.new_password)
      await refreshUser()
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as ChangePasswordErrorBody | null
        setFormError(
          body?.old_password?.[0] ?? body?.new_password?.[0] ?? 'Não foi possível trocar a senha.',
        )
      } else {
        setFormError('Não foi possível trocar a senha. Tente novamente.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-sm border-t-4 border-t-brand-orange">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <KeyRound className="text-brand-navy" size={32} />
          <h1 className="font-semibold text-lg text-neutral-900">Troque sua senha</h1>
          <p className="text-neutral-500 text-sm">
            Essa é uma senha temporária. Defina uma nova antes de continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            error={errors.old_password?.message}
            {...register('old_password')}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.new_password?.message}
            {...register('new_password')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          {formError && <p className="text-red-600 text-sm">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
          <Button type="button" variant="ghost" onClick={logout}>
            Sair
          </Button>
        </form>
      </Card>
    </div>
  )
}
