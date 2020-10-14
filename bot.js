// Set up variables to let it login properly
const Discord = require('discord.js');
var auth = require('./auth.json');
const fetch = require("node-fetch");
const fs = require('fs');
const { isNullOrUndefined } = require('util');
const client = new Discord.Client();
//const channel = new Discord.ClientUser();

// Variables for the bot scoring
var botScoreO = 0;

// Variables for the shopping list
var head = null;
var clearConfirm = false;
var clearer = "";

// Logs in bot with authentication
client.login(auth.token).catch(console.error);

// Makes sure the client logs in successfully, logs time when it comes up, and loads previous values which are stored in file.
client.on('ready', () => {
	console.log('Logged in as ${client.user.tag}!');
	// Log Omega's bootup time
	fs.appendFile("/Users/The Baboon/Desktop/Discord Bot/logs.txt", "-- OMEGA START: " + getDateTime() + " --\r\n", (err) => { if(err) { console.error(err); return; } } );
	// Get bot score info from last run
	fs.readFile("/Users/The Baboon/Desktop/Discord Bot/botscore.txt", "utf8", function(err, contents) {
		if(err) { 
			console.error(err); 
			return;
		}
		botScoreO = contents;
  });
  // Loads shopping list from file
	reloadList();
});

// Triggers whenever a message is sent
client.on('message', msg => {
	
	// Log all messages sent in the console and in a text file for long-term
	var report = replaceIDs("\"" + msg.content + "\" from " + msg.author + " in " + msg.channel + " at " + getDateTime());
	console.log(report);
	fs.appendFile("/Users/The Baboon/Desktop/Discord Bot/logs.txt", report + "\r\n", (err) => { if(err) { console.error(err); return; } } );
	
	var str = msg.toString().toLowerCase();
		
	// React to pings with :mention:, even if it's from Omega himself
	if (str.includes("<@") && str.includes(">") || str.includes("@everyone") || str.includes("@here")) {
		var bean = msg.guild.emojis.find(emoji => emoji.name == 'mention');
		msg.react(bean);
	} 
		
	// Makes sure he doesn't reply to himself
	if(msg.channel.id != "638200674399551519" && msg.author != "<@591786115975872512>") {
		
		// ! is the character I'm using to prefix commands
		if(str.charAt(0) == "!") {
			var params = str.split(" ");
			// Report on (current) bot score
			if(params[0].includes("!score")) {
				if (str.includes("omega")) {
					msg.channel.send("My all-time score is " + botScoreO);
				} else
					msg.channel.send("My all-time score is " + botScoreO);
			}	 
			// Report back with spell 
			else if(params[0].includes("!spell")) {
				querySpell(params, msg.channel);
			}
			// Bot just replies with whatever the user tells it to say, doesn't allow @everyone nor @here since anyone can use it, but might eventually restrict this command to only certain roles
			else if(params[0].includes("!say")) {
				var reply = "";
				var ping = false;
				for(var i = 1; i < params.length; i++) {
					if(params[i].includes("@everyone") || params[i].includes("@here"))
						ping = true;
					reply += params[i] + " ";
				}
				if(!ping && reply != "")
					msg.channel.send(reply);
				else
					msg.channel.send("I can't shout that loud :(");
				msg.delete().catch(console.error);
			}
			// Rolls whatever dice the user specifies
			else if(params[0].includes("!roll")) {
				rollDice(params, msg.channel);
			}
			// Adds, removes, and displays from a list
			else if(params[0].includes("!list") && (msg.author == "<@176654870261006336>" || msg.author == "<@179892251898413056>" || msg.author == "<@187788766599970817>" || msg.author == "<@261725719044947972>")) {
				
				// Yucky lack of information
				if(params[1] == null) {
					msg.channel.send("Please specify a command for the list.");
					return;
				}
				if(!params[1].includes("add") && !params[1].includes("rmv") && !params[1].includes("show") && !params[1].includes("clear")) {
					msg.channel.send("Unknown list command. Either use !list add <item>, !list rmv <item>, or !list show");
					return;
				}
				
				// Checks which command has been used
				if(params[1].includes("add")) {
					
					// Makes sure there is an item to add to the list
					if(params[2] == null) {
						msg.channel.send("~~eat my ass~~ Please specify an item to add to the list");
						return;
					}
          
          // Splits items by commas
          // TODO: Check that this actually works, should do but best to be safe
          var addList = str.replace("!list add ", "").split(",");

          // Creates new head if list was empty (and sets curr to the head)
          var curr;
          if(head == isNullOrUndefined) {
            head = new Item(addList[0].toString());
            curr = head;
          } else
            curr = getLastItem();

          // Go through all the given other items and add them to the end of the list.
          for(let j = 0; j < addList.length; j++) {
            if(curr == head) { j = 1; }
            curr.next = new Item(addList[j]);
            curr = curr.next;
          }
          
					// Adds to the text file -- might not need writeFile anymore, but probably won't touch it anyway.
					fs.writeFile("/Users/The Baboon/Desktop/Discord Bot/shopping-list.txt", getAllItems(), (err) => { if(err) { console.error(err); return; } } );
					msg.react("👍");
					clearConfirm = false;
				} 
				else if(params[1].includes("rmv")) {
          
          // Go through list and check if any of the names match. If they do, then reference to the name matched one changes to the name matched one's next reference (just skips over it).
          var rmvList = str.replace("!list rmv ", "").split(",");

          if(head == isNullOrUndefined)
            msg.channel.send("wth r u doin n00b there's no list in the first place >:((");
          else {
            var curr = head;
            var prev;
            // Go through all the items to remove
            for(let j = 0; j < rmvList.length; j++) {
              let flag = false;
              while(curr != isNullOrUndefined) {
                // If name matches, delete reference
                if(curr.name == rmvList) {
                  flag = true;
                  prev.next = curr.next;
                }
                // Bring along prev and curr
                prev = curr;
                curr = curr.next;
                // Might need a break; in here, otherwise will delete all instances with the same name... probably a good thing?
              }
              if (flag)
                msg.channel.send("Could not find " + rmvList[j] + " in the list to delete :/// make sure you spelt it properly :cop:");
            }
          }
          
					// Replace the file with a new updated one -- with "empty" in the file if there's nothing lef tin the list
					fs.writeFile("/Users/The Baboon/Desktop/Discord Bot/shopping-list.txt", getAllItems(), (err) => { if(err) { console.error(err); return; } } );
					msg.react("👍");
					clearConfirm = false;
				} 
				else if (params[1].includes("show")) {

          // Just displays all the items in a list.
          if(head == isNullOrUndefined)
            msg.channel.send("There are no items in the list.");
          else {
            let displayList = "Shopping List: \n";
            let temp = getAllItems().split(",");

            for(let j = 0; j < temp.length; j++)
              displayList += "• " + capitaliseFirstLetter(temp[j]) + "\n";
            msg.channel.send(displayList);
          }
				} 
				else {
					if (clearConfirm && clearer == msg.author) {
						head = null;
						fs.writeFile("/Users/The Baboon/Desktop/Discord Bot/shopping-list.txt", head, (err) => { if(err) { console.error(err); return; } } );
						msg.channel.send("List cleared.");
						clearConfirm = false;
					} else {
						msg.channel.send("Please type again to confirm clearing the list fully.");
						clearer = msg.author;
						clearConfirm = true;
					}
				}
			}
			// Returns all commands that are implemented atm
			else if(params[0].includes("!help"))
				msg.channel.send("**Commands:**\n• !score [omega] to report the score of Omega.\n• !spell <spell name> to get data on D&D 5e spells.\n• !roll {die|+|-|value}\n• !say <message> to make me say anything/ping anyone for you anonymously (mostly)\n• !list {add|rmv|show|clear} <item> to add to the flat shopping list. (Only available to Flat-Beta members)");
			else
				msg.channel.send("No such command. Use !help to check current available commands");
		}
		// If it's not a command but instead a keyword/phrase, ...
		else {
			// "weeha"
			if(str.includes("weeha"))
				msg.channel.send("you are very wise my friend");
			// The name of the sucker of the month
			else if (str.includes("ryan"))
				msg.channel.send("ryan? more like stinky <:rad:487522054485049356>");
			// "good bot"
			else if(str.includes("good bot")) {
				botScoreO++;
				var love = msg.guild.emojis.find(emoji => emoji.name == 'love');
				msg.react(love);
				fs.writeFile("/Users/The Baboon/Desktop/Discord Bot/botscore.txt", botScoreO, (err) => { if(err) { console.error(err); return; } } );
			}
			// "bad bot"
			else if(str.includes("bad bot")) {
				botScoreO--;
				var sad = msg.guild.emojis.find(emoji => emoji.name == 'sad');
				msg.react(sad);
				fs.writeFile("/Users/The Baboon/Desktop/Discord Bot/botscore.txt", botScoreO, (err) => { if(err) { console.error(err); return; } } );
			}
			// "hey omega"
			else if(str.includes("hey omega")) {
				// Get a random number from 0-4
				var c = Math.floor(Math.random() * Math.floor(5));
				if(c == 0)
					msg.channel.send("Yes?");
				else if(c == 1)
					msg.channel.send("Can I help?");
				else if(c == 2)
					msg.channel.send("How may I be of assistance?");
				else if(c == 3)
					msg.channel.send("What would you like?");
				else
					msg.channel.send("What can I do for you?");
			}
			
			// Separate one to pin XP everytime Rob posts it. MAY make unpin last XP later.
			if(msg.author == "<@176654870261006336>" && (str.includes("lopip - ") || str.includes("lopip: ") || str.includes("lopip +")))
				msg.pin();
		}
	}
});

