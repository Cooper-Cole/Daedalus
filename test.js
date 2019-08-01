const Web3 = require('web3')
const fs = require('fs')

const web3 = new Web3('ws://localhost:7545')

const bytecode = fs.readFileSync('DaedalusExchange_sol_DaedalusExchange.bin', { encoding: 'utf8' })
const abi = JSON.parse(fs.readFileSync('DaedalusExchange_sol_DaedalusExchange.abi', { encoding: 'utf8' }))

const contract = new web3.eth.Contract(abi)

contract.deploy({
  data: bytecode,
  arguments: [10, 100]
}).send({
  from: '0xD96E8f1c8df69FCC3ffe9BC063fa8a0254e8930c',
  gas: 1500000,
  gasPrice: Web3.utils.toWei('0.00003', 'ether')
}).then(contractInst => {
  console.log(contractInst.options.address)
})