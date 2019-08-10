const Web3 = require('web3')
const fs = require('fs')
const { getAccountHash } = require('./accountHashHelpers')
const getContractInterfaces = require('./getContractInterfaces')

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
