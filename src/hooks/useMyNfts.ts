import { lowerCase } from 'lower-case'
import { useMemo } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NFTData, useActiveWeb3React, useStore } from '.'

export const useMyNfts = (): NFTData[] => {
  const { nfts } = useStore()
  const { account } = useActiveWeb3React()

  return useMemo(() => {
    if (!nfts) return []
    if (!account) return []

    const data = nfts.filter((item: any) => {
      // const ownerAddress = lowerCase(item.owner.address as string)
      const originOwner = lowerCase(item.originOwner)
      const user = lowerCase(account)
      const borrower = lowerCase(item.borrower ?? '')
      // const gamelandAddress = lowerCase(gameland?.address as string)
      return item.owner.address
        ? (originOwner === user && borrower !== user) || // mine owned
            originOwner === user
        : // ? (ownerAddress === user && borrower !== user) || // mine owned
          //     (ownerAddress === gamelandAddress && originOwner === user) || // deposit
          //     (ownerAddress === user && originOwner === user)
          false
    })

    return data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts, account])
}
