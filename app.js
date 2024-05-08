
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { createDiscordClient, createMessedge } = require("./functions/discord/discord");
const { youtubeUpload } = require("./functions/other_requests/helperFunctions");
const Discord = require("discord.js");
const { GatewayIntentBits } = require("discord.js");
require("dotenv").config();

app.listen(port, process.env.HOSTNAME, async () => {
  let body = {
//    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  };
//  const dsclient = new Discord.Client(body);

//  dsclient.on("messageCreate", async function (message) {
//    await createMessedge(message, dsclient);
//  });

  //dsclient.login(process.env.BOT_TOKEN);

  let intervalId = 0;
  clearInterval(intervalId);

  await youtubeUpload();
 intervalId = setInterval(youtubeUpload, process.env.INTERVAL_MILLISECONDS);
  intervalId = 0;

  console.log(`Server running at http://${process.env.HOSTNAME}:${port}/`);
});

app.get("/", (req, res) => {
  res.send("Main page");
});

