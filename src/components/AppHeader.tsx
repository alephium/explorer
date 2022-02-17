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

import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import logoDark from '../images/explorer-logo-dark.svg'
import logoLight from '../images/explorer-logo-light.svg'
import { deviceBreakPoints } from '../style/globalStyles'
import NetworkSwitch from './NetworkSwitch'
import SearchBar from './SearchBar'

interface AppHeaderProps {
  className?: string
}

const AppHeader = ({ className }: AppHeaderProps) => {
  const theme = useTheme()

  return (
    <header className={className}>
      <Link to="/">
        <Logo alt="alephium" src={theme.name === 'light' ? logoLight : logoDark} />
      </Link>
      <SearchBar />
      <NetworkSwitch />
    </header>
  )
}

const Logo = styled.img`
  height: 100px;
  width: 140px;
  margin-top: 5px;
  margin-left: 25px;

  @media ${deviceBreakPoints.tablet} {
    width: 150px;
  }
`

export default styled(AppHeader)`
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  gap: 5vw;
`
