const fs = require('fs')
const { capitaliseFirstLetter } = require('./strings')

// Variables for the shopping list
let head = null
let last = head
let clearConfirm = false
let clearer = ''

// Constructor for shopping list items
function Item (name, next) {
  this.name = name
  this.next = next
}

// Returns all the items names in the list, useful for the file saving and displaying the list.
function getAllItems () {
  if (head === null || head === undefined) { return '' }
  let list = head.name
  let curr = head.next

  while (!(curr === null || curr === undefined) && curr.name !== undefined) {
    list += ',' + curr.name
    curr = curr.next
  }
  return list
}

// Reads from the shoppingList file and adds values into the linked list
function reloadList () {
  // Read from saved shopping list
  fs.readFile('/Users/jonst/Desktop/Discord Bot/text_files/shopping-list.txt', 'utf8', function (err, contents) {
    if (err) {
      console.error(err)
      return
    }
    const temp = contents.split(',')

    if (temp[0] === '' || temp[0] === 'null') {
      console.log('No items in list on startup.')
    } else {
      // Creates the new head and carries on adding the rest of the items all linked up
      head = new Item(temp[0].toString())
      let curr = head
      if (temp.length > 1) {
        for (let i = 1; i < temp.length; i++) {
          curr.next = new Item(temp[i].toString())
          curr = curr.next
          last = curr
        }
      } else { last = head }
    }
  })
}

function addItemToList (msg, str) {
  // Splits items by commas
  const addList = str.replace('!list add ', '').split(',')

  // Creates new head if list was empty (and sets curr to the head)
  let curr
  let newHead = 0
  if (head === null || head === undefined) {
    head = new Item(addList[0].toString())
    console.log('New head added!')
    curr = head
    last = head
    newHead = 1
  } else { curr = last }

  // Go through all the given other items and add them to the end of the list.
  for (let j = newHead; j < addList.length; j++) {
    if (addList[j] !== undefined) {
      curr.next = new Item(addList[j].trim().toLowerCase())
      console.log('New item added!')
      curr = curr.next
      last = curr
    }
  }
  // Adds to the text file -- might not need writeFile anymore, but probably won't touch it anyway.
  fs.writeFile('/Users/jonst/Desktop/Discord Bot/text_files/shopping-list.txt', getAllItems(), (err) => { if (err) { console.error(err) } })
  clearConfirm = false
  msg.react('👍')
}

function removeItemFromList (msg, str) {
// Go through list and check if any of the names match. If they do, then reference to the name matched one changes to the name matched one's next reference (just skips over it).
  const rmvList = str.replace('!list rmv ', '').split(',')

  if (head === null || head === undefined) { msg.channel.send("wth r u doin n00b there's no list in the first place >:((") } else {
  // Go through all the items to remove
    for (let j = 0; j < rmvList.length; j++) {
      let curr = head
      let prev
      let found = false
      console.log(curr)
      while (!(curr === null || curr === undefined)) {
      // If name matches, delete reference
        rmvList[j] = rmvList[j].trim().toLowerCase() // not sure it works inline :(
        console.log("curr.name = '" + curr.name + "', rmvList[j] = '" + rmvList[j] + "'")
        if (curr.name === rmvList[j]) {
          found = true
          if (curr === last) { last = prev }
          if (curr === head) { head = curr.next } else { prev.next = curr.next }
        }
        // Bring along prev and curr
        prev = curr
        curr = curr.next
      // Might need a break; in here, otherwise will delete all instances with the same name... probably a good thing?
      }
      if (!found) { msg.channel.send('Could not find ' + rmvList[j].trim() + ' in the list to delete :/// make sure you spelt it properly :cop:') }
    }

    // Replace the file with a new updated one -- with "empty" in the file if there's nothing lef tin the list
    fs.writeFile('/Users/jonst/Desktop/Discord Bot/text_files/shopping-list.txt', getAllItems(), (err) => { if (err) { console.error(err) } })
  }
  clearConfirm = false
  msg.react('👍')
}

function displayList (msg) {
  // Just displays all the items in a list.
  if (head === null || head === undefined) { msg.channel.send('There are no items in the list.') } else {
    let displayList = 'Shopping List: \n'
    const temp = getAllItems().split(',')

    for (let j = 0; j < temp.length; j++) { displayList += '• ' + capitaliseFirstLetter(temp[j]) + '\n' }
    msg.channel.send(displayList)
  }
}

function clearList (msg) {
  if (clearConfirm && clearer === msg.author) {
    head = null
    fs.writeFile('/Users/jonst/Desktop/Discord Bot/text_files/shopping-list.txt', 'null', (err) => { if (err) { console.error(err) } })
    msg.channel.send('List cleared.')
    clearConfirm = false
  } else {
    msg.channel.send('Please type again to confirm clearing the list fully.')
    clearer = msg.author
    clearConfirm = true
  }
}

module.exports = {
  reloadList,
  addItemToList,
  removeItemFromList,
  displayList,
  clearList
}
