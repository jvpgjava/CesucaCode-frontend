import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteDocument,
  getDocument,
  getDocumentChunks,
  listDocuments,
  reprocessDocument,
  updateDocument,
  uploadDocument,
} from '@/api/endpoints/documents'
import { useToast } from '@/shared/ui/Toast'

// "list" e "detail" ficam em ramos separados de propósito: invalidar a lista
// não pode acabar invalidando (via correspondência de prefixo) o detalhe ou
// os chunks de um documento específico, e vice-versa.
const documentsListBaseKey = ['documents', 'list'] as const
const documentsListKey = (page: number) => [...documentsListBaseKey, { page }] as const
const documentKey = (id: number) => ['documents', 'detail', id] as const
const chunksKey = (id: number) => ['documents', 'detail', id, 'chunks'] as const

// Upload agora processa em background (Docling pode levar minutos), então a
// lista/detalhe faz polling só enquanto algum documento ainda está "processing".
const PROCESSING_POLL_INTERVAL_MS = 3000

export function useDocumentsQuery(page = 1) {
  return useQuery({
    queryKey: documentsListKey(page),
    queryFn: () => listDocuments({ page }),
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.results.some(
        (document) => document.status === 'processing',
      )
      return hasProcessing ? PROCESSING_POLL_INTERVAL_MS : false
    },
  })
}

export function useDocumentQuery(id: number) {
  return useQuery({
    queryKey: documentKey(id),
    queryFn: () => getDocument(id),
    refetchInterval: (query) =>
      query.state.data?.status === 'processing' ? PROCESSING_POLL_INTERVAL_MS : false,
  })
}

export function useChunksQuery(id: number, isDocumentProcessing = false) {
  return useQuery({
    queryKey: chunksKey(id),
    queryFn: () => getDocumentChunks(id),
    refetchInterval: isDocumentProcessing ? PROCESSING_POLL_INTERVAL_MS : false,
  })
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsListBaseKey })
      toast.success('Material enviado. Processando em segundo plano...')
    },
  })
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsListBaseKey })
    },
    onError: () => {
      toast.error('Não foi possível excluir o material. Tente novamente.')
    },
  })
}

export function useUpdateDocumentMutation(id: number) {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: (data: { title?: string; course?: string }) => updateDocument(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentKey(id), updated)
      queryClient.invalidateQueries({ queryKey: documentsListBaseKey })
      toast.success('Material atualizado.')
    },
  })
}

export function useReprocessDocumentMutation(id: number) {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: () => reprocessDocument(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentKey(id), updated)
      queryClient.invalidateQueries({ queryKey: chunksKey(id) })
      queryClient.invalidateQueries({ queryKey: documentsListBaseKey })
      toast.success('Reprocessamento iniciado.')
    },
    onError: () => {
      toast.error('Não foi possível reprocessar o material. Tente novamente.')
    },
  })
}
