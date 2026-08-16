import { useState } from 'react'
import { Dialog, DialogContent } from '@/shared/ui/Dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs'
import { CreateStudentForm } from './CreateStudentForm'
import { CreateCoordinatorForm } from './CreateCoordinatorForm'
import { ImportStudentsForm } from './ImportStudentsForm'

export function AddAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState('student')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Adicionar conta"
        description="Crie uma conta de aluno ou coordenador. A senha é gerada e enviada por e-mail."
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="student">Aluno</TabsTrigger>
            <TabsTrigger value="import">Importar CSV</TabsTrigger>
            <TabsTrigger value="coordinator">Coordenador</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <CreateStudentForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="import">
            <ImportStudentsForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          <TabsContent value="coordinator">
            <CreateCoordinatorForm onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
