#!/usr/bin/env node
const express = require("express");
const app = express();
const cors = require("cors");
const { log4js } = require("./logger");
const exec = require("child_process").exec;

// Custom Modules
const { readIp } = require("./getIP"); // Get IP Address
const { checkOperatingSystem } = require("./checkOs"); // Operating System Check
const { listWifi, connectWifi } = require("./wifi"); // OS Wifi Connections
const {
  btscan,
  readBtScan,
  btPair,
  btPlay,
  btNext,
  btPrev,
  getBtConnectedDevices,
  sendTrackInfo,
} = require("./bluetooth"); // OS Bluetooth Connections
const { readGpsData, startGps } = require("./gpsdata"); // OS GPS Connections
const { makeVolumeScript } = require("./volume/volume"); // OS Volume Level
const { setBrightness } = require("./brightness/brightness"); // OS Brightness
// TODO: Fix Engine Gauges
const { createEngineServer } = require("./engine/engine"); // OBDII Engine Readout

// Check OS and Disable Features
const supportedOS = checkOperatingSystem();

// Define Logger and Server: FileName
const logger = log4js.getLogger("Location: Server. File: app.js");

// Port
const PORT = process.env.PORT || 3222;

// Define CORs options
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// Use Express JSON and CORs
app.use(express.json());
app.use(cors());

//// Bluetooth
app.get("/btcheckconnected", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    let devices = await getBtConnectedDevices();
    res.send(devices);
  }
});

// Send BT Devices Found
app.get("/sendbtdevices", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    let btdevices = await readBtScan();
    console.log("BT DEVICES:\n", btdevices);
    res.send(btdevices);
  }
});

// Scan for BT Devices
app.get("/scanbtdevices", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    try {
      btscan();
      res.send("Scanning");
    } catch (err) {
      console.error(`Unable to send list of BT Devices ${err}`);
    }
  }
});

// Pair BT Device
app.post("/pairbt", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    let btMac = await req.body;
    if (btMac.settings === true) {
      btPair(btMac.btMac);
      let pairedDevice = JSON.stringify(btMac.btMac);
      res.send(pairedDevice);
    } else {
      btPair(btMac.btMac);
      console.log("FROM MUSIC: ", btMac.btMac);
      let trackInfo = await sendTrackInfo();
      let sendInfo = {
        PairedDevice: JSON.stringify(btMac.btMac),
        TrackInfo: trackInfo,
      };
      console.log(sendInfo);
      res.send(sendInfo);
    }
  }
});

// BT Music Controls
app.post("/playerControls", cors(corsOptions), async (req, res) => {
  let control = await req.body;
  console.log("Media Controls CMD: ", await control.cmd);
  if (control.cmd === "play" || control.cmd === "pause") {
    btPlay();
    let trackInfo = await sendTrackInfo();
    console.log(trackInfo);
    let sendInfo = {
      PairedDevice: null,
      TrackInfo: trackInfo,
    };
    res.send(sendInfo);
  } else if (control.cmd === "next") {
    await btNext();
    let trackInfo = await sendTrackInfo();
    console.log(trackInfo);
    let sendInfo = {
      PairedDevice: null,
      TrackInfo: trackInfo,
    };
    res.send(sendInfo);
  } else if (control.cmd === "prev") {
    await btPrev();
    let trackInfo = await sendTrackInfo();
    console.log(trackInfo);
    let sendInfo = {
      PairedDevice: null,
      TrackInfo: trackInfo,
    };
    res.send(sendInfo);
  } else if (control.cmd === "done") {
    let trackInfo = await sendTrackInfo();
    console.log(trackInfo);
    let sendInfo = {
      PairedDevice: null,
      TrackInfo: trackInfo,
    };
    res.send(sendInfo);
  }
});

//// Networking
// Scan for WiFi
app.get("/getwifinames", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    try {
      let wifi = await listWifi();
      console.log(wifi);
      res.json(wifi);
    } catch (err) {
      console.error(`Unable to get WiFi Names ${err}`);
      //TODO: Send 500 with Error Code
      res.sendStatus(500);
    }
  }
});

