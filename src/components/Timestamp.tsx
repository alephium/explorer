import dayjs from 'dayjs'
import { MouseEvent } from 'react'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { useStateWithLocalStorage } from '../utils/hooks'

dayjs.extend(localizedFormat)

interface TimestampProps {
  timeInMs: number
}

const Timestamp = ({ timeInMs }: TimestampProps) => {
  const [precisionMode, setPrecisionMode] = useStateWithLocalStorage<'on' | 'off'>('timestampPrecisionMode', 'off')

  const handleTimestampClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    setPrecisionMode(precisionMode === 'on' ? 'off' : 'on')
  }

  return (
    <span onClick={handleTimestampClick}>
      {precisionMode === 'on' ? dayjs(timeInMs).format('L LTS UTCZ') : dayjs().to(timeInMs)}
    </span>
  )
}

export default Timestamp
