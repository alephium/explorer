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

import { useEffect, useRef, useState } from 'react'
import styled, { css, DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import { deviceBreakPoints } from '@/styles/globalStyles'

interface TableProps {
  main?: boolean
  hasDetails?: boolean
  noBorder?: boolean
  bodyOnly?: boolean
  scrollable?: boolean
  isLoading?: boolean
  minHeight?: number
}

export interface TDStyle {
  tdPos: number
  style: FlattenInterpolation<ThemeProps<DefaultTheme>>
}

const Table: FC<TableProps> = ({ children, isLoading, minHeight = 300, ...props }) => {
  const [height, setHeight] = useState(minHeight)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clientHeight = tableRef.current && tableRef.current.clientHeight
    clientHeight && clientHeight > minHeight && setHeight(clientHeight)
  }, [minHeight])

  return !isLoading ? (
    <TableWrapper {...props} ref={tableRef}>
      <StyledTable {...props}>{children}</StyledTable>
    </TableWrapper>
  ) : (
    <SkeletonLoader heightInPx={height} />
  )
}

const TableWrapper = styled.div<TableProps>`
  border: ${({ noBorder, theme }) => !noBorder && `1px solid ${theme.border.primary}`};
  overflow: hidden;
  border-radius: 12px;
  line-height: initial;
  min-height: ${({ minHeight }) => minHeight}px;
  background-color: ${({ theme }) => theme.bg.primary};
`

const StyledTable = styled.table<TableProps>`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
  table-layout: fixed;
  white-space: nowrap;

  @media ${deviceBreakPoints.tablet} {
    ${({ scrollable, bodyOnly }) =>
      scrollable
        ? css`
            display: block;
            width: 100%;
            overflow-x: auto;
          `
        : bodyOnly
        ? /* Change table structure, stack td vertically */
          css`
            tr {
              display: flex;
              flex-direction: column;
              height: auto !important;

              td:first-child {
                height: 25px !important;
                font-weight: 600;
              }
              td:not(:first-child) {
                height: initial !important;
                font-weight: 500 !important;
              }
            }
          `
        : null}
  }

  tr td {
    padding: 12px;
  }

  tr:not(.details) {
    height: 55px;
  }

  th,
  td {
    ${({ bodyOnly }) =>
      bodyOnly &&
      css`
        width: 65%;
      `}

    @media ${deviceBreakPoints.tablet} {
      ${({ bodyOnly }) =>
        bodyOnly &&
        css`
          width: 100%;
        `}
    }

    &:first-child {
      padding-left: 20px;

      @media ${deviceBreakPoints.tablet} {
        padding-left: 12px;
      }

      ${({ bodyOnly }) =>
        bodyOnly &&
        css`
          width: 35%;
        `}
    }
  }

  svg {
    vertical-align: bottom;
  }

  tbody {
    tr:not(:last-child) {
      border-bottom: ${({ hasDetails, theme }) => (!hasDetails ? `1px solid ${theme.border.secondary}` : '')};
    }

    tr.details {
      &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
      }
      background-color: ${({ theme }) => theme.bg.hover};

      td {
        padding-top: 0;
        padding-bottom: 0;
      }

      table {
        td {
          padding-top: 10px;
          padding-bottom: 10px;
        }
      }
    }
  }
`

export default Table
