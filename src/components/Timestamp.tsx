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

import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import { MouseEvent } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useGlobalContext } from '@/contexts/global'
import { DATE_TIME_FORMAT } from '@/utils/strings'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

interface TimestampProps {
  timeInMs: number
  forceHighPrecision?: boolean
  formatToggle?: boolean
  className?: string
}

const Timestamp = ({ timeInMs, className, forceHighPrecision = false, formatToggle = false }: TimestampProps) => {
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useGlobalContext()

  const isHighPrecision = (formatToggle && timestampPrecisionMode === 'on') || forceHighPrecision

  const handleTimestampClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (forceHighPrecision || !formatToggle) return
    e.stopPropagation()
    setTimestampPrecisionMode(timestampPrecisionMode === 'on' ? 'off' : 'on')
    ReactTooltip.hide()
  }

  const highPrecisionTimestamp = dayjs(timeInMs).format(DATE_TIME_FORMAT)
  const lowPrecisionTimestamp = dayjs().to(timeInMs)

  return (
    <div
      onClick={handleTimestampClick}
      data-tip={
        !forceHighPrecision && formatToggle
          ? `${highPrecisionTimestamp}
            <br/>Click to change format`
          : undefined
      }
      data-multiline
      className={className}
    >
      {isHighPrecision ? highPrecisionTimestamp : lowPrecisionTimestamp}
    </div>
  )
}

export default styled(Timestamp)`
  overflow: hidden;
  text-overflow: ellipsis;
`
