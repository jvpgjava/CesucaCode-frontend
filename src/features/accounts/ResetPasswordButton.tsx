import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { useResetPasswordMutation } from './hooks/useAccounts'

export function ResetPasswordButton({
  accountId,
  accountName,
}: {
  accountId: number
  accountName: string
}) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const resetMutation = useResetPasswordMutation()

  const handleConfirm = async () => {
    const response = await resetMutation.mutateAsync(accountId)
    setResult(response.detail)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900"
        title="Redefinir senha"
      >
        <KeyRound size={16} />
      </button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setResult(null)
        }}
      >
        <DialogContent
          title="Redefinir senha"
          description={
            result ?? `Gerar uma nova senha aleatória para ${accountName} e enviar por e-mail?`
          }
        >
          <div className="flex justify-end gap-2">
            {result ? (
              <Button onClick={() => setOpen(false)}>Fechar</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm} disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? 'Enviando...' : 'Confirmar'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
