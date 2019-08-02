const Web3 = require('web3')
const fs = require('fs')
const getDaedalusHash = require('./getDaedalusHash')

const web3 = new Web3('ws://localhost:7545')

const Daedalus_bytecode = fs.readFileSync('Daedalus_sol_Daedalus.bin', { encoding: 'utf8' })
const Daedalus_abi = JSON.parse(fs.readFileSync('Daedalus_sol_Daedalus.abi', { encoding: 'utf8' }))
const Surplus_bytecode = fs.readFileSync('Daedalus_sol_Surplus.bin', { encoding: 'utf8' })
const Surplus_abi = fs.readFileSync('Daedalus_sol_Surplus.abi', { encoding: 'utf8' })

async function main(accountId, daedalusHash) {
  const accounts = await web3.eth.getAccounts()
  const account = accounts[accountId]

  const Daedalus = new web3.eth.Contract(Daedalus_abi, daedalusHash)

  Daedalus.events.SurplusCreated((err, event) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    console.log(event)
  })
}

let args = process.argv.slice(2);
if (args.length === 1) {
  let daedalusHash = getDaedalusHash()
  main(args[0], daedalusHash)
} else if (args.length === 2) {
  main(args[0], args[1])
} else {
  console.log('Execute this script with 1 or 2 arguments\n`node supplier.js <account index> [<daedalus contract hash>]`')
}