import { useState, useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Contract } from '@ethersproject/contracts'
import { injected } from '../connectors'
import { StoreContext } from '../components/Store'
import { isMobile } from 'react-device-detect'
import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { NetworkContextName } from '../utils'
import AssetContractAbi from '../constants/Abis/assetContract.json'
import ControlContractAbi from '../constants/Abis/controlContract.json'
// import erc721Abi from '../constants/Abis/erc721.json'
import BUSD from '../constants/Abis/busd.json'
import ERC20 from '../constants/Abis/ERC20.json'
import WETH from '../constants/Abis/WETH.json'
import rewardAbi from '../constants/Abis/reward.json'
import payment from '../constants/Abis/payment.json'
import PaidDownload from '../constants/Abis/PaidDownloads.json'
import airdrop from '../constants/Abis/airdrop.json'
import { useMyNfts } from './useMyNfts'
import { useMyRenting } from './useMyRenting'
import {
  BSCControlContractAddress,
  BSCAssetContractAddress,
  BUSDAddress,
  POLYGONControlContractAddress,
  POLYGONAssetContractAddress,
  BSCRewardAddress,
  POLYGONRewardAddress,
  WETHaddress,
  BSCPayMentAddress,
  BSCUSDT,
  PolygonPayMentAddress,
  PolygonUSDT,
  OneControlContractAddress,
  OneAssetContractAddress,
  OnePayMentAddress,
  OneRewardAddress,
  PaidDownloads,
  OneUSDT,
  BNBAirdropAddress,
  ETHAirdropAddress,
  PolygonAirdropAddress
} from '../constants'

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
  ETHEREUM = 1,
  POLYGON = 137,
  BSC = 56,
  ONE = 42161,
  NOVA = 42170
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
      ethereum.on('chainChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('chainChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}

export function useERC20Contract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BUSDAddress, BUSD, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(WETHaddress, WETH, library.getSigner())
  }
}

export function useUSDTContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BSCUSDT, ERC20, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(PolygonUSDT, ERC20, library.getSigner())
  } else if (chainId === 42161) {
    return new Contract(OneUSDT, ERC20, library.getSigner())
  }
}

export function useTestUSDTContract() {
  const { library } = useActiveWeb3React()
  if (!library) return null
  return new Contract('0x40BAC2848EFD60c89F8d10fd2AeD32F25C200d15', ERC20, library.getSigner())
}

export function useAirdropContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BNBAirdropAddress, airdrop, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(PolygonAirdropAddress, airdrop, library.getSigner())
  } else if (chainId === 1) {
    return new Contract(ETHAirdropAddress, airdrop, library.getSigner())
  }
}

export function usePayMentContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BSCPayMentAddress, payment, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(PolygonPayMentAddress, payment, library.getSigner())
  } else if (chainId === 42161) {
    return new Contract(OnePayMentAddress, payment, library.getSigner())
  }
}

export function usePaidDownloadContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  return new Contract(PaidDownloads, PaidDownload, library.getSigner())
}


export function useAssetContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BSCAssetContractAddress, AssetContractAbi, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(POLYGONAssetContractAddress, AssetContractAbi, library.getSigner())
  } else if (chainId === 42161) {
    return new Contract(OneAssetContractAddress, AssetContractAbi, library.getSigner())
  }
}

export function useControlContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BSCControlContractAddress, ControlContractAbi, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(POLYGONControlContractAddress, ControlContractAbi, library.getSigner())
  } else if (chainId === 42161) {
    return new Contract(OneControlContractAddress, ControlContractAbi, library.getSigner())
  }
}

export function useRewardContract() {
  const { library, chainId } = useActiveWeb3React()
  if (!library) return null
  if (chainId === 56) {
    return new Contract(BSCRewardAddress, rewardAbi, library.getSigner())
  } else if (chainId === 137) {
    return new Contract(POLYGONRewardAddress, rewardAbi, library.getSigner())
  } else if (chainId === 42161) {
    return new Contract(OneRewardAddress, rewardAbi, library.getSigner())
  }
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
