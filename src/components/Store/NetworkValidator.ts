import { Modal } from 'antd'
import { useEffect, useState } from 'react'
import { supportedNetwork } from '../../connectors'
import { useActiveWeb3React } from '../../hooks'

// return true while network error
export const useNetworkValidator = () => {
  const { active } = useActiveWeb3React()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!(window as any).ethereum) {
      // if no window.ethereum then MetaMask is not installed
      Modal.warning({
        title: 'Metamask not installed',
        content: 'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'
      })
      return
    }
    ;(window as any).ethereum.request({ method: 'eth_chainId' }).then((res: any) => {
      console.log(parseInt(res, 16))
      const chainId = parseInt(res, 16)
      if (!chainId) {
        setError(false)
        return
      }
      // console.log(chainId, !supportedNetwork.includes(chainId))

      setError(!supportedNetwork.includes(chainId))
    })
  }, [active])

  // console.log(error)

  return error
}
