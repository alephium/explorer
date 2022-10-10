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

const { readFile, writeFile } = require('fs')

const file = './build/index.html'

readFile(file, 'utf-8', function (err, contents) {
  if (err) {
    console.log(err)
    return
  }

  const replaced0 = contents.replace(
    /__REACT_APP_BACKEND_URL__/g,
    `"${process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:9090'}"`
  )
  const replaced1 = replaced0.replace(
    /__REACT_APP_NETWORK_TYPE__/g,
    `"${process.env.REACT_APP_NETWORK_TYPE ?? 'testnet'}"`
  )

  writeFile(file, replaced1, 'utf-8', function (err) {
    console.log(err)
  })
})
