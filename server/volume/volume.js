const fs = require("fs");
let exec = require("child_process").exec;

const makeVolumeScript = async (volumeLevel) => {
  try {
    let volumeCmd = `amixer sset 'Master' ${volumeLevel}%`;
    fs.writeFile("./volume/setvolume.sh", volumeCmd, function (err) {
      if (err) {
        console.error(`Error writing Volume CMD: ${err}`);
      }
    });
    setVolume();
  } catch (err) {
    console.log(`Error Making Volume Script ${err}`);
  }
};

const setVolume = () => {
  exec("sh ./volume/setvolume.sh");
};

module.exports = { makeVolumeScript };
