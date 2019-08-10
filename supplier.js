const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const EventEmitter = require('events')
const Battery = require('./battery')

const DaedalusNetworkClient = require('./DaedalusNetworkClient')
class Supplier extends DaedalusNetworkClient {
  constructor (ethNetwork, daedalusHash) {
    super(ethNetwork, daedalusHash)
    this.battery = new Battery(100)
    this.surplusEE = new EventEmitter()

    this.battery.addListener('excess', excessEnergy => {
      // const surplus = this._createSurplus(excessEnergy) // surplus is the setTimeoutPromise
      this.surplusEE.emit('surplus', excessEnergy)
    })
  }

  start () {}

  async _createSurplus (excessEnergy) {
    const newSurplusReceipt = await this.DaedalusContract.methods.newSurplus(excessEnergy).send({
      from: this.accountHash,
      gas: 6721975,
      gasPrice: 20000000000
    })
    const surplusAddress = newSurplusReceipt.events.SurplusCreated.returnValues._surplusAddress
    const Surplus = new this.web3.eth.Contract(JSON.parse(this.contractInterfaces.Surplus.abi), surplusAddress)
    return setTimeoutPromise(1000 * 10).then(async () => {
      return await Surplus.methods.exchangeEnd().send({
        from: this.accountHash,
        gas: 6721975,
        gasPrice: 20000000000
      })
    })
  }
}

module.exports = Supplier