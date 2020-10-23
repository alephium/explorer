// import original module declarations
import 'styled-components'
import { ThemeType } from './themes';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    name: ThemeType,
    body: string,
    textPrimary: string,
    textSecondary: string,
    bgPrimary: string,
    bgSecondary: string,
    borderPrimary: string
  }
}