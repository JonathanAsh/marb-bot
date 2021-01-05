
// Function to capitalise first letter of given string to properly query the API
function capitaliseFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Function to make sure any weird apostrophe replacements turn back into apostrophes
function correctApos (str) {
  return str.replace(/â€™/g, "'").replace(/â€”/g, '-').replace(/â€œ/g, '"').replace(/â€�/g, '"')
}

// Swaps semicolons for a hyphen otherwise it messes up a bit with formatting
function removeSemicolon (str) {
  return str.replace(/;/g, ' -')
}

// Returns the date and time in a nice format for the console and text file logs
function getDateTime () {
  const date = new Date()

  let hour = date.getHours()
  hour = (hour < 10 ? '0' : '') + hour

  let min = date.getMinutes()
  min = (min < 10 ? '0' : '') + min

  let sec = date.getSeconds()
  sec = (sec < 10 ? '0' : '') + sec

  const year = date.getFullYear()

  let month = date.getMonth() + 1
  month = (month < 10 ? '0' : '') + month

  let day = date.getDate()
  day = (day < 10 ? '0' : '') + day

  return (year + '-' + month + '-' + day + '_' + hour + ':' + min + '.' + sec).toString()
}

// Replaces the given IDs of users and channels with their more user-friendly counterparts (our names for 'em). There's probably a better way to do this.
function replaceID (r) {
  return r.replace(/<#591793011483082772>/g, '#dev-centre').replace(/<#594430167938629662>/g, '#minecraft').replace(/<#612116178407522304>/g, '#discussion').replace(/<#485317731009167364>/g, '#tactics').replace(/<#559269311294865409>/g, '#command-centre')
    .replace(/<#485317959783546901>/g, '#mems').replace(/<#567403796662059018>/g, '#dnd').replace(/<#494781493454045185>/g, '#gams').replace(/<#485316399326167040>/g, '#main').replace(/<@187788766599970817>/g, '@Marbles#2385')
    .replace(/<@179892251898413056>/g, '@Dash Alpha#3450').replace(/<@261725719044947972>/g, '@AhimsaNZ#4010').replace(/<@189998232951062528>/g, '@Elcarien#6346').replace(/<@296499043268558849>/g, '@maximize75#1963')
    .replace(/<@176654870261006336>/g, '@PrimeHylian#6432').replace(/<@314896092502294529>/g, '@Moodes567#2862').replace(/<@561029934844346381>/g, '@Natopotato#4629').replace(/<@186703389462233089>/g, '@OrphanPunter870#8474')
    .replace(/<@591786115975872512>/g, '@Omega Bot#5343').replace(/<@591589660610789376>/g, '@Alpha Bot#4046').replace(/<@234395307759108106>/g, '@Groovy#7254')
}

module.exports = {
  capitaliseFirstLetter,
  correctApos,
  removeSemicolon,
  getDateTime,
  replaceID
}
