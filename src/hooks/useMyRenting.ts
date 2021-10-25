import { isEmpty } from 'lodash'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'

export const useMyRenting = (): NFTData[] => {
  const { account } = useActiveWeb3React()
  const { nfts } = useStore()

  return useMemo(() => {
    if (!account || isEmpty(nfts) || !nfts.data) return []
    console.log(account, nfts)

    return nfts.data
  }, [account, nfts])
}
