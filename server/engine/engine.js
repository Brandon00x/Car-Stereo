const OBDReader = require("bluetooth-obd");
const btOBDReader = new OBDReader();
const http = require("http");

function readobdii(res, boolStart) {
  if (!boolStart) {
    try {
      console.log(`ReadOBDII Stop Called. Is Running: ${boolStart}`);
      btOBDReader.disconnect();
    } catch (err) {
      //console.log(err);
    }
    return;
  } else {
    console.log(`ReadOBDII Start Called. Is Running: ${boolStart}`);
    res.write("Connected");
    btOBDReader.on("connected", function () {
      //this.requestValueByName("vss"); //vss = vehicle speed sensor
      this.addPoller("vss"); // Speed MPH
      this.addPoller("rpm"); // RPM
      this.addPoller("frp"); //Fuel Pressure
      this.addPoller("alch_pct"); //Ethanol Percent
      this.addPoller("enginefrate"); // Fuel Consumption Rate
      this.addPoller("engineoilt"); // Oil Temp
      this.addPoller("temp"); // Coolant Temp
      this.addPoller("iat"); // Air Intake Temp
      this.addPoller("aet"); // Engine Torque
      this.addPoller("map"); // Intake Manifold Pressure
      this.addPoller("maf"); // Air Flow Intake
      this.addPoller("load_pct"); // Calculated Load Value

      this.startPolling(1000); //Request all values each second.
    });

    btOBDReader.on("dataReceived", function (data) {
      if (Object.keys(data).length >= 1) {
        console.log(data);
        res.write(data);
      }
    });

    btOBDReader.on("error", function (data) {
      console.log("Error: " + data);
    });

    btOBDReader.on("debug", function (data) {
      console.log("Debug: " + data);
    });

    // Use first device with 'obd' in the name
    btOBDReader.autoconnect("obd");
  }
}

function createEngineServer(boolStop) {
  if (boolStop === "start") {
    console.log("Starting Engine Server");
    const server = http.createServer(function (req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
      );

      req.on("data", (chunk) => {
        let data = JSON.parse(chunk);
        console.log(`Data: ${data.data}`);
        if (data.data === "start") {
          let boolStart = true;
          readobdii(res, boolStart);
        } else if (data.data === "stop") {
          server.close();
          let boolStart = false;
          readobdii(res, boolStart);
        }
      });
    });
    server.listen(3224, () => console.log("Engine Server Listening on 3224."));
  } else if (boolStop === "stop") {
    console.log("Stopping Engine Server");
    server.close();
  }
}

module.exports = { createEngineServer };
