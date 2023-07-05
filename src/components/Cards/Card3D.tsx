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
import { PointerEvent, ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

import { getPointerRelativePositionInElement } from '@/utils/pointer'

import CursorHighlight from '../CursorHighlight'

interface Card3DProps {
  children: ReactNode
  onPointerMove?: (pointerX: number, pointerY: number) => void
  className?: string
}

const Card3D = ({ children, onPointerMove, className }: Card3DProps) => {
  const theme = useTheme()

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

  return (
    <MotionContainer whileHover={{ zIndex: 3 }}>
      <CardContainer
        className={className}
        whileHover={{ translateZ: 10, borderColor: theme.font.secondary, boxShadow: '0 20px 100px rgba(0, 0, 0, 1)' }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          x.set(0.5, true)
          y.set(0.5, true)
        }}
        style={{
          rotateY,
          rotateX,
          zIndex: 0
        }}
      >
        <CardContent>{children}</CardContent>
        <StyledCursorHighlight />
      </CardContainer>
    </MotionContainer>
  )
}

const MotionContainer = styled(motion.div)`
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
  border: 1px solid ${({ theme }) => theme.border.primary};
  padding: 20px;
  box-shadow: 0 0px 0px rgba(0, 0, 0, 1);
`

const StyledCursorHighlight = styled(CursorHighlight)``

const CardContent = styled.div``

export default Card3D
