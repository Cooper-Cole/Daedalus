const EventEmitter = require('events')

class Battery extends EventEmitter {
  constructor (maximum) {
    super()
    this.maximum = maximum
    this.energy = 0
  }
  addEnergy (amount) {
    if (amount < 0) {
      throw new Error('Amount must be positive')
    }

    this.energy += amount

    if (this.energy > this.maximum) {
      this.emit('excess', this.energy - this.maximum)
    } else {
      this.emit('increase', this.energy)
    }
  }
  removeEnergy (amount) {
    this.energy -= amount
    this.emit('decrease', this.energy)
  }
}

module.exports = Battery