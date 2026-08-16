import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Informe seu e-mail ou RGM.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Informe sua senha atual.'),
    new_password: z.string().min(8, 'A nova senha precisa ter pelo menos 8 caracteres.'),
    confirm_password: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'As senhas não coincidem.',
    path: ['confirm_password'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
