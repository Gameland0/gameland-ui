import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
import { NFTData, useActiveWeb3React, useGameLandContract, useStore } from '.'

export const useMyNfts = (): NFTData[] => {
  const { nfts } = useStore()
  const { account } = useActiveWeb3React()
  const gameland = useGameLandContract()

  return useMemo(() => {
    if (!nfts) return []
    if (!account) return []
    const data = nfts.filter((item: any) => {
      const ownerAddress = lowerCase(item.owner.address as string)
      const originOwner = lowerCase(item.originOwner as string)
      const user = lowerCase(account as string)
      const borrower = lowerCase(item.borrower ?? '')
      const gamelandAddress = lowerCase(gameland?.address as string)
      return item.owner.address
        ? (ownerAddress === user && borrower !== user) || // mine owned
            (ownerAddress === gamelandAddress && originOwner === user) || // deposit
            (ownerAddress === user && originOwner === user)
        : false
    })

    return data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts, account])
}
