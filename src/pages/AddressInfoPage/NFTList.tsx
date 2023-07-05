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

import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'

import Card3D from '@/components/Cards/Card3D'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { NFTFile, NFTMetadataStored } from '@/types/assets'
import { getPointerRelativePositionInElement } from '@/utils/pointer'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { PointerEvent } from 'react'

interface NFTListProps {
  nfts: NFTMetadataStored[]
}

const NFTList = ({ nfts }: NFTListProps) => (
  <NFTListStyled>
    {nfts.map((nft) => (
      <NFTItem key={nft.id} nft={nft} />
    ))}
  </NFTListStyled>
)

interface NFTItemProps {
  nft: NFTMetadataStored
}

const NFTItem = ({ nft }: NFTItemProps) => {
  const { data: nftData } = useQuery<NFTFile>({
    queryKey: ['nftData', nft.id],
    queryFn: () => fetch(nft.tokenUri).then((res) => res.json())
  })

  const desc = nftData?.description
  const cutDesc = desc && desc?.length > 500 ? nftData?.description?.substring(0, 300) + '...' : desc

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const imagePosX = useTransform(x, [0, 1], ['3px', '-3px'], {
    clamp: true
  })
  const imagePosY = useTransform(y, [0, 1], ['3px', '-3px'], {
    clamp: true
  })

  const handlePointerMove = (pointerX: number, pointerY: number) => {
    x.set(pointerX, true)
    y.set(pointerY, true)
  }

  return (
    <NFTCardStyled onPointerMove={handlePointerMove}>
      <NFTPictureContainer>
        <NFTPicture
          style={{
            backgroundImage: `url(${nftData?.image})`,
            backgroundPositionX: imagePosX,
            backgroundPositionY: imagePosY
          }}
        />
      </NFTPictureContainer>
      <NFTName>{nftData?.name}</NFTName>
      <NFTDescription>{cutDesc}</NFTDescription>
    </NFTCardStyled>
  )
}

export default NFTList

const NFTListStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 25px;
  z-index: 0;

  @media ${deviceBreakPoints.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${deviceBreakPoints.mobile} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${deviceBreakPoints.tiny} {
    grid-template-columns: repeat(1, 1fr);
  }
`

const NFTCardStyled = styled(Card3D)`
  background-color: ${({ theme }) => theme.bg.background1};
  z-index: 1;
`

const NFTPictureContainer = styled.div`
  border-radius: 9px;
  overflow: hidden;
`

const NFTPicture = styled(motion.div)`
  max-width: 100%;
  height: 200px;
  background-size: cover;
  object-fit: cover;
  scale: 1.1;
`

const NFTName = styled.h2``

const NFTDescription = styled.span``
