import { formatAddress } from '../utils'
import React from 'react'
import styled from 'styled-components'
import { WrongNetwork } from './WrongNetwork'
import { ConnectWallet } from './ConnectWallet'
import { useActiveWeb3React, useStore } from '../hooks'

const AddressBox = styled.div`
  border: 1px solid #ccc;
  color: #666;
  padding: 0.4rem 0.75rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
`
export const AccountBar = () => {
  const context = useActiveWeb3React()
  const { account } = context
  // const chainName = useMemo(() => Object.keys(ChainId).find((k) => (chainId as number) === ChainId[k]), [chainId])
  // const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const { networkError } = useStore()

  // useEffect(() => {
  //   if (account && !chainName) {
  //     setIsWrongNetwork(true)
  //   }
  // }, [account, chainName])

  if (networkError) {
    return <WrongNetwork ghost danger />
  }

  if (account) {
    return <AddressBox>{formatAddress(account)}</AddressBox>
  }

  return <ConnectWallet />
}
