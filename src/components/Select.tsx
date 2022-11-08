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

import { motion, MotionStyle, Transition, Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ReactNode, useRef, useState } from 'react'
import styled from 'styled-components'

import useOnClickOutside from '@/hooks/useOnClickOutside'

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
  }
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
    initialItemHeight: 55,
    expandedItemHeight: 60,
    initialListWidth: '98%',
    expandedListWidth: '100%'
  },
  alignText,
  borderRadius = 12,
  className,
  style
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { initialItemHeight, expandedItemHeight, initialListWidth, expandedListWidth } = dimensions as Required<
    typeof dimensions
  >

  const orderedItems = [
    items.find(({ value }) => selectedItemValue === value),
    ...items.filter(({ value }) => selectedItemValue !== value)
  ] as SelectItem[]

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
    !isOpen && setIsOpen(true)

    // Scroll to top
    listRef.current?.scroll(0, 0)
  }

  const handleClickOutside = () => {
    setIsOpen(false)
  }

  const handleItemClick = (value: string) => {
    setIsOpen(false)
    onItemClick(value)
  }

  useOnClickOutside({ ref: wrapperRef, handler: handleClickOutside })

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
      variants={{
        open: {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <Divider style={{ top: expandedItemHeight }} />
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
          borderRadius: borderRadius
        }}
        transition={transition}
        ref={listRef}
      >
        {orderedItems.map(({ value, label, Component }, i) => (
          <ItemContainer
            key={value}
            onClick={() => handleItemClick(value)}
            variants={itemContainerVariants}
            style={{
              height: initialItemHeight,
              justifyContent: alignText,
              cursor: i === 0 && !isOpen ? 'pointer' : 'initial'
            }}
            borderRadius={borderRadius}
          >
            <Title
              style={{
                opacity: shouldAnimateItem(value) || i === 0 ? 1 : 0,
                top: expandedItemHeight / 6,
                fontSize: expandedItemHeight / 5 >= 12 ? 12 : expandedItemHeight / 5
              }}
            >
              {title}
            </Title>
            <ItemContent
              style={{
                paddingTop: i === 0 ? expandedItemHeight / 3.5 : 0
              }}
            >
              {label ? label : Component ? Component : null}
            </ItemContent>
            {i === 0 && <ChevronDown strokeWidth={1.5} strokeOpacity={isOpen ? 0.5 : 1} />}
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
  height: 60px;
  overflow: hidden;
`

const ItemList = styled(motion.div)`
  margin-right: auto;
  margin-left: auto;
  z-index: 3;
  overflow: auto;
  background-color: ${({ theme }) => theme.bgPrimary};

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
  justify-content: start;
  text-align: center;
  white-space: nowrap;

  width: 100%;

  font-weight: 600;
  font-size: 13px;
  line-height: 14.4px;

  padding: 15px;

  color: rgba(255, 255, 255, 0.7);
  background-color: ${({ theme }) => theme.bgPrimary};
  z-index: 1;

  &:hover:not(:first-child) {
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
      cursor: pointer;
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

const Divider = styled.div`
  position: absolute;
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.borderSecondary};
  z-index: 2;
`

const ItemContent = styled(motion.div)`
  flex: 1;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Title = styled(motion.span)`
  position: absolute;
  opacity: 0;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 600;
`
