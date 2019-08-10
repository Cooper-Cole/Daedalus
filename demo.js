const deployDaedalusContract = require('./deployDaedalusContract')
const Consumer = require('./Consumer')
const Supplier = require('./Supplier')
const getAccountValues = require('./getAccountValues')
const Web3 = require('web3')

function print(accountsWithBalances) {
  const web3 = new Web3()
  for (let a of accountsWithBalances) {
    console.log(`Account ${a.account} - ${web3.utils.fromWei(a.balance, 'ether')}`)
  }
}

async function main() { // do not catch errors; let function call handle it
  let txReceipt = await deployDaedalusContract(0, true)

  const S1 = new Supplier()
  await S1.initialize(1)

  const C1 = new Consumer(1, 10)
  await C1.initialize(2)

  const C2 = new Consumer(1, 10)
  await C2.initialize(3)

  print(await getAccountValues())

  S1.surplusEE.once('surplus', async excessEnergy => {
    const exchangeEndReceipt = await S1._createSurplus(excessEnergy)
    console.log(`Bid Winner: ${exchangeEndReceipt.events.ExchangeEnded.returnValues.winner}`)
    print(await getAccountValues())
    return exchangeEndReceipt.events.ExchangeEnded.returnValues.winner
  })
  // log values

  S1.battery.addEnergy(50)
  S1.battery.addEnergy(50) // Max is reached here, next addEnergy will emit 'excess' invent
  S1.battery.addEnergy(50) // this should kick off the Surplus contract creation

  
}

// 1. deploy Daedalus
// - modify deploy.js so that it exports a function that returns a promise that resolves 
// the transaction receipt from deploying a new instance of Daedalus contract

// 2. create consumer and supplier instances
// - consumers should start with 0 energy, supplier should start with X energy

// 3. log initial wallet values and energy amounts

// 4. increase the amount of energy supplier has
// - supplier should automatically create a surplus contract when it exceeds a certain energy value N

// 5. with the automatic creation of the surplus contract, await the finalization of the surplus contract
// - the suplier should transfer the energy to the correct consumer; this requires the suplier instance to be aware of other entities in the network

// 6. log new wallet values and energy amounts and complete demo

if (require.main === module) {
  main().then(_ => {
    // console.log('Demo Complete')
    // process.exit(0)
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
}