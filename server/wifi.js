const fs = require("fs");
let util = require("util");
let exec = require("child_process").exec;
let exec_prom = util.promisify(exec);

const listWifi = async () => {
  try {
    console.log("Running WiFi Scan");
    return new Promise((resolve, reject) => {
      exec("sh wifiscan.sh ./myDir");
      console.log("Ran WiFi Scan.");
      const path = "./list.txt";
      if (fs.existsSync(path)) {
        fs.readFile("./list.txt", function (err, data) {
          if (err) {
            console.log("ERROR");
            reject(`Error Reading WiFi Data ${err}`);
          } else {
            let response = JSON.stringify(data.toString().slice(0, -1));
            if (response === '""' || response === undefined) {
              console.error("Wifi Scan Did Not Find WiFi");
              let errMsg = "No WiFi Found.";
              reject(errMsg);
            } else {
              console.log("Found WiFi Connections");
              let formatted = response.replace(/ESSID:/g, "\n").slice(1, -1);
              let newLine = formatted.split("\n");
              let arr = [];
              for (var i = 1; i < newLine.length; i++) {
                //start at one to remove undefined
                arr.push(newLine[i]);
              }
              resolve(arr);
            }
          }
        });
      } else {
        console.error("Error: No WiFi File List Found.");
        let errMsg = "No WiFi List File Found";
        reject(errMsg);
      }
    });
  } catch (err) {
    console.log(err);
    reject(err)
  }
};

const connectWifi = async (wifiName, wifiPassword) => {
  console.log("WIFI.js ", wifiName, wifiPassword);
  let content = `
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=US

network={
        ssid="${wifiName.trim()}"
        psk="${wifiPassword}"
        key_mgmt=WPA-PSK
}
`;
  fs.writeFile("wpa_supplicant.conf", content, function (err) {
    if (err) {
      console.error(`Error writing WiFi Config ${err}`);
    }
  });
  bashWifi();
};

const bashWifi = async () => {
  exec("sh connectWifi.sh ./myDir");
};

module.exports = { listWifi, connectWifi };
