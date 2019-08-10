const Web3 = require('web3')
const getDaedalusHash = require('./getDaedalusHash')
const getContractInterfaces = require('./getContractInterfaces')
const { getAccountHash } = require('./accountHashHelpers')

class DaedalusNetworkClient {
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
      this.start()
    }
  }

  start () {
    console.error('Default start method execute; when extending the DaedalusNetworkClient you must define a start () method')
  }
}

module.exports = DaedalusNetworkClient