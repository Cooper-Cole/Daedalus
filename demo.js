const deployDaedalusContract = require('./deployDaedalusContract')
const Consumer = require('./Consumer')
const Supplier = require('./Supplier')
const getAccountValues = require('./getAccountValues')
const Web3 = require('web3')

function printEther(accountsWithBalances, whitelist) {
  const web3 = new Web3()
  console.log('\nAccount Ether Values:')
  for (let a of accountsWithBalances) {
    if (whitelist.indexOf(a.account) !== -1) {
      console.log(`Account ${a.account} - ${web3.utils.fromWei(a.balance, 'ether')} ether`)
    }
  }
}

function printEnergy(clients) {
  console.log('\nAccount Energy Values:')
  for (let c of clients) {
    console.log(`Account ${c.accountHash} - ${c.battery.energy} energy`)
  }
}

async function main() { // do not catch errors; let function call handle it
  let txReceipt = await deployDaedalusContract(0, true) // deploy Daedalus Contract

  const S1 = new Supplier()
  await S1.initialize(1) // Initialize Supplier using wallet 1

  const consumers = {}

  const C1 = new Consumer(1, 10, 1.15)
  const c1Hash = await C1.initialize(2) // Initialize Consumer 1 using wallet 2
  consumers[c1Hash] = C1

  const C2 = new Consumer(1, 10, 1.10)
  const c2Hash = await C2.initialize(3) // Initialize Consumer 2 using wallet 3
  consumers[c2Hash] = C2

  // Kick off event listeners for consumers
  C1.start()
  C2.start()

  printEther(await getAccountValues(), [S1.accountHash, C1.accountHash, C2.accountHash])
  printEnergy([S1, C1, C2])

  // Listen for the Supplier surplus event
  S1.surplusEE.once('surplus', async excessEnergy => {
    const exchangeEndReceipt = await S1._createSurplus(excessEnergy) // create a new surplus and await for it to complete

    const winnerHash = exchangeEndReceipt.events.ExchangeEnded.returnValues.winner
    console.log(`Bid Winner: ${winnerHash}`)
    printEther(await getAccountValues(), [S1.accountHash, C1.accountHash, C2.accountHash])

    // transfer energy
    S1.battery.removeEnergy(excessEnergy)
    consumers[winnerHash].battery.addEnergy(excessEnergy)

    printEnergy([S1, C1, C2])
  })

  // Add energy to Supplier simulating solar energy increase
  S1.battery.addEnergy(50)
  S1.battery.addEnergy(50) // Max is reached here, next addEnergy will emit 'excess' invent
  printEnergy([S1, C1, C2])
  S1.battery.addEnergy(50) // this should kick off the Surplus contract creation
}

if (require.main === module) {
  main().then(_ => {
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
}