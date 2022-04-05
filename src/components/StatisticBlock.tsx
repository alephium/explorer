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
import styled from 'styled-components'

import LoadingSpinner from './LoadingSpinner'

interface Props {
  title: string
  primary: ReactNode
  secondary: ReactNode
  isLoading: boolean
}

const StatisticBlock = ({ title, primary, secondary, isLoading }: Props) =>
  isLoading ? (
    <BlockCenteredContent>
      <LoadingSpinner />
    </BlockCenteredContent>
  ) : (
    <Block>
      <Title>{title}</Title>
      <Primary>{primary}</Primary>
      <Secondary>{secondary}</Secondary>
    </Block>
  )

const Block = styled.div`
  background-color: ${({ theme }) => theme.bgTertiary};
  border: 1px solid ${({ theme }) => theme.borderSecondary};
  box-shadow: ${({ theme }) => theme.shadowPrimary};
  border-radius: 7px;
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 20px 20px 34px;
`

const BlockCenteredContent = styled(Block)`
  align-items: center;
`

const Title = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  margin-bottom: 18px;
`

const Primary = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 23px;
  font-weight: 500;
`
const Secondary = styled.div`
  color: ${({ theme }) => theme.textSecondary};
`

export default StatisticBlock
