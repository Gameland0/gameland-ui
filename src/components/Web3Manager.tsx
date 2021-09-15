/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { useEagerConnect, useInactiveListener, useStore } from '../hooks'
import { NetworkContextName } from '../utils'
import { Loading } from './Loading'
import { network } from '../connectors'
import { formatEther } from '@ethersproject/units'

export const Web3Manager = ({ children }: { children: JSX.Element }) => {
  const { active } = useWeb3React()
  const { connector, active: networkActive, error, activate } = useWeb3React<Web3Provider>(NetworkContextName)
  const { activatingConnector, setActivatingConnector } = useStore()
  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  React.useEffect(() => {
    console.log(error, error instanceof UnsupportedChainIdError)

    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activatingConnector, connector, error])

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  if (error instanceof UnsupportedChainIdError) {
    return <div>Network error!</div>
  }
  // if (!active && !networkActive) {
  //   return <Loading />
  // }
  return children
}
