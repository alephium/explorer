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

import { HTMLMotionProps, motion } from 'framer-motion'
import styled from 'styled-components'

const FullScreenCard = (props: HTMLMotionProps<'div'>) => <Container {...props}></Container>

const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 20vh 10vw;
  background-color: ${({ theme }) => theme.bgPrimary};
  border-radius: 9px;
  z-index: 100;

  &::after {
    content: '';
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    background-color: rgba(0, 0, 0, 0.5);
  }
`

export default FullScreenCard
