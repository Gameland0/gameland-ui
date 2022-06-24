import { useMemo } from 'react'
import useSWR from 'swr'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useActiveWeb3React, useStore } from '.'
import { fetcher, http } from '../components/Store'
import { MORALIS_KEY } from '../constants'

export const useFetchMyNfts = (cursor: string, limit: number) => {
  const { account } = useActiveWeb3React()
  const { contracts } = useStore()

  const url = useMemo(() => {
    if (!contracts) {
      return ''
    }
    if (!account) {
      return ''
    }

    let addresses = ''

    contracts.forEach((item: any) => {
      addresses += `&token_addresses=${item}`
    })

    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY

    return `/moralis/${account}/nft?chain=polygon&format=decimal`

    // return `${MORALIS_API}/${account}/nft?chain=polygon&format=decimal&limit=${limit}&offset=${offset}${addresses}`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, limit, account, contracts])

  return useSWR(url, fetcher)
}
