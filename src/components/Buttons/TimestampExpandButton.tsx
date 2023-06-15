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

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { timestampPrecisionModeChanged } from '@/store/settingsSlice'
import { OnOff } from '@/types/generics'

interface TimestampExpandButtonProps {
  className?: string
}

const config: Record<OnOff, { Icon: (props: LucideProps) => JSX.Element; tooltipContent: string }> = {
  on: {
    Icon: ChevronsRightLeft,
    tooltipContent: 'Switch to simple time'
  },
  off: {
    Icon: ChevronsLeftRight,
    tooltipContent: 'Switch to precise time'
  }
}

const TimestampExpandButton = ({ className }: TimestampExpandButtonProps) => {
  const timestampPrecisionMode = useAppSelector((s) => s.settings.timestampPrecisionMode)
  const dispatch = useAppDispatch()

  const handleClick = () => {
    dispatch(timestampPrecisionModeChanged(timestampPrecisionMode === 'on' ? 'off' : 'on'))
    ReactTooltip.hide()
  }
  const { Icon, tooltipContent } = config[timestampPrecisionMode]

  return (
    <span className={className} onClick={handleClick} data-tip={tooltipContent}>
      <Icon size={11} />
    </span>
  )
}

export default styled(TimestampExpandButton)`
  cursor: pointer;
  color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => theme.bg.accent};
  border-radius: 4px;
  height: 14px;
  width: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 3px;
`
