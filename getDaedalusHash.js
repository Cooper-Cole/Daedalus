const fs = require('fs')
function getDaedalusHash () {
  try {
    return fs.readFileSync('daedalusHash', { encoding: 'utf8' })
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('daedalusHash file does not exist. Run deploy script to generate')
    } else {
      console.error(err)
    }
  }
}

module.exports = getDaedalusHash