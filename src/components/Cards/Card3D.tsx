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

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { PointerEvent, ReactNode, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { getPointerRelativePositionInElement } from '@/utils/pointer'

import CursorHighlight from '../CursorHighlight'

interface Card3DProps {
  children: ReactNode
  onPointerMove?: (pointerX: number, pointerY: number) => void
  onCardExpansion?: (isExpanded: boolean) => void
  className?: string
}

const Card3D = ({ children, onPointerMove, onCardExpansion, className }: Card3DProps) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const angle = 1

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const rotateY = useTransform(x, [0, 1], [-angle, angle], {
    clamp: true
  })
  const rotateX = useTransform(y, [0, 1], [angle, -angle], {
    clamp: true
  })

  const handlePointerMove = (e: PointerEvent) => {
    const { x: positionX, y: positionY } = getPointerRelativePositionInElement(e)

    x.set(positionX, true)
    y.set(positionY, true)

    onPointerMove && onPointerMove(positionX, positionY)
  }

  useEffect(() => {
    onCardExpansion && onCardExpansion(isExpanded)
  }, [isExpanded, onCardExpansion])

  return (
    <Card3DStyled whileHover={{ zIndex: 3 }}>
      <CardContainer
        className={className}
        whileHover={{
          boxShadow: theme.name === 'dark' ? '0 50px 80px rgba(0, 0, 0, 0.6)' : '0 50px 80px rgba(0, 0, 0, 0.3)',
          borderWidth: 1,
          borderColor: theme.font.primary,
          cursor: 'pointer'
        }}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false)
          setIsExpanded(false)
          x.set(0.5, true)
          y.set(0.5, true)
        }}
        style={{
          rotateY,
          rotateX,
          zIndex: 0
        }}
        animate={{
          translateZ: isExpanded ? 30 : isHovered ? 10 : 0
        }}
        onClick={() => setIsExpanded((p) => !p)}
      >
        <CardContent>{children}</CardContent>
        <StyledCursorHighlight />
      </CardContainer>
    </Card3DStyled>
  )
}

const Card3DStyled = styled(motion.div)`
  display: flex;
  position: relative;
  perspective: 100px;
  transform-style: preserve-3d;
`

const CardContainer = styled(motion.div)`
  min-height: 11rem;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1;
  overflow: hidden;
  border-radius: 9px;
  border-color: transparent;
  border-style: solid;
  padding: 20px;
  background-color: ${({ theme }) => theme.bg.primary};
  box-shadow: ${({ theme }) =>
    theme.name === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.4)' : '0 1px 2px rgba(0, 0, 0, 0.2)'};
`

const StyledCursorHighlight = styled(CursorHighlight)``

const CardContent = styled.div``

export default Card3D
