const Web3 = require('web3')
const getDaedalusHash = require('./getDaedalusHash')
const getContractInterfaces = require('./getContractInterfaces')
const { getAccountHash } = require('./accountHashHelpers')

/**
 * Base class for Consumer and Supplier classes. The asynchronous `initialize` method should be called immediatly after class instantiation.
 */
class DaedalusNetworkClient {
  /**
   * Constructor initializes Web3, contract interfaces, the daedalus contract, and the energy value
   * @param {string} [ethNetwork] A local etherium test network - defaults to ws://localhost:8545
   * @param {string} [daedalusHash] Daedalus contract hash - defaults to the local out file
   */
  constructor (ethNetwork, daedalusHash) {
    this.web3 = new Web3(ethNetwork || 'ws://localhost:8545') // default to local ganache server
    this.contractInterfaces = getContractInterfaces()
    this.setDaedalusContract(daedalusHash)
    this.energy = 0
  }

  async initialize (account) {
    this.accountHash = await getAccountHash(account)
  }

  setDaedalusContract(daedalusHash) {
    daedalusHash = daedalusHash || getDaedalusHash()

    // if contract is undefined or is not already referencing the expected contract
    if (this.DaedalusContract === undefined || this.DaedalusContract.options.address !== daedalusHash) {
      this.DaedalusContract = new this.web3.eth.Contract(JSON.parse(this.contractInterfaces.Daedalus.abi), daedalusHash)
    }
  }

  log (...args) {
    console.log(`${this.accountHash.substring(0, 5)} |>`, ...args)
  }
}

module.exports = DaedalusNetworkClient