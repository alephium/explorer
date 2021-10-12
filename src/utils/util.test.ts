import { checkAddressValidity, checkHexStringValidity, smartHash } from './strings'
import JSBI from 'jsbi'
import { abbreviateAmount, removeTrailingZeros } from './amounts'

function alf(amount: JSBI): JSBI {
  return JSBI.multiply(amount, JSBI.BigInt(1000000000000000000))
}

it('Should abbreviate amount', () => {
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
    expect(abbreviateAmount(alf(JSBI.BigInt(1)))).toEqual('1.00')
})

it('Should remove trailing zeros', () => {
  expect(removeTrailingZeros('0.00010000')).toEqual('0.0001'),
    expect(removeTrailingZeros('10000.000')).toEqual('10000.00'),
    expect(removeTrailingZeros('-10000.0001000')).toEqual('-10000.0001'),
    expect(removeTrailingZeros('-0.0001020000')).toEqual('-0.000102')
})

it('Should return a "smart hash"', () => {
  expect(smartHash('00002f884288e1f4')).toEqual('00002f884288e1f4'),
    expect(smartHash('00002f884288e1f48')).toEqual('00002f88...288e1f48'),
    expect(smartHash('00002f884288e1f4882b8bba09e7a0f1e6339ebabcef27e58e489090b792a820')).toEqual('00002f88...b792a820')
})

it('Should return true if address is correct', () => {
  expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFX')).toEqual(true),
    expect(
      checkAddressValidity(
        'WzbegYW2DgnouXKdMQGHcXKfgmTkvAomrvG9Dtw4vGpCrHdq4EzoFdaZPsR5zZHuVvEYD5Dw7Yf3X4PapL5M9RF62GsPaTtHdXYuxXfbbynwQ9WkiEai9Q9iD5yE55nNwGZkC9'
      )
    ).toEqual(true),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFX0')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFXl')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFXI')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAW-JAbuJ7hCLoAaQwHFXz')).toEqual(false),
    expect(checkAddressValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJ7hCLoAaQwHFXz ')).toEqual(false)
})

it('Should return true if is HEX string', () => {
  expect(checkHexStringValidity('00000091f9a011ff1cb23686d650dbde57e2b91c5a6aa6e4115291d3de432b0c')).toEqual(true),
    expect(checkHexStringValidity('78dd3fe6b0a52ef895b1575284deaa7826bea8fc89beb6984b3b41e9f800395d')).toEqual(true),
    expect(checkHexStringValidity('1EfGPJaeHYN8MQfZmUT58HNbAWkJAbuJkhCLoAaQwHFX0')).toEqual(false),
    expect(
      checkHexStringValidity(
        'WzbegYW2DgnouXKdMQGHcXKfgmTkvAomrvG9Dtw4vGpCrHdq4EzoFdaZPsR5zZHuVvEYD5Dw7Yf3X4PapL5M9RF62GsPaTtHdXYuxXfbbynwQ9WkiEai9Q9iD5yE55nNwGZkC9'
      )
    ).toEqual(false)
})
