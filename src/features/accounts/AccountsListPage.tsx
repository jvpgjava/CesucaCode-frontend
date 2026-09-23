import { Pencil, Plus, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { roleLabels } from '@/shared/auth/roles'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { formatDate } from '@/shared/lib/formatDate'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Input } from '@/shared/ui/Input'
import { Pagination } from '@/shared/ui/Pagination'
import { Select } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'
import { AccountEditDialog } from './AccountEditDialog'
import { AddAccountDialog } from './AddAccountDialog'
import { useAccountsQuery } from './hooks/useAccounts'
import { ResetPasswordButton } from './ResetPasswordButton'

export function AccountsListPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading } = useAccountsQuery({
    search: debouncedSearch || undefined,
    role: role || undefined,
    page,
  })

  const accounts = data?.results ?? []
  const editingAccount = accounts.find((account) => account.id === editingAccountId) ?? null

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-neutral-900 text-xl">Contas</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Adicionar
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por nome, e-mail ou RGM..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={role}
          onChange={(event) => {
            setRole(event.target.value)
            setPage(1)
          }}
          className="max-w-[200px]"
        >
          <option value="">Todos os papéis</option>
          <option value="cs_student">Estudante</option>
          <option value="cs_coordinator">Coordenador</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState icon={Users} title="Nenhuma conta encontrada" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-neutral-200 border-b bg-neutral-50 font-medium text-neutral-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail / RGM</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {accounts.map((account) => (
                <tr key={account.id} className={!account.is_active ? 'opacity-60' : undefined}>
                  <td className="px-4 py-3 align-middle font-medium text-neutral-900">
                    {account.nickname || account.full_name}
                  </td>
                  <td className="px-4 py-3 align-middle text-neutral-600">
                    {account.rgm ?? account.email}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge>{roleLabels[account.role]}</Badge>
                      {!account.is_active && <Badge tone="danger">Desativada</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-neutral-600">
                    {account.role === 'cs_coordinator'
                      ? account.coordinated_courses.map((c) => c.name).join(', ') || '-'
                      : (account.course?.name ?? '-')}
                  </td>
                  <td className="px-4 py-3 align-middle text-neutral-600">
                    {formatDate(account.created_at)}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAccountId(account.id)}
                        title="Editar conta"
                        className="text-neutral-500 hover:text-neutral-900"
                      >
                        <Pencil size={16} />
                      </button>
                      <ResetPasswordButton
                        accountId={account.id}
                        accountName={account.nickname || account.full_name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <Pagination
          page={page}
          count={data.count}
          hasNext={data.next !== null}
          hasPrevious={data.previous !== null}
          onPageChange={setPage}
        />
      )}

      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} />

      {editingAccount && (
        <AccountEditDialog
          account={editingAccount}
          open
          onOpenChange={(open) => {
            if (!open) setEditingAccountId(null)
          }}
        />
      )}
    </div>
  )
}
