import { useMemo } from 'react'
import { NFTData, useStore } from '.'
export const useLendingNfts = (): NFTData[] => {
  const { nfts } = useStore()

  return useMemo(() => {
    if (!nfts || !nfts.data) return []
    return nfts.data
  }, [nfts])
}
