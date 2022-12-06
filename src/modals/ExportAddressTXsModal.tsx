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
import { ComponentProps, useCallback, useState } from 'react'
import styled from 'styled-components'

import Button from '@/components/Buttons/Button'
import HighlightedHash from '@/components/HighlightedHash'
import Modal from '@/components/Modal/Modal'
import Select, { SelectListItem } from '@/components/Select'
import { useGlobalContext } from '@/contexts/global'
import { SIMPLE_DATE_FORMAT } from '@/utils/strings'

type TimePeriodValue = '1w' | '1m' | '6m' | '1y' | 'previousYear' | 'thisYear'

const now = dayjs()

const timePeriods: Record<TimePeriodValue, { from: number; to: number }> = {
  '1w': { from: now.startOf('day').subtract(7, 'day').millisecond(), to: now.millisecond() },
  '1m': { from: now.startOf('day').subtract(30, 'day').millisecond(), to: now.millisecond() },
  '6m': { from: now.startOf('day').subtract(6, 'month').millisecond(), to: now.millisecond() },
  '1y': { from: now.startOf('day').subtract(12, 'month').millisecond(), to: now.millisecond() },
  previousYear: { from: now.startOf('year').subtract(1, 'year').millisecond(), to: now.millisecond() },
  thisYear: { from: now.startOf('year').millisecond(), to: now.endOf('year').millisecond() }
}

interface ExportAddressTXsModalProps extends ComponentProps<typeof Modal> {
  addressHash: string
}

const ExportAddressTXsModal = ({ addressHash, ...props }: ExportAddressTXsModalProps) => {
  const { client, setSnackbarMessage } = useGlobalContext()

  console.log(dayjs().subtract(1, 'week').toString())

  const [timePeriodValue, setTimePeriodValue] = useState<TimePeriodValue>('1w')

  const getCSVFile = useCallback(
    async (periodValue: TimePeriodValue) => {
      console.log(client)
      await client?.addresses.getAddressesAddressExportTransactionsCsv(addressHash, {
        fromTs: timePeriods[periodValue].from,
        toTs: timePeriods[periodValue].to
      })
    },
    [addressHash, client]
  )

  return (
    <Modal maxWidth={550} {...props}>
      <h2>Export address transactions</h2>
      <HighlightedHash text={addressHash} middleEllipsis maxWidth="200px" />

      <Explanations>
        You can download the address transaction history for a selected time period. This can be useful for tax
        reporting.
      </Explanations>
      <Selects>
        <Select
          title="Time period"
          items={timePeriodsItems}
          selectedItemValue={timePeriodValue}
          onItemClick={(v) => setTimePeriodValue(v)}
        />
      </Selects>

      <FooterButton>
        <Button accent big onClick={() => getCSVFile(timePeriodValue)}>
          Export
        </Button>
      </FooterButton>
    </Modal>
  )
}

const currentYear = dayjs().year()
const today = dayjs().format(SIMPLE_DATE_FORMAT)

const timePeriodsItems: SelectListItem<TimePeriodValue>[] = [
  {
    value: '1w',
    label: 'Last week'
  },
  {
    value: '1m',
    label: 'Last month'
  },
  {
    value: '6m',
    label: 'Last 6 months'
  },
  {
    value: '1y',
    label: `Last 1 year 
    (${dayjs().subtract(1, 'year').format(SIMPLE_DATE_FORMAT)} 
    - ${today})`
  },
  {
    value: 'previousYear',
    label: `Previous year 
    (01/01/${currentYear - 1} - 31/12/${currentYear - 1})`
  },
  {
    value: 'thisYear',
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
