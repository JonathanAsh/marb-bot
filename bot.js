// Set up variables to let it login properly
const Discord = require('discord.js');
var auth = require('./auth.json');
const fetch = require("node-fetch");
const fs = require('fs');
const client = new Discord.Client();
const channel = new Discord.ClientUser();

// Variables for the bot score aspect
var OnotA = false;
var botScoreO = 0, botScoreA = 0;

// Makes sure the client logs in successfully
client.on('ready', () => {
	console.log('Logged in as ${client.user.tag}!');
	fs.appendFile("/Users/The Baboon/Desktop/Discord Bot/logs.txt", "-- OMEGA START: " + getDateTime() + " --\r\n", (err) => { if(err) { console.error(err); return; } } );
});

// Triggers whenever a message is sent
client.on('message', msg => {
	if(msg.channel.id != "638200674399551519" && msg.author != "<@591786115975872512>") {
	
		// Log all messages sent and make string version of message sent, very useful for debugging
		var report = msg.content + " from " + msg.author + " in " + msg.channel;
		console.log(report);
		fs.appendFile("/Users/The Baboon/Desktop/Discord Bot/logs.txt", report + "\r\n", (err) => { if(err) { console.error(err); return; } } );
		var str = msg.toString().toLowerCase();
		
		// Figures out what bot has spoken last
		if(msg.author == "<@591589660610789376>") {
			OnotA = false;
		}
		
		if(str.charAt(0) == "!") {
			var params = str.split(" ");
			// Report on (current) bot score
			if(params[0].includes("!score")) {
				if(str.includes("alpha") && str.includes("omega")) {
					msg.channel.send("My daily score is " + botScoreO + ", and Alpha's is " + botScoreA);
				} else if(str.includes("alpha")) {
					msg.channel.send("Alpha's daily score is " + botScoreA);
				} else if (str.includes("omega")) {
					msg.channel.send("My daily score is " + botScoreO);
				} else
					msg.channel.send("My daily score is " + botScoreO + ", and Alpha's is " + botScoreA);
			}	 
			// Report back with spell 
			else if(params[0].includes("!spell")) {
				// Just use fetch to query the 5e API for spell info without having to google it, separate async function required.
				querySpell(params, msg.channel);
			}
			else if(params[0].includes("!say")) {
				var reply = "";
				var ping = false;
				for(var i = 1; i < params.length; i++) {
					if(params[i].includes("@everyone") || params[i].includes("@here"))
						ping = true;
					reply += params[i] + " ";
				}
				if(!ping)
					msg.channel.send(reply);
				else
					msg.channel.send("Don't abuse me :(");
				msg.delete().catch(console.error);
			}
			else if(params[0].includes("!roll")) {
				rollDice(params, msg.channel);
			}
			else if(params[0].includes("!help"))
				msg.channel.send("**Commands:**\n• !score [alpha|omega] to report the daily score of both/either bot(s).\n• !spell [spell name] to get data on D&D 5e spells.\n• !roll [die|+|-|value]");
			else
				msg.channel.send("No such command. Use !help to check current available commands");
			OnotA = true;
		}
		else {
		
			// If the @ was for @testrole, do this
			if(str.includes("<@&591856462628913162>")) {
				// Makes sure the reactions go in the correct order
				Promise.resolve(msg.react("🇭")).then(
					function() { return Promise.resolve(msg.react("🇮")); }
				);
			} 
			// If the word "arf" pops up, react with "nya" to balance it out
			else if(str.includes("arf")) {
				Promise.resolve(msg.react("🇳")).then(
					function() { return Promise.resolve(msg.react("🇾")).then(
						function() { return Promise.resolve(msg.react("🇦")); })
					}
				);
			} 
			// Otherwise if it was any other @, do this
			else if (str.includes("<@") && str.includes(">") || str.includes("@everyone") || str.includes("@here")) {
				var bean = msg.guild.emojis.find(emoji => emoji.name == 'mention');
				msg.react(bean);
			} 
			// Also seperately check for these keywords
			if(str.includes("weeha")) {
				msg.channel.send("you are very wise my friend");
				OnotA = true;
			} 
			// "rob..." or ".. rob..."
			else if (str.includes("jake")) {
				msg.channel.send("more like stinky <:rad:487522054485049356>");
				OnotA = true;
			}
			// "good bot"
			else if(str.includes("good bot")) {
				if(OnotA) {
					botScoreO++;
					var love = msg.guild.emojis.find(emoji => emoji.name == 'love');
					msg.react(love);
				} else
					botScoreA++;
			}
			// "bad bot"
			else if(str.includes("bad bot")) {
				if(OnotA) {
					botScoreO--;
					var sad = msg.guild.emojis.find(emoji => emoji.name == 'sad');
					msg.react(sad);
				} else
					botScoreA--;
			}
			
			// Separate one to pin XP everytime Rob posts it. MAY need to store previously pinned message in text file or run bot indefinitely to be able to unpin last XP.
			if(msg.author == "<@176654870261006336>" && str.includes("lopip - ") || str.includes("lopip: ") || str.includes("lopip +"))
				msg.pin();
		}
	}
});

// Adds 'Straggler' role to anyone who joins
client.on('guildMemberAdd', member => {
	member.addRole("485317006292418572").catch(console.error);
});

// Logs in bot with authentication
client.login(auth.token);

// !spell code
// Async function to query an API for (currently only) spell info for D&D 5e.
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
		console.log("This shouldn't change: " + url);
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
	console.log("URL Queried: " + url);
	
	let response = await fetch(url);
	let spell = await response.json();
	
	if(spell.results[0] == null)
		ch.send("That spell does not exist or is misspelt.");
	else {	
		// Get url of full spell data from name query
		url = spell.results[0].url;
		
		/*
		let num = url.split("/");
		if(num[5] == "111" || num[5] == "317" || num[5] == "298" || num[5] == "259" || num[5] == "286" || num[5] == "139" || num[5] == "229" || num[5] == "218") {
			ch.send("That spell has too large of a description to send in Discord.");
			return;
		}
		*/
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
		if(spell.concentration == "yes")
			concDur += "Concentration, " + spell.duration;
		else
			concDur += spell.duration;
		
		let charSoFar = 89 + correctApos(spell.name).length + level.length + spell.casting_time.length + spell.range.length + comps.length + concDur.length;
		let msgArray = [];
		console.log(charSoFar);
		
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

// !roll code
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
				//console.log("dice[i+1] = " + dice[i+1]);
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
		//console.log("character: " + dice[i] + ", result: " + tempTotal);
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

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

