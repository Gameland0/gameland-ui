import { useMemo } from 'react'
import useSWR from 'swr'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useActiveWeb3React, useStore } from '.'
import { fetcher, http } from '../components/Store'
import { MORALIS_KEY } from '../constants'

export const useFetchMyNfts = (): any => {
  const { account, chainId } = useActiveWeb3React()

  const url = useMemo(() => {
    if (!account || !chainId) {
      return ''
    }
    let chain
    if (chainId === 56) {
      chain = 'bsc'
    } else if (chainId === 137) {
      chain = 'polygon'
    }
    http.defaults.headers.common['X-Api-Key'] = MORALIS_KEY

    return `/moralis/${account}/nft?chain=${chain}&format=decimal`
  }, [account, chainId])

  return useSWR(url, fetcher)
}
