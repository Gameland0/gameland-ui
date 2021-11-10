import { useEffect, useState } from 'react'
import { supportedNetwork } from '../../connectors'
import { useActiveWeb3React } from '../../hooks'

// return true while network error
export const useNetworkValidator = () => {
  const { active } = useActiveWeb3React()
  const [error, setError] = useState(false)

  useEffect(() => {
    ;(window as any).ethereum.request({ method: 'eth_chainId' }).then((res: any) => {
      console.log(parseInt(res, 16))
      const chainId = parseInt(res, 16)
      if (!chainId) {
        setError(false)
        return
      }
      console.log(chainId, !supportedNetwork.includes(chainId))

      setError(!supportedNetwork.includes(chainId))
    })
  }, [active])

  console.log(error)

  return error
}
