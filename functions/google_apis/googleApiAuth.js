const fs = require("fs");
const { Auth, OAuth2Client } = require("google-auth-library");
const readline = require("readline");
const credentials = require("../../utils/client_secret.json");
const TOKEN_PATH = "token.json";

const oauth2Client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

async function authorize(scopes) {
  let scopes_user = [
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.metadata",
    "https://www.googleapis.com/auth/script.projects",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/youtube",
  ];
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oauth2Client.setCredentials(JSON.parse(token));
    return oauth2Client;
  } catch (err) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes_user,
    });

    console.log("authorize: Authorize this app by visiting this URL:", authUrl);
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      const code = await new Promise((resolve) => {
        readlineInterface.question("Enter the code from that page here: ", (code) => {
          resolve(code);
          readlineInterface.close();
        });
      });
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      return oauth2Client;
    } catch (err) {
      console.log(`authorize: couldn't authorize :${err}`);
    }
  }
}

module.exports = { authorize };
