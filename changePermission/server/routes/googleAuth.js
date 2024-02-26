const { OAuth2Client } = require("google-auth-library");
const fs = require("fs");

async function renewAccessToken(tokenActive, tokenPath) {
  const credentials = require("../client_secret.json");
  const token = require(tokenActive);

  const oAuth2Client = new OAuth2Client(
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris[0]
  );
  let refreshToken = token.refresh_token;
  oAuth2Client.setCredentials({
    refresh_token: refreshToken,
  });
  const accessToken = await oAuth2Client.refreshAccessToken((err, newToken) => {
    if (err) return console.error("Error refreshing access token", err);
    oAuth2Client.setCredentials(newToken);
    fs.writeFile(tokenPath, JSON.stringify(newToken), (err) => {
      if (err) console.error("Error writing token to file", err);
      console.log("Token renewed and stored to", tokenPath);
    });
  });

  return oAuth2Client;
}

module.exports = { renewAccessToken };
