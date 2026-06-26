import Bot from './structures/Bot';
import {AllowedMentionsTypes} from 'discord.js';

console.clear();

const client = new Bot({
   intents: [3_276_799],
   allowedMentions: {
      parse: [AllowedMentionsTypes.User, AllowedMentionsTypes.Role],
   },
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

export default client;
