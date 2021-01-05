
// Rolling dice for convenience
function rollDice (dice, ch) {
  let total = 0; let tempTotal = 0

  // For each term ("id20", "+5", "3d8", etc.)
  for (let i = 1; i < dice.length; i++) {
    tempTotal = 0

    // Check what type of term it is and take appropriate action
    if (dice[i].includes('d')) {
      if (dice[i].length > 5) {
        ch.send('Make sure you chuck some spaces in between terms or just roll less dice please 👀')
        return
      }
      tempTotal += dieRoll(dice[i])
    } else if (dice[i].includes('+')) {
      if (dice[i].length === 1) {
        if (dice[i + 1].includes('d')) { tempTotal += dieRoll(dice[i + 1]) } else { tempTotal += parseInt(dice[i + 1], 10) }
        i++
      } else { tempTotal += parseInt(dice[i].split('+')[1], 10) }
    } else if (dice[i].includes('-')) {
      if (dice[i].length === 1) {
        if (dice[i + 1].includes('d')) { tempTotal -= dieRoll(dice[i + 1]) } else { tempTotal -= parseInt(dice[i + 1], 10) }
        i++
      } else { tempTotal -= parseInt(dice[i].split('+')[1], 10) }
    } else { console.log('Unknown term. ' + dice[i]) }
    total += tempTotal
  }
  ch.send('```ini\nRoll Result: ' + total + '\n```')
}

// Roll given die and return value
function dieRoll (term) {
  const nums = term.split('d')
  let sum = 0
  for (let j = 0; j < nums[0]; j++) { sum += Math.floor(Math.random() * nums[1] + 1) }
  return sum
}

module.exports = {
  rollDice
}
