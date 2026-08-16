import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { ApiError } from '@/api/client'
import { useImportStudentsMutation } from './hooks/useAccounts'
import {
  importStudentsSchema,
  type ImportStudentsFormInput,
  type ImportStudentsFormValues,
} from './schemas'
import type { BulkImportResult } from '@/api/types/accounts'

export function ImportStudentsForm({ onSuccess }: { onSuccess: () => void }) {
  const importMutation = useImportStudentsMutation()
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<BulkImportResult | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ImportStudentsFormInput, unknown, ImportStudentsFormValues>({
    resolver: zodResolver(importStudentsSchema),
  })

  const onSubmit = async (values: ImportStudentsFormValues) => {
    setFormError(null)
    try {
      const response = await importMutation.mutateAsync(values.file)
      setResult(response)
    } catch (error) {
      if (error instanceof ApiError) {
        const body = error.body as { detail?: string } | null
        setFormError(body?.detail ?? 'Não foi possível importar o arquivo.')
      } else {
        setFormError('Não foi possível importar o arquivo. Tente novamente.')
      }
    }
  }

  if (result) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-neutral-700">
          {result.created_count} conta(s) criada(s), {result.failed_count} com erro de validação
          {result.email_failures_count > 0 &&
            `, ${result.email_failures_count} com falha no envio do e-mail`}
          .
        </p>
        {result.errors.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Linha</th>
                  <th className="px-3 py-2">RGM</th>
                  <th className="px-3 py-2">Erro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {result.errors.map((err) => (
                  <tr key={err.row}>
                    <td className="px-3 py-2">{err.row}</td>
                    <td className="px-3 py-2">{err.rgm ?? '-'}</td>
                    <td className="px-3 py-2 text-red-600">
                      {Object.values(err.errors).flat().join(' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setResult(null)
              reset()
            }}
          >
            Importar outro
          </Button>
          <Button onClick={onSuccess}>Fechar</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Arquivo CSV"
        type="file"
        accept=".csv"
        error={errors.file?.message}
        {...register('file')}
      />
      <p className="text-xs text-neutral-500">
        Colunas: full_name, rgm, email, course (nickname é opcional).
      </p>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? 'Importando...' : 'Importar'}
      </Button>
    </form>
  )
}
