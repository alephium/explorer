import dayjs from 'dayjs'
import { MouseEvent, useContext } from 'react'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { GlobalContext } from '..'

dayjs.extend(localizedFormat)

interface TimestampProps {
  timeInMs: number
  fullPrecision?: boolean
}

const Timestamp = ({ timeInMs, fullPrecision = false }: TimestampProps) => {
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useContext(GlobalContext)

  const handleTimestampClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (fullPrecision) return
    e.stopPropagation()
    setTimestampPrecisionMode(timestampPrecisionMode === 'on' ? 'off' : 'on')
  }

  return (
    <span onClick={handleTimestampClick}>
      {timestampPrecisionMode === 'on' || fullPrecision ? dayjs(timeInMs).format('L LTS UTCZ') : dayjs().to(timeInMs)}
    </span>
  )
}

export default Timestamp
