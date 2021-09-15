import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'
import { lowerCase } from 'lower-case'

export const useMyNfts = (): NFTData[] => {
  const { account } = useActiveWeb3React()
  const { nfts } = useStore()

  return useMemo(() => {
    if (!nfts || !nfts.data) return []
    return nfts.data.filter((item: any) => {
      return lowerCase(item.originOwner) === lowerCase(String(account))
    })
  }, [nfts, account])
}
