import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from 'antd'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { injected } from '../connectors'
import { ButtonProps } from 'antd/lib/button/button'
import { useStore } from '../hooks'
import metamaskLogo from '../assets/metamask_logo.png'
import okxLogo from '../assets/Okx_logo.jpg'


const SwitchWallet = styled.div`
  width: 120px;
  background-clip: padding-box;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
  position: absolute;
  top: 35px;
  left: 0px;
  div {
    display: flex;
    height: 40px;
    padding: 8px 16px 0 8px;
    color: #2b2f33;
    font-size: 16px;
    font-weight: 700;
    img {
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
    &:hover {
      background-color: #f4f7f9;
    }
  } 
`

export const ConnectWallet: React.FC<ButtonProps> = ({ ...props }) => {
  const { activate } = useWeb3React<Web3Provider>()
  const { setActivatingConnector } = useStore()
  const { setWelletType } = useStore()
  const [showWelletType, setShowWelletType] = useState(false)
  const okxwallet = (window as any).okxwallet

  const handleConnect = () => {
    activate(injected)
    setActivatingConnector(injected)
    setWelletType('MetaMask')
  }

  const okxConnect = async () => {
    const res = await okxwallet.request({ method: 'eth_requestAccounts' })
    setWelletType('Okx')
  }

  return (
    <div>
      {okxwallet === 'undefined' ? (
        <Button {...props} onClick={handleConnect}>
          Connect Wallet
        </Button>
      ) : (
        <Button className="relative" onClick={() => setShowWelletType(!showWelletType)}>
          Connect Wallet
          {showWelletType ? (
            <SwitchWallet>
              <div onClick={okxConnect}>
                <img src={okxLogo} alt="" />
                Okx
              </div>
              <div onClick={handleConnect}>
                <img src={metamaskLogo} alt="" />
                MetaMask
              </div>
            </SwitchWallet>
          ):''}
        </Button>
      )}
    </div>
  )
}
