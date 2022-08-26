import React, { Component } from "react";
import "./Settings.scss";
import { Container, Col, Card } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
const axios = require("axios");

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHidden: true,
      isToggled: false,

      btNanes: null,
      btMacs: null,
      btScanTime: null,

      ip: null,
      wifiName: null,
      longitude: null,
      latitude: null,

      sideTitle: null,
      sideSubTitle: null,
      sideContent: null,
      input: null,
      darkMode: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.clearSideContent = this.clearSideContent.bind(this);
    this.getWifiNames = this.getWifiNames.bind(this);
    this.getIp = this.getIp.bind(this);
    this.enterWifiPassword = this.enterWifiPassword.bind(this);
    this.connectWifi = this.connectWifi.bind(this);
    this.loadBluetooth = this.loadBluetooth.bind(this);
    this.getBtDevices = this.getBtDevices.bind(this);
    this.pairDevice = this.pairDevice.bind(this);
    this.setSpeedVolume = this.setSpeedVolume.bind(this);
    this.configureGPS = this.configureGPS.bind(this);
    this.setPasscode = this.setPasscode.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.setBrightness = this.setBrightness.bind(this);
    this.handleBrightness = this.handleBrightness.bind(this);
    this.changeBrightness = this.changeBrightness.bind(this);
    this.reset = this.reset.bind(this);
  }

  clearSideContent() {
    this.setState({
      sideTitle: null,
      sideContent: null,
      isHidden: true,
      sideSubTitle: null,
    });
  }

  handleChange(e) {
    this.setState({
      input: e.target.value,
    });
  }

  //Bluetooth
  // TODO: List Paired Device in Card Title if Exists
  // TODO: Toggle Pairable Mode. (Could probably just remove 100% of this with that....)
  // TODO: Remove Scroll Bars on Side Content
  async loadBluetooth() {
    this.setState((prevstate) => ({
      isHidden: !prevstate.isHidden,
      sideTitle: "Bluetooth Settings",
      sideSubTitle: "Searching for Devices...",
    }));
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/scanbtdevices`,
      });
      console.log(res.data);
    } catch (err) {
      console.log(`Error Requesting BT Scan: ${err}`);
    }
    this.getBtDevices();
  }

  async getBtDevices() {
    setTimeout(async () => {
      try {
        const res = await axios({
          method: "get",
          url: `http://localhost:3222/sendbtdevices`,
        });
        let data = res.data;
        let rows = data.split("\n");

        //No Devices Found
        if (data === "No Devices Found") {
          this.setState({
            sideTitle: "Bluetooth Settings",
            sideSubTitle: "No devices found.",
            sideContent: null,
            btScanTime: 10,
          });
        } else {
          //Devices Found
          this.btnames = [];
          this.btmacs = [];
          this.btdevicerows = [];

          for (let i = 0; i < rows.length - 1; i++) {
            this.btnames.push(rows[i].slice(18));
            this.btmacs.push(rows[i].slice(0, 17));
            this.btdevicerows.push(
              <div key={uuidv4()}>
                <input
                  className="settingssidecontent"
                  defaultValue={rows[i].slice(18)}
                  disabled
                ></input>
                <button
                  value={rows[i].slice(0, 17)}
                  className="settingsConnectButton"
                  onClick={this.pairDevice}
                >
                  Connect
                </button>
              </div>
            );
          }
          this.setState({
            sideSubTitle: "Pair with Device:",
            sideContent: this.btdevicerows,
            btNames: this.btnames,
            btMacs: this.btmacs,
            btScanTime: 10,
          });
        }
      } catch (err) {
        console.error(`Error Scanning BT Devices: ${err}`);
      }
    }, 11000);
  }

  pairDevice(e) {
    this.selectedDevice = e.target.value;
    console.log(`Selected Device: ${this.selectedDevice}`);
    this.setState({
      isHidden: true,
    });
    try {
      axios
        .post("http://localhost:3222/pairbt", {
          settings: true,
          btMac: this.selectedDevice,
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.error(`Unable to POST to Pair BT Device ${err}`);
    }
  }
  //End Bluetooth

  //WIFI
  async getIp() {
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/getip`,
      });
      if (res.data === "Error") {
        this.error = "Unable to get IP.";
        this.setState({
          ip: this.error,
        });
      } else {
        this.ip = res.data.IP;
        this.setState({
          ip: this.ip,
        });
      }
    } catch (err) {
      console.err(`Error Getting IP: ${err}`);
    }
  }

  async getWifiNames() {
    await this.getIp();
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/getwifinames`,
      });
      if (res.data === "Error") {
        this.setState({
          isHidden: false,
          sideTitle: "WiFi Settings",
          sideSubTitle: "Error Scanning WiFi",
        });
      } else {
        let data = res.data;
        this.wifiNames = [];
        for (let i = 0; i < data.length; i++) {
          this.listItems = (
            <input
              key={uuidv4()}
              className="settingssidecontent"
              onClick={this.enterWifiPassword}
              defaultValue={data[i]}
            ></input>
          );
          this.wifiNames.push(this.listItems);
        }
        this.subTitle = (
          <div>
            <h6>Current IP: {this.state.ip}</h6>
            <h5>Connect To WiFi:</h5>
          </div>
        );
        this.setState((prevState) => ({
          isHidden: !prevState.isHidden,
          sideTitle: "WiFi Settings",
          sideSubTitle: this.subTitle,
          sideContent: this.wifiNames,
        }));
      }
    } catch (err) {
      console.error(`Error Getting WiFi Names ${err}`);
      this.setState((prevState) => ({
        isHidden: !prevState.isHidden,
        sideTitle: "WiFi Settings",
        sideSubTitle: "No WiFi Found",
        sideContent: null,
      }));
    }
  }

  enterWifiPassword(e) {
    this.selectedWifi = e.target.value;
    this.sideContent = (
      <div>
        <input
          placeholder="Enter Password"
          onChange={this.handleChange}
        ></input>
        <button className="settingsConnectButton" onClick={this.connectWifi}>
          Connect
        </button>
      </div>
    );

    this.setState({
      sideTitle: `Enter Password for ${this.selectedWifi}`,
      sideContent: this.sideContent,
      wifiName: e.target.value,
    });
  }

  connectWifi() {
    try {
      axios
        .post("http://localhost:3222/connectwifi", {
          wifiName: this.state.wifiName,
          wifiPassword: this.state.input,
        })
        .then(function (response) {
          //Todo: Check if connected
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch (err) {
      console.log(`Error Posting WiFi Password: ${err}`);
    }
    this.setState({
      isHidden: true,
      wifiName: null,
      sideContent: null,
      sideSubTitle: null,
    });
  }
  //END WIFI

  //Screen Brightness
  setBrightness() {
    this.brightnessSlider = (
      <div className="slidecontainer">
        <input
          type="range"
          min="20"
          max="255"
          step="5"
          value={this.brightnessLevel}
          className="settingsSpeedVolSlider"
          onChange={this.handleBrightness}
          style={{ marginTop: "30px" }}
        />
      </div>
    );
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
      sideTitle: "Brightness Settings",
      sideSubTitle: "Change the Screen Brightness:",
      sideContent: this.brightnessSlider,
    }));
  }

  handleBrightness(e) {
    this.brightnessLevel = e.target.value;
    this.changeBrightness();
  }

  changeBrightness() {
    try {
      axios
        .post("http://localhost:3222/brightness", {
          brightness: this.brightnessLevel,
        })
        .then((res) => {
          this.brightnessRes = res.data;
        });
    } catch (err) {
      console.error(`Error Changing Brightness ${err}`);
    }
  }
  //End Brightness

  //Volume
  setVolume() {
    this.volSlider = (
      <div className="slidecontainer">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={this.volumeLevel}
          className="settingsSpeedVolSlider"
          onChange={this.handleVolumeChange}
          style={{ marginTop: "30px" }}
        />
      </div>
    );
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
      sideTitle: "Volume Settings",
      sideSubTitle: "Change the Volume:",
      sideContent: this.volSlider,
    }));
  }

  handleVolumeChange(e) {
    this.volumeLevel = e.target.value;
    this.changeVolume();
  }

  changeVolume() {
    try {
      axios
        .post("http://localhost:3222/volume", {
          volume: this.volumeLevel,
        })
        .then((res) => {
          this.volResponse = res.data;
        });
    } catch (err) {
      console.error(`Error Changing Volume ${err}`);
    }
  }
  //End Volume

  //Speed Volume
  setSpeedVolume() {
    this.speedVolSlider = (
      <div className="slidecontainer">
        <input
          type="range"
          min="1"
          max="100"
          value="100"
          step="10"
          className="settingsSpeedVolSlider"
          onChange={this.handleChange}
          style={{ marginTop: "30px" }}
        />
      </div>
    );
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
      sideTitle: "Speed Volume Settings",
      sideSubTitle:
        "Speed Volume increase the volume level as the vehicle accelerates.",
      sideContent: this.speedVolSlider,
    }));
  }
  //END Speed Volume

  //GPS Configuration
  startGps() {
    try {
      axios.post("http://localhost:3222/startgps", {
        startGps: "start",
      });
    } catch (err) {
      console.error(`Error Changing Brightness ${err}`);
    }
  }

  async configureGPS() {
    try {
      const res = await axios({
        method: "get",
        url: `http://localhost:3222/gpscoordinates`,
      });
      console.log(res.data);

      this.gpsData = (
        <div className="settingsGPSSideContent">
          <h6>Longitude: {parseFloat(res.data.lng).toFixed(6)}</h6>
          <h6>Latitude: {parseFloat(res.data.lat).toFixed(6)}</h6>
          <h6>Speed: {parseFloat(res.data.speed).toFixed(2)} MPH</h6>
          <h6>Altitude: {parseFloat(res.data.altitude).toFixed(2)} FT</h6>
        </div>
      );
      this.setState((prevState) => ({
        isHidden: !prevState.isHidden,
        sideTitle: "GPS Settings",
        sideSubTitle: "GPS Data: ",
        sideContent: this.gpsData,
      }));
    } catch (err) {
      console.error(`Error Getting GPS Information: ${err}`);
    }
  }
  //END GPS Configuration

  //PASS CODE
  setPasscode() {
    this.passcode = (
      <div>
        <div className="settingsLockProperty">
          Lock Volume:
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settingsLockProperty">
          Lock Apple Music:
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settingsLockProperty">
          Lock Bluetooth Music:
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settingsLockProperty">
          Lock Google Maps:
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="settingsLockProperty">
          Lock Bluetooth Music:
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    );
    this.setState((prevState) => ({
      isHidden: !prevState.isHidden,
      sideTitle: "Passcode Settings",
      sideSubTitle:
        "A passcode can lock apps, prevent volume changes, disable music controls, and more.",
      sideContent: this.passcode,
    }));
  }
  //END PASSCODE

  //Dark or Light Mode
  toggleDarkLightMode() {
    this.setState((prevState) => ({
      darkMode: !prevState.darkMode,
    }));
  }
  //END Dark or Light Mode

  //Reset App
  reset() {
    try {
      axios.post("http://localhost:3222/reset", {
        reset: "reset",
      });
    } catch (err) {
      console.error(`Error Resetting Apps: ${err}`);
    }
  }
  //End Reset App

  render() {
    return (
      <Container className="settingsContainer">
        <Col className="settingsindex">
          <ul>
            <li>
              <span className="settingsTitle">
                Bluetooth:
                <span className="settingsDescription">
                  {" "}
                  Pair Bluetooth Device
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.loadBluetooth} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                WiFi:
                <span className="settingsDescription">
                  {" "}
                  Connect to WiFi Hotspot
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.getWifiNames} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Brightness:
                <span className="settingsDescription">
                  {" "}
                  Change the Screen Brightness
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.setBrightness} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Volume:
                <span className="settingsDescription"> Change the Volume</span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.setVolume} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Speed Volume:
                <span className="settingsDescription"> Set Speed Volume</span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.setSpeedVolume} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                GPS:
                <span className="settingsDescription">
                  {" "}
                  View GPS Information
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.configureGPS} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Start GPS:
                <span className="settingsDescription"> Turn on GPS</span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.startGps} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Passcode:
                <span className="settingsDescription">
                  {" "}
                  Passcode Protect Settings.
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.setPasscode} />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Dark Mode:
                <span className="settingsDescription">
                  {" "}
                  Toggle Dark or Light Mode
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </li>
            <li>
              <span className="settingsTitle">
                Reset:
                <span className="settingsDescription">
                  {" "}
                  Reset Car Play and Relaunch
                </span>
              </span>
              <label className="switch">
                <input type="checkbox" onClick={this.reset} />
                <span className="slider round"></span>
              </label>
            </li>
          </ul>
        </Col>

        {this.state.isHidden ? null : (
          <Card className="settingsSideCard">
            <h3 className="settingsSideTitle">{this.state.sideTitle}</h3>
            <h5 className="settingsSubTitle">{this.state.sideSubTitle}</h5>
            {this.state.sideContent}
          </Card>
        )}
      </Container>
    );
  }
}
