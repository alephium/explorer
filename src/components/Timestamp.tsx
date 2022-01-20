// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import dayjs from 'dayjs'
import { MouseEvent, useContext } from 'react'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import { GlobalContext } from '..'

dayjs.extend(localizedFormat)

interface TimestampProps {
  timeInMs: number
  forceHighPrecision?: boolean
}

const Timestamp = ({ timeInMs, forceHighPrecision = false }: TimestampProps) => {
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useContext(GlobalContext)

  const isHighPrecision = timestampPrecisionMode === 'on' || forceHighPrecision

  const handleTimestampClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (forceHighPrecision) return
    e.stopPropagation()
    setTimestampPrecisionMode(timestampPrecisionMode === 'on' ? 'off' : 'on')
  }

  const highPrecisionTimestamp = dayjs(timeInMs).format('L LTS UTCZ')
  const lowPrecisionTimestamp = dayjs().to(timeInMs)

  return (
    <>
      <span
        onClick={handleTimestampClick}
        data-tip={`
        ${isHighPrecision ? lowPrecisionTimestamp : highPrecisionTimestamp}
        <br/>
        (${isHighPrecision ? 'Click for human friendly format' : 'Click for higher precision'})`}
        data-multiline
      >
        {isHighPrecision ? highPrecisionTimestamp : lowPrecisionTimestamp}
      </span>
    </>
  )
}

export default Timestamp
