import axios from 'axios'

export const ZeroAddress = '0x0000000000000000000000000000000000000000'
export const ZeroNftInfo = ['0.0', '0.0', '0.0', '0.0']
export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAYS = 24 * HOUR

export const http = axios.create({
    timeout: 10000,
    baseURL: 'http://localhost:8092'
})

export function getProgress(borrowAt, days) {
    const _days = days * DAYS
    const deadline = new Date(borrowAt).valueOf() + days * DAYS
    const now = new Date().valueOf()
    const timeLeft = deadline - now
    const spend = _days - timeLeft
    if (timeLeft <= 0) {
      return 100
    }
    return ((spend / _days) * 100).toFixed(2)
}

export const shortNumbers = (num, digits = 10) => {
    if (!num) return 0
  
    if (String(num).length <= digits) return num
  
    return String(num).substring(0, digits) + '...'
}

export function getTimeLeftText(borrowAt, days) {
    const duration = days * DAYS
    const deadline = new Date(borrowAt).valueOf() + duration
    const now = new Date().valueOf()
    const timeLeft = deadline - now
  
    if (timeLeft <= 0) {
      return 'Expired'
    } else if (timeLeft > DAYS) {
      const _days = Math.floor(timeLeft / DAYS)
      const _hour = Math.floor((timeLeft - _days * DAYS) / HOUR)
      return `${_days} days ${_hour} hs`
    } else if (timeLeft > HOUR) {
      const _hour = Math.floor(timeLeft / HOUR)
      return `${_hour} hs`
    } else if (timeLeft > MINUTE) {
      const _minutes = Math.floor(timeLeft / MINUTE)
      return `${_minutes} mins`
    } else if (timeLeft > SECOND) {
      const _seconds = Math.floor(timeLeft / SECOND)
      return `${_seconds} secs.`
    }
}

export const getTimeOutProgress = (borrowAt) => {
    const localtime = new Date(borrowAt).valueOf() / 1000 + 115200
    const currentTime = Math.floor(new Date().valueOf() / 1000)
    const surplus = Number(localtime) - currentTime
    if (surplus <= 0) {
      return 100
    }
    return (100 - (surplus / 28800) * 100).toFixed(2)
}

export function getTimeOutLeftText(borrowAt) {
    const localtime = new Date(borrowAt).valueOf() / 1000 + 115200
    const currentTime = Math.floor(new Date().valueOf() / 1000)
    const timeLeft = localtime - currentTime
    const SECOND = 1
    const MINUTE = 60 * SECOND
    const HOUR = 60 * MINUTE
    if (timeLeft <= 0) {
      return 'Expired'
    } else if (timeLeft > HOUR) {
      const _hour = Math.floor(timeLeft / HOUR)
      return `Grace period ends at ${_hour} hous`
    } else if (timeLeft > MINUTE) {
      const _minutes = Math.floor(timeLeft / MINUTE)
      return `Grace period ends at ${_minutes} Minute`
    } else if (timeLeft > SECOND) {
      const _seconds = Math.floor(timeLeft / SECOND)
      return `Grace period ends at ${_seconds} second`
    }
}

export const formatAddress = (address) => {
  if (!address) return
  const start = address.slice(0,6)
  const end = address.slice(-6)
  return `${start}...${end}`
}