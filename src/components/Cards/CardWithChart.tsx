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

import { ArrowRight } from 'lucide-react'
import { ComponentProps } from 'react'
import styled from 'styled-components'

import NakedChart from '../Charts/NakedChart'
import Card from './Card'

interface CardWithChartProps extends ComponentProps<typeof Card> {
  chartSeries: ComponentProps<typeof NakedChart>['series']
  chartColors: ComponentProps<typeof NakedChart>['colors']
  isLoading: boolean
}

const CardWithChart = ({ chartSeries, chartColors, children, ...props }: CardWithChartProps) => (
  <StyledClickableCard {...props}>
    {children}
    <CardChartContainer>
      <NakedChart series={chartSeries} colors={chartColors} />
    </CardChartContainer>
    <SeeMoreLink>
      See more <StyledArrowRight>→</StyledArrowRight>
    </SeeMoreLink>
  </StyledClickableCard>
)

const CardChartContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  opacity: 0.4;
`

const SeeMoreLink = styled.a`
  position: absolute;
  bottom: 10px;
  right: 10px;
  color: ${({ theme }) => theme.textSecondary};
`

const StyledArrowRight = styled.span`
  display: none;
`

const StyledClickableCard = styled(Card)`
  &:hover {
    cursor: pointer;

    ${CardChartContainer} {
      opacity: 1;
    }

    ${SeeMoreLink} {
      color: ${({ theme }) => theme.textPrimary};
    }

    ${StyledArrowRight} {
      display: initial;
    }
  }
`

export default CardWithChart
