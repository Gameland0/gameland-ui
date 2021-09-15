import { useEffect, useMemo, useState } from 'react'
import { supportedNetwork } from '../../connectors'
import { useActiveWeb3React } from '../../hooks'

// return true while network error
export const useNetworkValidator = () => {
  const { active } = useActiveWeb3React()
  const [chainId, setChainId] = useState<number | undefined>()

  useEffect(() => {
    ;(window as any).ethereum.request({ method: 'eth_chainId' }).then((res: any) => {
      console.log(parseInt(res, 16))
      setChainId(parseInt(res, 16))
    })
  }, [active])

  const result = useMemo(() => {
    if (!chainId) {
      return false
    }
    return supportedNetwork.includes(chainId)
  }, [chainId])

  return !result
}
