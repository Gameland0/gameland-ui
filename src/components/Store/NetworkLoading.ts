import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { NetworkContextName } from '../../utils'

export const useNetworkLoading = () => {
  const { active } = useWeb3React()
  const { active: networkActive } = useWeb3React(NetworkContextName)

  const result = useMemo(() => {
    if (!active && !networkActive) {
      return true
    }
    return false
  }, [active, networkActive])

  return result
}
