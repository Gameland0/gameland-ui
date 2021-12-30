import axios from 'axios'
import { isEmpty } from 'lodash'
import React, { createContext, useEffect, useMemo, useReducer, useState } from 'react'
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
  lastBlockNumber: string
  setLastBlockNumber: React.Dispatch<React.SetStateAction<string>>
  dispatchOpensea: React.DispatchWithoutAction

  // rentingNfts: Record<string, any>
  // mutateRentingNfts: KeyedMutator<any>
}

export const StoreContext = createContext({} as StoreData)

// export const baseUrl = 'https://testnet-api.gameland.network'
export const baseUrl = process.env.NODE_ENV === 'development' ? '/api' : 'http://testnet-api.gameland.network'
export const http = axios.create({
  baseURL: baseUrl,
  timeout: 10000
  // headers: {
  //   'X-API-KEY': 'a47e9b96f1ca464792fb00e673164afc'
  // }
})
export const fetcher = (...args: [any, ...any[]]) => http.get(...args).then((res) => res.data)
export const fetcher2 = (url: string) => fetch(url, { cache: 'no-cache' }).then((res) => res.json())

export const Store = ({ children }: { children: JSX.Element }) => {
  const networkError = useNetworkValidator()
  const loading = useNetworkLoading()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)
  const [lastBlockNumber, setLastBlockNumber] = useState('')
  const { data: debts, mutate: mutateNfts } = useSWR(
    `/v0/opensea`,
    // 'http://localhost:8080/v1/nftports?chain=ethereum',
    fetcher
  )

  const [openseaData, setOpenseaData] = useState({
    assets: []
  })

  const [updater, dispatchOpensea] = useReducer((c) => c + 1, 0)

  const url = `https://rinkeby-api.opensea.io/api/v1/assets?order_direction=asc&offset=${page}&limit=${pageSize}&asset_contract_address=0xf2d47bbb40f9ffa447687b4708076f6ee3e9134c`
  // const { data: openseaData, mutate: mutateOData } = useSWR(url, fetcher2)

  useEffect(() => {
    console.log(networkError)

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        const currentData = openseaData

        if (currentData.assets.length) {
          currentData.assets.concat(data.assets)
          setOpenseaData(currentData)
        } else {
          setOpenseaData(data)
        }

        if (data.assets.length === pageSize) {
          dispatchOpensea()
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, updater])

  const nfts = useMemo(() => {
    console.log(debts, openseaData)
    if (isEmpty(openseaData) || !debts) {
      return []
    }

    const { assets } = openseaData as any
    const { data: debtsData } = debts
    // console.log(openseaData, debtsData)

    const result = assets.map((item: Record<string, any>) => {
      const contractAddress = item.asset_contract.address
      const tokenId = item.token_id
      const match = debtsData.find((debt: Record<string, any>) => {
        return debt.nftId === tokenId && debt.contractAddress === contractAddress
      })

      return Object.assign(item, match)
    })

    return result
  }, [debts, openseaData])

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
      lastBlockNumber,
      setLastBlockNumber,
      dispatchOpensea
      // rentingNfts,
      // mutateRentingNfts
    }
  }, [networkError, loading, activatingConnector, nfts, mutateNfts, lastBlockNumber])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
