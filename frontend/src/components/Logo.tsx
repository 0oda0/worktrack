import logoPurple from '../assets/brand/logo-full-purple.svg'
import logoWhite from '../assets/brand/logo-full-white.svg'

// Официальный логотип МТУСИ (знак + словомарка) со страницы брендбука.
// Брендбук запрещает искажения — используем оригинальный SVG как есть, масштаб по высоте.
export function Logo({ height = 32, variant = 'purple' }: { height?: number; variant?: 'purple' | 'white' }) {
  return (
    <img
      src={variant === 'white' ? logoWhite : logoPurple}
      alt="МТУСИ"
      style={{ display: 'block', height, width: 'auto' }}
    />
  )
}
