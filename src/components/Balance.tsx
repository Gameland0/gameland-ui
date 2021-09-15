/* eslint-disable @typescript-eslint/no-unused-vars */
import { formatEther } from '@ethersproject/units'
import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core'
import React, { useEffect } from 'react'

const fetcher =
  (library: any) =>
  (...args: [any, ...any[]]) => {
    const [method, ...params] = args
    return library[method](...params)
  }
export const Balance = () => {
  const { account, library } = useWeb3React()
  const { data: balance, mutate } = useSWR(['getBalance', account, 'latest'], {
    fetcher: fetcher(library),
  })

  useEffect(() => {
    if (!library) return
    library.on('block', () => {
      mutate(undefined, true)
    })

    return () => {
      library.removeAllListener && library.removeAllListener('block')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library])

  if (!balance) return <div>...</div>
  return <div>{formatEther(balance)}</div>
}
