import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import ChainId from '../utils/chainIdInfo'

export const supportedNetwork = [
  ChainId.mainnet
  // ChainId.ropsten,
  // ChainId.goerli,
  // ChainId.kovan,
  // ChainId.aurora,
  // ChainId['Aurora Testnet'],
  // ChainId.localnode,
  // ChainId.polygon,
  // ChainId.rinkeby
]

const RPC_URL = 'https://mainnet.infura.io/v3/'
const CHAIN_ID = 1

export const injected = new InjectedConnector({
  supportedChainIds: supportedNetwork
})

export const network = new NetworkConnector({
  urls: {
    [CHAIN_ID]: RPC_URL
  }
})

export { InjectedConnector }
