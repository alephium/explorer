import { smartHash } from './strings'
import JSBI from 'jsbi'
import { abbreviateAmount } from './amounts'

function alf(amount: JSBI): JSBI {
  return JSBI.multiply(amount, JSBI.BigInt(1000000000000000000))
}

it('abbreviate amount', () => {
  expect(abbreviateAmount(alf(JSBI.BigInt(-1)))).toEqual('0.00'),
    expect(abbreviateAmount(JSBI.BigInt(0))).toEqual('0.00'),
    expect(abbreviateAmount(JSBI.BigInt(1))).toEqual('0.000000000000000001'),
    expect(abbreviateAmount(JSBI.BigInt(100000))).toEqual('0.0000000000001'),
    expect(abbreviateAmount(JSBI.BigInt(1000000000))).toEqual('0.000000001'),
    expect(abbreviateAmount(JSBI.BigInt(2000000000))).toEqual('0.000000002'),
    expect(abbreviateAmount(JSBI.BigInt(2000000000000000))).toEqual('0.002'),
    expect(abbreviateAmount(alf(JSBI.BigInt(1230)))).toEqual('1.230K'),
    expect(abbreviateAmount(alf(JSBI.BigInt(1230000)))).toEqual('1.230M'),
    expect(abbreviateAmount(alf(JSBI.BigInt(1230000000)))).toEqual('1.230B'),
    expect(abbreviateAmount(alf(JSBI.BigInt(1230000000000)))).toEqual('1.230T'),
    expect(abbreviateAmount(alf(JSBI.BigInt(1230000000000000)))).toEqual('1230.000T'),
    expect(abbreviateAmount(alf(JSBI.BigInt(1)))).toEqual('1.0')
})

it('smart hash', () => {
  expect(smartHash('00002f884288e1f4')).toEqual('00002f884288e1f4'),
    expect(smartHash('00002f884288e1f48')).toEqual('00002f88...288e1f48'),
    expect(smartHash('00002f884288e1f4882b8bba09e7a0f1e6339ebabcef27e58e489090b792a820')).toEqual('00002f88...b792a820')
})
