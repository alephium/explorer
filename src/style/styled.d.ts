// import original module declarations
import 'styled-components'
import { ThemeType } from './themes'

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType
    body: string

    textPrimary: string
    textSecondary: string
    textAccent: string

    link: string
    linkHighlight: string

    bgPrimary: string
    bgSecondary: string
    bgHighlight: string

    borderPrimary: string
    borderHighlight: string

    tooltip: string
  }
}
