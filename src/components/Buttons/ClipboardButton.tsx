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

import { Check, Copy } from 'lucide-react'
import { MouseEvent, useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled, { css } from 'styled-components'

import { useGlobalContext } from '@/contexts/global'

interface ClipboardButtonProps {
  textToCopy: string
  tooltip?: string
  hasBackground?: boolean
  className?: string
}

const ClipboardButton = ({ textToCopy, tooltip, className }: ClipboardButtonProps) => {
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { setSnackbarMessage } = useGlobalContext()

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    navigator.clipboard
      .writeText(textToCopy)
      .catch((e) => {
        throw e
      })
      .then(() => {
        setHasBeenCopied(true)
      })
  }

  useEffect(() => {
    // Reset icon after copy
    let interval: ReturnType<typeof setInterval>

    if (hasBeenCopied) {
      ReactTooltip.rebuild()
      setSnackbarMessage({ text: 'Copied to clipboard!', type: 'info' })

      interval = setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [hasBeenCopied, setSnackbarMessage])

  return (
    <div className={className}>
      {!hasBeenCopied ? (
        <StyledClipboardIcon data-tip={tooltip || 'Copy to clipboard'} onClick={handleClick} />
      ) : (
        <StyledCheckIcon />
      )}
    </div>
  )
}

export default styled(ClipboardButton)`
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
  cursor: pointer;

  & svg {
    width: 1em;
    height: 1em;
  }

  ${({ hasBackground }) =>
    hasBackground &&
    css`
      background-color: ${({ theme }) => theme.bg.accent};
      padding: 3px;
      border-radius: 4px;

      & svg {
        width: 0.8em;
        height: 0.8em;
      }
    `}
`

const StyledClipboardIcon = styled(Copy)`
  stroke: currentColor;
`

const StyledCheckIcon = styled(Check)`
  color: ${({ theme }) => theme.global.valid};
`