// Adds 'Straggler' role to anyone who joins
client.on('guildMemberAdd', member => {
	member.addRole("485317006292418572").catch(console.error);
});

// Adds a bit of error handling for when the bot disconnects. Usually this will occur when the internet connection fails, but could also be for any uncaught exceptions that are thrown.
client.on('error', e => {
	console.error('Disconnected in the middle of running - internet go down? :(');
	client.destroy().catch();
	client.login(auth.token);
});

// Async function to query an API for requested spell info for D&D 5e.
async function querySpell(name, ch) {
	// List of words in titles which have to be searched with lower-case first letters since they're not important, just connect the title together.
	let unCapitals = ["of", "and", "to", "from", "without", "the", "or"];
	// Query API for spell by name
	let url = "http://www.dnd5eapi.co/api/spells/?name=";
	if(name.length == 2 && name[1].includes("/")) {
		let words = name[1].split("/");
		words[0] = capitaliseFirstLetter(words[0]);
		words[1] = capitaliseFirstLetter(words[1]);
		url += words[0] + "%2F" + words[1];
	} else {
		for(var i = 1; i < name.length; i++) {
			if(i != 1) url += "+";
			name[i] = name[i].toLowerCase();
			if(!unCapitals.includes(name[i]))
				url += capitaliseFirstLetter(name[i]);
			else
				url += name[i];
		}
	}
	
	let response = await fetch(url);
	let spell = await response.json();
	
	if(spell.results[0] == null)
		ch.send("That spell does not exist or is misspelt.");
	else {	
		// Get url of full spell data from name query
		url = "http://dnd5eapi.co"
		url += spell.results[0].url;
		response = await fetch(url).catch();
		spell = await response.json().catch();
		
		// Format the data to present it nicely in the message to be sent.
		let level = spell.level;
		if(level == 1) 
			level = "1st-Level " + spell.school.name;
		else if(level == 2) 
			level = "2nd-Level " + spell.school.name;
		else if(level == 3)
			level = "3rd-Level " + spell.school.name;
		else if(level == -1 || level == 0)
			level = spell.school.name + " cantrip";
		else
			level += "th-Level " + spell.school.name;
		
		if(spell.ritual != "no")
			level += " (ritual)";
		
		let comps = "\nComponents: ";
		for(var i = 0; i < spell.components.length; i++) {
			if(i != 0) comps += ", ";
			comps += spell.components[i];
		}
		if(spell.material != null)
			comps += " (" + correctApos(spell.material) + ")";
		
		let fesa = "\n\nAt Higher Levels: ";
		if(spell.higher_level != null) {
			for(var i = 0; i < spell.higher_level.length; i++) {
				if(i != 0) fesa += "\n";
				fesa += spell.higher_level[i];
			}
		} else fesa = "";
		
		let classes = "\n\n; Classes: ";
		for(var i = 0; i < spell.classes.length; i++) {
			if(i != 0) classes += ", ";
			classes += spell.classes[i].name;
		}
		
		let concDur = "\nDuration: ";
		if(spell.concentration == "yes" || spell.concentration == "true")
			concDur += "Concentration, ";
		concDur += spell.duration;
		
		let charSoFar = 89 + correctApos(spell.name).length + level.length + spell.casting_time.length + spell.range.length + comps.length + concDur.length;
		let msgArray = [];
		
		// Usually the description of the spell is the meatiest part of the message.
		// Since Discord won't allow messages over the limit of 2000 characters, 
		// the following 40 lines or so split the message up into parts to send
		// where each section is less than 2000 characters, split up in places that
		// are still aesthetically splitting (i.e., not in the middle of a word.)
		let newMsg = false;
		let desc = "";
		for(var i = 0; i < spell.desc.length; i++) {
			if(charSoFar + spell.desc[i].length < 2000) {
				if(i != 0 || newMsg) 
					desc += "\n";
				desc += spell.desc[i];
				charSoFar += spell.desc[i].length;
				newMsg = false;
			} else {
				if(msgArray.length == 0) {
					msgArray.push("```ini\n[ " + correctApos(spell.name) + " ]\n\n" +
						level + 
						"\nCasting Time: " + spell.casting_time + 
						"\nRange: " + spell.range + 
						comps + 
						concDur + "```");
					msgArray.push("```ini\n" + removeSemicolon(correctApos(desc)) + "\n```");
				} else
					msgArray.push("```ini\n" + removeSemicolon(correctApos(desc)) + "\n```");
				desc = "";
				newMsg = true;
				charSoFar = 13;
			}
		}
		if(msgArray.length == 0)
			msgArray.push("```ini\n[ " + correctApos(spell.name) + " ]\n\n" +
					level + 
					"\nCasting Time: " + spell.casting_time + 
					"\nRange: " + spell.range + 
					comps + 
					concDur + "```");
		if(desc.length + fesa.length + classes.length + 4 > 2000) {
			msgArray.push("```ini\n" + removeSemicolon(correctApos(desc)) + "```");
			msgArray.push("```ini\n" + fesa + classes + ".```");
		} else {
			msgArray.push("```ini\n" + removeSemicolon(correctApos(desc)) + fesa + classes + ".```");
		}
		
		// Concatenate it all together into the send body
		for(let i = 0; i < msgArray.length; i++)
			ch.send(msgArray[i])
		return;
	}
}

