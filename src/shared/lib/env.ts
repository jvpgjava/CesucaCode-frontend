const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL não está definida. Copie .env.example para .env e configure.')
}

export const env = {
  apiBaseUrl,
}
