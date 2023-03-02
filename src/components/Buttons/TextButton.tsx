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

import React, { FC } from 'react'
import styled from 'styled-components'

const TextButton: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <StyledTextButton {...props}>{children}</StyledTextButton>
)

const StyledTextButton = styled.button`
  background: transparent;
  font-size: inherit;
  color: ${({ theme, disabled }) => {
    if (disabled) return theme.font.secondary
    else return theme.global.accent
  }};

  display: flex;
  align-items: center;
  padding: 0;
  border: 0;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  &:hover {
    color: ${({ theme, disabled }) => {
      if (disabled) return
      return theme.global.accent
    }};
  }
`

export default TextButton
