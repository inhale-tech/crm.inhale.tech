const path = require("path");
const fs = require("fs");

//NOTE must be placed in the same root directory as the tokens folder!
function directoryScan() {
  let result = [];
  const directoryPath = path.join(__dirname, "tokens");
  console.log(directoryPath);

  result = fs.readdirSync(directoryPath, function (err, files) {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    return files.filter((file) => file.includes("token_"));
  });
  return result;
}

module.exports = { directoryScan };
