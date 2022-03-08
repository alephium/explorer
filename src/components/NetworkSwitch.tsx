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

import { ComponentPropsWithoutRef } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import Menu from './Menu'
import NetworkLogo from './NetworkLogo'

const NetworkSwitch = ({
  direction = 'down',
  className
}: Pick<ComponentPropsWithoutRef<typeof Menu>, 'direction' | 'className'>) => {
  const { networkType } = useGlobalContext()

  const isMainnet = networkType === 'mainnet'

  const switchToNetwork = (network: string) => {
    if (networkType !== network) {
      window.location.assign(isMainnet ? 'https://testnet.alephium.org' : 'https://explorer.alephium.org')
    }
  }

  return (
    <Menu
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
      direction={direction}
      className={className}
    />
  )
}

export default styled(NetworkSwitch)`
  border-radius: 7px;
  background-color: ${({ theme }) => theme.bgPrimary};
`
