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

import SkeletonLoader from './SkeletonLoader'

interface Props {
  primary: ReactNode
  secondary: ReactNode
  isLoading: boolean
}

const StatisticTextual = ({ primary, secondary, isLoading }: Props) =>
  isLoading ? (
    <SkeletonLoaderStyled heightInPx={136} />
  ) : (
    <Container>
      <Primary>{primary}</Primary>
      <Secondary>{secondary}</Secondary>
    </Container>
  )

const SkeletonLoaderStyled = styled(SkeletonLoader)`
  padding: 20px 20px 34px;
`

const Container = styled.div``

const Primary = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 23px;
  font-weight: 500;
  padding: 20px 6px 0px 20px;
`

const Secondary = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  padding: 0 6px 0px 20px;
`

export default StatisticTextual