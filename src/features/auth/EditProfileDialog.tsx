import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ApiError } from '@/api/client'
import { AvatarCircle } from '@/shared/ui/AvatarCircle'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { useToast } from '@/shared/ui/Toast'
import { useAuth } from './useAuth'

const MAX_AVATAR_SIZE_MB = 5

export function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Libera a URL de preview anterior quando troca de arquivo ou fecha o dialog.
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setNickname(user?.nickname ?? '')
      setAvatarFile(null)
      setAvatarPreview(null)
      setError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleAvatarPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setError(`Imagem maior que ${MAX_AVATAR_SIZE_MB}MB.`)
      return
    }
    setError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await updateProfile({ nickname: nickname.trim(), avatar: avatarFile ?? undefined })
      toast.success('Perfil atualizado.')
      onOpenChange(false)
    } catch (err) {
      const body =
        err instanceof ApiError
          ? (err.body as { nickname?: string[]; avatar?: string[] } | null)
          : null
      setError(body?.nickname?.[0] ?? body?.avatar?.[0] ?? 'Não foi possível atualizar o perfil.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayAvatar = avatarPreview ?? user?.avatar
  const initial = (user?.nickname || user?.full_name || '?').charAt(0).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        title="Editar perfil"
        description="Apelido e foto — os demais dados são gerenciados pela administração."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative rounded-full"
              title="Trocar foto de perfil"
            >
              <AvatarCircle
                avatar={displayAvatar}
                initial={initial}
                className="h-20 w-20 text-2xl"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={20} className="text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarPick}
              className="hidden"
            />
          </div>

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
