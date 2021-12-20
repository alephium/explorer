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

import { useCallback, useContext, useEffect, useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import logoLight from '../images/explorer-logo-light.svg'
import logoDark from '../images/explorer-logo-dark.svg'
import blockIcon from '../images/block-icon.svg'
import addressIcon from '../images/address-icon.svg'
import transactionIcon from '../images/transaction-icon.svg'
import { deviceBreakPoints, deviceSizes } from '../style/globalStyles'
import { X } from 'lucide-react'
import { useWindowSize } from '../hooks/useWindowSize'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeSwitcher, { StyledThemeSwitcher } from './ThemeSwitcher'
import { GlobalContext } from '..'
import Menu from './Menu'

import NetworkLogo from './NetworkLogo'

export type SidebarState = 'open' | 'close'

const Sidebar = ({ sidebarState }: { sidebarState: SidebarState }) => {
  const theme = useTheme()
  const windowWidth = useWindowSize().width
  const lastWindowWidth = useRef(windowWidth)
  const { setSidebarState, networkType } = useContext(GlobalContext)

  const isMainnet = networkType === 'mainnet'

  const switchToNetwork = (network: string) => {
    if (networkType !== network) {
      window.location.assign(isMainnet ? 'https://explorer.alephium.org' : `https://testnet.alephium.org`)
    }
  }

  const closeSidebar = useCallback(() => {
    setSidebarState('close')
  }, [setSidebarState])

  useEffect(() => {
    if (windowWidth) {
      if (
        lastWindowWidth.current &&
        lastWindowWidth.current >= deviceSizes.tablet &&
        windowWidth < deviceSizes.tablet &&
        open
      ) {
        closeSidebar()
      }

      lastWindowWidth.current = windowWidth
    }
  }, [closeSidebar, windowWidth])

  return (
    <>
      <SidebarContainer open={sidebarState === 'open'}>
        <CloseButton onClick={closeSidebar}>{<X />}</CloseButton>
        <Header>
          <Link to="/">
            <Logo alt="alephium" src={theme.name === 'light' ? logoLight : logoDark} />
          </Link>
          <NetworkMenu
            label={isMainnet ? 'Mainnet' : 'Testnet'}
            icon={isMainnet ? <NetworkLogo network="mainnet" /> : <NetworkLogo network="testnet" />}
            items={[
              {
                text: 'Mainnet',
                onClick: () => switchToNetwork('mainnet'),
                icon: <NetworkLogo network="mainnet" />
              },
              {
                text: 'Testnet',
                onClick: () => switchToNetwork('testnet'),
                icon: <NetworkLogo network="testnet" />
              }
            ]}
            direction="down"
          />
        </Header>
        <Navigation>
          <NavigationTitle>MENU</NavigationTitle>
          <Tabs>
            <Tab to="/blocks" onClick={closeSidebar}>
              <TabIcon src={blockIcon} alt="blocks" /> Blocks
            </Tab>
            <Tab to="/addresses" onClick={closeSidebar}>
              <TabIcon src={addressIcon} alt="addresses" /> Addresses
            </Tab>
            <Tab to="/transactions" onClick={closeSidebar}>
              <TabIcon src={transactionIcon} alt="transactions" /> Transactions
            </Tab>
          </Tabs>
        </Navigation>
        <ThemeSwitcher />
      </SidebarContainer>
      <AnimatePresence>
        {sidebarState === 'open' && (
          <Backdrop
            onClick={closeSidebar}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* STYLES */

const Logo = styled.img`
  height: 100px;
  width: 140px;
  margin-top: 5px;
  margin-left: 25px;

  @media ${deviceBreakPoints.tablet} {
    width: 150px;
  }
`

const CloseButton = styled.div`
  position: absolute;
  width: 35px;
  height: 35px;
  top: 16px;
  left: 20px;
  display: none;
  z-index: 300;
  padding: 5px;
  border-radius: 100%;

  @media ${deviceBreakPoints.tablet} {
    display: block;
    cursor: pointer;
  }
`

const Backdrop = styled(motion.div)`
  display: none;

  @media ${deviceBreakPoints.tablet} {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: black;
    z-index: 101;
  }
`

interface SidebarContainerProps {
  open: boolean
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 250px;

  background-color: ${({ theme }) => theme.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.borderPrimary};

  ${StyledThemeSwitcher} {
    display: block;
    position: absolute;
    bottom: 25px;
    left: 25px;
  }

  @media ${deviceBreakPoints.tablet} {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    width: 250px;

    transition: all 0.15s ease-out;
    transform: ${({ open }) => (!open ? 'translateX(-100%)' : '')};
  }
`

const Header = styled.header`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bgHighlight};

  @media ${deviceBreakPoints.tablet} {
    padding-top: 50px;
  }
`

const Tabs = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
`

const Navigation = styled.nav`
  margin-top: 25px;
`

const NavigationTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  padding: 0 25px;
  color: ${({ theme }) => theme.textSecondary};
`

const Tab = styled(NavLink)`
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
  position: relative;
  padding: 13px 20px;

  color: ${({ theme }) => theme.textSecondary};
  &.active {
    color: ${({ theme }) => theme.textPrimary};

    img {
      filter: none;
    }
  }
  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
`

const TabIcon = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 15px;
  filter: grayscale(100%);
`

// Network switch

const NetworkMenu = styled(Menu)`
  border-width: 1px 0;
  border-style: solid;
  border-color: ${({ theme }) => theme.borderSecondary};
`

export default Sidebar
