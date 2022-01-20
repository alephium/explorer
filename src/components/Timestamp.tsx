import dayjs from 'dayjs'
import { MouseEvent, useContext } from 'react'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { GlobalContext } from '..'

dayjs.extend(localizedFormat)

interface TimestampProps {
  timeInMs: number
}

const Timestamp = ({ timeInMs }: TimestampProps) => {
  const { timestampPrecisionMode, setTimestampPrecisionMode } = useContext(GlobalContext)

  const handleTimestampClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    setTimestampPrecisionMode(timestampPrecisionMode === 'on' ? 'off' : 'on')
  }

  return (
    <span onClick={handleTimestampClick}>
      {timestampPrecisionMode === 'on' ? dayjs(timeInMs).format('L LTS UTCZ') : dayjs().to(timeInMs)}
    </span>
  )
}

export default Timestamp
