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

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { PointerEvent, ReactNode, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { getPointerRelativePositionInElement } from '@/utils/pointer'

import CursorHighlight from '../CursorHighlight'

interface Card3DProps {
  children: ReactNode
  onPointerMove?: (pointerX: number, pointerY: number) => void
  onCardHover?: (isHovered: boolean) => void
  onCardFlip?: (isFlipped: boolean) => void
  className?: string
}

const Card3D = ({ children, onPointerMove, onCardFlip, onCardHover, className }: Card3DProps) => {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const baseRotation = isFlipped ? 180 : 0

  const angle = 10

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const springConfig = { damping: 10, stiffness: 100 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const rotateY = useTransform(xSpring, [0, 1], [-angle, angle], {
    clamp: true
  })
  const rotateX = useTransform(ySpring, [0, 1], [angle, -angle], {
    clamp: true
  })

  const reflectionTranslationX = useTransform(xSpring, [0, 1], [angle * 1.5, -angle * 1.5], {
    clamp: true
  })

  const reflectionTranslationY = useTransform(ySpring, [0, 1], [angle * 3, -angle * 3], {
    clamp: true
  })

  const handlePointerMove = (e: PointerEvent) => {
    if (isFlipped) return
    const { x: positionX, y: positionY } = getPointerRelativePositionInElement(e)

    x.set(positionX, true)
    y.set(positionY, true)

    onPointerMove && onPointerMove(positionX, positionY)
  }

  useEffect(() => {
    onCardFlip && onCardFlip(isFlipped)
  }, [isFlipped, onCardFlip])

  useEffect(() => {
    onCardHover && onCardHover(isHovered)
  }, [isHovered, onCardHover])

  return (
    <Card3DStyled whileHover={{ zIndex: 3 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <CardContainer
        className={className}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false)
          setIsFlipped(false)
          x.set(0.5, true)
          y.set(0.5, true)
        }}
        style={{
          rotateY,
          rotateX,
          zIndex: 0
        }}
        animate={{
          translateZ: isHovered ? 100 : 0
        }}
        onClick={() => setIsFlipped((p) => !p)}
      >
        <CardContent>{children}</CardContent>
        <MovingReflection
          style={{ translateX: reflectionTranslationX, translateY: reflectionTranslationY, opacity: 0 }}
          animate={{ opacity: isHovered ? (theme.name === 'dark' ? 0.5 : 1) : 0 }}
        />
      </CardContainer>
    </Card3DStyled>
  )
}

const Card3DStyled = styled(motion.div)`
  display: flex;
  position: relative;
  perspective: 1000px;
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
  border-style: solid;
  padding: 20px;
  border-width: 1px;
  background-color: ${({ theme }) => theme.bg.primary};
  box-shadow: ${({ theme }) =>
    theme.name === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.4)' : '0 1px 2px rgba(0, 0, 0, 0.1)'};

  border-color: ${({ theme }) => theme.border.secondary};

  transition: box-shadow 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);

  &:hover {
    cursor: pointer;
    border-color: ${({ theme }) => theme.border.primary};
    box-shadow: ${({ theme }) =>
      theme.name === 'dark' ? '0 50px 80px rgba(0, 0, 0, 0.6)' : '0 20px 40px rgba(0, 0, 0, 0.1)'};
  }
`

const CardContent = styled.div``

const MovingReflection = styled(motion.div)`
  position: absolute;
  background: linear-gradient(
    60deg,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 70%,
    rgba(255, 255, 255, 0.3) 80%,
    transparent 90%
  );
  pointer-events: none;

  inset: -50px;
`

export default Card3D
