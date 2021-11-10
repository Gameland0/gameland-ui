import { isEmpty } from 'lodash'
import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useStore } from '.'

export const useMyRenting = (): NFTData[] => {
  const { account } = useActiveWeb3React()
  const { nfts } = useStore()

  return useMemo(() => {
    if (!account || isEmpty(nfts)) return []
    console.log(account, nfts)

    return nfts.filter((item: any) => {
      return item.isBorrowed && lowerCase(item.borrower) === lowerCase(account)
    })
  }, [account, nfts])
}
