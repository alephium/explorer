import { abbreviateAmount, smartHash } from './util'

function alf(amount: bigint): bigint {
  return amount * 1000000000000000000n
}

it('abbreviate amount', () => {
  expect(abbreviateAmount(alf(-1n))).toEqual('0.00'),
    expect(abbreviateAmount(alf(0n))).toEqual('0.00'),
    expect(abbreviateAmount(alf(1230n))).toEqual('1.230K'),
    expect(abbreviateAmount(alf(1230000n))).toEqual('1.230M'),
    expect(abbreviateAmount(alf(1230000000n))).toEqual('1.230B'),
    expect(abbreviateAmount(alf(1230000000000n))).toEqual('1.230T'),
    expect(abbreviateAmount(alf(1230000000000000n))).toEqual('1230.000T'),
    expect(abbreviateAmount(alf(1n))).toEqual('1.0')
})

it('smart hash', () => {
  expect(smartHash('00002f884288e1f4')).toEqual('00002f884288e1f4'),
    expect(smartHash('00002f884288e1f48')).toEqual('00002f88...288e1f48'),
    expect(smartHash('00002f884288e1f4882b8bba09e7a0f1e6339ebabcef27e58e489090b792a820')).toEqual('00002f88...b792a820')
})
