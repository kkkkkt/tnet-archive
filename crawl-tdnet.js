const moment = require('moment');
const fs = require('fs');

const shell = require('shelljs');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

TargetMonthArray = () => {
  const end = new Date();
  let current = new Date();
  current.setDate(current.getDate() - 31);

  let res = [];

  while (current <= end) {
    let format = moment(current).format("YYYYMMDD");
    res.push(format);
    current.setDate(current.getDate() + 1);
  }

  return res;
}

zeroFilled = number => ('000' + number).substr(-3)

crawlDate = (date, crawlForce = false) => {
  let number = 1;

  while(true) {
    const name = `I_list_${zeroFilled(number)}_${date}.html`;

    if (!crawlForce && shell.test('-e', name)) {
      return;
    }

    if (crawlForce) {
      shell.rm(name);
    }

    const path = `https://www.release.tdnet.info/inbs/${name}`
    const command = `wget --no-check-certificate "${path}"`;
    let res = shell.exec(command);

    if (res.code != 0) {
      return;
    }
    sleep(1000);
    number++;
  }
}

crawlThisMonth = () => {
  const dateArray = TargetMonthArray();
  dateArray.forEach(date => {
    crawlDate(date);
  });
}


shell.cd("tdnet-html");

crawlThisMonth();

let today = moment().format("YYYYMMDD");
let yesterday = moment().subtract(1, "days").format("YYYYMMDD");

crawlDate(yesterday, true);
crawlDate(today, true);
