const DaedalusNetworkClient = require('./DaedalusNetworkClient')

class Consumer extends DaedalusNetworkClient {
  constructor (initialBid, maxBid, bidFactor = 1.10, ethNetwork, daedalusHash) {
    super(ethNetwork, daedalusHash)

    if (bidFactor < 1) {
      throw new Error('BidFactor must be greater than 1')
    }

    this.initialBid = initialBid
    this.maxBid = maxBid
    this.bidFactor = bidFactor
  }

  start () {
    // set SurplusCreated event handler
    this.DaedalusContract.events.SurplusCreated(async (err, event) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      const surplusAddress = event.returnValues._surplusAddress

      // only run the remainder of this event handler if the currentSurplus is undefined
      if (this.currentSurplus !== undefined) { return }

      // otherwise set the surplus contract and continue
      this.currentSurplus = new this.web3.eth.Contract(
        JSON.parse(this.contractInterfaces.Surplus.abi),
        surplusAddress
      )

      this.currentSurplus.events.HighestBidIncreased(async (err, event) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }

        try {
          // attempt to increase bid
          // this will error if someone else outbids at the same time. Should catch and ignore (make higher bid on the incoming HBI event)
          if (event.returnValues.bidder !== this.accountHash) {
            let nextBid = Consumer.getNextBid(this.web3.utils.fromWei(event.returnValues.amount, 'ether'), this.bidFactor)
            if (nextBid < this.maxBid) {
              await this._makeBid(nextBid)
            } else {
              this.log('Maximum bid reached')
            }
          }
        } catch (err) {
          // ignore if err is about being outbid
          console.error(err)
          process.exit(1)
        }
      })

      this.currentSurplus.events.ExchangeEnded(async (err, event) => {
        if (err) {
          console.error(err)
          process.exit(1)
        }

        if (event.returnValues.highestBidder !== this.accountHash) {
          try {
            let withdrawReceipt = await this._finalize()
            this.log('Withdraw successful. Surplus Event Complete')
          } catch (err) {
            console.error(err)
            process.exit(1)
          }
        }
      })

      this.log(`Making Initial Bid ${this.initialBid}`)
      try {
        await this.makeInitialBid(this.initialBid)
      } catch (err) {
        throw err
      }

      // this implementation currently ignores surplus contracts created while currently involved with an existing contract; next implementation should have a queue system that will allow the consumer to bid on an existing surplus event after they finish bidding on their current one. Ideally, the consumer should be able to participate in multiple surplus contract biddings at the same time.
    })
  }

  async makeInitialBid (initialBid) {
    try {
      return await this._makeBid(initialBid)
    } catch (err) {
      if (err.message.includes('Your bid does not exceed the current highest bid')) {
        let nextBid = Consumer.getNextBid(initialBid, this.bidFactor)
        return await this.makeInitialBid(nextBid)
      } else {
        throw err
      }
    }
  }

  async _finalize () {
    let withdrawReceipt = await this.currentSurplus.methods.withdraw().send({
      from: this.accountHash,
      gas: 6721975,
      gasPrice: 20000000000
    })

    this.currentSurplus = undefined
    
    return withdrawReceipt
  }

  async _makeBid (bid) {
    this.log(`Bidding: ${bid}`)
    const bidReceipt = await this.currentSurplus.methods.bid().send({
      from: this.accountHash,
      gas: 6721975,
      gasPrice: 20000000000,
      value: this.web3.utils.toWei(bid.toString(), 'ether')
    })
    return bidReceipt
  }

  static getNextBid (prevBid, bidFactor) {
    return Math.round(1000 * (prevBid * bidFactor)) / 1000
  }
}

module.exports = Consumer
