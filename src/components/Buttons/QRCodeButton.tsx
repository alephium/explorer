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

import { QrCode } from 'lucide-react'
import QRCode from 'qrcode.react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

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

export default QRCodeButton

const StyledClipboardIcon = styled(QrCode)`
  margin-left: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.secondary};
`

const Tooltip = styled(ReactTooltip)`
  opacity: 1 !important;
`
