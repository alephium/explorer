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
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'
import styled from 'styled-components'

import Card3D from '@/components/Cards/Card3D'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { NFTFile, NFTMetadataStored } from '@/types/assets'

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
  const [isExpanded, setIsExpanded] = useState(false)

  const { data: nftData } = useQuery<NFTFile>({
    queryKey: ['nftData', nft.id],
    queryFn: () => fetch(nft.tokenUri).then((res) => res.json())
  })

  const desc = nftData?.description
  const cutDesc = desc && desc?.length > 500 ? nftData?.description?.substring(0, 300) + '...' : desc

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const springConfig = { damping: 10, stiffness: 100 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const imagePosX = useTransform(xSpring, [0, 1], ['5px', '-5px'], {
    clamp: true
  })
  const imagePosY = useTransform(ySpring, [0, 1], ['5px', '-5px'], {
    clamp: true
  })

  const handlePointerMove = (pointerX: number, pointerY: number) => {
    x.set(pointerX, true)
    y.set(pointerY, true)
  }

  return (
    <NFTCardStyled onPointerMove={handlePointerMove} onCardExpansion={setIsExpanded}>
      <NFTPictureContainer>
        <NFTPicture
          style={{
            backgroundImage: `url(${nftData?.image})`,
            x: imagePosX,
            y: imagePosY,
            scale: 1.1
          }}
          animate={{
            scale: isExpanded ? 1.1 : 1.3
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
  gap: 25px;
  padding: 25px;
  z-index: 0;
  background-color: ${({ theme }) => theme.bg.secondary};

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
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;
`

const NFTPictureContainer = styled.div`
  border-radius: 9px;
  overflow: hidden;
  background-color: black;
`

const NFTPicture = styled(motion.div)`
  max-width: 100%;
  height: 200px;
  background-repeat: no-repeat;
  background-color: black;
  background-size: contain;
  background-position: center;
`

const NFTName = styled.h2``

const NFTDescription = styled.span``
