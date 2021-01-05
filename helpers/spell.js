const fetch = require('node-fetch')
const { capitaliseFirstLetter, correctApos, removeSemicolon } = require('./strings')

// Async function to query an API for requested spell info for D&D 5e.
async function querySpell (name, ch) {
  // List of words in titles which have to be searched with lower-case first letters since they're not important, just connect the title together.
  const unCapitals = ['of', 'and', 'to', 'from', 'without', 'the', 'or']
  // Query API for spell by name
  let url = 'http://www.dnd5eapi.co/api/spells/?name='
  if (name.length === 2 && name[1].includes('/')) {
    const words = name[1].split('/')
    words[0] = capitaliseFirstLetter(words[0])
    words[1] = capitaliseFirstLetter(words[1])
    url += words[0] + '%2F' + words[1]
  } else {
    for (let i = 1; i < name.length; i++) {
      if (i !== 1) url += '+'
      name[i] = name[i].toLowerCase()
      if (!unCapitals.includes(name[i])) { url += capitaliseFirstLetter(name[i]) } else { url += name[i] }
    }
  }

  let response = await fetch(url)
  let spell = await response.json()

  if (spell.results[0] == null) { ch.send('That spell does not exist or is misspelt.') } else {
    // Get url of full spell data from name query
    url = 'http://dnd5eapi.co'
    url += spell.results[0].url
    response = await fetch(url).catch()
    spell = await response.json().catch()

    // Format the data to present it nicely in the message to be sent.
    let level = spell.level
    if (level === 1) { level = '1st-Level ' + spell.school.name } else if (level === 2) { level = '2nd-Level ' + spell.school.name } else if (level === 3) { level = '3rd-Level ' + spell.school.name } else if (level === -1 || level === 0) { level = spell.school.name + ' cantrip' } else { level += 'th-Level ' + spell.school.name }

    if (spell.ritual !== 'no') { level += ' (ritual)' }

    let comps = '\nComponents: '
    for (let i = 0; i < spell.components.length; i++) {
      if (i !== 0) comps += ', '
      comps += spell.components[i]
    }
    if (spell.material != null) { comps += ' (' + correctApos(spell.material) + ')' }

    let fesa = '\n\nAt Higher Levels: '
    if (spell.higher_level != null) {
      for (let i = 0; i < spell.higher_level.length; i++) {
        if (i !== 0) fesa += '\n'
        fesa += spell.higher_level[i]
      }
    } else fesa = ''

    let classes = '\n\n; Classes: '
    for (let i = 0; i < spell.classes.length; i++) {
      if (i !== 0) classes += ', '
      classes += spell.classes[i].name
    }

    let concDur = '\nDuration: '
    if (spell.concentration === 'yes' || spell.concentration === 'true') { concDur += 'Concentration, ' }
    concDur += spell.duration

    let charSoFar = 89 + correctApos(spell.name).length + level.length + spell.casting_time.length + spell.range.length + comps.length + concDur.length
    const msgArray = []

    // Usually the description of the spell is the meatiest part of the message.
    // Since Discord won't allow messages over the limit of 2000 characters,
    // the following 40 lines or so split the message up into parts to send
    // where each section is less than 2000 characters, split up in places that
    // are still aesthetically splitting (i.e., not in the middle of a word.)
    let newMsg = false
    let desc = ''
    for (let i = 0; i < spell.desc.length; i++) {
      if (charSoFar + spell.desc[i].length < 2000) {
        if (i !== 0 || newMsg) { desc += '\n' }
        desc += spell.desc[i]
        charSoFar += spell.desc[i].length
        newMsg = false
      } else {
        if (msgArray.length === 0) {
          msgArray.push('```ini\n[ ' + correctApos(spell.name) + ' ]\n\n' +
                          level +
                          '\nCasting Time: ' + spell.casting_time +
                          '\nRange: ' + spell.range +
                          comps +
                          concDur + '```')
          msgArray.push('```ini\n' + removeSemicolon(correctApos(desc)) + '\n```')
        } else { msgArray.push('```ini\n' + removeSemicolon(correctApos(desc)) + '\n```') }
        desc = ''
        newMsg = true
        charSoFar = 13
      }
    }
    if (msgArray.length === 0) {
      msgArray.push('```ini\n[ ' + correctApos(spell.name) + ' ]\n\n' +
                      level +
                      '\nCasting Time: ' + spell.casting_time +
                      '\nRange: ' + spell.range +
                      comps +
                      concDur + '```')
    }
    if (desc.length + fesa.length + classes.length + 4 > 2000) {
      msgArray.push('```ini\n' + removeSemicolon(correctApos(desc)) + '```')
      msgArray.push('```ini\n' + fesa + classes + '.```')
    } else {
      msgArray.push('```ini\n' + removeSemicolon(correctApos(desc)) + fesa + classes + '.```')
    }

    // Concatenate it all together into the send body
    for (let i = 0; i < msgArray.length; i++) { ch.send(msgArray[i]) }
  }
}

module.exports = {
  querySpell
}
