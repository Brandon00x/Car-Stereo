const Gpsd = require("node-gpsd-client");
const exec = require("child_process").exec;

const readGpsData = async () => {
  try {
    return new Promise((resolve, reject) => {
      const client = new Gpsd({
        port: 2947, // default
        hostname: "localhost", // default
        parse: true,
      });

      client.on("connected", () => {
        console.log("Gpsd connected");
        client.watch({
          class: "WATCH",
          json: true,
          scaled: true,
        });
      });

      client.on("error", (err) => {
        console.log(`Gpsd error: ${err.message}`);
        reject(err);
      });

      client.on("TPV", (data) => {
        if (data !== undefined) {
          for (let i = 0; i < 1; i++) {
            let lat = data.lat;
            let lng = data.lon;
            let speed = data.speed.toFixed(3);
            let altitude = (data.altMSL * 3.281).toFixed(4);
            let gpsData = { lat, lng, speed, altitude };
            client.disconnect();
            resolve(gpsData);
          }
        }
      });
      client.connect();
    }).catch()
  } catch (err) {
    console.log(`Error IN GPS Data ${err}`);
  }
};

const startGps = async () => {
  exec("sh gpsstart.sh ./myDir");
};

module.exports = { readGpsData, startGps };
