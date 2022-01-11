import { lowerCase } from 'lower-case'
import { off } from 'process'
import { useMemo } from 'react'
import useSWR from 'swr'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NFTData, useActiveWeb3React, useGameLandContract, useStore } from '.'
import { fetcher, http } from '../components/Store'

export const useMyNfts = (contracts: any, offset: number, limit: number) => {
  const { account } = useActiveWeb3React()
  const { data: myNfts, mutate: mutateMyNfts } = useSWR(`/v0/guilds`, fetcher)

  return useMemo(() => {
    if (!account) return []
    if (!contracts) {
      return []
    }
    const fetchFn = async (offset: number, limit: number) => {
      let addresses = ''
      contracts.data.forEach((item: any) => {
        addresses += `&asset_contract_addresses=${item.address}`
      })
      console.log(addresses)

      const url = `https://rinkeby-api.opensea.io/api/v1/assets?order_direction=asc&offset=${offset}&limit=${limit}&owner=${account}${addresses}`

      await http.get(url)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts, offset, limit])
}
