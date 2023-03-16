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

import { HTMLAttributes } from 'react'
import styled from 'styled-components'

import Ellipsed from '@/components/Ellipsed'

import ClipboardButton from './Buttons/ClipboardButton'

interface HashEllipsedProps extends HTMLAttributes<HTMLDivElement> {
  hash: string
  disableCopy?: boolean
  className?: string
}

const HashEllipsed = ({ hash, disableCopy = false, className, ...props }: HashEllipsedProps) => (
  <Container className={className}>
    <HashContainer>
      <Ellipsed text={hash} {...props} />
    </HashContainer>
    {!disableCopy && <CopyButton textToCopy={hash} tooltip="Copy hash" className={className} />}
  </Container>
)

export default HashEllipsed

const CopyButton = styled(ClipboardButton)`
  flex-shrink: 0;
  display: none;
  height: 18px;
  width: 18px;
  background-color: ${({ theme }) => theme.bg.accent};
  padding: 3px;
  border-radius: 4px;
`

const HashContainer = styled.div`
  flex: 1;
  overflow: hidden;
`

const Container = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  font-family: 'Roboto Mono';

  &:hover {
    ${CopyButton} {
      display: block;
    }

    ${HashContainer} {
      -webkit-mask-image: linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%);
      mask-image: linear-gradient(to left, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%);
    }
  }
`
