import { createTheme, type MantineColorsTuple } from '@mantine/core'

// Фирменная шкала МТУСИ (docs/mtuci-brandbook.md): primaryShade 7 === #372579
const mtuci: MantineColorsTuple = [
  '#F2F0FA', // 0 — фон-подложка, hover строк, активный пункт меню
  '#E3DFF5', // 1 — badge-фоны
  '#C7BFE8', // 2
  '#A99CDA', // 3
  '#8C7ACC', // 4
  '#6F58BE', // 5
  '#55409E', // 6
  '#372579', // 7 — ФИРМЕННЫЙ: кнопки, ссылки, активные состояния
  '#2B1D5E', // 8 — hover основного
  '#201545', // 9
]

export const theme = createTheme({
  primaryColor: 'mtuci',
  primaryShade: 7,
  colors: { mtuci },
  fontFamily: 'Montserrat, sans-serif',
  fontFamilyMonospace: 'Montserrat, sans-serif',
  headings: { fontFamily: 'Montserrat, sans-serif', fontWeight: '700' },
  defaultRadius: 'lg',
  // shape lock: pill-кнопки/бейджи, карточки lg, инпуты md
  components: {
    Button: { defaultProps: { radius: 'xl' } },
    Badge: { defaultProps: { radius: 'xl' } },
    Paper: { defaultProps: { radius: 'lg' } },
    Card: { defaultProps: { radius: 'lg', withBorder: true } },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
  },
})
