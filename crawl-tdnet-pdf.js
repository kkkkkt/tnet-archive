const moment = require('moment');
const fs = require('fs');

const shell = require('shelljs');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const TARGET_JSON = "tdnet-html/json/tdnet.json"
const json = require("./tdnet-html/json/tdnet.json");


json.forEach(data => {

  target = `https://www.release.tdnet.info/inbs/${data.link}`;
  console.log(target);

  const command = `wget --no-check-certificate "${target}" -O "./tdnet-pdf/${data.link}"`;


  if (!shell.test('-e', `./tdnet-pdf/${data.link}`)) {
    let res = shell.exec(command);
  }
})

// if (results && results.length > 0) {
//   fs.writeFile("json/tdnet.json", JSON.stringify(results, null, 2), (err) => {
//     if (err) {
//         console.error(err);
//         return;
//     };
//     console.log("File has been created");
//   });
// }
