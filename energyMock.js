function getEnergy(max = 10) {
  return Math.floor(Math.random() * Math.floor(max))
}

function sendEnergy(energyAmount, recipient) {
  console.log(`Sending ${energyAmount} to ${recipient}`)
}

module.exports = {
  getEnergy,
  sendEnergy
}