// Wifi Connection
app.post("/connectwifi", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    try {
      let data = await req.body;
      let wifiName = data.wifiName;
      let wifiPassword = data.wifiPassword;

      await connectWifi(wifiName, wifiPassword);
      res.send("200");
    } catch (err) {
      console.error(`Unable to connect to Wifi ${err}`);
      res.send("Unable to connect to WiFi.");
    }
  }
});

// Send IP Address
app.get("/getip", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    try {
      ip = await readIp();
      res.json(ip);
    } catch (err) {
      res.send("Error");
    }
  }
});

//// GPS
// Send GPS Data
app.get("/gpscoordinates", cors(corsOptions), async (req, res) => {
  let gpsData = await readGpsData();
  logger.info(`GPS DATA SENT: ${JSON.stringify(gpsData)}`);
  res.send(gpsData);
});

// Start GPS
app.post("/startgps", cors(corsOptions), async (req, res) => {
  startGps();
  console.log(`GPS Started`);
  res.send("GPS Started");
});

//// Screen Brightness
app.post("/brightness", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    let brightness = req.body.brightness;
    console.log(`Set Brightness to ${brightness}`);
    setBrightness(brightness);
    res.send(`Set Brightness to ${brightness}`);
  }
});

//// OS Volume Control
app.post("/volume", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    let volume = req.body.volume;
    console.log(`Set Volume to ${volume}`);
    makeVolumeScript(volume);
    res.send(`Set Volume to ${volume}`);
  }
});

//// Reset - Restart client and server in case of error...
// TODO: Finish Reset
app.post("/reset", cors(corsOptions), async (req, res) => {
  if (supportedOS) {
    exec("./reset/reset.sh");
    console.log("Reset Apps Called");
  }
});

//// Google Assistant
app.post("/googleassistant", cors(corsOptions), async (req, res) => {
  logger.error("Feature Not Implemented Yet");
  // TODO: Finish Google Assistant
  // try {
  //   logger.info("POSTREQ: Hey Google");
  //   exec(
  //     "node google-assistant/examples/mic-speaker.js",
  //     async (err, stdout, stderr) => {
  //       if (err) console.error(err);
  //       console.log(stdout);
  //       let _asked = stdout;
  //       res.send(_asked);
  //     }
  //   );

  //   let asked = await JSON.stringify(fs.readFileSync("googleresponse.txt"));
  //   logger.info("Asked: ", asked);

  //   res.send("Hey Google Called");
  // } catch (err) {
  //   console.error(`Google Assistant Error: ${err}`);
  // }
});

//// OBDIII Engine Data
// TODO: Fix Gauge Freeze Issue with React Gauges
// app.post("/engine", cors(corsOptions), async (req, res) => {
//   let boolStart = req.body.data;
//   createEngineServer(boolStart);
//   res.sendStatus(200);
// });

//// Logging
// Save logs to DB.
app.post("/logger", (req, res) => {
  try {
    let data = req.body;
    let parsed = JSON.stringify(data);
    logger.info(parsed);
    res.sendStatus(200);
  } catch (err) {
    console.error(`Logging Error: ${err}`);
  }
});

//// Program Init
app.listen(PORT, () => {
  logger.info(`Preforming Startup Tests`);
  // OS Not Supported - Disabled Features Mode
  if (!supportedOS) {
    logger.warn(`Operating System Not Supported.`);
    logger.warn(`List of Disabled Features:`);
    logger.warn("OS Network Connections (Settings > Wifi Connection)");
    logger.warn("OS Bluetooth Connections (Bluetooth Music Component)");
    logger.warn("OS Volume Control Settings");
    logger.warn("OS Screen Brightness Level");
    logger.warn("OBDII Engine Data\n");
    logger.info("Optional Features:");
    logger.info("GPS -  See ReadMe to Forward GPS Data\n");
    logger.info(
      `Car Console Server with DISABLED FEATURES Listening on Port: ${PORT}.`
    );
  }
  // OS Supported
  else {
    logger.info(`Car Console Server Listening on Port: ${PORT}.`);
  }
});
