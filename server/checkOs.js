// Check Operating System Linux Return False if Not Linux
function checkOperatingSystem() {
  try {
    let operatingSystem = process.platform; // possible outcomes -> 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'

    if (operatingSystem === "linux") {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(`Unable to preform Operating System Check.\n${err}`);
    return false;
  }
}

module.exports = { checkOperatingSystem };
