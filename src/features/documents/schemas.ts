import { z } from 'zod'

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt']
const MAX_FILE_SIZE_MB = 20

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Informe um título.'),
  course: z.string().min(1, 'Selecione um curso.'),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'Selecione um arquivo.')
    .transform((files) => files[0])
    .refine(
      (file) => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        return extension ? SUPPORTED_EXTENSIONS.includes(extension) : false
      },
      `Formato não suportado. Use ${SUPPORTED_EXTENSIONS.join(', ')}.`,
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
      `Arquivo maior que ${MAX_FILE_SIZE_MB}MB.`,
    ),
})

export type UploadDocumentFormInput = z.input<typeof uploadDocumentSchema>
export type UploadDocumentFormValues = z.output<typeof uploadDocumentSchema>
