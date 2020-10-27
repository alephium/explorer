// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React from 'react'
import styled from 'styled-components'


interface PageTitleProps {
  title: string
  surtitle?: string
  subtitle?: string
}

const PageTitle: React.FC<PageTitleProps> = ({ title, surtitle, subtitle }) => (
  <>
    {surtitle && <Surtitle>{surtitle}</Surtitle>}
    <Title>
      {title}
    </Title>
    {subtitle && <Subtitle>{subtitle}</Subtitle>}
  </>
)

const Title = styled.h1`
  font-family: 'Poppins';
  font-weight: bold;
  font-size: 3.5rem;
  color: ${({ theme }) => theme.textPrimary };
  margin: 0 0 5px 0;
`

const Surtitle = styled.h2`
  font-family: 'Poppins';
  font-weight: 500;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.textSecondary };
  margin-bottom: 0;
`

const Subtitle = styled.h2`
  font-family: 'Poppins';
  font-weight: 500;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.textSecondary };
`

export default PageTitle