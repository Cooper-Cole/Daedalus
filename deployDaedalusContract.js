const Web3 = require('web3')
const fs = require('fs')
const { getAccountHash } = require('./accountHashHelpers')
const getContractInterfaces = require('./getContractInterfaces')

/**
 * This function deploys a new daedalus contract to the local test network. The Daedalus contract is a factory for generating surplusses. Consumers should subscribe to this contract to know when new surplusses are created.
 * @param {string | number} [acct=0] The account index or hash to deploy the Daedalus contract from - defaults to 0
 * @param {boolean} [write=false] Write the hash of the daedalus contract to an out file called daedalusHash - defaults to false
 * @param {string} [ethNetwork] A local etherium test network - defaults to ws://localhost:8545
 */
function deployDaedalusContract(acct = 0, write = false, ethNetwork) {
  const web3 = new Web3(ethNetwork || 'ws://localhost:8545')
  const DaedalusInterface = getContractInterfaces('Daedalus')
  return new Promise(async (resolve, reject) => {
    try {
      let accountHash = await getAccountHash(acct)
      const Daedalus = new web3.eth.Contract(JSON.parse(DaedalusInterface.abi))
  
      const daedalusTransactionReceipt = await Daedalus.deploy({
        data: DaedalusInterface.bytecode
      }).send({
        from: accountHash,
        gas: 6721975,
        gasPrice: 20000000000,
      })
      
      if (write) {
        fs.writeFileSync('./daedalusHash', daedalusTransactionReceipt.options.address, { encoding: 'utf8' })
      }

      resolve(daedalusTransactionReceipt)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = deployDaedalusContract

// Command Line Usage

if (require.main === module) {
  let args = process.argv.slice(2); // allow command line use 
  resolveTransactionReceipt(...args).then(({ options: { address } }) => {
    console.log(`Daedalus Contract Address = ${address}`)
    fs.writeFileSync('./daedalusHash', address, { encoding: 'utf8' })
    process.exit(0)
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
