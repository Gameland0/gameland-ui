import { useMemo } from 'react'
import useSWR from 'swr'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useActiveWeb3React, useStore } from '.'
import { fetcher } from '../components/Store'

export const useFetchMetadata = (id: any) => {
  const { account } = useActiveWeb3React()
  const url = useMemo(() => {
    return `https://api.opensea.io/api/v1/assets/${account}/${id}`
  }, [id, account])

  return useSWR(url, fetcher)
}
