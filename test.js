// const util = require('util');
// const setTimeoutPromise = util.promisify(setTimeout);

// const f = async () => {
//   await new Promise(res => { res('🦈') })
//   return setTimeoutPromise(1000).then(async () => {
//     return await new Promise(res => { res('👻')})
//   })
// }

// async function main() {
//   let res = await f()
//   console.log(res)
// }

// main().then(() => {})
const Web3 = require('web3')
const getContractInterfaces = require('./getContractInterfaces')
const getDaedalusHash = require('./getDaedalusHash')
const { getAccountHash } = require('./accountHashHelpers')
const { resolveTransactionReceipt } = require('./deploy')

async function main() {
  let web3 = new Web3('ws://localhost:8545')
  let DaedalusReceipt = await resolveTransactionReceipt(0)
  // console.log(DaedalusReceipt)
  let interfaces = getContractInterfaces()
  let daedalusHash = getDaedalusHash()
  let Daedalus = new web3.eth.Contract(JSON.parse(interfaces.Daedalus.abi), daedalusHash)
  Daedalus.events.SurplusCreated(event => {
    console.log(event)
  })
  let newSurplusReceipt = await newSurplus(Daedalus)
  let receipt = await web3.eth.getTransactionReceipt(newSurplusReceipt.transactionHash)
  // let surpluses = await getSurpluses(Daedalus)
  return receipt
}

async function getSurpluses (Daedalus) {
  return await Daedalus.methods.surplusContracts(0).call()
}

async function newSurplus (Daedalus) {
  let account = await getAccountHash(0)
  let receipt = await Daedalus.methods.newSurplus(50).send({
    from: account,
    gas: 6721975,
    gasPrice: 20000000000
  })
  return receipt
}

main().then(data => console.log(data))