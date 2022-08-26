const fs = require("fs");

const setBrightness = async (brightness) => {
  try {
    console.log("Brightness on set was ", brightness);
    const path = "/sys/class/backlight/10-0045/";
    if (fs.existsSync(path)) {
      fs.writeFile(
        "/sys/class/backlight/10-0045/brightness",
        brightness,
        function (err) {
          if (err) {
            console.error(`Error writing brightness file: ${err}`);
          }
        }
      );
    } else {
      console.error(
        "Error Changing Brightness. Brightness File Path Did Not Exist."
      );
    }
  } catch (err) {
    console.log(`Error writing brightness file: ${err}`);
  }
};

module.exports = { setBrightness };
