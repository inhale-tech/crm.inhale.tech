const { google } = require("googleapis");
const fs = require("fs");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

async function listFiles(auth, folderId, folderName, ragicId, playlistId) {
  const drive = google.drive({ version: "v3", auth });
  let response = [];
  try {
    if (folderId == undefined || folderId == "") return response;
    const requestBody = {
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, mimeType, size, trashed, modifiedTime)",
      orderBy: "modifiedTime desc",
    };
    const responseDrive = await drive.files.list(requestBody);
    if (responseDrive.status != 200) return response;

    const files = responseDrive.data.files;

    if (!files.length) return response;
    let dateFilter = new Date();
    let date = dateFilter.setDate(dateFilter.getDate() - 30);

    files.forEach((file) => {
      if (file.mimeType == "video/mp4" && file.size > 0 && file.trashed == false) {
        let fileStatus = {
          fileId: file.id,
          fileName: file.name,
          status: folderName,
          ragicId: ragicId,
          playlistId: playlistId,
        };
        response.push(fileStatus);
      }
    });
  } catch (error) {
    console.error(
      `listFiles: encountered unexpected error : no access to the folder: ${folderId} Or ${error}`
    );
    return response;
  }
  return response;
}

async function isDownloadedFile(driveAuth, fileId, downloadPath) {
  let response = false;
  try {
    const drive = google.drive({ version: "v3", auth: driveAuth });
    const responseDrive = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
    const dest = fs.createWriteStream(downloadPath);
    await streamPipeline(responseDrive.data, dest);

    console.log("isDownloadedFile: File downloaded successfully.");
    response = true;
  } catch (error) {
    console.error("isDownloadedFile: Error during file download:", error.message);
  }
  return response;
}

async function isDeletedFile(driveAuth, fileId) {
  let response = false;
  try {
    const drive = google.drive({ version: "v3", auth: driveAuth });
    const responseDrive = await drive.files.delete({ fileId: fileId });
    console.log("isDeletedFile: File deleted successfully:", responseDrive.status);
    response = true;
  } catch (error) {
    console.error("isDeletedFile: Error deleting file:", error.message);
  }
  return response;
}

module.exports = { listFiles, isDeletedFile, isDownloadedFile };
