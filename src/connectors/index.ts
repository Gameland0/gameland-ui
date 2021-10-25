import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import ChainId from '../utils/chainIdInfo'

export const supportedNetwork = [
  ChainId.mainnet,
  // ChainId.ropsten,
  ChainId.rinkeby,
  // ChainId.goerli,
  // ChainId.kovan,
  // ChainId.aurora,
  ChainId['Aurora Testnet'],
  ChainId.localnode,
  ChainId.polygon
]

const RPC_URL =
  process.env.NODE_ENV !== 'development'
    ? process.env.REACT_APP_RPC_URL_AURORA_TESTNET
    : process.env.REACT_APP_RPC_URL_LOCAL_TESTNET
const chainId = process.env.NODE_ENV !== 'development' ? '1313161555' : process.env.REACT_APP_CHAIN_ID
const CHAIN_ID = parseInt(chainId ?? '1313161555')

export const injected = new InjectedConnector({
  supportedChainIds: supportedNetwork
})

if (typeof RPC_URL === 'undefined') {
  throw new Error(`REACT_APP_RPC_URL_AURORA_TESTNET must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: {
    [CHAIN_ID]: RPC_URL
  }
})

export { InjectedConnector }
