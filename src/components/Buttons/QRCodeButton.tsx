import { QrCode } from 'lucide-react'
import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'
import QRCode from 'react-qr-code'

const QRCodeButton = ({ textToEncode }: { textToEncode: string }) => {
  return (
    <>
      <StyledClipboardIcon data-tip data-for="qr-code-tooltip" data-event="click" size={15} />
      <Tooltip id="qr-code-tooltip" backgroundColor="black" globalEventOff="click">
        <QRCode size={150} value={textToEncode} bgColor="black" fgColor="white" />
      </Tooltip>
    </>
  )
}

const StyledClipboardIcon = styled(QrCode)`
  margin-left: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
`

const Tooltip = styled(ReactTooltip)`
  opacity: 1 !important;
`

export default QRCodeButton
