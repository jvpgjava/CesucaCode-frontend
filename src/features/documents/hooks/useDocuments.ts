import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteDocument,
  getDocument,
  getDocumentChunks,
  listDocuments,
  reprocessDocument,
  uploadDocument,
} from '@/api/endpoints/documents'

// "list" e "detail" ficam em ramos separados de propósito: invalidar a lista
// não pode acabar invalidando (via correspondência de prefixo) o detalhe ou
// os chunks de um documento específico, e vice-versa.
const documentsListKey = ['documents', 'list'] as const
const documentKey = (id: number) => ['documents', 'detail', id] as const
const chunksKey = (id: number) => ['documents', 'detail', id, 'chunks'] as const

// Upload agora processa em background (Docling pode levar minutos), então a lista/detalhe faz polling só enquanto algum documento ainda está "processing".
const PROCESSING_POLL_INTERVAL_MS = 3000

export function useDocumentsQuery() {
  return useQuery({
    queryKey: documentsListKey,
    queryFn: listDocuments,
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
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsListKey })
    },
  })
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsListKey })
    },
  })
}

export function useReprocessDocumentMutation(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => reprocessDocument(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(documentKey(id), updated)
      queryClient.invalidateQueries({ queryKey: chunksKey(id) })
      queryClient.invalidateQueries({ queryKey: documentsListKey })
    },
  })
}
