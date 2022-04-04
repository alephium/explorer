# Alephium Explorer - Front-end

A blockchain explorer front-end for Alephium.

## Features

- Switch between main and test networks
- Search for an address or transaction
- List blocks
  - Hash, timestamp, height, number of TX, and chain index
- Transaction view
  - Hash, status, block hash, timestamp, inputs, outputs, gas, TX fee
- Address view
  - Address, number of transactions, total balance, locked balance, history
- Statistics
  - Hashrate, supply, transactions, blocks, number of chains

## Development

Everything is managed with NPM.

- Install dependencies: `npm install`
- Starting the project: `env $(cat .env.placeholder | xargs) npm run start`
- Building the project: `npm run build`
- Run the tests: `npm run test`
- Lint and fix: `npm run lint:fix`

See `package.json`'s `script` property for more options.

**Note**: You will probably want to change the variables in `.env.placeholder`
to use your local `explorer-backend`.

## Notes

This project uses [@alephium/sdk](https://github.com/alephium/js-sdk).
Please down the package to refer to it as documentation for the network request
methods (`api/api-explorer.ts`).
