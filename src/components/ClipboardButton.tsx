import { useEffect, useState, useContext } from 'react'
import { Clipboard, Check } from 'react-feather'
import ReactTooltip from 'react-tooltip'
import styled, { useTheme } from 'styled-components'
import { GlobalContext } from '..'

const ClipboardButton = ({ textToCopy }: { textToCopy: string }) => {
  const theme = useTheme()
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { setSnackbarMessage } = useContext(GlobalContext)

  const handleClick = () => {
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
    if (hasBeenCopied) {
      ReactTooltip.rebuild()
      setSnackbarMessage({ text: 'Copied to clipboard!', type: 'info' })

      setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }
  }, [hasBeenCopied, setSnackbarMessage])

  if (!hasBeenCopied) {
    return <StyledClipboardIcon size={15} data-tip={'Copy to clipboard'} onClick={handleClick} />
  } else {
    return <StyledCheckIcon size={15} />
  }
}

const StyledClipboardIcon = styled(Clipboard)`
  margin-left: 5px;
  cursor: pointer;
  color: ${({ theme }) => theme.textSecondary};
`

const StyledCheckIcon = styled(Check)`
  margin-left: 5px;
  color: ${({ theme }) => theme.textPrimary};
`

export default ClipboardButton
