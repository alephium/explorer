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

import { ALPH } from '@alephium/token-list'
import { HelpCircle } from 'lucide-react'
import styled, { css, useTheme } from 'styled-components'

import { useAssetMetadata } from '@/api/assets/assetsHooks'
import AlephiumLogoSVG from '@/images/alephium_logo_monochrome.svg'
import { useQuery } from '@tanstack/react-query'
import { assetsQueries } from '@/api/assets/assetsApi'

interface AssetLogoProps {
  assetId: string
  size: number
  showTooltip?: boolean
  className?: string
}

const AssetLogo = ({ assetId, showTooltip, className }: AssetLogoProps) => {
  const theme = useTheme()

  const metadata = useAssetMetadata(assetId)

  const { data: nftData } = useQuery({
    ...assetsQueries.nftData.details(metadata.id, metadata.type === 'non-fungible' ? metadata.tokenUri : undefined),
    enabled: metadata.type === 'non-fungible'
  })

  const assetType = metadata.type

  return (
    <div className={className} data-tip={showTooltip && (assetType === 'fungible' ? metadata.name : metadata.id)}>
      {assetId === ALPH.id ? (
        <LogoImage src={AlephiumLogoSVG} />
      ) : assetType === 'fungible' ? (
        metadata.verified ? (
          <LogoImage src={metadata.logoURI} />
        ) : (
          <span>{metadata.name.substring(0, 2)}</span>
        )
      ) : assetType === 'non-fungible' ? (
        <LogoImage src={nftData?.image} />
      ) : (
        <HelpCircle color={theme.font.secondary} opacity={0.5} strokeWidth={1.5} />
      )}
    </div>
  )
}

export default styled(AssetLogo)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex-shrink: 0;
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.tertiary};

  ${({ assetId }) =>
    assetId === ALPH.id &&
    css`
      padding: 0.2rem;
      background: linear-gradient(218.53deg, #0075ff 9.58%, #d340f8 86.74%);
    `};
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`
