import React from 'react'
import { Button } from 'antd'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { injected } from '../connectors'
import { ButtonProps } from 'antd/lib/button/button'
import { useStore } from '../hooks'

export const ConnectWallet: React.FC<ButtonProps> = ({ ...props }) => {
  const { activate } = useWeb3React<Web3Provider>()
  const { setActivatingConnector } = useStore()

  const handleConnect = () => {
    activate(injected)
    setActivatingConnector(injected)
  }
  return (
    <div>
      <Button {...props} onClick={handleConnect}>
        Connect Wallet
      </Button>
    </div>
  )
}
