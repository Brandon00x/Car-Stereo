const fs = require("fs");
const exec = require("child_process").exec;
const { log4js } = require("./logger");
const logger = log4js.getLogger("Location: Server. File: getIP.js");

const readIp = async () => {
  getIp();
  return new Promise((resolve, reject) => {
    fs.readFile("./ip.txt", function (err, data) {
      if (err) {
        logger.error("Unable to read IP text file. ");
        reject("Unable to read IP text file.");
      } else {
        if (data.length === 0) {
          reject("Unable to get IP.");
        } else {
          ip = data.toString();
          result = { IP: ip };
          resolve(result);
        }
      }
    });
  });
};

const getIp = async () => {
  exec("sh getIP.sh ./myDir");
};

setInterval(() => {
  getIp();
  logger.info("Checking for IP Change.");
}, 1000000);

module.exports = { readIp, getIp };
