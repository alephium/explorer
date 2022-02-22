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

import { TDStyle } from './Table'

interface TableBopyProps {
  tdStyles?: TDStyle[]
}

export default styled.tbody<TableBopyProps>`
  color: ${({ theme }) => theme.textPrimary};

  & > tr {
    ${(props) =>
      props.tdStyles
        ? props.tdStyles.map(
            (s) =>
              css`
                & > td:nth-child(${s.tdPos}) {
                  ${s.style}
                }
              `
          )
        : ''}

    &.details div {
      overflow: hidden;
    }

    &:hover {
      background-color: ${({ theme }) => theme.bgHover};
    }
  }
`
