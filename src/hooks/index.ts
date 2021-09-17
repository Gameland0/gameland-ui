import { useState, useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from '@ethersproject/contracts'

import { injected } from '../connectors'
import { StoreContext } from '../components/Store'
import { isMobile } from 'react-device-detect'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { NetworkContextName } from '../utils'
import GreeterAbi from '../constants/Abis/Greeter.json'
import MyNftAbi from '../constants/Abis/MyNft.json'
import GameLandAbi from '../constants/Abis/GameLand.json'
import { useMyNfts } from './useMyNfts'
import { useMyRenting } from './useMyRenting'
// export const GameLandAddress = '0x72b1A9ABDE02DbDeAa1e969467E6854999e06c57'
export const GameLandAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
// export const MyNFTAddress = '0xE01A18057b71cf11e711264fC03007AbC3C9a822'
export const MyNFTAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
export const Greeter = '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44'

export interface NFTData {
  borrower?: boolean
  collateral?: number
  createdAt?: string
  days?: number
  id?: number
  img: string
  isBorrowed?: boolean
  isLending?: boolean
  borrowAt?: string
  name: string
  nftId: string
  originOwner?: string
  owner?: string
  price?: number
  updatedAt?: string
}

export function useStore() {
  return useContext(StoreContext)
}

export declare enum ChainId {
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  AURORA = 1313161554,
  AURORA_TESTNET = 1313161555
}

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3React<Web3Provider>()
  const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName)

  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active } = useWeb3React()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && (window as any).ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  useEffect((): any => {
    const { ethereum } = window as any
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log("Handling 'connect' event")
        activate(injected)
      }
      const handleChainChanged = (chainId: string | number) => {
        console.log("Handling 'chainChanged' event with payload", chainId)
        activate(injected)
      }
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        if (accounts.length > 0) {
          activate(injected)
        }
      }
      const handleNetworkChanged = (networkId: string | number) => {
        console.log("Handling 'networkChanged' event with payload", networkId)
        activate(injected)
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}

export function useGreeterContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null
  return new Contract(Greeter, GreeterAbi, library?.getSigner())
}

export function useGameLandContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(GameLandAddress, GameLandAbi, library?.getSigner())
}

export function useMyNftContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null
  return new Contract(MyNFTAddress, MyNftAbi, library?.getSigner())
}

export interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch?: number
}

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

export interface Call {
  address: string
  callData: string
}

export { useMyNfts, useMyRenting }
