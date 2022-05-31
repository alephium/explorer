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
import { X } from 'lucide-react'
import { useEffect } from 'react'
import styled from 'styled-components'

interface FullScreenCardProps extends HTMLMotionProps<'div'> {
  label: string
  onClose: () => void
}

const FullScreenCard = ({ children, label, onClose, layoutId, ...props }: FullScreenCardProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)

    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <>
      <Container {...props} layoutId={layoutId}>
        <Header>
          <LabelText>{label}</LabelText>
          <CloseButton onClick={onClose} />
        </Header>
        <Content>{children}</Content>
      </Container>
      <Backdrop onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    </>
  )
}

const Container = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  margin: 15vh 10vw;
  background-color: ${({ theme }) => theme.bgPrimary};
  border-radius: 9px;
  overflow: hidden;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadowPrimary};
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
`

const Header = styled.div`
  height: 50px;
  padding: 20px;
  display: flex;
  background-color: ${({ theme }) => theme.bgSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CloseButton = styled(X)`
  cursor: pointer;
  color: ${({ theme }) => theme.textPrimary};

  :hover {
    color: ${({ theme }) => theme.textSecondary};
  }
`

const LabelText = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
`

const Content = styled.div`
  flex: 1;
  padding: 20px;
`

export default FullScreenCard
