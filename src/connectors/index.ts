import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import ChainId from '../utils/chainIdInfo'

export const supportedNetwork = [
  // ChainId.mainnet,
  // ChainId.ropsten,
  // ChainId.rinkeby,
  // ChainId.goerli,
  // ChainId.kovan,
  // ChainId.aurora,
  ChainId['Aurora Testnet'],
  ChainId.localnode
]

const RPC_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_RPC_URL_AURORA_TESTNET
    : process.env.REACT_APP_RPC_URL_LOCAL_TESTNET
const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1313161555')

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
