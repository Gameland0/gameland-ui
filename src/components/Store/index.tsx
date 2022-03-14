import axios from 'axios'
import { isEmpty } from 'lodash'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { KeyedMutator } from 'swr/dist/types'
import { useGameLandContract } from '../../hooks'
import { useNetworkLoading } from './NetworkLoading'
import { useNetworkValidator } from './NetworkValidator'

export interface StoreData {
  networkError: boolean
  loading: boolean
  activatingConnector: any
  setActivatingConnector: React.Dispatch<any>
  nfts: Record<string, any>
  mutateDebts: KeyedMutator<any>
  // guilds: Record<string, any>
  // mutateGuilds: KeyedMutator<any>
  // setOffset: React.Dispatch<React.SetStateAction<number>>
  // setLimit: React.Dispatch<React.SetStateAction<number>>
  lastBlockNumber: string
  setLastBlockNumber: React.Dispatch<React.SetStateAction<string>>
  // dispatchOpensea: React.DispatchWithoutAction
  contracts: any
  // mutateContracts: KeyedMutator<any>

  // rentingNfts: Record<string, any>
  // mutateRentingNfts: KeyedMutator<any>
}

export const StoreContext = createContext({} as StoreData)

export const swrConfig = {
  refreshInterval: 10000,
  refreshWhenHidden: false,
  refreshWhenOffline: false
}

// export const baseUrl = 'https://testnet-api.gameland.network'
export const http = axios.create({
  timeout: 10000
  // headers: {
  //   'X-API-KEY': 'a47e9b96f1ca464792fb00e673164afc'
  // }
})
export const fetcher = (...args: [any, ...any[]]) => http.get(...args).then((res) => res.data)
export const fetcher2 = (url: string) => fetch(url).then((res) => res.json())

export const Store = ({ children }: { children: JSX.Element }) => {
  const networkError = useNetworkValidator()
  const loading = useNetworkLoading()
  // const [offset, setOffset] = useState(0)
  // const [limit, setLimit] = useState(50)
  const [lastBlockNumber, setLastBlockNumber] = useState('')
  const [contracts, setContracts] = useState([])
  const { data: debts, mutate: mutateDebts } = useSWR(
    `/api/v0/opensea`,
    // 'http://localhost:8080/v1/nftports?chain=ethereum',
    fetcher
  )
  const gamelandContract = useGameLandContract()

  useEffect(() => {
    console.log(gamelandContract)

    if (!gamelandContract) return
    const syncFn = async () => {
      const res = await gamelandContract.get_nft_programes()
      console.log(res)

      if (res.length) {
        setContracts(res)
      }
    }

    syncFn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamelandContract?.address])

  // const { data: contracts, mutate: mutateContracts } = useSWR(
  //   `/api/v0/contracts`,
  //   // 'http://localhost:8080/v1/nftports?chain=ethereum',
  //   fetcher
  // )
  // const { data: guilds, mutate: mutateGuilds } = useSWR(
  //   `/api/v0/guilds`,
  //   // 'http://localhost:8080/v1/nftports?chain=ethereum',
  //   fetcher
  // )

  // const [openseaData, setOpenseaData] = useState({
  //   assets: []
  // })

  // const [updater, dispatchOpensea] = useReducer((c) => c + 1, 0)

  // const { data: openseaData, mutate: mutateOData } = useSWR(url, fetcher2)

  // const url = useMemo(() => {
  //   let addresses = ''
  //   if (!contracts) {
  //     return ''
  //   }
  //   contracts.data.forEach((item: any) => {
  //     addresses += `&asset_contract_addresses=${item.address}`
  //   })
  //   // return ''
  //   return `https://rinkeby-api.opensea.io/api/v1/assets?order_direction=asc&offset=${offset}&limit=${limit}${addresses}`
  // }, [contracts, limit, offset])

  // useEffect(() => {
  //   if (!url) {
  //     return
  //   }
  //   fetch(url)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       const currentData = openseaData

  //       if (currentData.assets.length) {
  //         const _currentData = currentData.assets.concat(data.assets)
  //         console.log('currentData: ', _currentData)
  //         setOpenseaData({ assets: _currentData })
  //       } else {
  //         setOpenseaData(data)
  //       }

  //       if (data.assets.length === limit) {
  //         const _offset = offset + limit
  //         setOffset(_offset)
  //       }
  //     })
  //     .catch((err) => {
  //       console.log('err' + err)

  //       return setOpenseaData({ assets: [] })
  //     })
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [url])

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
      // setOffset,
      // setLimit,
      lastBlockNumber,
      setLastBlockNumber,
      mutateDebts,
      // dispatchOpensea,
      contracts
      // mutateContracts
      // guilds,
      // mutateGuilds
      // rentingNfts,
      // mutateRentingNfts
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkError, loading, contracts, activatingConnector, nfts, lastBlockNumber])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
