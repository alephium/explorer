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
import styled from 'styled-components'

import { useGlobalContext } from '@/contexts/global'
import { DATE_TIME_FORMAT } from '@/utils/strings'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

type TimestampPrecisionLevel = 'simple' | 'precise'

interface TimestampProps {
  timeInMs: number
  formatToggle?: boolean
  forceFormat?: TimestampPrecisionLevel
  className?: string
}

const Timestamp = ({ timeInMs, className, forceFormat, formatToggle = false }: TimestampProps) => {
  const { timestampPrecisionMode } = useGlobalContext()

  const precision = forceFormat ?? (timestampPrecisionMode === 'on' ? 'precise' : 'simple')

  const highPrecisionTimestamp = dayjs(timeInMs).format(DATE_TIME_FORMAT)
  const lowPrecisionTimestamp = dayjs().to(timeInMs)

  return (
    <div
      data-tip={
        !forceFormat
          ? `${highPrecisionTimestamp}
            ${
              formatToggle ? (
                <span>
                  <br />
                  Click to change format
                </span>
              ) : (
                ''
              )
            }`
          : undefined
      }
      data-multiline
      className={className}
    >
      {precision === 'precise' ? highPrecisionTimestamp : lowPrecisionTimestamp}
    </div>
  )
}

export default styled(Timestamp)`
  overflow: hidden;
  text-overflow: ellipsis;
`
