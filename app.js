const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { createDiscordClient, createMessedge } = require("./functions/discord/discord");
const { youtubeUpload } = require("./functions/other_requests/helperFunctions");
const { addCommentToJira } = require("./functions/other_requests/otherRequests");
require("dotenv").config();

app.listen(port, process.env.HOSTNAME, async () => {
  const dsclient = createDiscordClient();

  dsclient.on("messageCreate", async function (message) {
    await new Promise((r) => setTimeout(r, 1000));
    const guild = dsclient.guilds.cache.get(message.guildId);
    const threads = guild.channels.cache
      .sort((a, b) => a.createdAt - b.createdAt)
      .filter((x) => x.isThread());
    let thread = threads.find((x) => x.id == message.channelId);
    if (thread !== "undefined" && thread.name !== "undefined" && message.author.bot !== true) {
      await addCommentToJira(thread.name, message.content, message.author.username);
    }
  });

  dsclient.login(process.env.BOT_TOKEN);

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
