import axios from 'axios'

/** Достаёт человекочитаемое сообщение из ошибки FastAPI ({detail: "..."}). */
export function errMsg(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e)) {
    const detail = e.response?.data?.detail
    if (typeof detail === 'string') return detail
    return fallback // axios без detail — не показываем технический message
  }
  // не-axios ошибки (геолокация и т.п.) несут понятный текст — покажем его
  if (e instanceof Error && e.message) return e.message
  return fallback
}
