const Discord = require("discord.js");
const { GatewayIntentBits } = require("discord.js");
const { addCommentToJira } = require("../other_requests/otherRequests");
require("dotenv").config();

function createDiscordClient() {
  let body = {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  };
  let response = new Discord.Client(body);
  return response;
}

async function createMessedge(message, dsclient) {
  await new Promise((r) => setTimeout(r, 1000));
  const guild = dsclient.guilds.cache.get(message.guildId);
  const threads = guild.channels.cache.sort((a, b) => a.createdAt - b.createdAt).filter((x) => x.isThread());
  let thread = threads.find((x) => x.id == message.channelId);
  if (
    thread !== "undefined" &&
    thread != undefined  &&
    thread.name !== "undefined" &&
    thread.name != undefined &&
    message.author.bot !== true
  ) {
    await addCommentToJira(thread.name, message.content, message.author.username);
  }
}

module.exports = { createDiscordClient, createMessedge };
