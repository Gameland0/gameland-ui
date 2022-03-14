import { useMemo } from 'react'
import { NFTData, useStore } from '.'
export const useLendingNfts = (): NFTData[] => {
  const { nfts } = useStore()

  return useMemo(() => {
    if (!nfts) return []
    return nfts
      .filter((item: any) => !item.isBorrowed && item.isLending)
      .map((item: any) => {
        item.metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
        return item
      })
  }, [nfts])
}
