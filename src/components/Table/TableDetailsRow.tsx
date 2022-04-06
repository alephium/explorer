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
import styled from 'styled-components'

import { SectionContext } from '../Section'

interface DetailsRowProps {
  openCondition: boolean
}

interface AnimatedCellProps {
  className?: string
  colSpan?: number
  alignItems?: 'left' | 'right'
}

interface DetailToggleProps {
  isOpen: boolean
  onClick: () => void
}

export const TableDetailsRow: FC<DetailsRowProps> = ({ children, openCondition }) => {
  const rebuildTooltips = useContext(SectionContext).rebuildTooltips
  useEffect(() => rebuildTooltips()) // Need to rebuild after lazy rendering

  return (
    <OpenConditionContext.Provider value={openCondition}>
      <tr className="details">{children}</tr>
    </OpenConditionContext.Provider>
  )
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

export const DetailToggle = ({ isOpen, onClick }: DetailToggleProps) => (
  <td style={{ padding: 0, textAlign: 'center', overflow: 'hidden' }}>
    <DetailToggleWrapper animate={isOpen ? 'open' : 'closed'} variants={variants} onClick={onClick}>
      <ChevronDown size={20} />
    </DetailToggleWrapper>
  </td>
)

const variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
}

const OpenConditionContext = createContext(false)

const DetailToggleWrapper = styled(motion.div)`
  cursor: pointer;
`

const AnimatedCellContainer = styled(motion.div)<{ alignItems: 'left' | 'right' }>`
  padding: 10px 0;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: ${({ alignItems }) => (alignItems === 'left' ? 'flex-start' : 'flex-end')};
`
