// [
//   1, // Mainet
//   3, // Ropsten
//   4, // Rinkeby
//   5, // Goerli
//   42, // Kovan
//   1313161554 // Aurora Mainnet
// ]
const ChainId: Record<string, number> = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  goerli: 5,
  kovan: 42,
  bsc: 56,
  aurora: 1313161554,
  'Aurora Testnet': 1313161555,
  localnode: 1337,
  ArbitrumNova: 42170,
  ArbitrumOne: 42161,
  polygon: 137
}

export default ChainId
