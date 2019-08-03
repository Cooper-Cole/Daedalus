const Web3 = require('web3')
const fs = require('fs')

const web3 = new Web3('ws://localhost:8545')

const Daedalus_bytecode = fs.readFileSync('Daedalus_sol_Daedalus.bin', { encoding: 'utf8' })
const Daedalus_abi = JSON.parse(fs.readFileSync('Daedalus_sol_Daedalus.abi', { encoding: 'utf8' }))

async function main() {
  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]

  const Daedalus = new web3.eth.Contract(Daedalus_abi)

  const daedalus = await Daedalus.deploy({
    data: Daedalus_bytecode
  }).send({
    from: account,
    gas: 6721975,
    gasPrice: 20000000000,
  })

  console.log(`Daedalus contract address: ${daedalus.options.address}`)

  return daedalus.options.address
}

main().then(daedalusHash => {
  fs.writeFileSync('./daedalusHash', daedalusHash, { encoding: 'utf8' })
  process.exit(0)
}).catch(err => {
  console.error(err)
  process.exit(1)
}) // call this with `node consumer.js 1` to select account 1