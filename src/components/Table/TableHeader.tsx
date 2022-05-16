/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import styled, { css } from 'styled-components'

interface TableHeaderProps {
  headerTitles: string[]
  columnWidths?: string[]
  textAlign?: ('left' | 'right')[]
  compact?: boolean
  transparent?: boolean
  className?: string
}

export const TableHeader = ({ headerTitles, columnWidths, textAlign, className }: TableHeaderProps) => (
  <thead className={className}>
    <tr>
      {headerTitles.map((v, i) => (
        <th
          key={i}
          style={{
            width: columnWidths ? columnWidths[i] || 'auto' : 'auto',
            textAlign: textAlign ? textAlign[i] : 'left'
          }}
        >
          {v}
        </th>
      ))}
    </tr>
  </thead>
)

export default styled(TableHeader)`
  color: ${({ theme }) => theme.textSecondary};

  th {
    padding: 0px 12px 12px 12px;

    font-family: 'Inter';
    font-weight: 600;
    font-size: 12px;
    line-height: 15px;

    ${({ compact, theme }) =>
      !compact &&
      css`
        position: sticky;
        top: 0;
        box-shadow: inset 0 -1px 0 ${theme.borderSecondary};
        padding: 12px;
      `}
    background-color: ${({ theme, transparent }) => (transparent ? 'transparent' : `${theme.borderSecondary}`)};
  }

  tr {
    height: ${({ compact }) => (compact ? '30px' : '48px')};
  }
`
