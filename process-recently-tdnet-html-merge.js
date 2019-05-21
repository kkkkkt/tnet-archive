const fs = require("fs");
const moment = require("moment");

const shell = require("shelljs");
const cheerio = require("cheerio");

let number = 1;

let year = 2019;
let month = 4;
let day = 17;

processTdnetHtmlToJson = (year, month, day, number) => {
  zeroFilled3 = number => ("000" + number).substr(-3);
  zeroFilled2 = number => ("00" + number).substr(-2);

  const fileName = `I_list_${zeroFilled3(number)}_${year}${zeroFilled2(
    month
  )}${zeroFilled2(day)}.html`;

  const name = `${fileName}`;

  if (!shell.test('-e', name)) {
    return [];
  }

  const data = fs.readFileSync(name, "utf8");

  const $ = cheerio.load(data);
  const length = $("#main-list-table > tbody > tr").length;

  let all = [];

  for (let i = 1; i <= length; i++) {
    let child = $(`#main-list-table > tbody > tr:nth-child(${i}) > td.kjTime`);
    const time = child.text().trim();

    const dateTime = new Date(
      `${year}-${zeroFilled2(month)}-${zeroFilled2(day)}T${time}:00+09:00`
    );

    child = $(`#main-list-table > tbody > tr:nth-child(${i}) > td.kjCode`);
    const code = child.text().trim();
    //  console.log(code);

    child = $(`#main-list-table > tbody > tr:nth-child(${i}) > td.kjName`);
    const name = child.text().trim();
    //  console.log(name);

    child = $(`#main-list-table > tbody > tr:nth-child(${i}) > td.kjTitle`);
    const title = child.text().trim();

    //  console.log(title);

    //
    child = $(`#main-list-table > tbody > tr:nth-child(${i}) > td.kjTitle > a`);

    let link = child.attr("href");
    child = $(
      `#main-list-table > tbody > tr:nth-child(${i}) > td.kjXbrl > div > div > a`
    );

    let xbrl = child.attr("href");

    let json = {
      company: name,
      title: title,
      code: code,
      //    time: time,
      dateTime: dateTime,
      link: link
    };

    if (xbrl) {
      json["xbrl"] = xbrl;
    }

    //  console.log(json);
    all.push(json);
  }

//  console.log(all);
  return all;
};

processTdnetHtmlDayToJson = (year, month, day) => {
  let results = []
  let number = 1;


  while (number) {
    let res = processTdnetHtmlToJson(year, month, day, number);

    if (!res || res.length == 0) {
      return results;
    } else {
      results = results.concat(res);
//      console.log(number);
      number++;
    }
  }
}

processRecentData = () => {
//  let first = moment().subtract(7, "days").toDate();
  let first = moment().subtract(3, "days").toDate();

  let today = new Date();
  let current = first;

  let results = [];

  while (current <= today) {
    let year = current.getFullYear();
    let month = current.getMonth() + 1;
    let day = current.getDate();
    let res = processTdnetHtmlDayToJson(year, month, day);

    if (res && res.length != 0) {
      results = results.concat(res);
      console.log(results.length);
    }

    current.setDate(current.getDate() + 1);
  }
  return results;
}

shell.cd("tdnet-html");

let recentJson = processRecentData();

//console.log(resJson);

let tdnet = fs.readFileSync("json/tdnet.json", "utf8");
let tdnetJson = JSON.parse(tdnet);

console.log(tdnetJson.length);

let newJson = [...tdnetJson, ...recentJson]
console.log(newJson.length);

// filtering unique data
newJson = Array.from(new Set(newJson.map(JSON.stringify))).map(JSON.parse);
console.log(newJson.length);

fs.writeFileSync("json/tdnet.json", JSON.stringify(newJson, null, 2));

return;

shell.cd("tdnet-html");

let results = processAll();

if (results && results.length > 0) {
  fs.writeFile("json/tdnet.json", JSON.stringify(results, null, 2), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    console.log("File has been created");
  });
}