// Function to capitalise first letter of given string to properly query the API
function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to make sure any weird apostrophe replacements turn back into apostrophes
function correctApos(str) {
	return str.replace(/â€™/g, "'").replace(/â€”/g, "-").replace(/â€œ/g, "\"").replace(/â€�/g, "\"");
}

// Swaps semicolons for a hyphen otherwise it messes up a bit with formatting
function removeSemicolon(str) {
	return str.replace(/;/g, " -");
}

// Rolling dice for convenience
function rollDice(dice, ch) {
	var total = 0, tempTotal = 0;
	
	// For each term ("id20", "+5", "3d8", etc.)
	for(var i = 1; i < dice.length; i++) {
		tempTotal = 0;
		
		// Check what type of term it is and take appropriate action
		if(dice[i].includes("d")) {
			if(dice[i].length > 5) {
				ch.send("Make sure you chuck some spaces in between terms or just roll less dice please 👀");
				return;
			}
			tempTotal += dieRoll(dice[i]);
		}
		else if(dice[i].includes("+")) {
			if(dice[i].length == 1) {
				if(dice[i + 1].includes("d"))
					tempTotal += dieRoll(dice[i+1]);
				else
					tempTotal += parseInt(dice[i + 1], 10);
				i++;
			}
			else
				tempTotal += parseInt(dice[i].split("+")[1], 10);
		}
		else if(dice[i].includes("-")) {
			if(dice[i].length == 1) {
				if(dice[i + 1].includes("d"))
					tempTotal -= dieRoll(dice[i+1]);
				else
					tempTotal -= parseInt(dice[i + 1], 10);
				i++;
			}
			else
				tempTotal -= parseInt(dice[i].split("+")[1], 10);
		}
		else
			console.log("Unknown term. " + dice[i]);
		total += tempTotal;
	}
	ch.send("```ini\nRoll Result: " + total + "\n```");
}

