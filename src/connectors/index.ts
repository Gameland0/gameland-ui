import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import ChainId from '../utils/chainIdInfo'

export const supportedNetwork = [
  // ChainId.mainnet,
  // ChainId.ropsten,
  // ChainId.goerli,
  // ChainId.kovan,
  // ChainId.aurora,
  // ChainId['Aurora Testnet'],
  // ChainId.localnode,
  // ChainId.polygon,
  ChainId.rinkeby
]

const RPC_URL = 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
const CHAIN_ID = 4

export const injected = new InjectedConnector({
  supportedChainIds: supportedNetwork
})

export const network = new NetworkConnector({
  urls: {
    [CHAIN_ID]: RPC_URL
  }
})

export { InjectedConnector }
