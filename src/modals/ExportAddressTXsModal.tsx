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

import { getHumanReadableError } from '@alephium/sdk'
import dayjs from 'dayjs'
import { ComponentProps, useCallback, useState } from 'react'
import styled from 'styled-components'

import Button from '@/components/Buttons/Button'
import HighlightedHash from '@/components/HighlightedHash'
import LoadingSpinner from '@/components/LoadingSpinner'
import Modal from '@/components/Modal/Modal'
import Select, { SelectListItem } from '@/components/Select'
import { useGlobalContext } from '@/contexts/global'
import { SIMPLE_DATE_FORMAT } from '@/utils/strings'

type TimePeriodValue = '1w' | '1m' | '6m' | '12m' | 'previousYear' | 'thisYear'

const now = dayjs()

const timePeriods: Record<TimePeriodValue, { from: number; to: number }> = {
  '1w': { from: now.startOf('day').subtract(7, 'day').valueOf(), to: now.valueOf() },
  '1m': { from: now.startOf('day').subtract(30, 'day').valueOf(), to: now.valueOf() },
  '6m': { from: now.startOf('day').subtract(6, 'month').valueOf(), to: now.valueOf() },
  '12m': { from: now.startOf('day').subtract(12, 'month').valueOf(), to: now.valueOf() },
  previousYear: {
    from: now.subtract(1, 'year').startOf('year').valueOf(),
    to: now.subtract(1, 'year').endOf('year').valueOf()
  },
  thisYear: { from: now.startOf('year').valueOf(), to: now.valueOf() }
}

interface ExportAddressTXsModalProps extends Omit<ComponentProps<typeof Modal>, 'children'> {
  addressHash: string
}

const ExportAddressTXsModal = ({ addressHash, onClose, ...props }: ExportAddressTXsModalProps) => {
  const { client, setSnackbarMessage } = useGlobalContext()

  const [timePeriodValue, setTimePeriodValue] = useState<TimePeriodValue>('1w')
  const [isLoading, setIsLoading] = useState(false)

  const getCSVFile = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await client?.addresses.getAddressesAddressExportTransactionsCsv(addressHash, {
        fromTs: timePeriods[timePeriodValue].from,
        toTs: timePeriods[timePeriodValue].to
      })

      const blob = await result?.blob()

      if (!blob) throw 'Problem while downloading the CSV file'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${addressHash}__${timePeriodValue}__${dayjs().format('DD-MM-YYYY')}` // Filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSnackbarMessage({
        text: 'The CSV has been successfully downloaded',
        type: 'success'
      })

      onClose()
    } catch (e) {
      setSnackbarMessage({
        text: getHumanReadableError(e, 'Problem while downloading the CSV file'),
        type: 'alert'
      })
    } finally {
      setIsLoading(false)
    }
  }, [addressHash, client?.addresses, onClose, setSnackbarMessage, timePeriodValue])

  return (
    <Modal maxWidth={550} onClose={onClose} {...props}>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner size={35} />
        </LoadingOverlay>
      )}
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
        <Button accent big onClick={getCSVFile}>
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
    value: '12m',
    label: `Last 12 months 
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  z-index: 100;

  > * {
    margin: auto;
  }
`
