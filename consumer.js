const DaedalusNetworkClient = require('./DaedalusNetworkClient')
const Battery = require('./Battery')
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

class Consumer extends DaedalusNetworkClient {
  /**
   * Constructor for Consumer client. Initializes battery with a maximum energy of 100.
   * 
   * @param {number} initialBid Initial bid in Ether
   * @param {number} maxBid Maximum bid in Ether, will stop bidding when reached
   * @param {number} [bidFactor] Defaults to 1.10 - Must be greater than 1, should be less than 2 (but not required). This is used to increment the bid
   * @param {number} [bidDelay] Defaults to 1000ms (1s) - Delay before bidding in milliseconds; mainly for demonstration purposes
   * @param {string} [ethNetwork] A local etherium test network - defaults to ws://localhost:8545 (Passed to the DaedalusNetworkClient constructor)
   * @param {string} [daedalusHash] Daedalus contract hash - defaults to the local out file (Passed to the DaedalusNetworkClient constructor)
   */
  constructor (initialBid, maxBid, bidFactor = 1.10, bidDelay = 1000, ethNetwork, daedalusHash) {
    super(ethNetwork, daedalusHash)

    if (bidFactor < 1) {
      throw new Error('BidFactor must be greater than 1')
    }

    this.battery = new Battery(100)
    this.initialBid = initialBid
    this.maxBid = maxBid
    this.bidFactor = bidFactor
    this.bidDelay = bidDelay // ms
  }

  /**
   * Attaches event handlers to the DaedalusContract events.
   */
  start () {
    // set SurplusCreated event handler
    this.DaedalusContract.events.SurplusCreated(async (err, event) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      const surplusAddress = event.returnValues._surplusAddress // get the new surplus address

      // only run the remainder of this event handler if the currentSurplus is undefined
      if (this.currentSurplus !== undefined) { return } 

      // otherwise set the surplus contract and continue
      this.currentSurplus = new this.web3.eth.Contract(
        JSON.parse(this.contractInterfaces.Surplus.abi),
        surplusAddress
      )

      // skip past the next two event handlers for the initial bid sequence


      // on highest bid increased attemp to out bid
      this.currentSurplus.events.HighestBidIncreased(async (err, event) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }

        try {
          // attempt to increase bid
          if (event.returnValues.bidder !== this.accountHash) { // make sure not out bidding self
            let nextBid = Consumer.getNextBid(this.web3.utils.fromWei(event.returnValues.amount, 'ether'), this.bidFactor) // determine the next bid
            if (nextBid < this.maxBid) { // if it is less than the maximum bid
              await setTimeoutPromise(this.bidDelay) // timeout
              await this.bidUntilSuccessful(nextBid) // bid until successful (this will increment bid)
            } else {
              this.log('Maximum bid reached')
            }
          }
        } catch (err) {
          if (err.message.includes('Surplus Event ended')) {
            this.log('Surplus contract completed. No longer bidding.') // don't error out if the bidding has ended
          } else {
            console.error(err)
            process.exit(1)
          }
        }
      })

      // When the exchange has ended try to withdraw
      this.currentSurplus.events.ExchangeEnded(async (err, event) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }

        try {
          let withdrawReceipt = await this._finalize() // finalize (attemp to withdraw)
          this.log('Surplus Event Complete')
        } catch (err) {
          console.error(err)
          process.exit(1)
        }
      })

      this.log(`Making Initial Bid ${this.initialBid}`)
      try {
        await this.bidUntilSuccessful(this.initialBid) // make an initial successful bid
      } catch (err) {
        if (!err.message.includes('Surplus Event ended')) {
          throw err
        }
      }

      // this implementation currently ignores surplus contracts created while currently involved with an existing contract; next implementation should have a queue system that will allow the consumer to bid on an existing surplus event after they finish bidding on their current one. Ideally, the consumer should be able to participate in multiple surplus contract biddings at the same time.
    })
  }

  /**
   * Recursively bid until successful. Uses the private _makeBid function.
   * @param {number} bid Amount to bid
   */
  async bidUntilSuccessful (bid) {
    try {
      return await this._makeBid(bid)
    } catch (err) {
      if (err.message.includes('Your bid does not exceed the current highest bid')) {
        let nextBid = Consumer.getNextBid(bid, this.bidFactor)
        return await this.bidUntilSuccessful(nextBid)
      } else {
        throw err
      }
    }
  }

  /**
   * Finalize by attempting to withdraw and clearing the current surplus
   */
  async _finalize () {
    let withdrawReceipt = await this.currentSurplus.methods.withdraw().send({
      from: this.accountHash,
      gas: 6721975,
      gasPrice: 20000000000
    })

    this.currentSurplus = undefined
    
    return withdrawReceipt
  }

  /**
   * Bid on the current surplus
   * @param {number} bid Amount to bid
   */
  async _makeBid (bid) {
    if (!this.currentSurplus) {
      throw new Error('Surplus Event ended')
    }
    this.log(`Bidding: ${bid}`)
    const bidReceipt = await this.currentSurplus.methods.bid().send({
      from: this.accountHash,
      gas: 6721975,
      gasPrice: 20000000000,
      value: this.web3.utils.toWei(bid.toString(), 'ether')
    })
    return bidReceipt
  }

  /**
   * This method will yield the next bid rounded to the nearest thousandth
   * @param {number} prevBid Previous bid value
   * @param {number} bidFactor Should be greater than 1 (required in class constructor)
   */
  static getNextBid (prevBid, bidFactor) {
    return Math.round(1000 * (prevBid * bidFactor)) / 1000
  }
}

module.exports = Consumer
