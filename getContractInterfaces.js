const fs = require('fs')

function getContractInterfaces(interface) {
  try {
    if (interface) {
      return {
        abi: fs.readFileSync(`Daedalus_sol_${interface}.abi`, { encoding: 'utf8' }),
        bytecode: fs.readFileSync(`Daedalus_sol_${interface}.bin`, { encoding: 'utf8' })
      }
    }

    return {
      Daedalus: {
        abi: fs.readFileSync('Daedalus_sol_Daedalus.abi', { encoding: 'utf8' }),
        bytecode: fs.readFileSync('Daedalus_sol_Daedalus.bin', { encoding: 'utf8' })
      },
      Surplus: {
        abi: fs.readFileSync('Daedalus_sol_Surplus.abi', { encoding: 'utf8' }),
        bytecode: fs.readFileSync('Daedalus_sol_Surplus.bin', { encoding: 'utf8' })
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT' && !interface) {
      console.error(`Expected interface file ${err.path} does not exist\nExecute \`npm run compile\` to fix.`)
    } else {
      console.error(err)
    }
  }
}

module.exports = getContractInterfaces