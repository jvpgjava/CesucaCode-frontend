import { useState } from 'react'
import { ApiError } from '@/api/client'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { useToast } from '@/shared/ui/Toast'
import { useAuth } from './useAuth'

export function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, updateNickname } = useAuth()
  const toast = useToast()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setNickname(user?.nickname ?? '')
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await updateNickname(nickname.trim())
      toast.success('Apelido atualizado.')
      onOpenChange(false)
    } catch (err) {
      const body = err instanceof ApiError ? (err.body as { nickname?: string[] } | null) : null
      setError(body?.nickname?.[0] ?? 'Não foi possível atualizar o apelido.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        title="Editar perfil"
        description="Só o apelido pode ser alterado por você — os demais dados são gerenciados pela administração."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Apelido"
            name="nickname"
            placeholder={user?.full_name}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={50}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
