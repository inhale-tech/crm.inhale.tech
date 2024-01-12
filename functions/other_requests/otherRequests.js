const fetch = require("node-fetch");
const axios = require("axios");
const Version3Client = require("jira.js").Version3Client;
require("dotenv").config();

async function ragicGetProjectFoldersRequest() {
  let response = [];
  const headers = {
    Authorization: `${process.env.RAGIC_AUTH}`,
    "Content-Type": "application/json",
  };
  try {
    const responseRagic = await axios.get(process.env.RAGIC_REQUEST_URL, { headers });
    if (responseRagic.status !== 200) {
      console.error(`Request failed with status code: ${responseRagic.status}`);
      return response;
    }

    let responceData = responseRagic.data;

    for (const Key in responceData) {
      if (typeof responceData[Key] != "object") continue;
      let iteratableObject = responceData[Key];
      let dataObject = {};
      dataObject[process.env.FOLDER_TYPE_PUBLIC] = iteratableObject[process.env.PUBLIC_DRIVE];
      dataObject[process.env.FOLDER_TYPE_PRIVATE] = iteratableObject[process.env.PRIVATE_DRIVE];
      dataObject[process.env.FOLDER_TYPE_INTERNAL] = iteratableObject[process.env.INTERNAL_DRIVE];
      dataObject[process.env.PLAYLIST_PROP] = iteratableObject[process.env.PLAYLIST];
      dataObject[process.env.PROP_PROJECT_NAME] = iteratableObject[process.env.PROJECT_NAME];
      dataObject[process.env.RAGIC_ID] = parseInt(Key);
      response.push(dataObject);
      dataObject = {};
    }
  } catch (error) {
    console.error("ragicGetProjectFoldersRequest: unexpected error during ragic request:", error.message);
  }
  return response;
}

async function makeSendPostRequest(requestBody) {
  let response = false;
  try {
    await axios.post(process.env.RESPONSE_WEBHOOK_URL, requestBody);
    response = true;
  } catch (error) {
    console.error("makeSendPostRequest: unexpected error happend:", error.message);
  }
  return response;
}

async function addCommentToJira(threadName, comment, author) {
  let reqBody = {
    host: process.env.JIRA_HOST,
    authentication: {
      basic: {
        email: process.env.ROOT_EMAIL,
        apiToken: process.env.API_KEY,
      },
    },
  };

  const client = new Version3Client(reqBody);
  await fetch(`${process.env.JIRA_COMMENT_URL}?issueId=${threadName}&comment=${comment}&author=${author}`);
}

module.exports = { ragicGetProjectFoldersRequest, makeSendPostRequest, addCommentToJira };
