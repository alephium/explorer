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
import { colord } from 'colord'
import { motion, MotionStyle, Transition, Variants } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import useOnOutsideClick from '../hooks/useOnClickOutside'

interface SelectProps {
  items: SelectItem[]
  onItemClick: (value: string) => void
  selectedItemValue?: string
  title: string
  dimensions?: {
    initialItemHeight?: number
    expandedItemHeight?: number
    initialListWidth?: number | string
    expandedListWidth?: number | string
    maxListHeight?: number | string
  }
  alwaysShowTitle?: boolean
  borderRadius?: number
  alignText?: 'start' | 'center' | 'end'
  className?: string
  style?: MotionStyle
}

export interface SelectItem {
  value: string
  label?: string
  Component?: ReactNode
}

const transition: Transition = { type: 'tween', duration: 0.15 }

const Select = ({
  items,
  onItemClick,
  selectedItemValue,
  title,
  dimensions = {
    initialItemHeight: 50,
    expandedItemHeight: 55,
    initialListWidth: '98%',
    expandedListWidth: '100%',
    maxListHeight: 300
  },
  alwaysShowTitle,
  alignText,
  borderRadius = 12,
  className,
  style
}: SelectProps) => {
  const theme = useTheme()

  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { initialItemHeight, expandedItemHeight, initialListWidth, expandedListWidth, maxListHeight } =
    dimensions as Required<typeof dimensions>

  const orderedItems = [
    ...items.filter(({ value }) => selectedItemValue === value),
    ...items.filter(({ value }) => selectedItemValue !== value)
  ]

  const itemContainerVariants: Variants = {
    initial: {
      height: initialItemHeight
    },
    open: {
      height: expandedItemHeight,
      transition
    }
  }

  const handleClick = () => {
    setIsOpen(true)

    // Scroll to top
    listRef.current?.scroll(0, 0)
  }

  const handleClickOutside = () => {
    setIsOpen(false)
  }

  const handleItemClick = (value: string) => {
    onItemClick(value)
  }

  useOnOutsideClick(wrapperRef, handleClickOutside)

  const isSelected = (value: string) => selectedItemValue === value

  const shouldAnimateItem = (value: string) => isSelected(value) && isOpen

  return (
    <SelectWrapper
      role="button"
      aria-label="Selected network"
      className={className}
      onClick={handleClick}
      animate={isOpen ? 'open' : 'initial'}
      style={{ height: initialItemHeight, ...style }}
      ref={wrapperRef}
    >
      <ItemList
        variants={{
          open: {
            height: items.length * expandedItemHeight,
            width: expandedListWidth
          }
        }}
        style={{
          height: initialItemHeight,
          width: initialListWidth,
          maxHeight: maxListHeight,
          borderRadius: borderRadius
        }}
        transition={transition}
        ref={listRef}
      >
        {orderedItems.map(({ value, label, Component }, i) => (
          <ItemContainer
            key={value}
            onClick={() => handleItemClick(value)}
            animate={{
              backgroundColor: shouldAnimateItem(value)
                ? colord(theme.bgHighlight).lighten(0.05).toHex()
                : theme.bgHighlight
            }}
            variants={itemContainerVariants}
            style={{
              height: initialItemHeight,
              justifyContent: alignText
            }}
            borderRadius={borderRadius}
          >
            <Title
              transition={{
                duration: 0.1
              }}
              animate={{
                opacity: shouldAnimateItem(value) || (alwaysShowTitle && i === 0) ? 1 : 0
              }}
              style={{
                top: expandedItemHeight / 10,
                fontSize: expandedItemHeight / 5 >= 12 ? 12 : expandedItemHeight / 5
              }}
            >
              {title}
            </Title>
            <ItemContent
              animate={{
                marginTop: shouldAnimateItem(value) || (alwaysShowTitle && i === 0) ? expandedItemHeight / 3.5 : 0
              }}
            >
              {label ? label : Component ? Component : null}
            </ItemContent>
          </ItemContainer>
        ))}
      </ItemList>
    </SelectWrapper>
  )
}

export default Select

const SelectWrapper = styled(motion.div)`
  position: relative;
  flex: 1;
  cursor: pointer;
`

const ItemList = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin-right: auto;
  margin-left: auto;
  z-index: 3;
  overflow: auto;

  overscroll-behavior: none;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const ItemContainer = styled(motion.div)<{ borderRadius: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: nowrap;

  width: 100%;

  font-weight: 600;
  font-size: 12px;
  line-height: 14.4px;

  padding: 15px;

  background-color: ${({ theme }) => theme.bgHighlight};
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.bgPrimary};

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      border-radius: ${({ borderRadius }) => borderRadius}px;
      background-color: rgba(255, 255, 255, 0.03);
      z-index: 0;
    }
  }

  // Selected network
  &:first-child {
    color: ${({ theme }) => theme.textPrimary};
    font-weight: 600;
    position: sticky;
    top: 0;
    border-radius: ${({ borderRadius }) => borderRadius}px;
    z-index: 2;
  }

  > span {
    padding-right: 5px;
  }
`

const ItemContent = styled(motion.div)`
  max-width: 100%;
`

const Title = styled(motion.span)`
  position: absolute;
  opacity: 0;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 600;
`
