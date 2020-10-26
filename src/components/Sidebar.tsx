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

import React from 'react';
import { NavLink } from 'react-router-dom'
import * as H from 'history'
import styled, { useTheme } from 'styled-components'

import logoLight from '../images/explorer-logo-light.svg';
import logoDark from '../images/explorer-logo-dark.svg';


const Sidebar = () => {
  const theme = useTheme()

  return (
    <SidebarContainer>
      <Logo alt="alephium" src={theme.name === 'light' ? logoLight : logoDark } />
      <Tabs>
        <Tab to="/blocks">Blocks</Tab>
        <Tab to="/addresses">Addresses</Tab> 
        <Tab to="/transactions">Transactions</Tab>
      </Tabs>
    </SidebarContainer>
  );
}

interface TabProps {
  title: string
  locationString: string
  disabled?: boolean
}

/* STYLES */

const Logo = styled.img`
  height: 100px;
  width: 150px;
`

const SidebarContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 300px;
  padding: 0 20px;
  background-color: ${( { theme }) => theme.bgSecondary };
  border-right: 2px solid ${( { theme }) => theme.borderPrimary };
`

const Tabs = styled.div`
  margin-top: 25px;
  display: flex;
  flex-direction: column;
`

const Tab = styled(NavLink)`
  &.active {
    color: ${( { theme }) => theme.textPrimary };
  }
  color: ${( { theme }) => theme.textSecondary };
  font-size: 1.2rem;
  cursor: pointer;
  margin-bottom: 5px;
  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
`

export default Sidebar
