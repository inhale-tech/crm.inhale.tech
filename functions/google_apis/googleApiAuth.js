const fs = require("fs");
const { Auth, OAuth2Client } = require("google-auth-library");
const readline = require("readline");
const credentials = require("../../utils/client_secret.json");
const TOKEN_PATH = "token.json";
const TOKEN_DRIVE = "token-drive.json";

const oauth2Client = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);

const oauth2Client_Drive = new OAuth2Client(
  credentials.web.client_id,
  credentials.web.client_secret,
  credentials.web.redirect_uris[0]
);
async function renewAccessToken(oAuth,pathCreditentials,tokenActive, tokenPath) {
  const credentials = require(pathCreditentials);
  const token = require(tokenActive);
  let refreshToken = token.refresh_token;
  oAuth.setCredentials({
    refresh_token: refreshToken,
  });
  const accessToken = await oAuth.refreshAccessToken((err, newToken) => {
    if (err) return console.error("Error refreshing access token", err);
    oAuth.setCredentials(newToken);
    fs.writeFile(tokenPath, JSON.stringify(newToken), (err) => {
      if (err) console.error("Error writing token to file", err);
      console.log("Token renewed and stored to", tokenPath);
    });
  });

  return oAuth;
}
async function authorize(option) {
  let OAuthToken = option == "youtube" ? oauth2Client : oauth2Client_Drive;

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
    if (option == "youtube") {
      const token = fs.readFileSync(TOKEN_PATH);
      OAuthToken.setCredentials(JSON.parse(token));
    } else {
      const token = fs.readFileSync(TOKEN_DRIVE);
      OAuthToken.setCredentials(JSON.parse(token));
    }

    return OAuthToken;
  } catch (err) {
    const authUrl = OAuthToken.generateAuthUrl({
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
      const { tokens } = await OAuthToken.getToken(code);
      OAuthToken.setCredentials(tokens);

      if (option == "youtube") {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      } else {
        fs.writeFileSync(TOKEN_DRIVE, JSON.stringify(tokens));
      }

      return OAuthToken;
    } catch (err) {
      console.log(`authorize: couldn't authorize :${err}`);
    }
  }
}

module.exports = { authorize };
