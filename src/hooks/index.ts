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
import ArchNftAbi from '../constants/Abis/ArchNft.json'
// import MyNftAbi from '../artifacts/contracts/MyNFT.sol/MyNFT.json'
import GameLandAbi from '../constants/Abis/GameLand.json'
import { useMyNfts } from './useMyNfts'
import { useMyRenting } from './useMyRenting'
import { lowerCase } from 'lower-case'

export const GameLandAddress = '0x18da12d0346b5129c363d355b0765952652fd390' // stable version
export const MyNFTAddress = '0xf2d47bbb40f9ffa447687b4708076f6ee3e9134c' // stable version
// export const ArchAddress = '0x2E7704C0aeE70BF604c0Ed93D72133F39935fE79'
// export const Greeter = '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44'
if (typeof GameLandAddress === 'undefined') {
  throw new Error(`Seems contract not exist.`)
}

interface OpenseaData {
  token_id?: string
  image_url?: string
}

export interface NFTData extends OpenseaData {
  borrower?: string
  collateral?: number
  createdAt?: string
  days?: number
  id?: number
  token_id?: string
  img?: string
  isBorrowed?: boolean
  isLending?: boolean
  withdrawable?: boolean
  borrowAt?: string
  name: string
  nftId: string
  originOwner?: string
  owner?: any
  price?: number
  updatedAt?: string
  image_preview_url?: string
  image_original_url?: string
  sell_orders?: Record<string, any>[]
  contractAddress?: string
  contract?: Record<string, any>
  gamelandNftId?: number
  asset_contract?: Record<string, any>
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

// export function useGreeterContract() {
//   const { library } = useActiveWeb3React()
//   if (!library) return null
//   return new Contract(Greeter, GreeterAbi, library?.getSigner())
// }

export function useGameLandContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(GameLandAddress, GameLandAbi, library.getSigner())
}

export function useMyNftContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null
  return new Contract(MyNFTAddress, MyNftAbi, library.getSigner())
}

// export function useArchNftContract() {
//   const { library } = useActiveWeb3React()
//   if (!library) return null
//   return new Contract(ArchAddress, ArchNftAbi, library.getSigner())
// }

const ABIS: Record<string, any[]> = {}
ABIS[lowerCase(MyNFTAddress)] = MyNftAbi
// ABIS[lowerCase(ArchAddress)] = ArchNftAbi

export function useNFTContract() {
  const contracts: Record<string, Contract> = {}
  const { library } = useActiveWeb3React()
  if (!library) return null
  Object.keys(ABIS).forEach((address) => {
    contracts[address] = new Contract(address, ABIS[address], library?.getSigner())
  })
  return contracts
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

// export function useReceipt(transaction: TransactionResponse) {
//   const {hash }
//   return ''
// }
