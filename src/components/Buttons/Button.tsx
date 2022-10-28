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
import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

interface ButtonProps extends MotionProps {
  accent?: boolean
  big?: boolean
  children: ReactNode
}

const Button = ({ accent, big, children, ...props }: ButtonProps) => {
  const theme = useTheme()

  const bgColor = accent ? theme.accent : theme.bgPrimary

  return (
    <motion.button
      {...props}
      style={{
        backgroundColor: bgColor,
        color: accent ? theme.white : theme.textPrimary,
        height: big ? '50px' : 'intial',
        minWidth: big ? '250px' : 'initial'
      }}
      whileHover={{
        backgroundColor:
          theme.name === 'dark'
            ? colord(bgColor).lighten(0.05).toRgbString()
            : colord(bgColor).darken(0.02).toRgbString()
      }}
      transition={{
        duration: 0.1
      }}
    >
      {children}
    </motion.button>
  )
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
