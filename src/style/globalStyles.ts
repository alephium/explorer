import { createGlobalStyle } from 'styled-components'
import normalize from 'styled-normalize'

const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    background-color: ${({ theme }) => theme.body};
    transition: background-color 0.2s ease;
  }

  a {
    color: #53A9F5;
  }
`

export default GlobalStyle