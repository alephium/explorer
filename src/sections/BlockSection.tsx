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

import { Card, CardContent, Grid, Typography } from '@material-ui/core'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import Moment from 'react-moment'
import PageTitle from '../components/PageTitle'
import { ExplorerClient } from '../utils/explorer'
import { createClient, useInterval } from '../utils/util'

const BlockSection = () => {

  const [lastFetchTime, setLastFetchTime] = useState(moment())
  const [blocks, setBlocks] = useState<any[]>([]) // TODO: define blocks type
  let client = useRef<ExplorerClient>()


  // Fetching Data
  useEffect(() => {
    const getBlocks = async () => {
      if (!client.current)  {
        client.current = await createClient()
      }

      const to = lastFetchTime

      const from = to.clone().subtract(10, 'minutes')
      console.log('Fetching blocks: ' + from.format() + ' -> ' + to.format() + ' (' + from + ' -> ' + to + ')')

      const blocks: any[] = await client.current.blocks(from.valueOf(), to.valueOf())

      blocks.sort(function (a: any, b: any) {
        return b.timestamp - a.timestamp;
      })

      setBlocks(blocks)
    }

    getBlocks()
  })

  const fetchData = () => setLastFetchTime(moment())

  // Polling
  useInterval(fetchData, 20 * 1000)

  return (
    <section>
      <PageTitle text="Blocks" />
        <Grid container>
          {blocks.map(block => (
            <Grid item xs={6} className="content" key={block.hash} container justify="center">
              <Card className="card">
                <CardContent>
                  <Typography className="title">
                    <a href={"./blocks/" + block.hash}><pre>#{block.hash}</pre></a>
                  </Typography>
                  <Typography className="props" color="textSecondary">
                    height: ⇪ {block.height}<br/>
                    chain index: {block.chainFrom} ➡ {block.chainTo}
                  </Typography>
                  <Typography className="time">
                    <Moment fromNow>{block.timestamp}</Moment> (<Moment format="YYYY/MM/DD HH:mm:ss">{block.timestamp}</Moment>)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
    </section>
  )

}

export default BlockSection