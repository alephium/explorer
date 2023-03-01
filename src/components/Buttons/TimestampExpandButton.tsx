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

import { ChevronsLeftRight, ChevronsRightLeft, LucideProps } from 'lucide-react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useGlobalContext } from '@/contexts/global'
import { OnOff } from '@/types/generics'

interface TimestampExpandButtonProps {
  className?: string
}

const config: Record<OnOff, { Icon: (props: LucideProps) => JSX.Element; tooltipContent: string }> = {
  on: {
    Icon: ChevronsRightLeft,
    tooltipContent: 'Switch to simple format'
  },
  off: {
    Icon: ChevronsLeftRight,
    tooltipContent: 'Switch to complete format'
  }
}

const TimestampExpandButton = ({ className }: TimestampExpandButtonProps) => {
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useGlobalContext()

  const handleClick = () => {
    setTimestampPrecisionMode(timestampPrecisionMode === 'on' ? 'off' : 'on')
    ReactTooltip.hide()
  }
  const { Icon, tooltipContent } = config[timestampPrecisionMode]

  return <Icon size={15} onClick={handleClick} className={className} data-tip={tooltipContent} />
}

export default styled(TimestampExpandButton)`
  cursor: pointer;
  color: ${({ theme }) => theme.global.accent};
`
