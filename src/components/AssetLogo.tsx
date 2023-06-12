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

import { Asset } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { HelpCircle } from 'lucide-react'
import styled, { css } from 'styled-components'

import AlephiumLogoSVG from '@/images/alephium_logo_monochrome.svg'

interface AssetLogoProps {
  asset: Pick<Asset, 'id' | 'logoURI' | 'name'>
  size: number
  showTooltip?: boolean
  className?: string
}

const AssetLogo = ({ asset, size, showTooltip, className }: AssetLogoProps) => (
  <div className={className} data-tip={showTooltip && (asset.name || asset.id)}>
    {asset.logoURI ? (
      <LogoImage src={asset.logoURI} />
    ) : asset.id === ALPH.id ? (
      <LogoImage src={AlephiumLogoSVG} />
    ) : (
      <HelpCircle size={size * 0.6} />
    )}
  </div>
)

export default styled(AssetLogo)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex-shrink: 0;

  ${({ asset, theme }) =>
    asset.id === ALPH.id
      ? css`
          padding: 0.2rem;
          background: linear-gradient(218.53deg, #0075ff 9.58%, #d340f8 86.74%);
        `
      : !asset.logoURI &&
        css`
          background: ${theme.bg.tertiary};
        `}
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`
