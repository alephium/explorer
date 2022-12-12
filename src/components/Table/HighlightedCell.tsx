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

import { FC } from 'react'
import styled from 'styled-components'

import ClipboardButton from '../Buttons/ClipboardButton'
import QRCodeButton from '../Buttons/QRCodeButton'

interface HighlightedCellProps {
  textToCopy?: string
  qrCodeContent?: string
  className?: string
}

const HighlightedCell: FC<HighlightedCellProps> = ({ children, textToCopy, qrCodeContent, className }) => {
  return (
    <span className={className}>
      <span>{children}</span>
      {textToCopy && <ClipboardButton textToCopy={textToCopy} />}
      {qrCodeContent && <QRCodeButton textToEncode={qrCodeContent} />}
    </span>
  )
}

export default styled(HighlightedCell)`
  font-weight: 600 !important;
  color: ${({ theme }) => theme.textAccent};
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow: hidden;
`
