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

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { createContext, FC, useContext, useEffect } from 'react'
import styled, { css, DefaultTheme, FlattenInterpolation, ThemeProps } from 'styled-components'

import { deviceBreakPoints } from '../style/globalStyles'
import ClipboardButton from './Buttons/ClipboardButton'
import QRCodeButton from './Buttons/QRCodeButton'
import { SectionContext } from './Section'

interface TableProps {
  main?: boolean
  hasDetails?: boolean
  noBorder?: boolean
  bodyOnly?: boolean
  scrollable?: boolean
}

export const Table: FC<TableProps> = ({ children, ...props }) => (
  <TableWrapper {...props}>
    <StyledTable {...props}>{children}</StyledTable>
  </TableWrapper>
)

interface TableHeaderProps {
  headerTitles: string[]
  columnWidths?: string[]
  textAlign?: ('left' | 'right')[]
  compact?: boolean
  transparent?: boolean
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  headerTitles,
  columnWidths,
  textAlign,
  compact = false,
  transparent = false
}) => (
  <StyledTableHeader compact={compact} transparent={transparent}>
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
  </StyledTableHeader>
)

// == Row

interface RowProps {
  isActive?: boolean
}

export const Row = styled.tr<RowProps>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.bgHighlight : '')};
  border: none;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'auto')};
`

// == Details Row

interface DetailsRowProps {
  openCondition: boolean
}

const OpenConditionContext = createContext(false)

export const DetailsRow: FC<DetailsRowProps> = ({ children, openCondition }) => {
  const rebuildTooltips = useContext(SectionContext).rebuildTooltips
  useEffect(() => rebuildTooltips()) // Need to rebuild after lazy rendering

  return (
    <OpenConditionContext.Provider value={openCondition}>
      <tr className="details">{children}</tr>
    </OpenConditionContext.Provider>
  )
}

interface AnimatedCellProps {
  className?: string
  colSpan?: number
  alignItems?: 'left' | 'right'
}

export const AnimatedCell: FC<AnimatedCellProps> = ({ children, className, colSpan, alignItems = 'left' }) => {
  const condition = useContext(OpenConditionContext)

  return (
    <td colSpan={colSpan}>
      <AnimatePresence>
        {condition && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.15 }}
            className={className}
          >
            <AnimatedCellContainer alignItems={alignItems}>{children}</AnimatedCellContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </td>
  )
}

// == Details Toggle

const variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
}

interface DetailToggleProps {
  isOpen: boolean
  onClick: () => void
}

export const DetailToggle: FC<DetailToggleProps> = ({ isOpen, onClick }) => {
  return (
    <td style={{ padding: 0, textAlign: 'center', overflow: 'hidden' }}>
      <DetailToggleWrapper animate={isOpen ? 'open' : 'closed'} variants={variants} onClick={onClick}>
        <ChevronDown size={20} />
      </DetailToggleWrapper>
    </td>
  )
}

const DetailToggleWrapper = styled(motion.div)`
  cursor: pointer;
`

// == Highlighted cell (address, hash...)

export const HighlightedCell: FC<{ textToCopy?: string; qrCodeContent?: string }> = ({
  children,
  textToCopy,
  qrCodeContent
}) => {
  return (
    <StyledHighlightedCell>
      <span>{children}</span>
      {textToCopy && <ClipboardButton textToCopy={textToCopy} />}
      {qrCodeContent && <QRCodeButton textToEncode={qrCodeContent} />}
    </StyledHighlightedCell>
  )
}

// ===
// === Styles ====
// ===

const TableWrapper = styled.div<TableProps>`
  border: ${({ noBorder, theme }) => !noBorder && `1px solid ${theme.borderPrimary}`};
  overflow: hidden;
  border-radius: 7px;
`

const StyledTable = styled.table<TableProps>`
  width: 100%;
  text-align: left;
  border-collapse: collapse;
  table-layout: fixed;
  white-space: nowrap;

  @media ${deviceBreakPoints.mobile} {
    ${({ scrollable, bodyOnly }) => {
      if (scrollable) {
        return `
					display: block;
					width: 100%;
					overflow-x: auto;
				`
      } else if (bodyOnly) {
        /* Change table structure, stack td vertically */
        return css`
          tr {
            display: flex;
            flex-direction: column;

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
      }
    }}
  }

  td {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  tr td {
    padding: 12px;
  }

  tr:not(.details) td {
    height: 45px;
  }

  svg {
    vertical-align: bottom;
  }

  tbody {
    tr:not(:last-child) {
      border-bottom: ${({ hasDetails, noBorder, theme }) =>
        !hasDetails ? (noBorder ? 'none' : `1px solid ${theme.borderPrimary}`) : ''};
    }

    tr.details {
      &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.borderPrimary};
      }
      box-shadow: inset 0 1px 0 ${({ theme }) => theme.borderSecondary};
      background-color: ${({ theme }) => theme.bgHighlight};

      td {
        padding-top: 0;
        padding-bottom: 0;
      }
    }
  }
`

interface StyledTableHeaderProps {
  compact: boolean
  transparent: boolean
}

export const StyledTableHeader = styled.thead<StyledTableHeaderProps>`
  color: ${({ theme }) => theme.textSecondary};

  th {
    padding: 0px 12px 12px 12px;
    font-weight: 500;
    ${({ compact, theme }) => {
      if (!compact) {
        return `
					position: sticky;
					top: 0;
					box-shadow: inset 0 -1px 0 ${theme.borderPrimary};
					padding: 12px;
				`
      }
    }}
    background-color: ${({ theme, transparent }) => (transparent ? 'transparent' : `${theme.bgSecondary}`)};
  }

  tr {
    height: ${({ compact }) => (compact ? '30px' : '48px')};
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

const StyledHighlightedCell = styled.td`
  font-weight: 600 !important;
  color: ${({ theme }) => theme.textAccent};
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
`

export const AnimatedCellContainer = styled(motion.div)<{ alignItems: 'left' | 'right' }>`
  padding: 10px 0;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: ${({ alignItems }) => (alignItems === 'left' ? 'flex-start' : 'flex-end')};

  > * {
    padding: 3px 0 !important;
  }
`
