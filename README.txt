First attempt making a Discord bot. Uses Node.js, haven't really used it before but it seems pretty intuitive.

Current Functionality:
  - Replies to certain keywords in messages with other keywords
  - Reacts to messages depending on their content
  - Keeps a count of "good bot" or "bad bot", and can report these scores whenever asked
  - Queries a free online D&D database to return spell descriptions nicely formatted
  - Rolls given dice + modifiers
  - Adds a role to users as soon as they join the Discord server
  - Repeats back whatever it is commanded to
  - Logs all messages sent from who & where & when in a text file
  - Stores previous variables in file to load from them again after restart
  - Holds a list of shopping items that can be added/removed/cleared/displayed in Discord, which is backed up in a text file

TODO:
  - Make list handle accepting commas in added items better (sanitise input, essentially)

- Jonathan Ashworth
