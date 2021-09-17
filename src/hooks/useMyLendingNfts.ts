import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'
export const useMyLendingNfts = (): NFTData[] => {
  const { nfts } = useStore()
  const { account } = useActiveWeb3React()

  return useMemo(() => {
    if (!account || !nfts || !nfts.data) return []
    return nfts.data.filter((item: any) => lowerCase(item.originOwner) === lowerCase(account) && item.isLending)
  }, [account, nfts])
}
