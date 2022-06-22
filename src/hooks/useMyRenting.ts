import { isEmpty } from 'lodash'
import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'

export const useMyRenting = (): NFTData[] => {
  const { account } = useActiveWeb3React()
  const { nfts } = useStore()

  return useMemo(() => {
    if (!account || isEmpty(nfts)) return []

    return nfts
      .filter((item: any) => {
        return item.isBorrowed && lowerCase(item.borrower) === lowerCase(account)
      })
      .map((item: any) => {
        item.metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
        return item
      })
  }, [account, nfts])
}
