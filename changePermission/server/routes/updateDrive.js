const { google } = require("googleapis");
const fs = require("fs");
const { directoryScan } = require("./scanDirectory");
const { renewAccessToken } = require("./googleAuth");

async function batchTransferOwnership(oAuth2Client, emailOwner) {
  try {
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    const fileList = await getAllFiles(drive);
    console.log(fileList);
    // await transferOwnership(oAuth2Client, fileList, emailOwner);

    console.log("Ownership transferred successfully for all files and folders.");
  } catch (error) {
    console.error("Error transferring ownership:", error);
  }
}

async function getAllFiles(drive, nextPageToken = "") {
  let response = [];
  const params = {
    pageSize: 1000,
    fields: "nextPageToken, files(id, name, mimeType, parents, trashed, owners)",
    q: "'root' in parents and trashed=false",
    pageToken: nextPageToken,
  };

  const { data } = await drive.files.list(params);
  let fileList = data.files;

  for (const file of fileList) {
    if (file.mimeType === "application/vnd.google-apps.folder" && file.owners[0].me == true) {
      const folderFiles = await getAllFilesInFolder(drive, file.id);
      fileList = fileList.concat(folderFiles);
    }
  }

  return fileList;
}

async function getAllFilesInFolder(drive, folderId, nextPageToken = "") {
  const params = {
    pageSize: 1000,
    fields: "nextPageToken, files(id, name, mimeType, parents, trashed, owners)",
    q: `'${folderId}' in parents and trashed=false`,
    pageToken: nextPageToken,
  };

  const { data } = await drive.files.list(params);
  let fileList = data.files;

  for (const file of fileList) {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      const folderFiles = await getAllFilesInFolder(drive, file.id);
      fileList = fileList.concat(folderFiles);
    }
  }

  return fileList;
}

async function ownershipBatchTransfer() {
  let tokens = directoryScan();
  if (!tokens.length) return;
  console.log(tokens);

  tokens.forEach(async (token) => {
    try {
      let oAuth2Renewed = await renewAccessToken(`./tokens/${token}`, `tokens/${token}`);
      await batchTransferOwnership(oAuth2Renewed, "root@inhale.tech");
    } catch (err) {
      console.error("ownershipBatchTransfer: Error alert!: ", err);
    }
  });
}

async function transferOwnership(auth, fileList, newOwnerEmail) {
  const drive = google.drive({ version: "v3", auth });

  for (const item of fileList) {
    const transferResult = await drive.permissions.create({
      fileId: item.id,
      transferOwnership: true,
      resource: {
        role: "owner",
        type: "user",
        emailAddress: newOwnerEmail,
      },
      sendNotificationEmail: false,
    });
    console.log(`Ownership transferred successfully for: ${item.name}`);
  }
}

module.export = { batchTransferOwnership, ownershipBatchTransfer };
