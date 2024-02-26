const express = require("express");
const fs = require("fs");
const { Auth, OAuth2Client } = require("google-auth-library");
const port = 8000;
let registrationUser = "";
const credentials = require("./client_secret.json");
const cors = require("cors");
const { ownershipBatchTransfer } = require("./routes/updateDrive");
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
};
const app = express();
app.use(cors());
const oauth2Client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

app.get("/authorization", (req, res) => {
  //TODO : add reading user name from req
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
  });
  registrationUser = req.query.userName;
  res.status(200).json({ url_redirect: url });
});

app.get("/oauth2callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    let TOKEN_PATH = `routes/tokens/token_${registrationUser}.json`;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send("Successfully authenticated with Google Drive API!");
  } catch (err) {
    console.error(err);
  }
});


app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);

  let intervalId = 0;
  clearInterval(intervalId);

  await ownershipBatchTransfer();
  intervalId = setInterval(ownershipBatchTransfer, 7200000);
  intervalId = 0;
});
