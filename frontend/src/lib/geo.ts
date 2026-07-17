export interface Coords {
  lat: number
  lng: number
}

/** Запрашивает геопозицию (по тапу пользователя). Кидает понятную ошибку при отказе/таймауте. */
export function getPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Геолокация не поддерживается устройством'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        reject(
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'Доступ к геолокации запрещён — разрешите его, чтобы отметиться'
              : 'Не удалось определить местоположение. Попробуйте ещё раз',
          ),
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  })
}
