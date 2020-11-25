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

import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import logoLight from '../images/explorer-logo-light.svg'
import logoDark from '../images/explorer-logo-dark.svg'
import blockIcon from '../images/block-icon.svg'
import addressIcon from '../images/address-icon.svg'
import transactionIcon from '../images/transaction-icon.svg'
import { deviceBreakPoints, deviceSizes } from '../style/globalStyles';
import { Menu, X } from 'react-feather';
import { useWindowSize } from '../hooks/useWindowSize';
import { AnimatePresence, motion } from 'framer-motion';


const Sidebar = () => {
  const theme = useTheme()
  const windowWidth = useWindowSize().width
  const lastWindowWidth = useRef(windowWidth)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (windowWidth) {

      if (lastWindowWidth.current && lastWindowWidth.current >= deviceSizes.mobile && windowWidth < deviceSizes.mobile && open) {
        setOpen(false)
      }

      lastWindowWidth.current = windowWidth
    }

  }, [open, windowWidth])

  return (
    <>
      <HamburgerButton onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </ HamburgerButton>
      <SidebarContainer open={open}>
        <Header>
          <Link to="/"><Logo alt="alephium" src={theme.name === 'light' ? logoLight : logoDark } /></Link>
        </Header>
        <Tabs>
          <Tab to="/blocks" onClick={() => setOpen(false)}><TabIcon src={blockIcon} alt="blocks" /> Blocks</Tab>
          <Tab to="/addresses" onClick={() => setOpen(false)}><TabIcon src={addressIcon} alt="addresses" /> Addresses</Tab>
          <Tab to="/transactions" onClick={() => setOpen(false)}><TabIcon src={transactionIcon} alt="transactions" /> Transactions</Tab>
        </Tabs>
      </SidebarContainer>
      <AnimatePresence>{open && <Backdrop onClick={() => setOpen(false)} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }} transition={{ duration: 0.15 }} />}</AnimatePresence>
    </>
  );
}


/* STYLES */

const Logo = styled.img`
  height: 100px;
  width: 150px;

  @media ${deviceBreakPoints.mobile} {
    margin-left: 45px;
    width: 125px;
  }
`

const HamburgerButton = styled.div`
  position: absolute;
  top: 25px;
  left: 20px;
  display: none;
  z-index: 200;

  @media ${deviceBreakPoints.mobile} {
    display: block;
    cursor: pointer;
  }
`

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: black;
  z-index: 99;
`

interface SidebarContainerProps {
  open: boolean
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 300px;
  padding: 0 20px;
  background-color: ${( { theme }) => theme.bgSecondary };
  border-right: 2px solid ${( { theme }) => theme.borderPrimary };

  @media ${deviceBreakPoints.mobile} {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    width: 250px;

    transition: all 0.15s ease-out;
    transform: ${ ({open}) => !open ? 'translateX(-100%)': '' }
  }
`

const Header = styled.header`
  display: flex;
  align-items: center;
`

const Tabs = styled.div`
  margin-top: 5vw;
  display: flex;
  flex-direction: column;
`

const Tab = styled(NavLink)`
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  position: relative;

  color: ${( { theme }) => theme.textSecondary };
  &.active {
    color: ${( { theme }) => theme.textPrimary };

    img {
      filter: none;
    }

    &::after {
      content: "";
      display: block;
      width: 20px;
      height: 3px;
      position: absolute;
      left: 40px;
      bottom: -6px;
      background: linear-gradient(to left, #6510F7, #F76110) border-box;
    }
  }
  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
`

const TabIcon = styled.img`
  height: 25px;
  width: 25px;
  margin-right: 15px;
  filter: grayscale(100%);
`

export default Sidebar
