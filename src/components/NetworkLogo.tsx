import styled from 'styled-components'

import { NetworkType } from '..'

interface NetworkLogoProps {
  network: NetworkType
  size?: number
}

const NetworkLogo = ({ network, size = 25 }: NetworkLogoProps) => {
  return (
    <LogoContainer network={network} size={size}>
      {network === 'mainnet' ? 'M' : 'T'}
    </LogoContainer>
  )
}

const LogoContainer = styled.div<NetworkLogoProps>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: 20%;
  background: ${({ network, theme }) => (network === 'mainnet' ? theme.accentGradient : theme.bgSecondary)};
  color: ${({ network, theme }) => (network === 'mainnet' ? 'rgba(255, 255, 255, 0.8)' : theme.textPrimary)};
  border: 1px solid ${({ theme }) => theme.borderPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
`

export default NetworkLogo
