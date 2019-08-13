const Web3 = require('web3')

/**
 * This function returns all of the account values from a local etherium test network (such as Ganache)
 * The return value is an array of objects with associative `account` and `balance` properties.
 * 
 * @param {string} [ethNetwork] A local etherium test network - defaults to ws://localhost:8545
 */
async function getAccountValues(ethNetwork) {
  const web3 = new Web3(ethNetwork || 'ws://localhost:8545')
  const res = []
  const accounts = await web3.eth.getAccounts()
  for (let account of accounts) {
    const balance = await web3.eth.getBalance(account)
    res.push({ account, balance })
  }
  return res 
  
}

/* export function to log account values and return
acct energy functions later*/
module.exports = getAccountValues;

// Command Line Usage

if (require.main === module) {
  let args = process.argv.slice(2);
  main(...args).then(() => {})
}

async function main(ethNetwork) {
  const web3 = new Web3(ethNetwork || 'ws://localhost:8545')
  const accountsWithBalances = await getAccountValues
  for (let a of accountsWithBalances) {
    console.log(`Account ${a.account} - ${web3.utils.fromWei(a.balance, 'ether')}`)
  }
}