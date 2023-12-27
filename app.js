const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { createDiscordClient, createMessedge } = require("./functions/discord/discord");
const { youtubeUpload } = require("./functions/other requests/helperFunctions");
require("dotenv").config();

app.listen(port, process.env.HOSTNAME, async () => {
  const dsclient = createDiscordClient();
  dsclient.on("messageCreate", createMessedge);
  await dsclient.login(process.env.BOT_TOKEN);

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
