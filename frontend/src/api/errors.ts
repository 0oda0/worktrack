import axios from 'axios'

/** Достаёт человекочитаемое сообщение из ошибки FastAPI ({detail: "..."}). */
export function errMsg(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = e.response?.data?.detail
    if (typeof detail === 'string') return detail
  }
  return fallback
}
