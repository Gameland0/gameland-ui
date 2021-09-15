import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'

export const useMyRenting = (): NFTData[] => {
  const { account } = useActiveWeb3React()
  const { nfts } = useStore()

  return useMemo(() => {
    if (!account || !nfts.data) return []
    console.log(nfts)

    return nfts.data.filter((item: any) => item.borrower === account)
  }, [account, nfts])
}
