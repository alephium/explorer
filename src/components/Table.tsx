// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React from 'react'
import styled, { css, DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components'

interface TableHeaderProps {
  headerTitles: string[]
}

export const TableHeader: React.FC<TableHeaderProps> = ({ headerTitles }) => (
  <StyledTableHeader>
    <tr>
      {headerTitles.map((v, i) => <th key={i}>{v}</th>)}
    </tr>
  </StyledTableHeader>
)
// === Styles

interface TableProps {
  hasDetails?: boolean
}

export const Table = styled.table<TableProps>`
  width: 100%;
  text-align: left;
  border-collapse: collapse; 
  vertical-align: middle;

  td, th {
    padding: 0 5px;
  }

  svg {
    vertical-align: middle;
  }

  tbody {
    tr {
      border-bottom: ${({ hasDetails, theme }) => !hasDetails ? `2px solid ${theme.borderPrimary}` : ''};
    }

    tr.details {
      border-bottom: 2px solid ${({ theme  }) => theme.borderPrimary};
      background-color: ${({ theme  }) => theme.bgHighlight};
    }
  }
`

export const StyledTableHeader = styled.thead`
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
  tdPos: number
  style: FlattenInterpolation<ThemeProps<DefaultTheme>>
}

export interface TableBopyProps {
  tdStyles?: TDStyle[]
}

export const TableBody = styled.tbody<TableBopyProps>`
  color: ${({theme}) => theme.textPrimary};

  tr {
    ${props => props.tdStyles ? props.tdStyles.map(s => css`td:nth-child(${s.tdPos}) { ${s.style} }`) : ''}

    &:not(.details) td {
      height: 50px;
    }

    &.details {
      div { overflow: hidden; }
    }

    &:hover {
      background-color: ${({ theme }) => theme.bgHighlight};
    }
  }
`