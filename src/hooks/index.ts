import { useState, useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from '@ethersproject/contracts'
import { injected } from '../connectors'
import { StoreContext } from '../components/Store'
import { isMobile } from 'react-device-detect'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { NetworkContextName } from '../utils'
import GameLandAbi from '../constants/Abis/GameLand.json'
import AssetContractAbi from '../constants/Abis/assetContract.json'
import ControlContractAbi from '../constants/Abis/controlContract.json'
import erc721Abi from '../constants/Abis/erc721.json'
import BUSD from '../constants/Abis/busd.json'
import { useMyNfts } from './useMyNfts'
import { useMyRenting } from './useMyRenting'
import { ABIs } from '../constants/Abis/ABIs'
import { GAMELADDRESS } from '../constants'

export const GameLandAddress = GAMELADDRESS
export const TSAddress = '0x5931351f118e8be5A112AFf93463f44B5411dB6f'
export const ControlContractAddress = '0xf0Bccbd3516e655d2EBA7836EAF78108a306AAcF'
export const AssetContractAddress = '0x0B7b14E00017a6f46E180086Ffce54b1a5FC7dDc'
export const ERC20Address = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
export const ERC721Address = '0xaaE8DfD6727Eb98ab19E352ef84927f9C6819073'

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
  metadata?: Record<string, any>
  contractAddress?: string
  gamelandNftId?: number
  contract_type?: string
  token_address?: string
  contract?: Record<string, any>
  owner_of?: string
  standard?: string
}

export function useStore() {
  return useContext(StoreContext)
}

// mainnet: 1,
// ropsten: 3,
// rinkeby: 4,
// goerli: 5,
// kovan: 42,
// aurora: 1313161554,
// 'Aurora Testnet': 1313161555,
// localnode: 1337,
// polygon: 137
export declare enum ChainId {
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  AURORA = 1313161554,
  AURORA_TESTNET = 1313161555,
  ETHEREUM = 1,
  POLYGON = 137
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

export function useGameLandContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(GameLandAddress, GameLandAbi, library.getSigner())
}

export function useTsContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(TSAddress, ABIs[TSAddress], library.getSigner())
}

export function useERC20Contract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(ERC20Address, BUSD, library.getSigner())
}

export function useAssetContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(AssetContractAddress, AssetContractAbi, library.getSigner())
}

export function useERC721Contract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(ERC721Address, erc721Abi, library.getSigner())
}

export function useControlContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null

  return new Contract(ControlContractAddress, ControlContractAbi, library.getSigner())
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
