const Web3 = require('web3')

async function getAccountHashFromIndex (accountIndex, ethNetwork) {
  if (!Number.isInteger(accountIndex)) {
    throw new Error('Account index is not an integer')
  }

  const web3 = new Web3(ethNetwork || 'ws://localhost:8545') // defaul to local ganache network
  const networkAccounts = await web3.eth.getAccounts()

  if (networkAccounts.length - 1 < accountIndex) {
    throw new Error('Accoutn index value is out of bounds')
  }

  return networkAccounts[accountIndex]
}

async function verifyAccountHash (accountHash, ethNetwork) {
  const web3 = new Web3(ethNetwork || 'ws://localhost:8545') // defaul to local ganache network
  const networkAccounts = await web3.eth.getAccounts()

  return networkAccounts.includes(accountHash)
}

async function getAccountHash(accountHashOrIndex, ethNetwork) {
  let accountHash
  if (Number.isInteger(accountHashOrIndex)) {
    accountHash = await getAccountHashFromIndex(accountHashOrIndex, ethNetwork)
  } else if (await verifyAccountHash(accountHashOrIndex, ethNetwork)) {
    accountHash = accountHashOrIndex
  } else {
    throw new Error("accountHashOrIndex is neither a valid account hash nor a valid account index")
  }

  return accountHash
}

module.exports = {
  getAccountHash,
  getAccountHashFromIndex,
  verifyAccountHash
}