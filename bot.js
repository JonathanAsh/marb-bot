// Set up variables to let it login properly
const Discord = require('discord.js')
const auth = require('./auth.json')
const fs = require('fs')
const client = new Discord.Client()

const { reloadList, addItemToList, removeItemFromList, displayList, clearList } = require('./helpers/shopping_list.js')
const { getDateTime, replaceID } = require('./helpers/strings.js')
const { rollDice } = require('./helpers/dice.js')
const { querySpell } = require('./helpers/spell.js')

// Variables for the bot scoring
let botScoreO = 0

// Logs in bot with authentication
client.login(auth.token).catch(console.error)

// Makes sure the client logs in successfully, logs time when it comes up, and loads previous values which are stored in file.
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  // Log Omega's bootup time
  fs.appendFile('/Users/jonst/Desktop/Discord Bot/text_files/logs.txt', '-- OMEGA START: ' + getDateTime() + ' --\r\n', (err) => { if (err) { console.error(err) } })
  // Get bot score info from last run
  fs.readFile('/Users/jonst/Desktop/Discord Bot/text_files/botscore.txt', 'utf8', function (err, contents) {
    if (err) {
      console.error(err)
      return
    }
    botScoreO = contents
  })
  // Loads shopping list from file
  reloadList()
})

// Triggers whenever a message is sent
client.on('message', msg => {
  // Log all messages sent in the console and in a text file for long-term
  const report = replaceID('"' + msg.content + '" from ' + msg.author + ' in ' + msg.channel + ' at ' + getDateTime())
  console.log(report)
  fs.appendFile('/Users/jonst/Desktop/Discord Bot/text_files/logs.txt', report + '\r\n', (err) => { if (err) { console.error(err) } })

  const str = msg.toString().toLowerCase()

  // React to pings with :mention:, even if it's from Omega himself
  if ((str.includes('<@') && str.includes('>')) || str.includes('@everyone') || str.includes('@here')) {
    const bean = msg.guild.emojis.find(emoji => emoji.name === 'mention')
    msg.react(bean)
  }

  // Makes sure he doesn't reply to himself
  if (msg.channel.id !== '638200674399551519' && msg.author !== '<@591786115975872512>') {
    // ! is the character I'm using to prefix commands
    if (str.charAt(0) === '!') {
      const params = str.split(' ')
      // Report on (current) bot score
      if (params[0].includes('!score')) {
        if (str.includes('omega')) {
          msg.channel.send('My all-time score is ' + botScoreO)
        } else {
          msg.channel.send('My all-time score is ' + botScoreO)
        }
      } else if (params[0].includes('!spell')) {
        // Report back with spell
        querySpell(params, msg.channel)
      } else if (params[0].includes('!say')) {
        // Bot just replies with whatever the user tells it to say, doesn't allow @everyone nor @here since anyone can use it, but might eventually restrict this command to only certain roles
        let reply = ''
        let ping = false
        for (let i = 1; i < params.length; i++) {
          if (params[i].includes('@everyone') || params[i].includes('@here')) { ping = true }
          reply += params[i] + ' '
        }
        if (!ping && reply !== '') { msg.channel.send(reply) } else { msg.channel.send("I can't shout that loud :(") }
        msg.delete().catch(console.error)
      } else if (params[0].includes('!roll')) {
        // Rolls whatever dice the user specifies
        rollDice(params, msg.channel)
      } else if (params[0].includes('!list')) { // may need to replace the " && (msg.author === '<@176654870261006336>' || msg.author === '<@179892251898413056>' || msg.author === '<@187788766599970817>' || msg.author === '<@261725719044947972>')" in but is malfunctioning atm so removed.
        // Adds, removes, and displays from a list
        if (params[1] == null) {
          msg.channel.send('Please specify a command for the list.')
          return
        }
        if (!params[1].includes('add') && !params[1].includes('rmv') && !params[1].includes('show') && !params[1].includes('clear')) {
          msg.channel.send('Unknown list command. Either use !list add <item>, !list rmv <item>, or !list show')
          return
        }
        // Checks which command has been used
        if (params[1].includes('add')) {
          // Makes sure there is an item to add to the list
          if (params[2] == null) { msg.channel.send('~~eat my ass~~ Please specify an item to add to the list'); return }
          addItemToList(msg, str)
        } else if (params[1].includes('rmv')) {
          removeItemFromList(msg, str)
        } else if (params[1].includes('show')) {
          displayList(msg)
        } else {
          clearList(msg)
        }
      } else if (params[0].includes('!help')) {
        msg.channel.send('**Commands:**\n• !score [omega] to report the score of Omega.\n• !spell <spell name> to get data on D&D 5e spells.\n• !roll {die|+|-|value}\n• !say <message> to make me say anything/ping anyone for you anonymously (mostly)\n• !list {add|rmv|show|clear} <item> to add to the flat shopping list. (Only available to Flat-Beta members)')
      } else {
        msg.channel.send('No such command. Use !help to check current available commands')
      }
    } else {
      // "weeha"
      if (str.includes('weeha')) {
        msg.channel.send('you are very wise my friend')
      } else if (str.includes('ryan')) { // The name of the sucker of the month
        msg.channel.send('ryan? more like stinky <:rad:487522054485049356>')
      } else if (str.includes('good bot')) {
        botScoreO++
        const love = msg.guild.emojis.find(emoji => emoji.name === 'love')
        msg.react(love)
        fs.writeFile('/Users/jonst/Desktop/Discord Bot/text_files/botscore.txt', botScoreO.toString(), (err) => { if (err) { console.error(err) } })
      } else if (str.includes('bad bot')) {
        botScoreO--
        const sad = msg.guild.emojis.find(emoji => emoji.name === 'sad')
        msg.react(sad)
        fs.writeFile('/Users/jonst/Desktop/Discord Bot/text_files/botscore.txt', botScoreO.toString(), (err) => { if (err) { console.error(err) } })
      } else if (str.includes('hey omega')) {
        // Get a random number from 0-4
        const c = Math.floor(Math.random() * Math.floor(5))
        if (c === 0) {
          msg.channel.send('Yes?')
        } else if (c === 1) {
          msg.channel.send('Can I help?')
        } else if (c === 2) {
          msg.channel.send('How may I be of assistance?')
        } else if (c === 3) {
          msg.channel.send('What would you like?')
        } else {
          msg.channel.send('What can I do for you?')
        }
      }

      // Separate one to pin XP everytime Rob posts it. MAY make unpin last XP later.
      if (msg.author === '<@176654870261006336>' && (str.includes('lopip - ') || str.includes('lopip: ') || str.includes('lopip +'))) {
        msg.pin()
      }
    }
  }
})

// Adds 'Straggler' role to anyone who joins
client.on('guildMemberAdd', member => {
  member.addRole('485317006292418572').catch(console.error)
})

// Adds a bit of error handling for when the bot disconnects. Usually this will occur when the internet connection fails, but could also be for any uncaught exceptions that are thrown.
client.on('error', e => {
  console.error('Disconnected in the middle of running - internet go down? :(')
  client.destroy().catch()
  client.login(auth.token)
})
