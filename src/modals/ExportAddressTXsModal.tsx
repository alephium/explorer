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

import dayjs from 'dayjs'
import { ComponentProps, useState } from 'react'
import styled from 'styled-components'

import Button from '../components/Buttons/Button'
import HighlightedHash from '../components/HighlightedHash'
import Modal from '../components/Modal/Modal'
import Select, { SelectItem } from '../components/Select'
import { SIMPLE_DATE_FORMAT } from '../utils/strings'

interface ExportAddressTXsModalProps extends ComponentProps<typeof Modal> {
  addressHash: string
}

const ExportAddressTXsModal = ({ addressHash, ...props }: ExportAddressTXsModalProps) => {
  const [timePeriodValue, setTimePeriodValue] = useState<TimePeriods>('7d')

  return (
    <Modal {...props} maxWidth={550}>
      <h2>Export address transactions</h2>
      <HighlightedHash text={addressHash} middleEllipsis maxWidth={'200px'} />

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

      <FooterButton>
        <Button accent big>
          Export
        </Button>
      </FooterButton>
    </Modal>
  )
}

type TimePeriods = '7d' | '30d' | '6m' | '12m' | 'lastYear' | 'thisYear'

const currentYear = dayjs().year()
const today = dayjs().format(SIMPLE_DATE_FORMAT)

const timePeriodsItems: SelectItem[] = [
  {
    value: '7d' as TimePeriods,
    label: 'Last 7 days'
  },
  {
    value: '30d' as TimePeriods,
    label: 'Last 30 days'
  },
  {
    value: '6m' as TimePeriods,
    label: 'Last 6 months'
  },
  {
    value: '12m' as TimePeriods,
    label: `Last 1 year 
    (${dayjs().subtract(1, 'year').format(SIMPLE_DATE_FORMAT)} 
    - ${today})`
  },
  {
    value: 'lastYear' as TimePeriods,
    label: `Last year 
    (01/01/${currentYear - 1} - 31/12/${currentYear - 1})`
  },
  {
    value: 'thisYear' as TimePeriods,
    label: `This year (01/01/${currentYear - 1} - ${today})`
  }
]

export default styled(ExportAddressTXsModal)`
  padding: 30px 50px;
`

const Explanations = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin: 30px 0 40px 0;
  line-height: 20px;
`

const Selects = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`

const FooterButton = styled.div`
  bottom: 0;
  right: 0;
  left: 0;
  margin: 50px 0 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`
