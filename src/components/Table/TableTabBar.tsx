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

import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { deviceBreakPoints } from '@/styles/globalStyles'

export interface TabItem {
  value: string
  label: string | ReactNode
  icon?: string | ReactNode
}

interface TableTabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  className?: string
}

const TableTabBar = ({ items, onTabChange, activeTab, className }: TableTabBarProps) => (
  <div className={className} role="tablist" aria-label="Tab navigation">
    {items.map((item) => {
      const isActive = activeTab.value === item.value

      return (
        <Tab
          key={item.value}
          onClick={() => onTabChange(item)}
          onKeyPress={() => onTabChange(item)}
          isAlone={items.length === 1}
          role="tab"
          tabIndex={0}
          aria-selected={isActive}
          isActive={isActive}
        >
          {item.icon && <TabIcon>{item.icon}</TabIcon>}
          {item.label}
        </Tab>
      )
    })}
  </div>
)

export default styled(TableTabBar)`
  display: flex;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const Tab = styled.div<{ isActive: boolean; isAlone: boolean }>`
  flex: 1;
  text-align: center;
  font-size: 15px;
  height: 55px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 9px 9px 0 0;

  ${({ isAlone }) =>
    isAlone &&
    css`
      justify-content: left;
      padding: 25px;
      cursor: default;
    `}

  @media ${deviceBreakPoints.mobile} {
    font-size: 13px;
  }

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.border.primary};
  }

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.font.primary};
          background-color: ${theme.bg.secondary};
          border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
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

const TabIcon = styled.div`
  margin-right: 10px;

  @media ${deviceBreakPoints.mobile} {
    margin-right: 5px;
  }
`
