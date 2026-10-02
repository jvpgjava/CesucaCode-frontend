export interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: number
  role: MessageRole
  content: string
  feedback: 1 | -1 | null
  feedback_reason?: FeedbackReason | ''
  created_at: string
}

export type FeedbackReason = 'incorreta' | 'incompleta' | 'nao_entendeu' | 'fora_do_curso' | 'outro'

export const FEEDBACK_REASON_LABELS: Record<FeedbackReason, string> = {
  incorreta: 'Incorreta',
  incompleta: 'Incompleta',
  nao_entendeu: 'Não entendeu a pergunta',
  fora_do_curso: 'Fora do meu curso',
  outro: 'Outro',
}

export const FEEDBACK_COMMENT_MAX_LENGTH = 500

// Eventos do stream de resposta (SSE) de POST .../messages/send/.
export type ChatStreamEvent =
  | { type: 'meta'; userMessageId: number | null; route: string | null }
  | { type: 'status'; step: string; label: string }
  | { type: 'token'; content: string }
  | { type: 'suggestions'; items: string[] }
  | { type: 'done'; messageId: number | null }
  | { type: 'error'; message: string }

export type ChatStepStatus = 'active' | 'done'

export interface ChatStep {
  step: string
  label: string
  status: ChatStepStatus
}
