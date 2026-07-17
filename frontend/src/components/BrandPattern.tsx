// Фирменный паттерн из фрагментов знака — только на auth-экране (брендбук: «светлый» тайл ~5%).
export function BrandPattern() {
  return (
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="wt-hept" width="72" height="72" patternUnits="userSpaceOnUse">
          <polygon
            points="36,12 52,20 56,37 44,50 28,50 16,37 20,20"
            fill="none"
            stroke="var(--mantine-color-mtuci-7)"
            strokeWidth="1.2"
            opacity="0.06"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wt-hept)" />
    </svg>
  )
}
