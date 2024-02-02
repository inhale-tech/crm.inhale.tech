const {
  uploadToYouTube,
  isUpdatedStatus,
  isAddedToPlaylist,
  getAllChannels,
} = require("../google_apis/youtubeApi");
const { listFiles, isDeletedFile, isDownloadedFile } = require("../google_apis/driveApi");
const { authorize } = require("../google_apis/googleApiAuth");
const { ragicGetProjectFoldersRequest, makeSendPostRequest } = require("./otherRequests");
const fs = require("fs");

require("dotenv").config();

const folder_type_enum = {
  private: "Private",
  updates: "Updates",
  public: "Public",
  internal: "Internal",
  unlisted: "unlisted",
};

async function getFolders(authClient) {
  let responce = [];
  let folderList = await ragicGetProjectFoldersRequest();

  if (folderList.length == 0) return responce;

  for (let i = 0; i < folderList.length; i++) {
    let temp = await folderArrayFormator(authClient, folderList[i]);
    if (temp.length) mergeArrays(responce, temp);
  }
  return responce;
}

async function folderArrayFormator(authClient, projectObject) {
  let responce = [];

  for (const key in folder_type_enum) {
    if (key == "unlisted" || key == "Public" || key == "public") continue;
    let type = folder_type_enum[key];
    let folderId = projectObject[type];

    let ragicId = parseInt(projectObject[process.env.RAGIC_ID]);
    let PlaylistId = projectObject[process.env.PLAYLIST_PROP];

    let filesArray = await listFiles(authClient, folderId, type, ragicId, PlaylistId);
    if (filesArray.length != 0) mergeArrays(responce, filesArray);
  }

  return responce;
}

const mergeArrays = (first, second) => {
  for (let i = 0; i < second.length; i++) {
    first.push(second[i]);
  }
  return first;
};

async function uploaded(authClient, fileId, filePath, fileName) {
  let response = "";
  let name = fileName == "" ? filePath : fileName;
  if (!(await isDownloadedFile(authClient, fileId, filePath))) return response;

  response = await uploadToYouTube(authClient, filePath, name);
  if (response == "") {
    await isDeletedLocalFile(filePath);
  }

  return response;
}

async function isDeletedLocalFile(filePath) {
  let response = false;
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`isdeletedLocalFile: File not found: ${filePath}`);
      return response;
    }
    fs.unlinkSync(filePath);
    console.log(`isDeletedLocalFile: File deleted successfully: ${filePath}`);
    response = true;
  } catch (error) {
    console.error(`isdeletedLocalFile: Error deleting file: ${filePath}`, error.message);
  }
  return response;
}

async function updatePlaylist(authClient, youtubeVideoId, filePath, videoObject) {
  let newStatus =
    videoObject.status == folder_type_enum.updates
      ? folder_type_enum.private.toLocaleLowerCase()
      : folder_type_enum.unlisted;

  await isDeletedLocalFile(filePath);
  await isUpdatedStatus(authClient, newStatus, youtubeVideoId);
  if (videoObject.playlistId == "") return;
  await isAddedToPlaylist(authClient, videoObject.playlistId, youtubeVideoId);
}

async function uploadAndDelete(authClient, filesUpload) {
  let response = [];
  for (let i = 0; i < filesUpload.length; i++) {
    let videoObject = filesUpload[i];
    let fileId = videoObject.fileId;
    let fileName = videoObject.fileName;
    let filePath = `${process.env.VIDEO_NAME}${Date.now()}${process.env.VIDEO_TYPE}`;

    let youtubeVideoId = await uploaded(authClient, fileId, filePath, fileName);

    if (youtubeVideoId == "") {
      await isDeletedLocalFile(filePath);
      continue;
    }
    let videoLink = `${process.env.YOUTUBE_VIDEOLINK_URL}${youtubeVideoId}`;
    await updatePlaylist(authClient, youtubeVideoId, filePath, videoObject);

    let responceObject = {
      youtubeLink: videoLink,
      ragicId: videoObject.ragicId,
      status: videoObject.status,
      driveFileId: videoObject.fileId,
    };
    response.push(responceObject);
  }
  return response;
}
async function youtubeUpload() {
  try {
    const authClient = await authorize("youtube");
    console.log("user youtube authenificated");
    const authDriveClient = await authorize("drive");
    console.log("user drive authenificated");
    if (!authClient || !authDriveClient) return;

    let filesUpload = await getFolders(authDriveClient);
    console.log(filesUpload);
    if (filesUpload.length == 0) return;

    if (parseInt(filesUpload.length) > parseInt(process.env.YOUTUBE_LIMIT)) {
      filesUpload = filesUpload.slice(0, parseInt(process.env.YOUTUBE_LIMIT));
    }

    let responce = await uploadAndDelete(authClient, filesUpload);
    if (responce.length != 0) await makeSendPostRequest(responce);
  } catch (err) {
    console.error(`youtubeUpload: Unexpected error during uplaod :${err}`);
  }
}

module.exports = {
  folderArrayFormator,
  mergeArrays,
  isDeletedLocalFile,
  getFolders,
  updatePlaylist,
  uploadAndDelete,
  youtubeUpload,
};
