import { FC } from 'react'
import styled from 'styled-components'

let NotificationBar: FC<{ className?: string }> = ({ className, children }) => {
  return <div className={className}>{children}</div>
}

NotificationBar = styled(NotificationBar)`
  width: 100%;
  font-size: 1rem;
  text-align: center;
  padding: 20px;
`

export default NotificationBar
