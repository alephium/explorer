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
  const { data: nftData } = useQuery<NFTFile>({
    queryKey: ['nftData', nft.id],
    queryFn: () => fetch(nft.tokenUri).then((res) => res.json())
  })

  const desc = nftData?.description
  const cutDesc = desc && desc?.length > 500 ? nftData?.description?.substring(0, 300) + '...' : desc

  return (
    <NFTItemStyled>
      <NFTPicture src={nftData?.image} alt={nftData?.description} />
      <NFTName>{nftData?.name}</NFTName>
      <NFTDescription>{cutDesc}</NFTDescription>
    </NFTItemStyled>
  )
}

export default NFTList

const NFTListStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  padding: 15px;

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

const NFTItemStyled = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 350px;
  background-color: ${({ theme }) => theme.bg.background1};
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const NFTPicture = styled.img`
  max-width: 100%;
  height: 75%;
  object-fit: cover;
`

const NFTName = styled.h2``

const NFTDescription = styled.span``
