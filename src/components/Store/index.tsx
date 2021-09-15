import axios from 'axios'
import React, { createContext, useMemo } from 'react'
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
  // rentingNfts: Record<string, any>
  // mutateRentingNfts: KeyedMutator<any>
}

export const StoreContext = createContext({} as StoreData)
export const fetcher = (...args: [any, ...any[]]) => fetch(...args).then((res) => res.json())
export const http = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://api-gameland.bandot.io' : '',
  timeout: 6000 // 请求超时时间
})

export const Store = ({ children }: { children: JSX.Element }) => {
  const networkError = useNetworkValidator()
  const loading = useNetworkLoading()
  const { data: nfts, mutate: mutateNfts } = useSWR(`/api/nft`, fetcher)
  // const { data: rentingNfts, mutate: mutateRentingNfts } = useSWR(`/api/debts`, fetcher)

  const [activatingConnector, setActivatingConnector] = React.useState<any>()

  const value = useMemo(() => {
    return {
      networkError,
      loading,
      activatingConnector,
      setActivatingConnector,
      nfts,
      mutateNfts
      // rentingNfts,
      // mutateRentingNfts
    }
  }, [networkError, loading, activatingConnector, nfts, mutateNfts])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
