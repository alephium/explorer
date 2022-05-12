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

import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  label: string
  className?: string
}

const Card: FC<Props> = ({ label, className, children }) => (
  <div className={className}>
    <Label>
      <LabelText>{label}</LabelText>
    </Label>
    <Content>{children}</Content>
  </div>
)

const Container = styled.div`
  background-color: ${({ theme }) => theme.bgPrimary};
  box-shadow: ${({ theme }) => theme.shadowPrimary};
  border-radius: 9px;
  display: flex;
  width: 100%;
  flex-direction: column;
`

const LabelText = styled.span`
  height: 31px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
`

const Label = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.borderSecondary};
  border-top-left-radius: 9px;
  border-top-right-radius: 9px;
  background-color: ${({ theme }) => theme.borderSecondary};
  padding: 9px 22px 7px 20px;
`

const Content = styled.div``

export default Card
