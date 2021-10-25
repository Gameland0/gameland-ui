import axios from 'axios'
import React, { createContext, useMemo, useState } from 'react'
import useSWR from 'swr'
import { KeyedMutator } from 'swr/dist/types'
import { useNetworkLoading } from './NetworkLoading'
import { useNetworkValidator } from './NetworkValidator'

export interface StoreData {
  networkError: boolean
  loading: boolean
  activatingConnector: any
  setActivatingConnector: React.Dispatch<any>
  nfts: Record<string, any>
  mutateNfts: KeyedMutator<any>
  setPage: React.Dispatch<React.SetStateAction<number>>
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  setChain: React.Dispatch<React.SetStateAction<string>>

  // rentingNfts: Record<string, any>
  // mutateRentingNfts: KeyedMutator<any>
}

export const StoreContext = createContext({} as StoreData)

// export const baseUrl = 'https://api-gameland.bandot.io'
const baseUrl = process.env.NODE_ENV === 'development' ? '/api' : 'https://gameland.network/api'
console.log(process.env.NODE_ENV)
export const http = axios.create({
  baseURL: baseUrl,
  timeout: 6000, // 请求超时时间
  headers: {
    Authorization: process.env.REACT_APP_NFTPORTS_KEY && ''
  }
})
console.log(process.env.NODE_ENV === 'production', baseUrl)
export const fetcher = (...args: [any, ...any[]]) => http.get(...args).then((res) => res.data)

export const Store = ({ children }: { children: JSX.Element }) => {
  const networkError = useNetworkValidator()
  const loading = useNetworkLoading()
  const [page, setPage] = useState(0)
  const [chain, setChain] = useState('ethereum')
  const [pageSize, setPageSize] = useState(30)
  const { data: nfts, mutate: mutateNfts } = useSWR(
    `v0/opensea?order_direction=desc&offset=${page}&limit=${pageSize}`,
    // 'http://localhost:8080/v1/nftports?chain=ethereum',
    fetcher
  )
  // const { data: rentingNfts, mutate: mutateRentingNfts } = useSWR(`/api/debts`, fetcher)

  const [activatingConnector, setActivatingConnector] = React.useState<any>()

  const value = useMemo(() => {
    return {
      networkError,
      loading,
      activatingConnector,
      setActivatingConnector,
      nfts,
      mutateNfts,
      setPage,
      setPageSize,
      setChain
      // rentingNfts,
      // mutateRentingNfts
    }
  }, [networkError, loading, activatingConnector, nfts, mutateNfts])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
