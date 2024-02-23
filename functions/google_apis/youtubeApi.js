const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

async function uploadToYouTube(youtubeAuth, videoPath, videoName) {
  let response = "";
  try {
    const youtube = google.youtube({ version: "v3", auth: youtubeAuth });

    const requestBody = {
      snippet: {
        title: videoName,
        description: videoName,
        channelId: "UCv6JfdW0ylvlNyIaT-yiOCA",
      },
      status: {
        privacyStatus: process.env.STATUS_ENUM.private,
      },
    };
    const media = { body: fs.createReadStream(videoPath) };
    let insertBody = {
      part: "snippet, status",
      requestBody,
      media,
    };
    const uploadResponse = await youtube.videos.insert(insertBody);
    response = uploadResponse.data.id;

    console.log("uploadToYouTube: Video uploaded succsessfully ", uploadResponse.data);
  } catch (error) {
    console.error("uploadToYouTube: Error during file upload to YouTube:", error.message);
  }
  return response;
}

async function isUpdatedStatus(youtubeAuth, newPrivacyStatus='unlisted', videoId) {
  let response = false;
  try {
    const youtube = google.youtube({ version: "v3", auth: youtubeAuth });
    const requestBody = {
      part: "status",
      resource: {
        id: videoId,
        status: { privacyStatus: newPrivacyStatus },
      },
    };
    const updateResponse = await youtube.videos.update(requestBody);
    console.log("updateStatus: Video privacy status updated successfully:", updateResponse.data);
    response = true;
  } catch (error) {
    console.log("updateStatus: Error updating video:", error.message);
  }
  return response;
}

async function isAddedToPlaylist(youtubeAuth, playlistId, videoId) {
  let response = false;
  try {
    const youtube = google.youtube({ version: "v3", auth: youtubeAuth });
    const requestBody = {
      part: "snippet",
      resource: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId: videoId,
          },
        },
      },
    };
    const playlistItemResponse = await youtube.playlistItems.insert(requestBody);
    console.log("addToPlaylist: Video added to playlist successfully:", playlistItemResponse.data);
    response = true;
  } catch (err) {
    console.error("addToPlaylist: Error updating playlist:", error.message);
  }
  return response;
}

module.exports = { uploadToYouTube, isUpdatedStatus, isAddedToPlaylist, getAllChannels };
