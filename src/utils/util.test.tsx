import { abbreviateAmount, calAmountDelta, smartHash } from './util'

it('abbreviate amount', () => {
  expect(abbreviateAmount(-1.0)).toEqual('0.00'),
    expect(abbreviateAmount(1.23)).toEqual('1.23'),
    expect(abbreviateAmount(1230.0)).toEqual('1.23K'),
    expect(abbreviateAmount(1230000.0)).toEqual('1.23M'),
    expect(abbreviateAmount(1230000000.0)).toEqual('1.23B'),
    expect(abbreviateAmount(1230000000000.0)).toEqual('1.23T'),
    expect(abbreviateAmount(1230000000000000.0)).toEqual('1230.00T'),
    expect(abbreviateAmount(1.0)).toEqual('1.00')
})

it('smart hash', () => {
  expect(smartHash('00002f884288e1f4')).toEqual('00002f884288e1f4'),
    expect(smartHash('00002f884288e1f48')).toEqual('00002f88...288e1f48'),
    expect(smartHash('00002f884288e1f4882b8bba09e7a0f1e6339ebabcef27e58e489090b792a820')).toEqual('00002f88...b792a820')
})
