import { formatAddress } from '../utils'
import React from 'react'
import { useHistory } from 'react-router-dom'
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
  cursor: pointer;
`
export const AccountBar = () => {
  const context = useActiveWeb3React()
  const { account } = context
  const history = useHistory()
  const UserPage = () => {
    history.push({
      pathname: `/dashboard`
    })
  }
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
    return <AddressBox onClick={UserPage}>{formatAddress(account)}</AddressBox>
  }

  return <ConnectWallet />
}
