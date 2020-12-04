import { createGlobalStyle } from 'styled-components'
import normalize from 'styled-normalize'

const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    background-color: ${({ theme }) => theme.body};
    transition: background-color 0.2s ease;

    color: ${({ theme }) => theme.textPrimary};
  }

  a {
    color: ${({ theme }) => theme.link};;
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.linkHighlight};;
    }
  }

  // Animations
  @keyframes spin {
    from {
        transform:rotate(0deg);
    }
    to {
        transform:rotate(360deg);
    }
  }
`

// Breakpoints

export const deviceSizes = {
  mobile: 1024,
  desktop: 1920
}

export const deviceBreakPoints = {
  mobile: `(max-width: ${deviceSizes.mobile}px)`,
  desktop: `(max-width: ${deviceSizes.desktop}px)`
}

export default GlobalStyle
