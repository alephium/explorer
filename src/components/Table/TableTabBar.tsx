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

export interface TabItem {
  value: string
  label: string
}

interface TableTabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  className?: string
}

const TableTabBar = ({ items, onTabChange, activeTab, className }: TableTabBarProps) => {
  return (
    <div className={className} role="tablist" aria-label="Tab navigation">
      {items.map((item) => {
        const isActive = activeTab.value === item.value

        return (
          <Tab
            key={item.value}
            onClick={() => onTabChange(item)}
            onKeyPress={() => onTabChange(item)}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            isActive={isActive}
          >
            {item.label}
          </Tab>
        )
      })}
    </div>
  )
}

export default styled(TableTabBar)`
  display: flex;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const Tab = styled.div<{ isActive: boolean }>`
  flex: 1;
  text-align: center;
  font-size: 14px;
  height: 55px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.border.primary};
  }

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.font.primary};
          background-color: ${theme.bg.primary};
          border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
          font-weight: 600;
        `
      : css`
          color: ${theme.font.tertiary};
          background-color: ${theme.bg.tertiary};
          border-bottom: 1px solid ${({ theme }) => theme.border.primary};
        `}

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`
