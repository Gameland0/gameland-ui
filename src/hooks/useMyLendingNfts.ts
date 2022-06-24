import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'
export const useMyLendingNfts = (): any[] => {
  const { nfts } = useStore()
  const { account } = useActiveWeb3React()

  return useMemo(() => {
    if (!account || !nfts) return []
    return nfts
      .filter((item: any) => lowerCase(item.originOwner) === lowerCase(account))
      .map((item: any) => {
        item.metadata = typeof item.metadata === 'string' && item.metadata ? JSON.parse(item.metadata) : item.metadata
        return item
      })
  }, [account, nfts])
}
