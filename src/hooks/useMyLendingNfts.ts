import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'
export const useMyLendingNfts = (): NFTData[] => {
  const { nfts } = useStore()
  const { account } = useActiveWeb3React()

  return useMemo(() => {
    if (!account || !nfts) return []
    return nfts.filter(
      (item: any) => (item.isLending || item.withdrawable) && lowerCase(item.originOwner) === lowerCase(account)
    )
  }, [account, nfts])
}
