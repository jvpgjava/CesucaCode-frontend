import { env } from '@/shared/lib/env'

const ACCESS_TOKEN_KEY = 'cesucacode.access'
const REFRESH_TOKEN_KEY = 'cesucacode.refresh'

let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY)
let refreshToken: string | null = localStorage.getItem(REFRESH_TOKEN_KEY)
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export function setTokens(tokens: { access: string; refresh: string }) {
  accessToken = tokens.access
  refreshToken = tokens.refresh
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasTokens(): boolean {
  return Boolean(accessToken)
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Erro ${status} na API`)
    this.status = status
    this.body = body
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  isFormData?: boolean
  skipAuth?: boolean
  isRetry?: boolean
}

let refreshPromise: Promise<void> | null = null

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshToken) {
    throw new ApiError(401, null, 'Sessão expirada.')
  }

  const response = await fetch(`${env.apiBaseUrl}/api/auth/login/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await safeJson(response), 'Sessão expirada.')
  }

  const data = (await response.json()) as { access: string; refresh?: string }
  accessToken = data.access
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access)
  if (data.refresh) {
    refreshToken = data.refresh
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh)
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, isFormData = false, skipAuth = false, isRetry = false } = options

  const headers: Record<string, string> = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  })

  if (response.status === 401 && !skipAuth && !isRetry) {
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      await refreshPromise
    } catch {
      clearTokens()
      onUnauthorized?.()
      throw new ApiError(401, null, 'Sessão expirada.')
    }
    return request<T>(path, { ...options, isRetry: true })
  }

  if (!response.ok) {
    const errorBody = await safeJson(response)
    if (response.status === 401) {
      clearTokens()
      onUnauthorized?.()
    }
    throw new ApiError(response.status, errorBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await safeJson(response)) as T
}

interface SseEvent {
  event: string
  data: string
}

async function openStream(path: string, body: unknown, isRetry: boolean): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (response.status === 401 && !isRetry) {
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      await refreshPromise
    } catch {
      clearTokens()
      onUnauthorized?.()
      throw new ApiError(401, null, 'Sessão expirada.')
    }
    return openStream(path, body, true)
  }

  if (!response.ok || !response.body) {
    throw new ApiError(response.status, await safeJson(response))
  }

  return response
}

// Consome uma resposta Server-Sent Events (text/event-stream) via fetch — a API
// EventSource nativa só suporta GET com cookies, não POST com Bearer token.
export async function* streamEvents(path: string, body: unknown): AsyncGenerator<SseEvent> {
  const response = await openStream(path, body, false)
  if (!response.body) {
    throw new ApiError(response.status, null)
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)

      let eventName = 'message'
      let data = ''
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          data += line.slice(5).trim()
        }
      }
      if (data) {
        yield { event: eventName, data }
      }

      boundary = buffer.indexOf('\n\n')
    }
  }
}
