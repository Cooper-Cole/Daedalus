const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);
const EventEmitter = require('events')
const Battery = require('./battery')
const DaedalusNetworkClient = require('./DaedalusNetworkClient')

class Supplier extends DaedalusNetworkClient {
  /**
   * Constructor for Supplier initializes battery with a max size of 100. Creates an event emitter on the property this.surplusEE which will emit a 'surplus' event when the internal battery emits an 'excess' event
   * @param {string} [ethNetwork] A local etherium test network - defaults to ws://localhost:8545 (Passed to the DaedalusNetworkClient constructor)
   * @param {string} [daedalusHash] Daedalus contract hash - defaults to the local out file (Passed to the DaedalusNetworkClient constructor)
   */
  constructor (ethNetwork, daedalusHash) {
    super(ethNetwork, daedalusHash)
    this.battery = new Battery(100)
    this.surplusEE = new EventEmitter()

    this.battery.addListener('excess', excessEnergy => {
      // const surplus = this._createSurplus(excessEnergy) // surplus is the setTimeoutPromise
      this.surplusEE.emit('surplus', excessEnergy)
    })
  }

  /**
   * Creates a new surplus and returns a timeout promise of 10 seconds. Once the timer completes it will automatically fire the exchangeEnd() method on the surplus contract.
   * @param {number} excessEnergy Energy to distribute
   */
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