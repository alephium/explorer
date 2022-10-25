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

import { colord } from 'colord'
import { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

const Button = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props}>{children}</button>
}

export default styled(Button)`
  background-color: ${({ theme }) => theme.bgPrimary};
  color: ${({ theme }) => theme.textPrimary};
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.borderSecondary};
  padding: 10px 15px;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? colord(theme.bgPrimary).lighten(0.05).toHex()
        : colord(theme.bgPrimary).darken(0.02).toHex()};
  }
`
