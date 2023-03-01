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

import styled from 'styled-components'

export default styled.div<{ heightInPx: number }>`
  min-height: ${({ heightInPx }) => heightInPx}px;
  width: 100%;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  border: ${({ theme }) => `1px solid ${theme.borderSecondary}`};
  background: ${({ theme }) => theme.bgPrimary};
  background: linear-gradient(-90deg, rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05));
  background-size: 400% 400%;
  animation: gradientAnimation 1.5s ease-in-out infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: -135% 0%;
    }
  }
`
