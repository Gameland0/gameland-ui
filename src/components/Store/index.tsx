import axios from 'axios'
// import { isEmpty } from 'lodash'
import React, { createContext, useEffect, useMemo, useState } from 'react'
// import useSWR from 'swr'
// import { KeyedMutator } from 'swr/dist/types'
// import { useAssetContract, useActiveWeb3React } from '../../hooks'
import { useNetworkLoading } from './NetworkLoading'
import { useNetworkValidator } from './NetworkValidator'
import { useWeb3React } from '@web3-react/core'

export interface StoreData {
  networkError: boolean
  loading: boolean
  activatingConnector: any
  setActivatingConnector: React.Dispatch<any>
  nfts: Record<string, any>
  // BSCmutateDebts: KeyedMutator<any>
  // polygonmutateDebts: KeyedMutator<any>
  userinfo: Record<string, any>
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
  timeout: 30000
})
export const bschttp = axios.create({
  timeout: 30000,
  baseURL: process.env.NODE_ENV === 'production' ? 'https://bsc-api.gameland.network' : 'http://localhost:8091'
})
export const polygonhttp = axios.create({
  timeout: 30000,
  baseURL: process.env.NODE_ENV === 'production' ? 'https://polygon-api.gameland.network' : 'http://localhost:8089'
})

export const newhttp = axios.create({
  timeout: 30000,
  baseURL: process.env.NODE_ENV === 'production' ? 'https://118.193.47.26:10013' : 'http://localhost:8099'
})

export const fetcher = (url: string) => {
  const _url = url.startsWith('/moralis') ? 'https://deep-index.moralis.io/api/v2' + url.substring(8) : ''
  return http.get(_url).then((res) => res.data)
}

export const fetcher2 = (url: string) => fetch(url).then((res) => res.json())
export const Store = ({ children }: { children: JSX.Element }) => {
  const networkError = useNetworkValidator()
  const { chainId } = useWeb3React()
  const loading = useNetworkLoading()
  const [lastBlockNumber, setLastBlockNumber] = useState('')
  const [contracts, setContracts] = useState([])
  const [nfts, setNfts] = useState([] as any)
  const [userinfo, setUserinfo] = useState([] as any)
  // const AssetContract = useAssetContract()

  // useEffect(() => {
  //   if (!AssetContract) return
  //   const syncFn = async () => {
  //     const res = await AssetContract.get_nft_programes()

  //     if (res.length) {
  //       setContracts(res)
  //     }
  //   }
  //   syncFn()
  // }, [AssetContract?.address])
  const getNftData = async () => {
    if (!chainId) return
    if (chainId === 56) {
      const BSCdata = await bschttp.get(`/v0/opensea`)
      setNfts(BSCdata.data.data)
    } else if (chainId === 137) {
      const polygondata = await polygonhttp.get(`/v0/opensea`)
      setNfts(polygondata.data.data)
    } else {
      setNfts([])
    }
    const userdata = await bschttp.get(`v0/userinfo`)
    setUserinfo(userdata.data.data)
  }
  useEffect(() => {
    getNftData()
  }, [chainId])

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
      // BSCmutateDebts,
      // polygonmutateDebts,
      userinfo,
      contracts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkError, loading, contracts, activatingConnector, nfts, lastBlockNumber, userinfo])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
