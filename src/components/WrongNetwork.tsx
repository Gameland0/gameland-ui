import React, { useEffect } from 'react'
import { Button } from 'antd'
import { ToastContainer } from 'react-toastify'
import { ButtonProps } from 'antd/lib/button/button'
import { useStore } from '../hooks'
import { Modal } from 'antd'
import { BSC_CHAIN_ID_HEX, BSC_RPC_URL } from '../constants'

const { confirm } = Modal

export const WrongNetwork: React.FC<ButtonProps> = ({ ...props }) => {
  const { networkError } = useStore()

  useEffect(() => {
    console.log(networkError)

    if (networkError) {
      confirm({
        title: 'Please connect to supported network.',
        okText: 'Switch network',
        bodyStyle: { background: '#f3f5f7', color: '#404040' },
        onOk() {
          handleClick()
        },
        onCancel() {
          // console.log('Cancel')
        }
      })
    }
  }, [networkError])

  const handleClick = async () => {
    const { ethereum } = window as any
    if (ethereum) {
      try {
        // check if the chain to connect to is installed
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID_HEX }] // chainId must be in hexadecimal numbers
        })
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Matic network',
                  chainId: BSC_CHAIN_ID_HEX,
                  rpcUrls: [BSC_RPC_URL]
                }
              ]
            })
          } catch (addError) {
            console.error(addError)
          }
        }
        console.error(error)
      }
    } else {
      // if no window.ethereum then MetaMask is not installed
      alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html')
    }
  }
  return (
    <div>
      <Button {...props} onClick={handleClick}>
        Wrong Network
      </Button>
      <ToastContainer theme="dark" />
    </div>
  )
}
