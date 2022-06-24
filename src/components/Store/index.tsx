import axios from 'axios'
import { isEmpty } from 'lodash'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { KeyedMutator } from 'swr/dist/types'
import { useAssetContract } from '../../hooks'
import { useNetworkLoading } from './NetworkLoading'
import { useNetworkValidator } from './NetworkValidator'

export interface StoreData {
  networkError: boolean
  loading: boolean
  activatingConnector: any
  setActivatingConnector: React.Dispatch<any>
  nfts: Record<string, any>
  mutateDebts: KeyedMutator<any>
  lastBlockNumber: string
  setLastBlockNumber: React.Dispatch<React.SetStateAction<string>>
  contracts: any
}

export const StoreContext = createContext({} as StoreData)

export const swrConfig = {
  refreshInterval: 10000,
  refreshWhenHidden: false,
  refreshWhenOffline: false
}

export const http = axios.create({
  timeout: 10000
})
export const http2 = axios.create({
  timeout: 10000,
  baseURL: process.env.NODE_ENV === 'production' ? 'https://polygon-api.gameland.network' : 'http://localhost:8089'
})
export const fetcher = (url: string) => {
  let _url
  if (process.env.NODE_ENV === 'production') {
    _url = url.startsWith('/moralis')
      ? 'https://deep-index.moralis.io/api/v2' + url.substring(8)
      : 'https://polygon-api.gameland.network' + url
  } else {
    _url = url.startsWith('/moralis')
      ? 'https://deep-index.moralis.io/api/v2' + url.substring(8)
      : 'http://localhost:8089' + url
  }
  return http.get(_url).then((res) => res.data)
}
export const fetcher2 = (url: string) => fetch(url).then((res) => res.json())
export const Store = ({ children }: { children: JSX.Element }) => {
  const networkError = useNetworkValidator()
  const loading = useNetworkLoading()
  const [lastBlockNumber, setLastBlockNumber] = useState('')
  const [contracts, setContracts] = useState([])
  const { data: debts, mutate: mutateDebts } = useSWR(`/v0/opensea`, fetcher)
  const AssetContract = useAssetContract()

  useEffect(() => {
    if (!AssetContract) return
    const syncFn = async () => {
      const res = await AssetContract.get_nft_programes()

      if (res.length) {
        setContracts(res)
      }
    }
    syncFn()
  }, [AssetContract?.address])

  const nfts = useMemo(() => {
    if (isEmpty(debts)) {
      return []
    }

    return debts.data
  }, [debts])

  const [activatingConnector, setActivatingConnector] = React.useState<any>()

  const value = useMemo(() => {
    return {
      networkError,
      loading,
      activatingConnector,
      setActivatingConnector,
      nfts,
      lastBlockNumber,
      setLastBlockNumber,
      mutateDebts,
      contracts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkError, loading, contracts, activatingConnector, nfts, lastBlockNumber])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
