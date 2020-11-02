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

import { AnimatePresence, motion } from 'framer-motion'
import React, { createContext, FC, useContext } from 'react'
import { ChevronDown } from 'react-feather'
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

// == Row 

interface RowProps {
  isActive?: boolean
}

export const Row = styled.tr<RowProps>`
  background-color: ${({ theme, isActive  }) => isActive ? theme.bgHighlight : '' };
`

// == Details Row 

interface DetailsRowProps {
  openCondition: boolean
}

const OpenConditionContext = createContext(false)

export const DetailsRow: FC<DetailsRowProps> = ({ children, openCondition }) => (
  <OpenConditionContext.Provider value={openCondition}>
    <tr className="details">
      {children}
    </tr>
  </OpenConditionContext.Provider>
)

export const AnimatedCell: FC = ({ children }) => {
  const condition = useContext(OpenConditionContext)

  return (
    <td style={{ verticalAlign: 'top' }}>
      <AnimatePresence>
        {condition &&
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }}>
          <AnimatedCellContainer>
            { children }
          </AnimatedCellContainer>
        </motion.div>
        }
      </AnimatePresence>
    </td>
  )
}

// == Details Toggle

const variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
}

interface DetailToggleProps {
  isOpen: boolean
  onClick: () => void
}

export const DetailToggle: FC<DetailToggleProps> = ({ isOpen, onClick }) => {
  return (
    <DetailToggleWrapper animate={isOpen ? 'open' : 'closed' } variants={variants} onClick={onClick} >
      <ChevronDown size={20} />
    </DetailToggleWrapper>
  )
}

const DetailToggleWrapper = styled(motion.div)`
  cursor: pointer;
  padding: 10px;
`

// === 
// === Styles ====
// === 

interface TableProps {
  hasDetails?: boolean
}

export const Table = styled.table<TableProps>`
  width: 100%;
  text-align: left;
  border-collapse: collapse; 
  vertical-align: middle;

  tr:not(.details) td, th {
    padding: 10px 5px;
  }

  svg {
    vertical-align: inherit;
  }

  tbody {
    tr {
      border-bottom: ${({ hasDetails, theme }) => !hasDetails ? `2px solid ${theme.borderPrimary}` : ''};
    }

    tr.details {
      border-bottom: 2px solid ${({ theme  }) => theme.borderPrimary};
      background-color: ${({ theme  }) => theme.bgHighlight};

      td {
        padding: 0
      }
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

    &.details {
      div { overflow: hidden; }
    }

    &:hover {
      background-color: ${({ theme }) => theme.bgHighlight};
    }
  }
`

export const HighlightedCell = styled.td`
  font-weight: 600 !important;
  color: ${({ theme }) => theme.textAccent };
`

export const AnimatedCellContainer = styled(motion.div)`
  padding: 10px 0;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
`