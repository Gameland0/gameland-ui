import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { POLYGON_CHAIN_ID, POLYGON_RPC_URL } from '../constants'
import ChainId from '../utils/chainIdInfo'

export const supportedNetwork = [
  // ChainId.mainnet,
  // ChainId.ropsten,
  // ChainId.rinkeby,
  // ChainId.goerli,
  // ChainId.kovan,
  // ChainId.aurora,
  // ChainId['Aurora Testnet'],
  // ChainId.localnode,
  ChainId.polygon
]

const RPC_URL = POLYGON_RPC_URL
const chainId = POLYGON_CHAIN_ID
const CHAIN_ID = chainId

export const injected = new InjectedConnector({
  supportedChainIds: supportedNetwork
})

if (typeof RPC_URL === 'undefined') {
  throw new Error(`RPC_URL must be a defined variable`)
}

export const network = new NetworkConnector({
  urls: {
    [CHAIN_ID]: RPC_URL
  }
})

export { InjectedConnector }
