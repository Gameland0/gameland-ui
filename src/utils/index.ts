import { getAddress } from '@ethersproject/address'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'

export const NetworkContextName = 'GAMELAND'

export const ZeroAddress = '0x0000000000000000000000000000000000000000'
export const ZeroNftInfo = ['0.0', '0.0', '0.0', '0.0']

export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAYS = 24 * HOUR

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}
export const formatAddress = (address: string, places = 4): string => {
  const validatedAddress = isAddress(address)
  if (!validatedAddress) {
    throw Error(`Invalid address.`)
  }
  const len = address.length
  const start = address.substring(0, places)
  const end = address.substring(len - places, len)

  return `${start}...${end}`
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === ZeroAddress) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validNumber = (number: string, min: number): boolean => {
  if (!number) {
    return true
  }

  const numReg = /^(\.|[0-9])*(\.)?[0-9]*$/
  console.log(numReg.test(number))

  if (numReg.test(number)) {
    return true
    // if (Number(number) > min) {
    // }
  }

  if (/-/.test(number)) {
    return false
  }

  return false
}
export const validIntNumber = (number: string): boolean => {
  if (!number) {
    return true
  }

  const numReg = /^[1-9]\d*$/
  console.log(numReg.test(number))

  if (numReg.test(number)) {
    return true
    // if (Number(number) > min) {
    // }
  }

  return false
}

export function getProgress(borrowAt: string, days: number) {
  const _days = days * DAYS
  const deadline = new Date(borrowAt).valueOf() + days * DAYS
  const now = new Date().valueOf()
  const timeLeft = deadline - now
  const spend = _days - timeLeft

  if (timeLeft <= 0) {
    return 100
  }
  return ((spend / _days) * 100).toFixed(2) as unknown as number
}

export function getTimeLeftText(borrowAt: string, days: number) {
  const _days = days * DAYS
  const deadline = new Date(borrowAt).valueOf() + _days
  const now = new Date().valueOf()
  const timeLeft = deadline - now

  if (timeLeft <= 0) {
    return 'Expired'
  } else if (timeLeft > DAYS) {
    const _days = Math.floor(timeLeft / DAYS)
    return `${_days} days`
  } else if (timeLeft > HOUR) {
    const _hour = Math.floor(timeLeft / HOUR)
    return `${_hour} hours`
  } else if (timeLeft > MINUTE) {
    const _minutes = Math.floor(timeLeft / MINUTE)
    return `${_minutes} minutes`
  } else if (timeLeft > SECOND) {
    const _seconds = Math.floor(timeLeft / SECOND)
    return `${_seconds} seconds.`
  }
}
