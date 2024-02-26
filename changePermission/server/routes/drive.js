const { google } = require("googleapis");
const readline = require("readline");
const fs = require("fs");

// Load client secrets from a JSON file downloaded from the Google API Console
const credentials = require("./credentials.json");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// The file ID of the file you want to transfer ownership of
const FILE_ID = "your_file_id_here";

// The email address of the new owner
const NEW_OWNER_EMAIL = "root@inhale.tech";

// Create an OAuth2 client with the given credentials
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Authorize the client with the token obtained by running authorize.js (or any other means)
const token = fs.readFileSync("token.json");
oAuth2Client.setCredentials(JSON.parse(token));

// Create a new drive instance
const drive = google.drive({ version: "v3", auth: oAuth2Client });

async function transferOwnership() {
  try {
    // Get the current permissions of the file
    const { data } = await drive.permissions.list({ fileId: FILE_ID });
    const permissions = data.permissions;

    // Find the current owner
    const currentOwner = permissions.find((permission) => permission.role === "owner");

    if (!currentOwner) {
      throw new Error("No owner found for the file.");
    }

    // Transfer ownership to the new owner
    const transferResult = await drive.permissions.create({
      fileId: FILE_ID,
      transferOwnership: true,
      resource: {
        role: "owner",
        type: "user",
        emailAddress: NEW_OWNER_EMAIL,
      },
      sendNotificationEmail: false, // Set to true to send notification email to the new owner
    });

    console.log("Ownership transferred successfully.");
    console.log("New owner:", NEW_OWNER_EMAIL);
  } catch (error) {
    console.error("Error transferring ownership:", error);
  }
}

const tokenPath = "token.json";

// Load client secrets from a file, generate a token, and list files
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);

  const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(tokenPath, (err, token) => {
    if (err) return console.log("Error loading token file:", err);

    oAuth2Client.setCredentials(JSON.parse(token));
    listFiles(oAuth2Client);
  });
});

function listFiles(auth) {
  const drive = google.drive({ version: "v3", auth });

  drive.files.list(
    {
      pageSize: 10,
      fields: "nextPageToken, files(id, name, mimeType)",
    },
    (err, res) => {
      if (err) return console.error("The API returned an error:", err.message);

      const files = res.data.files;
      if (files.length) {
        console.log("Files and folders:");
        files.forEach((file) => {
          console.log(`${file.name} (${file.id}) - ${file.mimeType}`);
        });
      } else {
        console.log("No files or folders found.");
      }
    }
  );
}
