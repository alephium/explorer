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

import { ComponentProps, useState } from 'react'
import styled from 'styled-components'

import HighlightedHash from '../components/HighlightedHash'
import Modal from '../components/Modal/Modal'
import Select, { SelectItem } from '../components/Select'

interface ExportAddressTXsModalProps extends ComponentProps<typeof Modal> {
  addressHash: string
}

const ExportAddressTXsModal = ({ addressHash, ...props }: ExportAddressTXsModalProps) => {
  const [timePeriodValue, setTimePeriodValue] = useState<TimePeriods>('7d')

  return (
    <Modal {...props} maxWidth={550}>
      <h2>Export address transactions</h2>
      <HighlightedHash text={addressHash} middleEllipsis />
      <Explanations>
        Download the address transaction history. We propose multiple formats, useful for tax reporting.
      </Explanations>
      <Selects>
        <Select
          title="Time period"
          items={timePeriodsItems}
          onItemClick={(v) => setTimePeriodValue(v as TimePeriods)}
          selectedItemValue={timePeriodValue}
        />
      </Selects>
    </Modal>
  )
}

type TimePeriods = '7d' | '30d' | '6m' | '12m' | 'lastYear' | 'thisYear'

const timePeriodsItems: SelectItem[] = [
  {
    value: '7d' as TimePeriods,
    label: 'Last 7 days'
  },
  {
    value: '30d' as TimePeriods,
    label: 'Last 30 days'
  }
]

export default styled(ExportAddressTXsModal)`
  padding: 30px 50px;
`

const Explanations = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin: 40px 0;
  line-height: 20px;
`

const Selects = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`
