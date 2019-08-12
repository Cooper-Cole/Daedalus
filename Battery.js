const EventEmitter = require('events')

/**
 * Battery mocks the flow of energy into a DaedalusNetworkClient.
 * It is an EventEmitter that emits 3 unique events
 * - 'increase' when it gains energy
 * - 'decrease' when it looses energy'
 * - 'excess' when it gains more energy than its assigned maximum
 * 
 * Unlike a real battery this fake one stores past it's maximum limit. This detail is not important for the simplified demonstration purposes and is thus ignored.
 * 
 */
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