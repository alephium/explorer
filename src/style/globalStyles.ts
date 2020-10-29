import styled, { createGlobalStyle, css, DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components'
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

// === Table

export const Table = styled.table`
  width: 100%;
  text-align: left;
  border-collapse: collapse; 
`

export const TableHeader = styled.thead`
  font-weight: 400;
  color: ${({theme}) => theme.textSecondary};
  font-style: italic;

  th {
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.bgPrimary }
  }

  tr {
    height: 60px;
  }
`


export interface TDStyle {
  tdIndex: number
  style: FlattenInterpolation<ThemeProps<DefaultTheme>>
}

export interface TableBopyProps {
  tdStyles: TDStyle[]
}

export const TableBody = styled.tbody<TableBopyProps>`
  color: ${({theme}) => theme.textPrimary};

  tr {
    ${props => props.tdStyles.map(s => css`td:nth-child(${s.tdIndex}) { ${s.style} }`)}

    border-bottom: 2px solid ${({ theme }) => theme.borderPrimary};

    td {
      height: 50px;
    }
  }
`

export default GlobalStyle