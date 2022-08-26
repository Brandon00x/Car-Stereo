const fs = require("fs");
const readline = require("readline");
const exec = require("child_process").exec;

const btscan = async () => {
  console.log("Starting Bluetooth Scan");
  exec("sh btdiscoveron.sh ./myDir");
  exec("sh btscan.sh ./myDir");
};

const getBtConnectedDevices = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      let devices = await readConnectedDevices();
      resolve(devices);
    }, 2000);
  });
};

const readConnectedDevices = async () => {
  try {
    const fileStream = fs.createReadStream("btconnecteddevices.txt");
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let counter = 0;
    let devices = [];
    for await (const line of rl) {
      counter++;
      if (counter === 1) {
        let mac = line.replace("Device ", "").replace("(public)", "").trim();
        devices.push(mac);
      } else if (counter === 2) {
        let name = line.replace("Name: ", "").trim();
        devices.push(name);
      }
      if (counter === 3) {
        let isConnected = line.replace("Connected: ", "").trim();
        devices.push(isConnected);
        counter = 0;
      }
    }
    if (devices.indexOf("00:1D:A5:01:05:DC") != -1) {
      let obdiiIndex = devices.indexOf("00:1D:A5:01:05:DC");
      devices.splice(obdiiIndex, 1);
      devices.splice(obdiiIndex, 1);
      devices.splice(obdiiIndex, 1);
    } else {
      if (devices.indexOf("yes") != -1) {
        devices.push("Connected");
        return devices;
      } else if (devices.indexOf("yes") === -1) {
        devices.push("Disconnected");
        return devices;
      }
    }
  } catch (err) {
    console.error(`Unable to read BT Connected Devices File: ${err}`);
  }
};

const readBtScan = async () => {
  try {
    return new Promise((resolve, reject) => {
      fs.readFile("./btdevices.txt", function (err, data) {
        if (err) {
          console.error("Unable to read BT scan results");
          reject("Unable to read BT scan results");
        } else {
          btdevices = data.toString();
          if (btdevices.length <= 1) {
            btdevices = "No Devices Found";
            resolve(btdevices);
          } else {
            console.log("Read Scanned BT Devices File.");
            resolve(btdevices);
          }
        }
      });
    });
  } catch (err) {
    console.error(`Unable to resolve readBtScan promise ${err}`);
  }
};

const btPair = async (btMac) => {
  let mac = btMac;
  console.log("MAC address to pair: ", mac);
  let pairCmd = `#!/bin/bash\nsudo bluetoothctl trust ${mac}\nsudo bluetoothctl connect ${mac}`;

  fs.writeFile("btpair.sh", pairCmd, function (err) {
    if (err) {
      console.error(`Error Writing BT Pair CMD: ${err}`);
    } else {
      fs.chmodSync("btpair.sh", "755");
      execBtPair();
    }
  });
};

const execBtPair = async () => {
  console.log("Attemping BT Pair.");
  exec("sh btpair.sh ./myDir");
  //exec("sh btdiscoveroff.sh ./myDir");
};

const sendTrackInfo = async () => {
  try {
    setTimeout(async () => {
      getBtSongInfo();
    }, 1000);
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        fs.readFile("./trackinfo.txt", function (err, data) {
          if (err) {
            console.error(`Error Reading Track Info ${err}`);
          } else {
            let trackinfo = data.toString();
            let removeFirstLine = trackinfo.replace(/.*/, "");
            let t = 0;
            let s = 0;
            // TODO: Probably a better way..... Revist Later
            let dumb = removeFirstLine
              .replace("array [", "")
              .replaceAll("dict entry(", "")
              .replaceAll("variant", "")
              .replaceAll(")", "")
              .replaceAll("string", "")
              .replaceAll("uint32", "")
              .replace("Genre", "")
              .replaceAll('""', "")
              .replace(")", "")
              .replace(/  /g, "")
              .replaceAll("\n", "")
              .replace("  ", "")
              .replace("     ", "")
              .replaceAll("   ", ", ")
              .replaceAll('" ', '", ')
              .replaceAll('",', '":')
              .replace("]", "")
              .replace(/:/g, (match) => (++t === 2 ? "," : match))
              .replace(/:/g, (match) => (++s === 6 ? "," : match))
              .replaceAll(":", ",");

            let arr = dumb.split(",");

            let title = arr[1];
            let trackNumber = arr[3];
            let numberOfTracks = arr[5];
            let duration = arr[7];
            let album = arr[9];
            let artist = arr[11];

            let songInfo = {
              Title: title,
              TrackNumber: trackNumber,
              NumberOfTracks: numberOfTracks,
              Duration: duration,
              Album: album,
              Artist: artist,
            };
            resolve(songInfo);
          }
        });
      }, 3000);
    });
  } catch (err) {
    console.log("Error Getting Music Info: ", err);
  }
};

//Track Info:
const getBtSongInfo = async () => {
  exec("sh btsonginfo.sh ./myDir");
};

//Player Controls:
const btPlay = async () => {
  exec("sh btplay.sh ./myDir");
};

const btNext = async () => {
  exec("sh btnext.sh ./myDir");
};

const btPrev = async () => {
  exec("sh btprev.sh ./myDir");
};

const btVolumeUp = async () => {
  exec("sh btvolumedown.sh ./myDir");
};

const btVolumeDown = async () => {
  exec("sh btvolumeup.sh ./myDir");
};

module.exports = {
  btscan,
  readBtScan,
  btPair,
  btPlay,
  btNext,
  btPrev,
  btVolumeUp,
  btVolumeDown,
  sendTrackInfo,
  execBtPair,
  getBtConnectedDevices,
};