// Roll given die and return value
function dieRoll(term) {
	var nums = term.split("d");
	var sum = 0;
	for(var j = 0; j < nums[0]; j++)
		sum += Math.floor(Math.random() * nums[1] + 1);
	return sum;
}

// Replaces the given IDs of users and channels with their more user-friendly counterparts (our names for 'em). There's probably a better way to do this.
function replaceIDs(r) {
	return r.replace(/<#591793011483082772>/g, "#dev-centre").replace(/<#594430167938629662>/g, "#minecraft").replace(/<#612116178407522304>/g, "#discussion").replace(/<#485317731009167364>/g, "#tactics").replace(/<#559269311294865409>/g, "#command-centre")
			.replace(/<#485317959783546901>/g, "#mems").replace(/<#567403796662059018>/g, "#dnd").replace(/<#494781493454045185>/g, "#gams").replace(/<#485316399326167040>/g, "#main").replace(/<@187788766599970817>/g, "@Marbles#2385")
			.replace(/<@179892251898413056>/g, "@Dash Alpha#3450").replace(/<@261725719044947972>/g, "@AhimsaNZ#4010").replace(/<@189998232951062528>/g, "@Elcarien#6346").replace(/<@296499043268558849>/g, "@maximize75#1963")
			.replace(/<@176654870261006336>/g, "@PrimeHylian#6432").replace(/<@314896092502294529>/g, "@Moodes567#2862").replace(/<@561029934844346381>/g, "@Natopotato#4629").replace(/<@186703389462233089>/g, "@OrphanPunter870#8474")
			.replace(/<@591786115975872512>/g, "@Omega Bot#5343").replace(/<@591589660610789376>/g, "@Alpha Bot#4046").replace(/<@234395307759108106>/g, "@Groovy#7254");
			
}

// Returns the date and time in a nice format for the console and text file logs
function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + "_" + hour + ":" + min + "." + sec;

}

// Reads from the shoppingList file and adds values into the linked list
function reloadList() {
	// Read from saved shopping list
	fs.readFile("/Users/The Baboon/Desktop/Discord Bot/shopping-list.txt", "utf8", function(err, contents) {
		if(err) { 
			console.error(err); 
			return;
		}
    console.log("contents: \"" + contents + "\""); // TODO: NEED TO CHECK WHAT IS RETURNED WITH AN EMPTY FILE!!
		var temp = contents.split(',');
		
    if(temp[0] == "empty") { // TODO: Make this actually check for an empty file as above (null? that's what it's putting in, anyway)
			console.log("No items in list on startup.");
		}	else {
			// Creates the new head and carries on adding the rest of the items all linked up
      head = new Item(temp[0].toString());
      var curr = head;
      for(let i = 1; i < temp.length; i++) {
        curr.next = new Item(temp[i].toString());
        curr = curr.next;
      }
    }
	});
}

// Constructor for shopping list items
function Item(name, next) {
  this.name = name;
  this.next = next;
}

// Returns the final item in the list, useful for adding new items to the list.
function getLastItem() {
  var curr = head;

  if(curr == isNullOrUndefined)
    return;
  else {
    while(curr.next != isNullOrUndefined)
      curr = curr.next;
    return curr; // TODO: Make sure this returns the last object and not the one before.
  }
}

// Returns all the items names in the list, useful for the file saving and displaying the list.
function getAllItems() {
  var list = head.name;
  var curr = head.next;
  while (curr != isNullOrUndefined)
    list += "," + curr.name;
    curr = curr.next;
  return list;
}
