const Web3 = require('web3')
const fs = require('fs')


const web3 = new Web3('ws://localhost:8545')
async function main() {
  const accounts = await web3.eth.getAccounts()
  for (let account of accounts) {
    const balance = await web3.eth.getBalance(account)
    console.log(`Account ${account} - ${web3.utils.fromWei(balance, 'ether')}`)
  }
}

function returnAccountValues(account) {
    
    return console.log(`Account ${account} - ${web3.utils.fromWei(balance, 'ether')}`)
}


main()

/* export function to log account values and return
acct energy functions later*/
module.exports = returnAccountValues;