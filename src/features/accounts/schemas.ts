import { z } from 'zod'

export const createStudentSchema = z.object({
  full_name: z.string().min(1, 'Informe o nome completo.'),
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  nickname: z.string().optional(),
  rgm: z.string().min(1, 'Informe o RGM.'),
  course: z.string().min(1, 'Selecione um curso.'),
})
export type CreateStudentFormValues = z.infer<typeof createStudentSchema>

export const createCoordinatorSchema = z.object({
  full_name: z.string().min(1, 'Informe o nome completo.'),
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  nickname: z.string().optional(),
  coordinated_courses: z.array(z.string()).min(1, 'Selecione ao menos um curso.'),
})
export type CreateCoordinatorFormValues = z.infer<typeof createCoordinatorSchema>

export const importStudentsSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Selecione um arquivo CSV.')
    .transform((files) => files[0])
    .refine((file) => file.name.toLowerCase().endsWith('.csv'), 'O arquivo precisa ser um CSV.'),
})
export type ImportStudentsFormInput = z.input<typeof importStudentsSchema>
export type ImportStudentsFormValues = z.output<typeof importStudentsSchema>
