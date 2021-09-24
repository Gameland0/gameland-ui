// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const hre = require('hardhat')

// contract address 0x5FbDB2315678afecb367f032d93F642f64180aa3
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory('Greeter')
  // const greeter = await Greeter.deploy('Hello, Hardhat!')

  // await greeter.deployed()

  // console.log('Greeter deployed to:', greeter.address)

  const provider = hre.ethers.provider
  const deployerWallet = new hre.ethers.Wallet(process.env.REACT_APP_AURORA_PRIVATE_KEY, provider)

  console.log('Deploying contracts with the account:', deployerWallet.address)

  console.log('Account balance:', (await deployerWallet.getBalance()).toString())

  const Greeter = await hre.ethers.getContractFactory('Greeter')
  const greeter = await Greeter.connect(deployerWallet).deploy('Hola hre!')
  await greeter.deployed()

  console.log('greeter deployed to:', greeter.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
