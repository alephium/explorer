# Alephium Explorer - Front-end

A blockchain explorer front-end for Alephium.

## Features

* Switch between main and test networks
* Search for an address or transaction
* List blocks
  * Hash, timestamp, height, number of TX, and chain index
* Transaction view
  * Hash, status, block hash, timestamp, inputs, outputs, gas, TX fee
* Address view
  * Address, number of transactions, total balance, locked balance, history

## Development

Everything is managed with NPM.

* Install dependencies: `npm install`
* Starting the project: `npm run start`
* Building the project: `npm run build`
* Run the tests: `npm run test`
* Lint and fix: `npm run lint:fix`

See `package.json`'s `script` property for more options.

## Notes

This project uses [alephium-js](https://github.com/alephium/alephium-js).
It's suggested to download `alephium-js` to refer to it as documentation on
the network requests (`api/api-explorer.ts`).
