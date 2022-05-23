import { useMemo } from 'react'
import useSWR from 'swr'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useActiveWeb3React, useStore } from '.'
import { fetcher } from '../components/Store'

export const useFetchMyNfts = (offset: number, limit: number) => {
  const { account } = useActiveWeb3React()
  const { contracts } = useStore()
  const url = useMemo(() => {
    // let addresses = ''
    // contracts.data.forEach((item: any) => {
    //   addresses += `&asset_contract_addresses=${item.address}`
    // })

    return `https://api.opensea.io/api/v1/assets?order_direction=asc&limit=${limit}&owner=${account}`
  }, [offset, limit, contracts, account])

  return useSWR(url, fetcher)
}
