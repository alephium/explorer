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

import dayjs from 'dayjs'
import React, { createContext, FC, useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { APIContext } from '..'
import PageTitle from '../components/PageTitle'
import { Table, TableHeader, TDStyle, TableBody, HighlightedCell } from '../components/Table'
import { Block, Transaction } from '../types/api'
import transactionIcon from '../images/transaction-icon.svg'
import { InputAddressLink, OutputAddressLink, TightLink } from '../components/Links'
import { ArrowRight, ChevronDown } from 'react-feather'
import Badge from '../components/Badge'
import { APIError } from '../utils/client'
import { motion, AnimatePresence } from 'framer-motion'

interface ParamTypes {
  id: string
}

const BlockInfoSection = () => {
  const { id } = useParams<ParamTypes>()
  const [blockInfo, setBlockInfo] = useState<Block & APIError>()
  const client = useContext(APIContext).client

  useEffect(() => {
    (async () => {
      setBlockInfo(await client.block(id))
    })()
  }, [id, client])

  return (
    <section>
      {!blockInfo?.status ? <>
      <PageTitle title="Block" />
      <Table>
        <TableBody tdStyles={BlockTableBodyCustomStyles}>
          <tr><td>Hash</td><HighlightedCell>{blockInfo?.hash}</HighlightedCell></tr>
          <tr><td>Height</td><td>{blockInfo?.height}</td></tr>
          <tr><td>Chain Index</td><td>{blockInfo?.chainFrom} → {blockInfo?.chainTo}</td></tr>
          <tr><td>Nb. of transactions</td><td>{blockInfo?.transactions.length}</td></tr>
          <tr><td>Timestamp</td><td>{dayjs(blockInfo?.timestamp).format('YYYY/MM/DD HH:mm:ss')}</td></tr>
        </TableBody>
      </Table>
      <Subtitle>Transactions</Subtitle>
      <Table hasDetails>
        <TableHeader headerTitles={[ '', 'Hash', 'Inputs', '', 'Outputs', 'Amount' ]} />
        <TableBody tdStyles={TXTableBodyCustomStyles}>
          {blockInfo?.transactions.map(t => (
            <TransactionRow transaction={t} />
          ))}
        </TableBody>
      </Table>
      </> : <span>{blockInfo?.detail}</span>}
    </section>
  )
}


interface TransactionRowProps {
  transaction: Transaction
}

const TransactionRow: FC<TransactionRowProps> = ({ transaction }) => {
  const t = transaction
  const [detailOpen, setDetailOpen] = useState(false)

  const toggleDetail = useCallback(() => setDetailOpen(!detailOpen), [detailOpen])

  return (
    <>
      <Row key={t.hash} isActive={detailOpen} >
        <td><TransactionIcon /></td>
        <td><TightLink to={`/transactions/${t.hash}`} text={t.hash} maxCharacters={16}/></td>
        <td>{t.inputs.length} address{t.inputs.length > 1 ? 'es' : ''}</td>
        <td><ArrowRight size={15} /></td>
        <td>{t.outputs.length} address{t.outputs.length > 1 ? 'es' : ''}</td>
        <td><Badge type={'neutral'}>{t.outputs.reduce<number>((acc, o) => (acc + o.amount), 0)} א</Badge></td>
        <td><DetailToggle isOpen={detailOpen} onClick={toggleDetail} /></td>
      </Row> 
      <DetailsRow openCondition={detailOpen}>
        <td/>
        <td/>
        <AnimatedCell>
          {t.inputs.map(i => <InputAddressLink address={i.address} txHashRef={i.txHashRef} /> )}
        </AnimatedCell>
        <td />
        <AnimatedCell>{t.outputs.map(o => <OutputAddressLink address={o.address} />)}</AnimatedCell>
        <AnimatedCell>{t.outputs.map(o => <div>{o.amount} א</div>)}</AnimatedCell>
        <td />
      </DetailsRow>      
    </>
  )
}

// TODO: make expandlable elements generic (in Table.tsx)

interface RowProps {
  isActive?: boolean
}

const Row = styled.tr<RowProps>`
  background-color: ${({ theme, isActive  }) => isActive ? theme.bgHighlight : '' };
`

interface DetailsRowProps {
  openCondition: boolean
}

const OpenConditionContext = createContext(false)

const DetailsRow: FC<DetailsRowProps> = ({ children, openCondition }) => (
  <OpenConditionContext.Provider value={openCondition}>
    <tr className="details">
      {children}
    </tr>
  </OpenConditionContext.Provider>
)

const AnimatedCell: FC = ({ children }) => {
  const condition = useContext(OpenConditionContext)

  return (
    <td style={{ verticalAlign: 'top' }}>
      <AnimatePresence>
        {condition &&
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }}>
          <AnimatedCellContainer>
            { children }
          </AnimatedCellContainer>
        </motion.div>
        }
      </AnimatePresence>
    </td>
  )
}

const AnimatedCellContainer = styled(motion.div)`
  padding: 10px 0;
  text-align: left;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const Subtitle = styled.h2`
  margin-top: 40px;
`

const TransactionIcon = styled.div`
  background-image: url(${transactionIcon});
  background-position: center;
  background-repeat: no-repeat;
  height: 25px;
  width: 25px;
`

const BlockTableBodyCustomStyles: TDStyle[] = [
  { 
    tdPos: 1,
    style: css`
      width: 30%;
    `
  },
  { 
    tdPos: 2,
    style: css`
      font-weight: 500;
    `
  },
  { 
    tdPos: 4,
    style: css`
      text-align: center;
      color: ${({ theme }) => theme.textSecondary};
      width: 15%;
    `
  },
  { 
    tdPos: 5,
    style: css`
      color: ${({ theme }) => theme.textAccent};
      width: 30%;
    `
  }
]

const TXTableBodyCustomStyles: TDStyle[] = [
  { 
    tdPos: 2,
    style: css`
      width: 25%;
    `
  },
  { 
    tdPos: 3,
    style: css`
      color: ${({ theme }) => theme.textAccent};
      width: 20%;
    `
  },
  { 
    tdPos: 4,
    style: css`
      text-align: center;
      color: ${({ theme }) => theme.textSecondary};
      width: 10%;
    `
  },
  { 
    tdPos: 5,
    style: css`
      color: ${({ theme }) => theme.textAccent};
      width: 20%;
    `
  }
]


// Toggle

const variants = {
  closed: { rotate: 0 },
  open: { rotate: 180 },
}

interface DetailToggleProps {
  isOpen: boolean
  onClick: () => void
}

const DetailToggle: FC<DetailToggleProps> = ({ isOpen, onClick }) => {
  return (
    <DetailToggleWrapper animate={isOpen ? 'open' : 'closed' } variants={variants} onClick={onClick} >
      <ChevronDown size={20} />
    </DetailToggleWrapper>
  )
}

const DetailToggleWrapper = styled(motion.div)`
  cursor: pointer;
  padding: 10px;
`

export default BlockInfoSection