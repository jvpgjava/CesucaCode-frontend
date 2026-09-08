import { useState } from 'react'
import type { User } from '@/api/types/auth'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { useUpdateAccountMutation } from './hooks/useAccounts'

export function AccountEditDialog({
  account,
  open,
  onOpenChange,
}: {
  account: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateMutation = useUpdateAccountMutation()
  const [nickname, setNickname] = useState(account.nickname)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setNickname(account.nickname)
    onOpenChange(nextOpen)
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: account.id, data: { nickname } })
      onOpenChange(false)
    } catch {
      // erro já reportado via toast no hook
    }
  }

  const handleToggleActive = async () => {
    try {
      await updateMutation.mutateAsync({ id: account.id, data: { is_active: !account.is_active } })
    } catch {
      // erro já reportado via toast no hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        title="Editar conta"
        description={`${account.full_name} (${account.email ?? account.rgm})`}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Apelido"
            name="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            maxLength={50}
          />

          <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
            <div>
              <p className="font-medium text-neutral-900 text-sm">
                {account.is_active ? 'Conta ativa' : 'Conta desativada'}
              </p>
              <p className="text-neutral-500 text-xs">
                {account.is_active
                  ? 'Desativar impede login sem apagar a conta.'
                  : 'Reative para permitir login novamente.'}
              </p>
            </div>
            <Button
              type="button"
              variant={account.is_active ? 'danger' : 'secondary'}
              onClick={handleToggleActive}
              disabled={updateMutation.isPending}
              className="shrink-0"
            >
              {account.is_active ? 'Desativar' : 'Reativar'}
            </Button>
          </div>

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="mt-2 w-full">
            {updateMutation.isPending ? 'Salvando...' : 'Salvar apelido'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
